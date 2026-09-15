import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'rented', 'inspection', 'maintenance', 'retired'],
      default: 'available',
      index: true,
    },
    currentCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'damaged'],
      default: 'excellent',
    },
    cumulativeRentalHours: { type: Number, default: 0 },
    totalRentalsCount: { type: Number, default: 0 },
    lastInspectionDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;
