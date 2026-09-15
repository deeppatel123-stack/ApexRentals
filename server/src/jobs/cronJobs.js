import cron from 'node-cron';
import RentalOrder from '../models/RentalOrder.js';
import Quotation from '../models/Quotation.js';
import Notification from '../models/Notification.js';
import { calculateLateFee } from '../services/lateFeeService.js';

export const initializeCronJobs = () => {
  console.log('[Background Scheduler] Initializing operational cron jobs...');

  // 1. Scan for Overdue Rentals every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const overdueOrders = await RentalOrder.find({
        status: 'active',
        returnScheduledAt: { $lt: now },
      });

      for (const order of overdueOrders) {
        order.status = 'overdue';

        // Pre-calculate late fee
        const lateCalc = await calculateLateFee({
          scheduledReturnDate: order.returnScheduledAt,
          actualReturnDate: now,
          baseHourlyRate: 100,
          heldDepositAmount: order.totalDeposit,
        });

        order.lateFeeAccrued = lateCalc.lateFee;
        await order.save();

        // Create alert notifications
        await Notification.create({
          userId: order.customerId,
          title: '🚨 Rental Return Overdue',
          message: `Your rental order #${order.orderNumber} is overdue. Please return items immediately to avoid accumulating late penalties.`,
          type: 'alert',
          link: `/rentals/${order._id}`,
        });

        await Notification.create({
          roleTarget: 'admin',
          title: '⚠️ Order Marked Overdue',
          message: `Order #${order.orderNumber} is now overdue. Accrued late fee: ₹${lateCalc.lateFee}.`,
          type: 'warning',
          link: `/admin/rentals`,
        });
      }
    } catch (err) {
      console.error('[Cron Error: Overdue Scanner]', err.message);
    }
  });

  // 2. Expire Stale Quotations daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      await Quotation.updateMany(
        {
          status: { $in: ['draft', 'sent'] },
          validUntil: { $lt: now },
        },
        { status: 'expired' }
      );
    } catch (err) {
      console.error('[Cron Error: Quotation Expiry]', err.message);
    }
  });
};

export default initializeCronJobs;
