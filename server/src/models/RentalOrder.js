import mongoose from 'mongoose';

const rentalItemSchema = new mongoose.Schema({
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
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    default: null, // Assigned on reservation or pickup
  },
  rentalStart: { type: Date, required: true },
  rentalEnd: { type: Date, required: true },
  durationHours: { type: Number, required: true },
  rateApplied: { type: Number, required: true },
  lineRentalFee: { type: Number, required: true },
  lineDeposit: { type: Number, required: true },
});

const rentalOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
      index: true,
    },
    items: [rentalItemSchema],
    fulfillmentType: {
      type: String,
      enum: ['store_pickup', 'doorstep_delivery'],
      default: 'store_pickup',
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'dispatched_or_ready',
        'active',
        'returned',
        'overdue',
        'closed',
        'cancelled',
      ],
      default: 'pending_payment',
      index: true,
    },
    totalRentalFee: { type: Number, required: true },
    totalDeposit: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    lateFeeAccrued: { type: Number, default: 0 },
    damageFeeAccrued: { type: Number, default: 0 },
    netRefundAmount: { type: Number, default: 0 },
    pickupScheduledAt: { type: Date, required: true },
    returnScheduledAt: { type: Date, required: true, index: true },
    actualDispatchedAt: { type: Date, default: null },
    actualReturnedAt: { type: Date, default: null },
    qrCodeString: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for operational queries
rentalOrderSchema.index({ status: 1, returnScheduledAt: 1 });
rentalOrderSchema.index({ 'items.productId': 1, 'items.rentalStart': 1, 'items.rentalEnd': 1 });

export const RentalOrder = mongoose.model('RentalOrder', rentalOrderSchema);
export default RentalOrder;
