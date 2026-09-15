import mongoose from 'mongoose';

const organizationSettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Apex Rentals & Logistics Ltd.' },
    logoUrl: { type: String, default: '' },
    email: { type: String, default: 'support@apexrentals.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: {
      type: String,
      default: 'Suite 402, Technology Park, Mumbai, MH 400001',
    },
    currency: { type: String, default: '₹' },
    currencyCode: { type: String, default: 'INR' },
    taxPercentage: { type: Number, default: 18 }, // 18% GST default
    defaultGracePeriodMinutes: { type: Number, default: 30 }, // 30 minutes free grace
    lateFeeHourlyMultiplier: { type: Number, default: 1.5 }, // 1.5x regular hourly rate
    lateFeeDailyRate: { type: Number, default: 500 }, // Fallback per day late fee
    maxLateFeePercentOfDeposit: { type: Number, default: 100 }, // Cap at 100% of deposit
    quotationHeader: {
      type: String,
      default: 'Official Rental Quotation & Operational Contract Estimate',
    },
    quotationFooter: {
      type: String,
      default: 'This quotation is valid for 7 days. Equipment subject to availability upon confirmation.',
    },
  },
  { timestamps: true }
);

export const OrganizationSettings = mongoose.model(
  'OrganizationSettings',
  organizationSettingsSchema
);
export default OrganizationSettings;
