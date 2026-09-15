import Pricelist from '../models/Pricelist.js';

export const listPricelists = async (req, res, next) => {
  try {
    const pricelists = await Pricelist.find().populate('rules.productId', 'title sku baseRates');
    res.status(200).json({ status: 'success', data: { pricelists } });
  } catch (error) {
    next(error);
  }
};

export const createPricelist = async (req, res, next) => {
  try {
    const { name, description, isDefault, customerTier, startDate, endDate, rules } = req.body;

    if (isDefault) {
      await Pricelist.updateMany({}, { isDefault: false });
    }

    const pricelist = await Pricelist.create({
      name,
      description,
      isDefault: isDefault || false,
      customerTier: customerTier || 'all',
      startDate: startDate || null,
      endDate: endDate || null,
      rules: rules || [],
    });

    res.status(201).json({ status: 'success', data: { pricelist } });
  } catch (error) {
    next(error);
  }
};

export const updatePricelist = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Pricelist.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const pricelist = await Pricelist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pricelist) return res.status(404).json({ status: 'fail', message: 'Pricelist not found.' });

    res.status(200).json({ status: 'success', data: { pricelist } });
  } catch (error) {
    next(error);
  }
};
