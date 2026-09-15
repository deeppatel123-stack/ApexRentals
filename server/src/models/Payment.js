import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
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
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['rental_plus_deposit', 'penalty_charge', 'deposit_refund', 'in_store_settlement'],
      required: true,
    },
    method: {
      type: String,
      enum: ['card_demo', 'upi_demo', 'cash_in_store', 'netbanking_demo'],
      default: 'card_demo',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'paid',
    },
    transactionReference: {
      type: String,
      default: () => `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    },
    paymentDetails: {
      cardLast4: { type: String, default: '4242' },
      upiId: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
