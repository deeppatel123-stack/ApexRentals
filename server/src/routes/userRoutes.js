import { Router } from 'express';
import { updateProfile, listCustomers } from '../controllers/authController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.put('/profile', protect, updateProfile);
router.get('/admin/customers', protect, requireAdmin, listCustomers);

export default router;
