import mongoose from 'mongoose';

const pricelistRuleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  discountPercentage: { type: Number, default: 0 },
  fixedHourlyRate: { type: Number, default: null },
  fixedDailyRate: { type: Number, default: null },
  fixedWeeklyRate: { type: Number, default: null },
  fixedMonthlyRate: { type: Number, default: null },
});

const pricelistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    customerTier: {
      type: String,
      enum: ['standard', 'vip', 'corporate', 'all'],
      default: 'all',
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    rules: [pricelistRuleSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Pricelist = mongoose.model('Pricelist', pricelistSchema);
export default Pricelist;
