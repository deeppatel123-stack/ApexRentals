import { Router } from 'express';
import { listNotifications, markAsRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, listNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
