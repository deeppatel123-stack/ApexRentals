import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Pricelist from '../models/Pricelist.js';
import OrganizationSettings from '../models/OrganizationSettings.js';

/**
 * Calculates rental duration breakdown in hours and days.
 */
export const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    throw new Error('Rental end date and time must be after the rental start date and time.');
  }

  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const totalDays = Math.ceil(totalHours / 24);
  const totalWeeks = Math.ceil(totalDays / 7);
  const totalMonths = Math.ceil(totalDays / 30);

  return { totalHours, totalDays, totalWeeks, totalMonths };
};

/**
 * Evaluates the best applicable rental rate and computes subtotal and deposit.
 */
export const calculateRentalCost = async ({
  productId,
  variantId = null,
  startDate,
  endDate,
  customerTier = 'standard',
}) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found.');

  let variant = null;
  if (variantId) {
    variant = await ProductVariant.findById(variantId);
  }

  const { totalHours, totalDays } = calculateDuration(startDate, endDate);

  // 1. Determine Base Rate (Hourly vs Daily)
  let baseRate = 0;
  let calculationMethod = 'daily';

  if (totalHours < 24 && product.baseRates.hourly > 0) {
    calculationMethod = 'hourly';
    baseRate = product.baseRates.hourly;
    if (variant?.priceAdjustment?.hourly) {
      baseRate += variant.priceAdjustment.hourly;
    }
  } else {
    calculationMethod = 'daily';
    baseRate = product.baseRates.daily;
    if (variant?.priceAdjustment?.daily) {
      baseRate += variant.priceAdjustment.daily;
    }
  }

  // 2. Check Dynamic Pricelist Rules (Customer Tier or Seasonal)
  const now = new Date();
  const activePricelist = await Pricelist.findOne({
    isActive: true,
    $or: [{ customerTier: customerTier }, { customerTier: 'all' }],
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).sort({ isDefault: 1 }); // Non-default preferred over default

  let discountPercentage = 0;
  if (activePricelist) {
    const rule = activePricelist.rules.find(
      (r) => r.productId.toString() === productId.toString()
    );
    if (rule) {
      if (calculationMethod === 'hourly' && rule.fixedHourlyRate) {
        baseRate = rule.fixedHourlyRate;
      } else if (calculationMethod === 'daily' && rule.fixedDailyRate) {
        baseRate = rule.fixedDailyRate;
      } else if (rule.discountPercentage > 0) {
        discountPercentage = rule.discountPercentage;
      }
    }
  }

  // 3. Compute Rental Subtotal
  let rawRentalFee =
    calculationMethod === 'hourly' ? baseRate * totalHours : baseRate * totalDays;

  if (discountPercentage > 0) {
    rawRentalFee = rawRentalFee * (1 - discountPercentage / 100);
  }

  const lineRentalFee = Math.round(rawRentalFee * 100) / 100;

  // 4. Calculate Security Deposit (fixed vs percentage)
  let lineDeposit = 0;
  if (product.depositRule.type === 'fixed') {
    lineDeposit = product.depositRule.value;
  } else {
    // Percentage of total rental fee
    lineDeposit = Math.round((lineRentalFee * product.depositRule.value) / 100);
  }

  if (variant?.depositAdjustment) {
    lineDeposit += variant.depositAdjustment;
  }

  // 5. Query Org Tax Settings
  const settings = (await OrganizationSettings.findOne()) || {
    taxPercentage: 18,
  };
  const taxAmount = Math.round(((lineRentalFee * settings.taxPercentage) / 100) * 100) / 100;

  return {
    productId: product._id,
    variantId: variant?._id || null,
    totalHours,
    totalDays,
    calculationMethod,
    rateApplied: baseRate,
    discountPercentage,
    lineRentalFee,
    lineDeposit,
    taxAmount,
    totalLineAmount: lineRentalFee + lineDeposit + taxAmount,
  };
};
