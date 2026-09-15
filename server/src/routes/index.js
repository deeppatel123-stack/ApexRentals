import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import pricelistRoutes from './pricelistRoutes.js';
import quotationRoutes from './quotationRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import depositRoutes from './depositRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import aiRoutes from './aiRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const apiRouter = Router();

// Mount all API sub-routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/pricelists', pricelistRoutes);
apiRouter.use('/quotations', quotationRoutes);
apiRouter.use('/rentals', rentalRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.use('/deposits', depositRoutes);
apiRouter.use('/maintenance', maintenanceRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;
