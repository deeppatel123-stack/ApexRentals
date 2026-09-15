import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: { type: String, default: 'System' },
    action: { type: String, required: true }, // e.g. "ORDER_DISPATCHED", "DEPOSIT_SETTLED"
    resource: { type: String, required: true }, // e.g. "RentalOrder", "Product"
    resourceId: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
