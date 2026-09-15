import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  passed: { type: Boolean, default: true },
  notes: { type: String, default: '' },
});

const inspectionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalOrder',
      required: true,
      index: true,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    type: {
      type: String,
      enum: ['dispatch', 'return'],
      required: true,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checklistResults: [checklistItemSchema],
    damageSeverity: {
      type: String,
      enum: ['none', 'minor', 'moderate', 'severe', 'total_loss'],
      default: 'none',
    },
    damageNotes: { type: String, default: '' },
    repairCostEstimate: { type: Number, default: 0 },
    missingAccessoriesFee: { type: Number, default: 0 },
    photos: [{ type: String }],
    inspectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Inspection = mongoose.model('Inspection', inspectionSchema);
export default Inspection;
