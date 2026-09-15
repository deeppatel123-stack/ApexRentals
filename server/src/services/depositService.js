import SecurityDeposit from '../models/SecurityDeposit.js';
import Payment from '../models/Payment.js';
import RentalOrder from '../models/RentalOrder.js';

/**
 * Settles security deposit for an order upon return and inspection.
 */
export const settleSecurityDeposit = async ({
  orderId,
  lateFee = 0,
  damageFee = 0,
  missingAccessoryFee = 0,
  settledByUserId,
  notes = '',
}) => {
  const deposit = await SecurityDeposit.findOne({ orderId });
  if (!deposit) {
    throw new Error(`Security deposit record not found for order ${orderId}.`);
  }

  const order = await RentalOrder.findById(orderId);
  if (!order) {
    throw new Error(`Rental order ${orderId} not found.`);
  }

  const deductions = [];
  if (lateFee > 0) {
    deductions.push({
      reason: 'late_fee',
      amount: lateFee,
      notes: `Late return penalty: ₹${lateFee}`,
    });
  }
  if (damageFee > 0) {
    deductions.push({
      reason: 'damage',
      amount: damageFee,
      notes: `Damage repair cost assessment: ₹${damageFee}`,
    });
  }
  if (missingAccessoryFee > 0) {
    deductions.push({
      reason: 'missing_item',
      amount: missingAccessoryFee,
      notes: `Missing accessories replacement: ₹${missingAccessoryFee}`,
    });
  }

  const totalDeductions = lateFee + damageFee + missingAccessoryFee;
  const initial = deposit.initialAmount;

  let refundedAmount = 0;
  let outstandingPenalty = 0;
  let heldStatus = 'held';

  if (totalDeductions === 0) {
    refundedAmount = initial;
    heldStatus = 'fully_refunded';
  } else if (totalDeductions < initial) {
    refundedAmount = initial - totalDeductions;
    heldStatus = 'partially_refunded';
  } else if (totalDeductions === initial) {
    refundedAmount = 0;
    heldStatus = 'forfeited';
  } else {
    // Deductions exceed the deposit!
    refundedAmount = 0;
    outstandingPenalty = totalDeductions - initial;
    heldStatus = 'pending_penalty_payment';
  }

  // Update Deposit record
  deposit.deductions = deductions;
  deposit.totalDeductions = totalDeductions;
  deposit.refundedAmount = refundedAmount;
  deposit.outstandingPenaltyAmount = outstandingPenalty;
  deposit.heldStatus = heldStatus;
  deposit.settledAt = new Date();
  deposit.settledBy = settledByUserId;
  await deposit.save();

  // If there is an amount to refund, log a refund payment transaction
  if (refundedAmount > 0) {
    await Payment.create({
      orderId: order._id,
      customerId: order.customerId,
      amount: refundedAmount,
      type: 'deposit_refund',
      method: 'card_demo',
      status: 'refunded',
      transactionReference: `REFUND_${Date.now()}`,
    });
  }

  // Update order totals
  order.lateFeeAccrued = lateFee;
  order.damageFeeAccrued = damageFee + missingAccessoryFee;
  order.netRefundAmount = refundedAmount;
  order.status = 'closed';
  await order.save();

  return {
    depositId: deposit._id,
    initialDeposit: initial,
    totalDeductions,
    refundedAmount,
    outstandingPenalty,
    heldStatus,
    settlementBreakdown: {
      lateFee,
      damageFee,
      missingAccessoryFee,
    },
  };
};
