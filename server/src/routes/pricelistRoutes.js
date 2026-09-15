import { Router } from 'express';
import {
  listPricelists,
  createPricelist,
  updatePricelist,
} from '../controllers/pricelistController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, requireAdmin, listPricelists);
router.post('/', protect, requireAdmin, createPricelist);
router.put('/:id', protect, requireAdmin, updatePricelist);

export default router;
