import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import InventoryItem from '../models/InventoryItem.js';
import RentalOrder from '../models/RentalOrder.js';
import SecurityDeposit from '../models/SecurityDeposit.js';
import { calculateRentalCost, calculateDuration } from '../services/pricingService.js';
import { isItemAvailable } from '../services/availabilityService.js';
import { calculateLateFee } from '../services/lateFeeService.js';
import { settleSecurityDeposit } from '../services/depositService.js';

const runTests = async () => {
  console.log('🧪 Starting Rental Management System Automated Test Suite...\n');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rental_management_system';
  await mongoose.connect(mongoUri);

  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition, testName) => {
    totalCount++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  };

  try {
    // -------------------------------------------------------------------
    console.log('Test Group 1: Authentication & Password Security');
    // -------------------------------------------------------------------
    const testEmail = `tester_${Date.now()}@rental.com`;
    const user = await User.create({
      name: 'Auth Tester',
      email: testEmail,
      password: 'secretPassword123',
      role: 'customer',
    });

    assert(user.password !== 'secretPassword123', 'Password is encrypted using bcrypt salt');
    assert(await user.matchPassword('secretPassword123'), 'Valid password matches successfully');
    assert(!(await user.matchPassword('wrongPassword')), 'Invalid password fails matching');
    await User.findByIdAndDelete(user._id);

    // -------------------------------------------------------------------
    console.log('\nTest Group 2: Rental Duration & Price Engine');
    // -------------------------------------------------------------------
    const start = new Date('2026-10-01T10:00:00Z');
    const end3Hours = new Date('2026-10-01T13:00:00Z');
    const end3Days = new Date('2026-10-04T10:00:00Z');

    const durationHourly = calculateDuration(start, end3Hours);
    assert(durationHourly.totalHours === 3, 'Hourly duration calculates correctly (3 hours)');

    const durationDaily = calculateDuration(start, end3Days);
    assert(durationDaily.totalDays === 3, 'Daily duration calculates correctly (3 days)');

    const testProd = await Product.findOne({ sku: 'CAM-SONY-FX3' });
    if (testProd) {
      const priceResult = await calculateRentalCost({
        productId: testProd._id,
        startDate: start,
        endDate: end3Days,
        customerTier: 'standard',
      });

      assert(priceResult.lineRentalFee === 2200 * 3, 'Base rental rate applied correctly (2200 x 3 = 6600)');
      assert(priceResult.lineDeposit === 8000, 'Fixed security deposit calculated correctly (8000)');
      assert(priceResult.taxAmount === Math.round(6600 * 0.18 * 100) / 100, 'GST 18% computed accurately');
    }

    // -------------------------------------------------------------------
    console.log('\nTest Group 3: Real Date-Range Availability & Conflict Detection');
    // -------------------------------------------------------------------
    const sampleItem = await InventoryItem.findOne({ status: 'available' });
    if (sampleItem) {
      const windowStart = new Date('2026-11-10T10:00:00Z');
      const windowEnd = new Date('2026-11-15T10:00:00Z');

      const isInitiallyAvailable = await isItemAvailable(sampleItem._id, windowStart, windowEnd);
      assert(isInitiallyAvailable, 'Item is available when no conflicting bookings exist');

      // Create a temporary conflicting order
      const dummyCustomer = await User.findOne({ role: 'customer' });
      const conflictOrder = await RentalOrder.create({
        orderNumber: `ORD-TEST-${Date.now()}`,
        customerId: dummyCustomer._id,
        items: [
          {
            productId: sampleItem.productId,
            inventoryItemId: sampleItem._id,
            rentalStart: windowStart,
            rentalEnd: windowEnd,
            durationHours: 120,
            rateApplied: 1000,
            lineRentalFee: 5000,
            lineDeposit: 2000,
          },
        ],
        status: 'confirmed',
        totalRentalFee: 5000,
        totalDeposit: 2000,
        pickupScheduledAt: windowStart,
        returnScheduledAt: windowEnd,
      });

      // Now verify overlap conflict
      const isAvailableDuringOverlap = await isItemAvailable(sampleItem._id, windowStart, windowEnd);
      assert(!isAvailableDuringOverlap, 'Availability correctly detects double-booking conflict and rejects');

      // Cleanup
      await RentalOrder.findByIdAndDelete(conflictOrder._id);
    }

    // -------------------------------------------------------------------
    console.log('\nTest Group 4: Late Return Fee & Grace Period Engine');
    // -------------------------------------------------------------------
    const scheduledReturn = new Date('2026-10-10T10:00:00Z');

    // Case A: Returned within 30 min grace period
    const graceReturn = new Date('2026-10-10T10:20:00Z');
    const graceResult = await calculateLateFee({
      scheduledReturnDate: scheduledReturn,
      actualReturnDate: graceReturn,
      baseHourlyRate: 100,
      heldDepositAmount: 5000,
    });
    assert(graceResult.gracePeriodApplied && graceResult.lateFee === 0, 'Grace period waives fee on-time return (0 fee)');

    // Case B: Returned 2 hours late (exceeds grace)
    const late2Hours = new Date('2026-10-10T12:00:00Z');
    const lateResult = await calculateLateFee({
      scheduledReturnDate: scheduledReturn,
      actualReturnDate: late2Hours,
      baseHourlyRate: 100,
      heldDepositAmount: 5000,
    });
    assert(lateResult.lateFee === 2 * 150, 'Late fee calculates 2 hours * 1.5x multiplier = 300');

    // Case C: Massive late return hits deposit cap
    const superLate = new Date('2026-10-25T10:00:00Z'); // 15 days late
    const cappedResult = await calculateLateFee({
      scheduledReturnDate: scheduledReturn,
      actualReturnDate: superLate,
      baseHourlyRate: 100,
      heldDepositAmount: 5000,
    });
    assert(cappedResult.capped && cappedResult.lateFee === 5000, 'Late fee caps at 100% of held security deposit');

    // -------------------------------------------------------------------
    console.log('\nTest Group 5: Security Deposit Settlement & Deduction Math');
    // -------------------------------------------------------------------
    const dummyCust = await User.findOne({ role: 'customer' });
    const dummyOrder = await RentalOrder.create({
      orderNumber: `ORD-SETTLE-${Date.now()}`,
      customerId: dummyCust._id,
      items: [],
      status: 'active',
      totalRentalFee: 2000,
      totalDeposit: 5000,
      pickupScheduledAt: new Date(),
      returnScheduledAt: new Date(),
    });

    await SecurityDeposit.create({
      orderId: dummyOrder._id,
      customerId: dummyCust._id,
      initialAmount: 5000,
      heldStatus: 'held',
    });

    const adminUser = await User.findOne({ role: 'admin' });
    const settlement = await settleSecurityDeposit({
      orderId: dummyOrder._id,
      lateFee: 500,
      damageFee: 800,
      missingAccessoryFee: 200,
      settledByUserId: adminUser._id,
    });

    assert(settlement.totalDeductions === 1500, 'Total deductions sum accurately (500 + 800 + 200 = 1500)');
    assert(settlement.refundedAmount === 3500, 'Net refund calculates accurately (5000 - 1500 = 3500)');
    assert(settlement.heldStatus === 'partially_refunded', 'Deposit status transitions to partially_refunded');

    // Cleanup
    await RentalOrder.findByIdAndDelete(dummyOrder._id);
    await SecurityDeposit.findByIdAndDelete(settlement.depositId);

    console.log(`\n=======================================================`);
    console.log(`🏁 TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
    console.log(`=======================================================`);

    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
