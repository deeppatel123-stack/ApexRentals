import InventoryItem from '../models/InventoryItem.js';
import RentalOrder from '../models/RentalOrder.js';

const TURNAROUND_BUFFER_HOURS = 1;

/**
 * Checks if a specific physical InventoryItem is available during a given time window.
 */
export const isItemAvailable = async (inventoryItemId, startDate, endDate, excludeOrderId = null) => {
  const item = await InventoryItem.findById(inventoryItemId);
  if (!item || !item.isActive || item.status === 'retired' || item.status === 'maintenance') {
    return false;
  }

  const startWithBuffer = new Date(new Date(startDate).getTime() - TURNAROUND_BUFFER_HOURS * 60 * 60 * 1000);
  const endWithBuffer = new Date(new Date(endDate).getTime() + TURNAROUND_BUFFER_HOURS * 60 * 60 * 1000);

  const query = {
    _id: { $ne: excludeOrderId },
    status: { $in: ['confirmed', 'dispatched_or_ready', 'active'] },
    'items.inventoryItemId': inventoryItemId,
    $or: [
      {
        'items.rentalStart': { $lt: endWithBuffer },
        'items.rentalEnd': { $gt: startWithBuffer },
      },
    ],
  };

  const conflictingOrder = await RentalOrder.findOne(query);
  return !conflictingOrder;
};

/**
 * Finds all available physical inventory items for a product (and optional variant) for a date range.
 */
export const getAvailableInventoryUnits = async (productId, variantId = null, startDate, endDate) => {
  const query = {
    productId,
    isActive: true,
    status: { $nin: ['retired', 'maintenance'] },
  };

  if (variantId) {
    query.variantId = variantId;
  }

  const allCandidateItems = await InventoryItem.find(query);
  const availableItems = [];

  for (const item of allCandidateItems) {
    const available = await isItemAvailable(item._id, startDate, endDate);
    if (available) {
      availableItems.push(item);
    }
  }

  return availableItems;
};

/**
 * Validates availability for an entire cart/list of items.
 */
export const validateCartAvailability = async (cartItems) => {
  const results = [];

  for (const item of cartItems) {
    const availableUnits = await getAvailableInventoryUnits(
      item.productId,
      item.variantId || null,
      item.rentalStart,
      item.rentalEnd
    );

    const isAvailable = availableUnits.length >= (item.quantity || 1);

    results.push({
      productId: item.productId,
      variantId: item.variantId,
      availableCount: availableUnits.length,
      requestedCount: item.quantity || 1,
      isAvailable,
      assignedUnitId: isAvailable && availableUnits[0] ? availableUnits[0]._id : null,
    });
  }

  const allAvailable = results.every((r) => r.isAvailable);
  return { allAvailable, itemBreakdown: results };
};
