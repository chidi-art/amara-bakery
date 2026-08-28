const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json({ success: true, cart: cart || { user: req.user._id, items: [] } });
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const amount = Number(quantity);
  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) return res.status(404).json({ success: false, message: 'Product not found' });
  if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  const nextQuantity = (item?.quantity || 0) + amount;
  if (nextQuantity > product.stock) return res.status(400).json({ success: false, message: 'Insufficient stock' });
  if (item) item.quantity = nextQuantity;
  else cart.items.push({ product: productId, quantity: amount });
  await cart.save();
  await cart.populate('items.product');
  res.status(201).json({ success: true, cart });
};

const updateCartItem = async (req, res) => {
  const quantity = Number(req.body.quantity);
  const product = await Product.findById(req.params.productId);
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find((entry) => entry.product.toString() === req.params.productId);
  if (!item || !product) return res.status(404).json({ success: false, message: 'Cart item not found' });
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return res.status(400).json({ success: false, message: 'Invalid quantity or insufficient stock' });
  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
};
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } }, { new: true }).populate('items.product');
  res.json({ success: true, cart: cart || { user: req.user._id, items: [] } });
};
const clearCart = async (req, res) => { await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }); res.json({ success: true, message: 'Cart cleared' }); };
module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };