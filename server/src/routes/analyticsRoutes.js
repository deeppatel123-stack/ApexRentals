import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/dashboard-summary', protect, requireAdmin, getDashboardStats);

export default router;
