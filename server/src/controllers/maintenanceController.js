import MaintenanceLog from '../models/MaintenanceLog.js';
import InventoryItem from '../models/InventoryItem.js';

export const listMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find()
      .populate({
        path: 'inventoryItemId',
        populate: { path: 'productId', select: 'title sku brand images' },
      })
      .populate('loggedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { logs } });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceLog = async (req, res, next) => {
  try {
    const { inventoryItemId, issueDescription, severity, estimatedCost, serviceCenter } = req.body;

    const log = await MaintenanceLog.create({
      inventoryItemId,
      issueDescription,
      severity: severity || 'routine_service',
      estimatedCost: estimatedCost || 0,
      serviceCenter: serviceCenter || 'In-house Workshop',
      loggedBy: req.user._id,
      status: 'logged',
    });

    await InventoryItem.findByIdAndUpdate(inventoryItemId, { status: 'maintenance' });

    res.status(201).json({ status: 'success', data: { log } });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, actualCost, notes } = req.body;
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ status: 'fail', message: 'Log not found.' });

    log.status = status;
    if (actualCost !== undefined) log.actualCost = actualCost;
    if (status === 'completed') {
      log.completionDate = new Date();
      // Restore physical unit back to 'available'
      await InventoryItem.findByIdAndUpdate(log.inventoryItemId, {
        status: 'available',
        currentCondition: 'good',
      });
    }

    await log.save();

    res.status(200).json({ status: 'success', data: { log } });
  } catch (error) {
    next(error);
  }
};
