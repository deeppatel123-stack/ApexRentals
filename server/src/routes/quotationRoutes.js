import { Router } from 'express';
import {
  listQuotations,
  createQuotation,
  convertQuotationToOrder,
} from '../controllers/quotationController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, requireAdmin, listQuotations);
router.post('/', protect, requireAdmin, createQuotation);
router.post('/:id/convert-to-order', protect, requireAdmin, convertQuotationToOrder);

export default router;
