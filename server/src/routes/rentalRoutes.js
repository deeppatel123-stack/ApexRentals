import { Router } from 'express';
import {
  checkAvailability,
  checkout,
  getMyOrders,
  getOrderById,
  getAllOrders,
  dispatchOrder,
  returnOrderIntake,
} from '../controllers/rentalController.js';
import { protect, requireAdmin, requireCustomer } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/check-availability', checkAvailability);
router.post('/checkout', protect, checkout);
router.get('/my-orders', protect, requireCustomer, getMyOrders);
router.get('/admin/all', protect, requireAdmin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/dispatch', protect, requireAdmin, dispatchOrder);
router.post('/:id/return-intake', protect, requireAdmin, returnOrderIntake);

export default router;
