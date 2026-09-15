import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import InventoryItem from '../models/InventoryItem.js';
import { calculateRentalCost } from '../services/pricingService.js';
import { getAvailableInventoryUnits } from '../services/availabilityService.js';

export const listProducts = async (req, res, next) => {
  try {
    const { category, search, brand, activeOnly = 'true' } = req.query;
    const filter = {};

    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    const variants = await ProductVariant.find({ productId: product._id, isActive: true });
    const inventoryCount = await InventoryItem.countDocuments({
      productId: product._id,
      status: 'available',
      isActive: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        product,
        variants,
        availableUnitsCount: inventoryCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      sku,
      images,
      baseRates,
      depositRule,
      requiresSerialTracking,
      accessoriesChecklist,
    } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      title,
      slug,
      description,
      category,
      brand: brand || 'Generic',
      sku,
      images: images || [],
      baseRates: baseRates || { hourly: 0, daily: 100 },
      depositRule: depositRule || { type: 'fixed', value: 1000 },
      requiresSerialTracking: requiresSerialTracking !== undefined ? requiresSerialTracking : true,
      accessoriesChecklist: accessoriesChecklist || [],
    });

    res.status(201).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    res.status(200).json({ status: 'success', message: 'Product deactivated.' });
  } catch (error) {
    next(error);
  }
};

// Create Product Variant
export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sku, title, attributes, priceAdjustment, depositAdjustment } = req.body;

    const variant = await ProductVariant.create({
      productId,
      sku,
      title: title || sku,
      attributes: attributes || {},
      priceAdjustment: priceAdjustment || {},
      depositAdjustment: depositAdjustment || 0,
    });

    res.status(201).json({ status: 'success', data: { variant } });
  } catch (error) {
    next(error);
  }
};

// Calculate Rental Price Preview for User
export const getPricePreview = async (req, res, next) => {
  try {
    const { productId, variantId, startDate, endDate } = req.body;
    const customerTier = req.user?.tier || 'standard';

    const costBreakdown = await calculateRentalCost({
      productId,
      variantId,
      startDate,
      endDate,
      customerTier,
    });

    const availableUnits = await getAvailableInventoryUnits(
      productId,
      variantId,
      startDate,
      endDate
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...costBreakdown,
        isAvailable: availableUnits.length > 0,
        availableUnitsCount: availableUnits.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
