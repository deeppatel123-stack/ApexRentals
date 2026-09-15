import InventoryItem from '../models/InventoryItem.js';

export const listInventory = async (req, res, next) => {
  try {
    const { productId, status, condition } = req.query;
    const filter = { isActive: true };

    if (productId) filter.productId = productId;
    if (status) filter.status = status;
    if (condition) filter.currentCondition = condition;

    const items = await InventoryItem.find(filter)
      .populate('productId', 'title sku brand images baseRates')
      .populate('variantId', 'title attributes sku')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const { productId, variantId, serialNumber, barcode, currentCondition, notes } = req.body;

    const existing = await InventoryItem.findOne({ serialNumber });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'An asset with this serial number already exists.' });
    }

    const item = await InventoryItem.create({
      productId,
      variantId: variantId || null,
      serialNumber,
      barcode: barcode || `BC-${serialNumber}`,
      currentCondition: currentCondition || 'excellent',
      notes: notes || '',
      status: 'available',
    });

    res.status(201).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ status: 'fail', message: 'Inventory item not found.' });
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};
