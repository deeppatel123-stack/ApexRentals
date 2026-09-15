import Notification from '../models/Notification.js';

export const listNotifications = async (req, res, next) => {
  try {
    const isCustomer = req.user.role === 'customer';
    const query = isCustomer
      ? { userId: req.user._id }
      : { $or: [{ roleTarget: 'admin' }, { roleTarget: 'all' }, { userId: req.user._id }] };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      const isCustomer = req.user.role === 'customer';
      const query = isCustomer ? { userId: req.user._id } : { roleTarget: 'admin' };
      await Notification.updateMany(query, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.status(200).json({ status: 'success', message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
};
