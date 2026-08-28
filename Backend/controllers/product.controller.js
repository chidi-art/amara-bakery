const mongoose = require('mongoose');
const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const { category, search, sort, page = 1, limit = 20 } = req.query;
  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
  const sortValue = sort === 'price' ? { price: 1 } : sort === '-price' ? { price: -1 } : { createdAt: -1 };
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category').sort(sortValue).skip((pageNumber - 1) * limitNumber).limit(limitNumber),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, products, pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) } });
};

const getProductById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

const createProduct = async (req, res) => res.status(201).json({ success: true, product: await Product.create(req.body) });
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };