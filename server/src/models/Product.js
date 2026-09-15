import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String, default: 'General' },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    images: [{ type: String }],
    baseRates: {
      hourly: { type: Number, default: 0 },
      daily: { type: Number, required: true },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    depositRule: {
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed',
      },
      value: { type: Number, required: true, default: 1000 },
    },
    requiresSerialTracking: { type: Boolean, default: true },
    accessoriesChecklist: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    totalRentals: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Search indexing
productSchema.index({ title: 'text', description: 'text', brand: 'text', sku: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
