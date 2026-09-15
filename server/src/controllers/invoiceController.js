import path from 'path';
import fs from 'fs';
import Invoice from '../models/Invoice.js';

export const listInvoices = async (req, res, next) => {
  try {
    const isCustomer = req.user.role === 'customer';
    const filter = isCustomer ? { customerId: req.user._id } : {};

    const invoices = await Invoice.find(filter)
      .populate('orderId', 'orderNumber status fulfillmentType')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { invoices } });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('orderId')
      .populate('customerId', 'name email phone');

    if (!invoice) return res.status(404).json({ status: 'fail', message: 'Invoice not found.' });

    if (req.user.role === 'customer' && invoice.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

    res.status(200).json({ status: 'success', data: { invoice } });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ status: 'fail', message: 'Invoice not found.' });

    if (req.user.role === 'customer' && invoice.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

    if (!invoice.pdfUrl) {
      return res.status(404).json({ status: 'fail', message: 'PDF document not generated for this invoice.' });
    }

    const filePath = path.join(process.cwd(), invoice.pdfUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'fail', message: 'Invoice PDF file not found on server.' });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
