import mongoose from 'mongoose';

const deductionItemSchema = new mongoose.Schema({
  reason: {
    type: String,
    enum: ['late_fee', 'damage', 'missing_item', 'cleaning_fee'],
    required: true,
  },
  amount: { type: Number, required: true },
  notes: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now },
});

const securityDepositSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalOrder',
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    initialAmount: { type: Number, required: true },
    heldStatus: {
      type: String,
      enum: ['held', 'partially_refunded', 'fully_refunded', 'forfeited', 'pending_penalty_payment'],
      default: 'held',
      index: true,
    },
    deductions: [deductionItemSchema],
    totalDeductions: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    outstandingPenaltyAmount: { type: Number, default: 0 },
    settledAt: { type: Date, default: null },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export const SecurityDeposit = mongoose.model('SecurityDeposit', securityDepositSchema);
export default SecurityDeposit;
