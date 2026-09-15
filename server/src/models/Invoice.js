import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  periodString: { type: String, default: '' },
  amount: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalOrder',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceDate: { type: Date, default: Date.now },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    lateFeeAmount: { type: Number, default: 0 },
    damageFeeAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    refundAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partially_paid', 'refunded', 'settled'],
      default: 'paid',
    },
    pdfUrl: { type: String, default: '' },
    notes: { type: String, default: 'Thank you for your business!' },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
