import { Router } from 'express';
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
} from '../controllers/inventoryController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, requireAdmin, listInventory);
router.post('/', protect, requireAdmin, createInventoryItem);
router.put('/:id', protect, requireAdmin, updateInventoryItem);

export default router;
