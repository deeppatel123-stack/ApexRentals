import { Router } from 'express';
import { listDeposits, getDepositByOrderId } from '../controllers/depositController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, listDeposits);
router.get('/order/:orderId', protect, getDepositByOrderId);

export default router;
