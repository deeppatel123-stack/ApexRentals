import { Router } from 'express';
import {
  listInvoices,
  getInvoiceById,
  downloadInvoicePDF,
} from '../controllers/invoiceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, listInvoices);
router.get('/:id', protect, getInvoiceById);
router.get('/:id/download', protect, downloadInvoicePDF);

export default router;
