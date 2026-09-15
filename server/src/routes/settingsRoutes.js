import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, requireAdmin, updateSettings);

export default router;
