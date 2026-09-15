import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, default: '' }, // e.g., "Canon EOS R5 - Body Only - Black"
    attributes: {
      brand: { type: String, default: '' },
      manufacturer: { type: String, default: '' },
      color: { type: String, default: '' },
      size: { type: String, default: '' },
      specification: { type: String, default: '' },
    },
    priceAdjustment: {
      hourly: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    depositAdjustment: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
