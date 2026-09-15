import { Router } from 'express';
import {
  listMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceStatus,
} from '../controllers/maintenanceController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, requireAdmin, listMaintenanceLogs);
router.post('/', protect, requireAdmin, createMaintenanceLog);
router.put('/:id', protect, requireAdmin, updateMaintenanceStatus);

export default router;
