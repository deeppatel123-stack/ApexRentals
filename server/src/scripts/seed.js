import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import InventoryItem from '../models/InventoryItem.js';
import Pricelist from '../models/Pricelist.js';
import Quotation from '../models/Quotation.js';
import RentalOrder from '../models/RentalOrder.js';
import Payment from '../models/Payment.js';
import SecurityDeposit from '../models/SecurityDeposit.js';
import Inspection from '../models/Inspection.js';
import Invoice from '../models/Invoice.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import OrganizationSettings from '../models/OrganizationSettings.js';
import Notification from '../models/Notification.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rental_management_system';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('🧹 Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      ProductVariant.deleteMany({}),
      InventoryItem.deleteMany({}),
      Pricelist.deleteMany({}),
      Quotation.deleteMany({}),
      RentalOrder.deleteMany({}),
      Payment.deleteMany({}),
      SecurityDeposit.deleteMany({}),
      Inspection.deleteMany({}),
      Invoice.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      OrganizationSettings.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('🏢 Creating Organization Settings...');
    await OrganizationSettings.create({
      companyName: 'Apex Rentals & Logistics Ltd.',
      email: 'admin@rental.com',
      phone: '+91 98765 43210',
      address: 'Suite 402, Technology Park, Mumbai, MH 400001',
      currency: '₹',
      currencyCode: 'INR',
      taxPercentage: 18,
      defaultGracePeriodMinutes: 30,
      lateFeeHourlyMultiplier: 1.5,
      lateFeeDailyRate: 500,
      maxLateFeePercentOfDeposit: 100,
      quotationHeader: 'Apex Industrial & Media Rentals — Official Quotation',
      quotationFooter: 'Valid for 7 days. Equipment requires pre-rental verification checklist upon pickup.',
    });

    console.log('👤 Creating Users (Admin & Customers)...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@rental.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 99999 00001',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });

    const customer1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 98888 11111',
      tier: 'standard',
      totalRentalsCompleted: 4,
      lateReturnsCount: 0,
      addresses: [
        {
          street: '42 Baker Street, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          isDefault: true,
          coordinates: { lat: 19.0596, lng: 72.8295 },
        },
      ],
    });

    const customer2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 97777 22222',
      tier: 'vip',
      totalRentalsCompleted: 11,
      lateReturnsCount: 2,
      addresses: [
        {
          street: '15 Marine Lines Boulevard',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400020',
          isDefault: true,
          coordinates: { lat: 18.9438, lng: 72.8232 },
        },
      ],
    });

    console.log('📁 Creating Categories...');
    const catCameras = await Category.create({
      name: 'Cameras & Optics',
      slug: 'cameras-optics',
      description: 'Cinema cameras, DSLRs, prime lenses, and stabilizers.',
      icon: 'Camera',
    });

    const catAudio = await Category.create({
      name: 'Audio & DJ Gear',
      slug: 'audio-dj-gear',
      description: 'PA systems, wireless mics, mixers, and subwoofers.',
      icon: 'Mic',
    });

    const catTools = await Category.create({
      name: 'Power Tools & Generators',
      slug: 'power-tools-generators',
      description: 'Heavy duty drills, silent inverter generators, and pressure washers.',
      icon: 'Wrench',
    });

    const catDrones = await Category.create({
      name: 'Drones & Aerial Tech',
      slug: 'drones-aerial',
      description: '4K cinematic camera drones, thermal drones, and RTK accessories.',
      icon: 'Plane',
    });

    console.log('📦 Creating Products & Variants...');
    // Product 1: Sony FX3 Cinema Camera
    const prodSonyFX3 = await Product.create({
      title: 'Sony FX3 Cinema Line Full-Frame Camera',
      slug: 'sony-fx3-cinema-camera',
      category: catCameras._id,
      brand: 'Sony',
      sku: 'CAM-SONY-FX3',
      description: 'Compact cinema camera featuring high-sensitivity 4K 120fps recording, 15+ stops dynamic range, active cooling fan, and XLR handle unit.',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
      ],
      baseRates: {
        hourly: 250,
        daily: 2200,
        weekly: 12000,
        monthly: 42000,
      },
      depositRule: { type: 'fixed', value: 8000 },
      requiresSerialTracking: true,
      accessoriesChecklist: [
        'XLR Audio Top Handle',
        'NP-FZ100 Batteries (x2)',
        'Dual Battery Charger',
        'Body Cap & Hotshoe Cover',
        '160GB CFexpress Type A Card',
      ],
      totalRentals: 14,
    });

    const varFX3Body = await ProductVariant.create({
      productId: prodSonyFX3._id,
      sku: 'CAM-SONY-FX3-BODY',
      title: 'Sony FX3 - Body Only',
      attributes: { specification: 'Body + XLR Handle' },
      priceAdjustment: { daily: 0 },
      depositAdjustment: 0,
    });

    const varFX3Kit = await ProductVariant.create({
      productId: prodSonyFX3._id,
      sku: 'CAM-SONY-FX3-2470',
      title: 'Sony FX3 + 24-70mm f/2.8 GM Lens',
      attributes: { specification: 'Body + G-Master Lens' },
      priceAdjustment: { daily: 800 },
      depositAdjustment: 4000,
    });

    // Product 2: DJI Mavic 3 Pro Drone
    const prodDJIMavic = await Product.create({
      title: 'DJI Mavic 3 Pro Drone (Hasselblad Triple Camera)',
      slug: 'dji-mavic-3-pro-drone',
      category: catDrones._id,
      brand: 'DJI',
      sku: 'DRN-DJI-M3P',
      description: 'Flagship aerial photography drone featuring 4/3 CMOS Hasselblad camera, 43-min flight time, and omnidirectional obstacle sensing.',
      images: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800',
      ],
      baseRates: {
        hourly: 300,
        daily: 2800,
        weekly: 15000,
        monthly: 50000,
      },
      depositRule: { type: 'fixed', value: 10000 },
      accessoriesChecklist: [
        'DJI RC Pro Remote Controller',
        'Intelligent Flight Batteries (x3)',
        'Battery Charging Hub',
        'ND Filter Set (ND8/16/32/64)',
        'Hard Shell Carrying Case',
      ],
      totalRentals: 9,
    });

    // Product 3: Honda 3kVA Silent Inverter Generator
    const prodGenerator = await Product.create({
      title: 'Honda EU30is 3kVA Super Silent Inverter Generator',
      slug: 'honda-eu30is-silent-generator',
      category: catTools._id,
      brand: 'Honda',
      sku: 'GEN-HON-EU30',
      description: 'Ultra quiet portable inverter power for outdoor video shoots, construction sites, and remote event power.',
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
      ],
      baseRates: {
        hourly: 150,
        daily: 1400,
        weekly: 7500,
        monthly: 24000,
      },
      depositRule: { type: 'fixed', value: 4000 },
      accessoriesChecklist: ['Oil check dipstick', 'DC 12V charging cable', 'Spark plug wrench'],
      totalRentals: 6,
    });

    // Product 4: Sennheiser EW-D Wireless Mic Kit
    const prodSennheiser = await Product.create({
      title: 'Sennheiser EW-D Digital Wireless Lavalier Microphone Kit',
      slug: 'sennheiser-ew-d-wireless-mic',
      category: catAudio._id,
      brand: 'Sennheiser',
      sku: 'AUD-SEN-EWD',
      description: 'Professional digital wireless system with ultra-low 1.9 ms latency and 134 dB dynamic range.',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      ],
      baseRates: {
        hourly: 80,
        daily: 750,
        weekly: 4000,
        monthly: 12000,
      },
      depositRule: { type: 'percentage', value: 50 }, // 50% of rental fee
      accessoriesChecklist: ['Transmitter', 'Receiver', 'ME 2 Lavalier Mic', '3.5mm Jack Cable', 'XLR Cable'],
      totalRentals: 18,
    });

    console.log('🏷️ Creating Physical Serialized Inventory Items...');
    // Create physical units for Sony FX3
    const fx3Unit1 = await InventoryItem.create({
      productId: prodSonyFX3._id,
      variantId: varFX3Body._id,
      serialNumber: 'FX3-SN-882910',
      barcode: 'BC-FX3-882910',
      status: 'rented', // Active in an order
      currentCondition: 'excellent',
      cumulativeRentalHours: 124,
      totalRentalsCount: 7,
    });

    const fx3Unit2 = await InventoryItem.create({
      productId: prodSonyFX3._id,
      variantId: varFX3Kit._id,
      serialNumber: 'FX3-SN-882911',
      barcode: 'BC-FX3-882911',
      status: 'available',
      currentCondition: 'good',
      cumulativeRentalHours: 240,
      totalRentalsCount: 12,
    });

    const fx3Unit3 = await InventoryItem.create({
      productId: prodSonyFX3._id,
      variantId: varFX3Kit._id,
      serialNumber: 'FX3-SN-882912',
      barcode: 'BC-FX3-882912',
      status: 'maintenance',
      currentCondition: 'fair',
      cumulativeRentalHours: 380,
      totalRentalsCount: 19,
      notes: 'Sensor cleaning and fan replacement required.',
    });

    // Create physical units for DJI Drone
    const droneUnit1 = await InventoryItem.create({
      productId: prodDJIMavic._id,
      serialNumber: 'DJI-M3P-9901',
      barcode: 'BC-DJI-9901',
      status: 'rented', // In overdue order
      currentCondition: 'good',
      cumulativeRentalHours: 95,
      totalRentalsCount: 5,
    });

    const droneUnit2 = await InventoryItem.create({
      productId: prodDJIMavic._id,
      serialNumber: 'DJI-M3P-9902',
      barcode: 'BC-DJI-9902',
      status: 'available',
      currentCondition: 'excellent',
      cumulativeRentalHours: 42,
      totalRentalsCount: 3,
    });

    // Create physical units for Honda Generator
    const genUnit1 = await InventoryItem.create({
      productId: prodGenerator._id,
      serialNumber: 'HON-EU30-4109',
      barcode: 'BC-HON-4109',
      status: 'available',
      currentCondition: 'good',
      cumulativeRentalHours: 180,
      totalRentalsCount: 9,
    });

    // Create physical units for Mic Kit
    const micUnit1 = await InventoryItem.create({
      productId: prodSennheiser._id,
      serialNumber: 'SEN-EWD-1002',
      barcode: 'BC-SEN-1002',
      status: 'available',
      currentCondition: 'excellent',
      cumulativeRentalHours: 65,
      totalRentalsCount: 8,
    });

    console.log('💰 Creating Pricelists...');
    await Pricelist.create({
      name: 'Default Standard Pricelist',
      isDefault: true,
      customerTier: 'all',
      rules: [],
    });

    await Pricelist.create({
      name: 'VIP Corporate 15% Off Fleet Pricelist',
      isDefault: false,
      customerTier: 'vip',
      description: 'Exclusive 15% discount for verified VIP studio partners.',
      rules: [
        { productId: prodSonyFX3._id, discountPercentage: 15 },
        { productId: prodDJIMavic._id, discountPercentage: 15 },
        { productId: prodSennheiser._id, discountPercentage: 20 },
      ],
    });

    console.log('📜 Creating Sample Completed, Active & Overdue Rental Orders...');
    const now = new Date();

    // 1. Completed Past Order (Settled with Full Refund)
    const pastStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const pastOrder = await RentalOrder.create({
      orderNumber: 'ORD-902141',
      customerId: customer1._id,
      items: [
        {
          productId: prodSennheiser._id,
          inventoryItemId: micUnit1._id,
          rentalStart: pastStart,
          rentalEnd: pastEnd,
          durationHours: 72,
          rateApplied: 750,
          lineRentalFee: 2250,
          lineDeposit: 1125,
        },
      ],
      fulfillmentType: 'store_pickup',
      status: 'closed',
      totalRentalFee: 2250,
      totalDeposit: 1125,
      taxAmount: 405,
      totalPaid: 3780,
      netRefundAmount: 1125,
      pickupScheduledAt: pastStart,
      returnScheduledAt: pastEnd,
      actualDispatchedAt: pastStart,
      actualReturnedAt: pastEnd,
    });

    await SecurityDeposit.create({
      orderId: pastOrder._id,
      customerId: customer1._id,
      initialAmount: 1125,
      heldStatus: 'fully_refunded',
      refundedAmount: 1125,
      settledAt: pastEnd,
      settledBy: admin._id,
    });

    await Payment.create({
      orderId: pastOrder._id,
      customerId: customer1._id,
      amount: 3780,
      type: 'rental_plus_deposit',
      method: 'card_demo',
      status: 'paid',
    });

    await Invoice.create({
      invoiceNumber: 'INV-902141',
      orderId: pastOrder._id,
      customerId: customer1._id,
      items: [{ title: prodSennheiser.title, periodString: '3 Days', amount: 2250 }],
      subtotal: 2250,
      depositAmount: 1125,
      taxAmount: 405,
      totalAmount: 3780,
      refundAmount: 1125,
      paymentStatus: 'settled',
    });

    // 2. Active Ongoing Order (Sony FX3)
    const activeStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const activeEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const activeOrder = await RentalOrder.create({
      orderNumber: 'ORD-902142',
      customerId: customer1._id,
      items: [
        {
          productId: prodSonyFX3._id,
          variantId: varFX3Body._id,
          inventoryItemId: fx3Unit1._id,
          rentalStart: activeStart,
          rentalEnd: activeEnd,
          durationHours: 72,
          rateApplied: 2200,
          lineRentalFee: 6600,
          lineDeposit: 8000,
        },
      ],
      fulfillmentType: 'doorstep_delivery',
      deliveryAddress: customer1.addresses[0],
      status: 'active',
      totalRentalFee: 6600,
      totalDeposit: 8000,
      taxAmount: 1188,
      totalPaid: 15788,
      pickupScheduledAt: activeStart,
      returnScheduledAt: activeEnd,
      actualDispatchedAt: activeStart,
    });

    await SecurityDeposit.create({
      orderId: activeOrder._id,
      customerId: customer1._id,
      initialAmount: 8000,
      heldStatus: 'held',
    });

    await Payment.create({
      orderId: activeOrder._id,
      customerId: customer1._id,
      amount: 15788,
      type: 'rental_plus_deposit',
      method: 'card_demo',
      status: 'paid',
    });

    await Invoice.create({
      invoiceNumber: 'INV-902142',
      orderId: activeOrder._id,
      customerId: customer1._id,
      items: [{ title: prodSonyFX3.title, periodString: '3 Days', amount: 6600 }],
      subtotal: 6600,
      depositAmount: 8000,
      taxAmount: 1188,
      totalAmount: 15788,
      paymentStatus: 'paid',
    });

    // 3. Overdue Order (DJI Drone - scheduled return was yesterday!)
    const overdueStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const overdueEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 24 hours overdue

    const overdueOrder = await RentalOrder.create({
      orderNumber: 'ORD-902143',
      customerId: customer2._id,
      items: [
        {
          productId: prodDJIMavic._id,
          inventoryItemId: droneUnit1._id,
          rentalStart: overdueStart,
          rentalEnd: overdueEnd,
          durationHours: 72,
          rateApplied: 2380, // VIP rate
          lineRentalFee: 7140,
          lineDeposit: 10000,
        },
      ],
      fulfillmentType: 'store_pickup',
      status: 'overdue',
      totalRentalFee: 7140,
      totalDeposit: 10000,
      taxAmount: 1285.2,
      totalPaid: 18425.2,
      lateFeeAccrued: 1500, // Pre-calculated late penalty
      pickupScheduledAt: overdueStart,
      returnScheduledAt: overdueEnd,
      actualDispatchedAt: overdueStart,
    });

    await SecurityDeposit.create({
      orderId: overdueOrder._id,
      customerId: customer2._id,
      initialAmount: 10000,
      heldStatus: 'held',
    });

    await Payment.create({
      orderId: overdueOrder._id,
      customerId: customer2._id,
      amount: 18425.2,
      type: 'rental_plus_deposit',
      method: 'card_demo',
      status: 'paid',
    });

    await Invoice.create({
      invoiceNumber: 'INV-902143',
      orderId: overdueOrder._id,
      customerId: customer2._id,
      items: [{ title: prodDJIMavic.title, periodString: '3 Days', amount: 7140 }],
      subtotal: 7140,
      depositAmount: 10000,
      taxAmount: 1285.2,
      lateFeeAmount: 1500,
      totalAmount: 18425.2,
      paymentStatus: 'paid',
    });

    console.log('📋 Creating Maintenance Work Order...');
    await MaintenanceLog.create({
      inventoryItemId: fx3Unit3._id,
      issueDescription: 'Fan cooling error and sensor dust detected during return intake inspection.',
      severity: 'minor_repair',
      status: 'in_progress',
      estimatedCost: 1500,
      loggedBy: admin._id,
    });

    console.log('📝 Creating Sample Quotations...');
    const quoteValidUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await Quotation.create({
      quotationNumber: 'QT-100892',
      customerId: customer2._id,
      items: [
        {
          productId: prodGenerator._id,
          rentalStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          rentalEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          durationHours: 48,
          appliedRate: 1400,
          rentalFee: 2800,
          depositAmount: 4000,
        },
      ],
      subtotal: 2800,
      depositTotal: 4000,
      taxAmount: 504,
      totalAmount: 7304,
      validUntil: quoteValidUntil,
      status: 'draft',
    });

    console.log('🔔 Creating Seed Notifications...');
    await Notification.create({
      roleTarget: 'admin',
      title: '⚠️ Overdue Alert: Order #ORD-902143',
      message: 'DJI Mavic 3 Pro Drone is overdue by 24 hours. Contact customer Sarah Jenkins.',
      type: 'alert',
      link: '/admin/rentals',
    });

    await Notification.create({
      userId: customer1._id,
      title: '📦 Order Dispatched',
      message: 'Your Sony FX3 Camera is currently active. Return is scheduled for in 2 days.',
      type: 'info',
      link: `/rentals/${activeOrder._id}`,
    });

    console.log('=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('Demo Credentials:');
    console.log('  Admin User:     admin@rental.com   | password: admin123');
    console.log('  Customer User:  john@example.com   | password: customer123');
    console.log('  Customer VIP:   sarah@example.com  | password: customer123');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
