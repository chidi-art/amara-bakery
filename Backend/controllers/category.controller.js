const Category = require('../models/Categories');

const getCategories = async (req, res) => res.json({ success: true, categories: await Category.find({ isActive: true }).sort({ name: 1 }) });
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};
const createCategory = async (req, res) => res.status(201).json({ success: true, category: await Category.create(req.body) });
const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};
const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};
module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };