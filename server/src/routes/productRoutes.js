import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  getPricePreview,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', listProducts);
router.post('/price-preview', getPricePreview);
router.get('/:id', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);
router.post('/:productId/variants', protect, requireAdmin, createVariant);

export default router;
