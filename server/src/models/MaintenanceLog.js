import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
      index: true,
    },
    issueDescription: { type: String, required: true },
    severity: {
      type: String,
      enum: ['routine_service', 'minor_repair', 'major_overhaul', 'replacement_required'],
      default: 'routine_service',
    },
    status: {
      type: String,
      enum: ['logged', 'in_progress', 'completed', 'scrapped'],
      default: 'logged',
      index: true,
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    serviceCenter: { type: String, default: 'In-house Workshop' },
    completionDate: { type: Date, default: null },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
export default MaintenanceLog;
