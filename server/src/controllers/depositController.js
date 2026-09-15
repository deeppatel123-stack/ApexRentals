import SecurityDeposit from '../models/SecurityDeposit.js';

export const listDeposits = async (req, res, next) => {
  try {
    const isCustomer = req.user.role === 'customer';
    const filter = isCustomer ? { customerId: req.user._id } : {};

    const deposits = await SecurityDeposit.find(filter)
      .populate('orderId', 'orderNumber status returnScheduledAt actualReturnedAt')
      .populate('customerId', 'name email phone tier')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { deposits } });
  } catch (error) {
    next(error);
  }
};

export const getDepositByOrderId = async (req, res, next) => {
  try {
    const deposit = await SecurityDeposit.findOne({ orderId: req.params.orderId })
      .populate('orderId')
      .populate('customerId', 'name email');

    if (!deposit) return res.status(404).json({ status: 'fail', message: 'Deposit record not found.' });

    if (req.user.role === 'customer' && deposit.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }

    res.status(200).json({ status: 'success', data: { deposit } });
  } catch (error) {
    next(error);
  }
};
