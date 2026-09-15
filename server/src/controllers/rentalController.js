import QRCode from 'qrcode';
import RentalOrder from '../models/RentalOrder.js';
import InventoryItem from '../models/InventoryItem.js';
import Payment from '../models/Payment.js';
import SecurityDeposit from '../models/SecurityDeposit.js';
import Invoice from '../models/Invoice.js';
import Inspection from '../models/Inspection.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { calculateRentalCost } from '../services/pricingService.js';
import { validateCartAvailability, getAvailableInventoryUnits } from '../services/availabilityService.js';
import { calculateLateFee } from '../services/lateFeeService.js';
import { settleSecurityDeposit } from '../services/depositService.js';
import { generateInvoicePDF } from '../services/pdfInvoiceService.js';

/**
 * Check availability for a cart or product
 * POST /api/v1/rentals/check-availability
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Cart items array is required.' });
    }

    const availability = await validateCartAvailability(items);
    res.status(200).json({ status: 'success', data: availability });
  } catch (error) {
    next(error);
  }
};

/**
 * Checkout & Create Rental Order
 * POST /api/v1/rentals/checkout
 */
export const checkout = async (req, res, next) => {
  try {
    const { items, fulfillmentType, deliveryAddress, paymentMethod = 'card_demo' } = req.body;
    const customerId = req.user._id;
    const customer = await User.findById(customerId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No items in cart.' });
    }

    // 1. Strict Server-Side Availability Verification
    const availability = await validateCartAvailability(items);
    if (!availability.allAvailable) {
      return res.status(400).json({
        status: 'fail',
        message: 'One or more items in your cart are no longer available for the chosen dates.',
        data: availability.itemBreakdown,
      });
    }

    // 2. Strict Server-Side Recalculation of Pricing & Deposits
    let totalRentalFee = 0;
    let totalDeposit = 0;
    let totalTax = 0;
    const processedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const assignedUnit = availability.itemBreakdown[i]?.assignedUnitId;

      const pricing = await calculateRentalCost({
        productId: item.productId,
        variantId: item.variantId || null,
        startDate: item.rentalStart,
        endDate: item.rentalEnd,
        customerTier: customer.tier,
      });

      processedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        inventoryItemId: assignedUnit || null,
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
        durationHours: pricing.totalHours,
        rateApplied: pricing.rateApplied,
        lineRentalFee: pricing.lineRentalFee,
        lineDeposit: pricing.lineDeposit,
      });

      totalRentalFee += pricing.lineRentalFee;
      totalDeposit += pricing.lineDeposit;
      totalTax += pricing.taxAmount;
    }

    const totalPaid = Math.round((totalRentalFee + totalDeposit + totalTax) * 100) / 100;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // Pick earliest start and latest end for scheduling
    const earliestStart = new Date(Math.min(...items.map((i) => new Date(i.rentalStart))));
    const latestEnd = new Date(Math.max(...items.map((i) => new Date(i.rentalEnd))));

    // 3. Generate QR Code String
    const qrPayload = JSON.stringify({ orderNumber, customerId: customer._id });
    const qrCodeString = await QRCode.toDataURL(qrPayload);

    // 4. Create Rental Order
    const order = await RentalOrder.create({
      orderNumber,
      customerId,
      items: processedItems,
      fulfillmentType: fulfillmentType || 'store_pickup',
      deliveryAddress: fulfillmentType === 'doorstep_delivery' ? deliveryAddress : undefined,
      status: 'confirmed',
      totalRentalFee,
      totalDeposit,
      taxAmount: totalTax,
      totalPaid,
      pickupScheduledAt: earliestStart,
      returnScheduledAt: latestEnd,
      qrCodeString,
    });

    // Mark assigned units as 'reserved'
    for (const item of processedItems) {
      if (item.inventoryItemId) {
        await InventoryItem.findByIdAndUpdate(item.inventoryItemId, { status: 'reserved' });
      }
    }

    // 5. Create Payment Record (Combined charge: Rental + Security Deposit)
    await Payment.create({
      orderId: order._id,
      customerId,
      amount: totalPaid,
      type: 'rental_plus_deposit',
      method: paymentMethod,
      status: 'paid',
    });

    // 6. Create Security Deposit Ledger Record
    await SecurityDeposit.create({
      orderId: order._id,
      customerId,
      initialAmount: totalDeposit,
      heldStatus: 'held',
    });

    // 7. Generate Invoice Document
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoiceLineItems = [];
    for (const item of processedItems) {
      const prod = await Product.findById(item.productId);
      invoiceLineItems.push({
        title: prod?.title || 'Rental Item',
        amount: item.lineRentalFee,
        periodString: `${new Date(item.rentalStart).toLocaleDateString()} - ${new Date(item.rentalEnd).toLocaleDateString()}`,
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: order._id,
      customerId,
      items: invoiceLineItems,
      subtotal: totalRentalFee,
      depositAmount: totalDeposit,
      taxAmount: totalTax,
      totalAmount: totalPaid,
      paymentStatus: 'paid',
    });

    // Build PDF
    const pdfUrl = await generateInvoicePDF(invoice, order, customer);
    invoice.pdfUrl = pdfUrl;
    await invoice.save();

    // 8. In-App Notifications
    await Notification.create({
      userId: customerId,
      title: '🎉 Rental Booking Confirmed!',
      message: `Your rental order #${order.orderNumber} is confirmed. View invoice and pickup details anytime.`,
      type: 'success',
      link: `/rentals/${order._id}`,
    });

    await Notification.create({
      roleTarget: 'admin',
      title: '📦 New Rental Order Placed',
      message: `Order #${order.orderNumber} placed by ${customer.name}. Scheduled for: ${new Date(order.pickupScheduledAt).toLocaleDateString()}.`,
      type: 'info',
      link: `/admin/rentals`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Rental order placed and confirmed successfully.',
      data: {
        order,
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer's orders
 * GET /api/v1/rentals/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await RentalOrder.find({ customerId: req.user._id })
      .populate('items.productId', 'title slug images brand sku')
      .populate('items.inventoryItemId', 'serialNumber barcode')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details by ID
 * GET /api/v1/rentals/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await RentalOrder.findById(req.params.id)
      .populate('customerId', 'name email phone tier')
      .populate('items.productId')
      .populate('items.variantId')
      .populate('items.inventoryItemId');

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    // Authorization check: Customer can only view their own order
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

    const deposit = await SecurityDeposit.findOne({ orderId: order._id });
    const invoice = await Invoice.findOne({ orderId: order._id });
    const inspections = await Inspection.find({ orderId: order._id }).populate('inspectorId', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        order,
        deposit,
        invoice,
        inspections,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all orders (Admin only)
 * GET /api/v1/rentals/admin/all
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, dueToday } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (dueToday === 'true') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      filter.returnScheduledAt = { $gte: todayStart, $lte: todayEnd };
      filter.status = { $in: ['active', 'confirmed'] };
    }

    if (search) {
      filter.orderNumber = new RegExp(search, 'i');
    }

    const orders = await RentalOrder.find(filter)
      .populate('customerId', 'name email phone tier')
      .populate('items.productId', 'title sku images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dispatch / Pickup Order (Admin only)
 * PUT /api/v1/rentals/:id/dispatch
 */
export const dispatchOrder = async (req, res, next) => {
  try {
    const { checklistResults, itemSerialAssignments } = req.body;
    const order = await RentalOrder.findById(req.params.id);

    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    if (order.status === 'active') {
      return res.status(400).json({ status: 'fail', message: 'Order is already marked active.' });
    }

    // Update physical serial assignments if modified during pickup
    if (itemSerialAssignments && Array.isArray(itemSerialAssignments)) {
      for (const assign of itemSerialAssignments) {
        const lineItem = order.items.id(assign.itemId);
        if (lineItem) {
          lineItem.inventoryItemId = assign.inventoryItemId;
        }
      }
    }

    // Mark inventory units as 'rented'
    for (const line of order.items) {
      if (line.inventoryItemId) {
        await InventoryItem.findByIdAndUpdate(line.inventoryItemId, { status: 'rented' });

        // Record Dispatch Inspection
        await Inspection.create({
          orderId: order._id,
          inventoryItemId: line.inventoryItemId,
          type: 'dispatch',
          inspectorId: req.user._id,
          checklistResults: checklistResults || [{ item: 'Hardware integrity verified', passed: true }],
          damageSeverity: 'none',
        });
      }
    }

    order.status = 'active';
    order.actualDispatchedAt = new Date();
    await order.save();

    await Notification.create({
      userId: order.customerId,
      title: '📦 Order Handed Over / Dispatched',
      message: `Your rental items for Order #${order.orderNumber} have been dispatched. Scheduled return: ${new Date(order.returnScheduledAt).toLocaleString()}.`,
      type: 'info',
      link: `/rentals/${order._id}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Order dispatched and active.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return Intake, Inspection & Deposit Settlement (Admin only)
 * POST /api/v1/rentals/:id/return-intake
 */
export const returnOrderIntake = async (req, res, next) => {
  try {
    const {
      checklistResults,
      damageSeverity = 'none',
      damageNotes = '',
      repairCostEstimate = 0,
      missingAccessoriesFee = 0,
      damagePhotos = [],
      actualReturnTime = new Date(),
    } = req.body;

    const order = await RentalOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found.' });

    if (order.status === 'closed') {
      return res.status(400).json({ status: 'fail', message: 'Order has already been returned and closed.' });
    }

    const returnDate = new Date(actualReturnTime);

    // 1. Calculate Late Fee based on schedule and grace period
    const lateFeeCalc = await calculateLateFee({
      scheduledReturnDate: order.returnScheduledAt,
      actualReturnDate: returnDate,
      baseHourlyRate: 100,
      heldDepositAmount: order.totalDeposit,
    });

    const lateFee = lateFeeCalc.lateFee;
    const damageFee = Number(repairCostEstimate) || 0;
    const missingFee = Number(missingAccessoriesFee) || 0;

    // 2. Perform Return Inspections and update physical items
    for (const item of order.items) {
      if (item.inventoryItemId) {
        await Inspection.create({
          orderId: order._id,
          inventoryItemId: item.inventoryItemId,
          type: 'return',
          inspectorId: req.user._id,
          checklistResults: checklistResults || [],
          damageSeverity,
          damageNotes,
          repairCostEstimate: damageFee,
          missingAccessoriesFee: missingFee,
          photos: damagePhotos,
          inspectedAt: returnDate,
        });

        // If damaged, update condition and transition to 'maintenance'
        if (damageSeverity !== 'none') {
          await InventoryItem.findByIdAndUpdate(item.inventoryItemId, {
            status: 'maintenance',
            currentCondition: damageSeverity === 'total_loss' ? 'damaged' : 'fair',
          });

          await MaintenanceLog.create({
            inventoryItemId: item.inventoryItemId,
            issueDescription: `Return Damage: ${damageNotes || damageSeverity}`,
            severity: damageSeverity === 'severe' || damageSeverity === 'total_loss' ? 'major_overhaul' : 'minor_repair',
            status: 'logged',
            estimatedCost: damageFee,
            loggedBy: req.user._id,
          });
        } else {
          // Restore to available stock
          await InventoryItem.findByIdAndUpdate(item.inventoryItemId, {
            status: 'available',
            $inc: { cumulativeRentalHours: item.durationHours, totalRentalsCount: 1 },
          });
        }
      }
    }

    // 3. Settle Security Deposit
    const settlement = await settleSecurityDeposit({
      orderId: order._id,
      lateFee,
      damageFee,
      missingAccessoryFee: missingFee,
      settledByUserId: req.user._id,
    });

    // Update order return timing
    order.actualReturnedAt = returnDate;
    await order.save();

    // 4. Update Invoice Document with deductions
    const invoice = await Invoice.findOne({ orderId: order._id });
    if (invoice) {
      invoice.lateFeeAmount = lateFee;
      invoice.damageFeeAmount = damageFee + missingFee;
      invoice.refundAmount = settlement.refundedAmount;
      invoice.paymentStatus = 'settled';
      await invoice.save();

      // Regenerate updated PDF
      const customer = await User.findById(order.customerId);
      const updatedPdf = await generateInvoicePDF(invoice, order, customer);
      invoice.pdfUrl = updatedPdf;
      await invoice.save();
    }

    // 5. Notification to Customer
    await Notification.create({
      userId: order.customerId,
      title: '📋 Rental Return Completed',
      message: `Return inspection complete for Order #${order.orderNumber}. Net deposit refunded: ₹${settlement.refundedAmount}.`,
      type: 'success',
      link: `/rentals/${order._id}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Rental intake and deposit settlement completed successfully.',
      data: {
        order,
        settlement,
        lateFeeBreakdown: lateFeeCalc,
      },
    });
  } catch (error) {
    next(error);
  }
};
