import Quotation from '../models/Quotation.js';
import RentalOrder from '../models/RentalOrder.js';
import Payment from '../models/Payment.js';
import SecurityDeposit from '../models/SecurityDeposit.js';
import Invoice from '../models/Invoice.js';
import { calculateRentalCost } from '../services/pricingService.js';
import { getAvailableInventoryUnits } from '../services/availabilityService.js';
import { generateInvoicePDF } from '../services/pdfInvoiceService.js';
import User from '../models/User.js';

export const listQuotations = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    const quotations = await Quotation.find(filter)
      .populate('customerId', 'name email phone tier')
      .populate('items.productId', 'title sku baseRates images')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { quotations } });
  } catch (error) {
    next(error);
  }
};

export const createQuotation = async (req, res, next) => {
  try {
    const { customerId, items, validDays = 7, headerText, footerText } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ status: 'fail', message: 'Customer not found.' });

    let subtotal = 0;
    let depositTotal = 0;
    const computedItems = [];

    for (const item of items) {
      const pricing = await calculateRentalCost({
        productId: item.productId,
        variantId: item.variantId || null,
        startDate: item.rentalStart,
        endDate: item.rentalEnd,
        customerTier: customer.tier,
      });

      computedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
        durationHours: pricing.totalHours,
        appliedRate: pricing.rateApplied,
        rentalFee: pricing.lineRentalFee,
        depositAmount: pricing.lineDeposit,
      });

      subtotal += pricing.lineRentalFee;
      depositTotal += pricing.lineDeposit;
    }

    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount = subtotal + depositTotal + taxAmount;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;

    const quotation = await Quotation.create({
      quotationNumber,
      customerId,
      items: computedItems,
      subtotal,
      depositTotal,
      taxAmount,
      totalAmount,
      validUntil,
      headerText: headerText || undefined,
      footerText: footerText || undefined,
      status: 'draft',
    });

    res.status(201).json({ status: 'success', data: { quotation } });
  } catch (error) {
    next(error);
  }
};

export const convertQuotationToOrder = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ status: 'fail', message: 'Quotation not found.' });

    if (quotation.status === 'converted') {
      return res.status(400).json({ status: 'fail', message: 'Quotation already converted to an order.' });
    }

    const customer = await User.findById(quotation.customerId);

    // Build RentalOrder items and assign physical units
    const orderItems = [];
    for (const item of quotation.items) {
      const units = await getAvailableInventoryUnits(item.productId, item.variantId, item.rentalStart, item.rentalEnd);
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        inventoryItemId: units.length > 0 ? units[0]._id : null,
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
        durationHours: item.durationHours,
        rateApplied: item.appliedRate,
        lineRentalFee: item.rentalFee,
        lineDeposit: item.depositAmount,
      });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const earliestStart = new Date(Math.min(...quotation.items.map((i) => new Date(i.rentalStart))));
    const latestEnd = new Date(Math.max(...quotation.items.map((i) => new Date(i.rentalEnd))));

    const order = await RentalOrder.create({
      orderNumber,
      customerId: quotation.customerId,
      items: orderItems,
      fulfillmentType: 'store_pickup',
      status: 'confirmed',
      totalRentalFee: quotation.subtotal,
      totalDeposit: quotation.depositTotal,
      taxAmount: quotation.taxAmount,
      totalPaid: quotation.totalAmount,
      pickupScheduledAt: earliestStart,
      returnScheduledAt: latestEnd,
    });

    // Create Payment Record (In-store settlement)
    await Payment.create({
      orderId: order._id,
      customerId: order.customerId,
      amount: quotation.totalAmount,
      type: 'rental_plus_deposit',
      method: 'cash_in_store',
      status: 'paid',
    });

    // Create Security Deposit Record
    await SecurityDeposit.create({
      orderId: order._id,
      customerId: order.customerId,
      initialAmount: quotation.depositTotal,
      heldStatus: 'held',
    });

    // Generate Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: order._id,
      customerId: order.customerId,
      items: orderItems.map((i) => ({
        title: 'Rental Item',
        amount: i.lineRentalFee,
        periodString: `${new Date(i.rentalStart).toLocaleDateString()} - ${new Date(i.rentalEnd).toLocaleDateString()}`,
      })),
      subtotal: quotation.subtotal,
      depositAmount: quotation.depositTotal,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      paymentStatus: 'paid',
    });

    const pdfUrl = await generateInvoicePDF(invoice, order, customer);
    invoice.pdfUrl = pdfUrl;
    await invoice.save();

    // Mark quotation converted
    quotation.status = 'converted';
    quotation.convertedOrderId = order._id;
    await quotation.save();

    res.status(200).json({
      status: 'success',
      message: 'Quotation successfully converted to confirmed Rental Order.',
      data: { order, invoice },
    });
  } catch (error) {
    next(error);
  }
};
