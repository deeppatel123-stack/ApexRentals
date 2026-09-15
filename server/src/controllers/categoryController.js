import Category from '../models/Category.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ status: 'success', data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, description, icon, imageUrl });
    res.status(201).json({ status: 'success', data: { category } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    res.status(200).json({ status: 'success', data: { category } });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    res.status(200).json({ status: 'success', message: 'Category deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};
