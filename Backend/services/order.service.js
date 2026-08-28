const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

const createOrder = async (userId, deliveryAddress) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart?.items.length) { const error = new Error('Cart is empty'); error.statusCode = 400; throw error; }
  if (!deliveryAddress) { const error = new Error('Delivery address is required'); error.statusCode = 400; throw error; }
  const items = cart.items.map(({ product, quantity }) => ({ product: product._id, name: product.name, price: product.price, quantity }));
  for (const item of items) {
    const result = await Product.updateOne({ _id: item.product, isAvailable: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
    if (result.modifiedCount !== 1) { const error = new Error(`Insufficient stock for ${item.name}`); error.statusCode = 400; throw error; }
  }
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const order = await Order.create({ user: userId, items, totalAmount, deliveryAddress });
  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
  return order;
};

const createGuestOrder = async ({ items: requestedItems, deliveryAddress, customer }) => {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const error = new Error('Order must contain at least one product');
    error.statusCode = 400;
    throw error;
  }
  if (!deliveryAddress) {
    const error = new Error('Delivery address is required');
    error.statusCode = 400;
    throw error;
  }

  const items = [];
  for (const requestedItem of requestedItems) {
    const quantity = Number(requestedItem.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      const error = new Error('Each product quantity must be between 1 and 10');
      error.statusCode = 400;
      throw error;
    }
    const product = await Product.findOne({ _id: requestedItem.product, isAvailable: true });
    if (!product) {
      const error = new Error('One or more products are unavailable');
      error.statusCode = 400;
      throw error;
    }
    const result = await Product.updateOne(
      { _id: product._id, isAvailable: true, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } }
    );
    if (result.modifiedCount !== 1) {
      const error = new Error(`Insufficient stock for ${product.name}`);
      error.statusCode = 400;
      throw error;
    }
    items.push({ product: product._id, name: product.name, price: product.price, quantity });
  }

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return Order.create({ items, totalAmount, deliveryAddress, customer });
};

module.exports = { createOrder, createGuestOrder };