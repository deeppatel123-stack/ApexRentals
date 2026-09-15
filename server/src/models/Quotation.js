import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null,
  },
  rentalStart: { type: Date, required: true },
  rentalEnd: { type: Date, required: true },
  durationHours: { type: Number, required: true },
  appliedRate: { type: Number, required: true },
  rentalFee: { type: Number, required: true },
  depositAmount: { type: Number, required: true },
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [quotationItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    depositTotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    validUntil: { type: Date, required: true },
    headerText: { type: String, default: 'Thank you for choosing our rental services.' },
    footerText: { type: String, default: 'Standard terms and conditions apply. Goods must be returned in original condition.' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'converted', 'expired', 'cancelled'],
      default: 'draft',
      index: true,
    },
    convertedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalOrder',
      default: null,
    },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
