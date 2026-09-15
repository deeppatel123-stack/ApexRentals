import RentalOrder from '../models/RentalOrder.js';
import SecurityDeposit from '../models/SecurityDeposit.js';
import InventoryItem from '../models/InventoryItem.js';
import Product from '../models/Product.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const next3DaysEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. KPI Counts
    const [
      activeCount,
      overdueCount,
      dueTodayCount,
      upcomingPickupsCount,
      upcomingReturnsCount,
      totalInventoryCount,
      rentedInventoryCount,
    ] = await Promise.all([
      RentalOrder.countDocuments({ status: 'active' }),
      RentalOrder.countDocuments({ status: 'overdue' }),
      RentalOrder.countDocuments({
        status: { $in: ['active', 'confirmed'] },
        returnScheduledAt: { $gte: todayStart, $lte: todayEnd },
      }),
      RentalOrder.countDocuments({
        status: 'confirmed',
        pickupScheduledAt: { $gte: todayStart, $lte: next3DaysEnd },
      }),
      RentalOrder.countDocuments({
        status: 'active',
        returnScheduledAt: { $gte: todayStart, $lte: next3DaysEnd },
      }),
      InventoryItem.countDocuments({ isActive: true, status: { $ne: 'retired' } }),
      InventoryItem.countDocuments({ isActive: true, status: 'rented' }),
    ]);

    // 2. Financial Aggregations
    const revenueAgg = await RentalOrder.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRentalFee' },
          totalLateFees: { $sum: '$lateFeeAccrued' },
          totalDamageFees: { $sum: '$damageFeeAccrued' },
        },
      },
    ]);

    const depositAgg = await SecurityDeposit.aggregate([
      {
        $group: {
          _id: null,
          totalHeld: {
            $sum: {
              $cond: [{ $eq: ['$heldStatus', 'held'] }, '$initialAmount', 0],
            },
          },
          totalRefunded: { $sum: '$refundedAmount' },
          totalDeductions: { $sum: '$totalDeductions' },
        },
      },
    ]);

    // 3. Status Distribution
    const statusDistribution = await RentalOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 4. Monthly Revenue History (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueHistory = await RentalOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalRentalFee' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 5. Fleet Utilization Percentage
    const fleetUtilization =
      totalInventoryCount > 0
        ? Math.round((rentedInventoryCount / totalInventoryCount) * 100)
        : 0;

    res.status(200).json({
      status: 'success',
      data: {
        kpi: {
          activeRentals: activeCount,
          overdueRentals: overdueCount,
          rentalsDueToday: dueTodayCount,
          upcomingPickups: upcomingPickupsCount,
          upcomingReturns: upcomingReturnsCount,
          totalInventoryCount,
          rentedInventoryCount,
          fleetUtilization,
          totalRevenue: revenueAgg[0]?.totalRevenue || 0,
          totalLateFees: revenueAgg[0]?.totalLateFees || 0,
          totalDamageFees: revenueAgg[0]?.totalDamageFees || 0,
          totalDepositsHeld: depositAgg[0]?.totalHeld || 0,
          totalDepositsRefunded: depositAgg[0]?.totalRefunded || 0,
        },
        statusDistribution: statusDistribution.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        revenueHistory: revenueHistory.map((h) => ({
          label: `${h._id.month}/${h._id.year}`,
          revenue: h.revenue,
          orders: h.orderCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
