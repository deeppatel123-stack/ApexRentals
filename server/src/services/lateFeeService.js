import OrganizationSettings from '../models/OrganizationSettings.js';

/**
 * Calculates late fee for an order based on scheduled return vs actual return.
 */
export const calculateLateFee = async ({
  scheduledReturnDate,
  actualReturnDate = new Date(),
  baseHourlyRate = 50,
  heldDepositAmount = 1000,
}) => {
  const settings = (await OrganizationSettings.findOne()) || {
    defaultGracePeriodMinutes: 30,
    lateFeeHourlyMultiplier: 1.5,
    lateFeeDailyRate: 500,
    maxLateFeePercentOfDeposit: 100,
  };

  const scheduled = new Date(scheduledReturnDate).getTime();
  const actual = new Date(actualReturnDate).getTime();
  const diffMs = actual - scheduled;

  // If returned before or exactly at scheduled time
  if (diffMs <= 0) {
    return {
      isLate: false,
      gracePeriodApplied: false,
      overdueMinutes: 0,
      overdueHours: 0,
      lateFee: 0,
      capped: false,
    };
  }

  const overdueMinutes = Math.floor(diffMs / (1000 * 60));

  // Check if within grace period
  if (overdueMinutes <= settings.defaultGracePeriodMinutes) {
    return {
      isLate: true,
      gracePeriodApplied: true,
      graceMinutes: settings.defaultGracePeriodMinutes,
      overdueMinutes,
      overdueHours: 0,
      lateFee: 0,
      capped: false,
      note: `Returned within ${settings.defaultGracePeriodMinutes} minutes grace period. Fee waived.`,
    };
  }

  // Calculate fee from original scheduled return
  const overdueHours = Math.ceil(overdueMinutes / 60);
  const hourlyChargeRate = (baseHourlyRate || 50) * (settings.lateFeeHourlyMultiplier || 1.5);
  let rawLateFee = overdueHours * hourlyChargeRate;

  // If overdue for more than 24 hours, add daily penalty tier
  if (overdueHours > 24) {
    const overdueDays = Math.floor(overdueHours / 24);
    rawLateFee += overdueDays * (settings.lateFeeDailyRate || 500);
  }

  // Apply maximum cap based on deposit percentage
  const maxCap = (heldDepositAmount * (settings.maxLateFeePercentOfDeposit || 100)) / 100;
  const isCapped = rawLateFee > maxCap;
  const lateFee = Math.min(rawLateFee, maxCap);

  return {
    isLate: true,
    gracePeriodApplied: false,
    overdueMinutes,
    overdueHours,
    hourlyRateApplied: hourlyChargeRate,
    rawFee: rawLateFee,
    lateFee: Math.round(lateFee * 100) / 100,
    capped: isCapped,
    maxCap,
  };
};
