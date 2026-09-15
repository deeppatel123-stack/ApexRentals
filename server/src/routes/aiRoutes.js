import { Router } from 'express';
import {
  predictLateReturnRisk,
  predictDemandForecast,
  predictMaintenanceSuggestions,
  optimizeDeliveryRoutes,
  getAIBusinessInsights,
} from '../controllers/aiController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/late-return-risk', protect, requireAdmin, predictLateReturnRisk);
router.get('/demand-forecast', protect, requireAdmin, predictDemandForecast);
router.get('/maintenance', protect, requireAdmin, predictMaintenanceSuggestions);
router.get('/route-optimization', protect, requireAdmin, optimizeDeliveryRoutes);
router.get('/business-insights', protect, requireAdmin, getAIBusinessInsights);

export default router;
