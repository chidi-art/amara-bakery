const Order = require('../models/Order');
const { createOrder, createGuestOrder } = require('../services/order.service');

const create = async (req, res) => res.status(201).json({ success: true, order: await createOrder(req.user._id, req.body.deliveryAddress) });
const createGuest = async (req, res) => res.status(201).json({ success: true, order: await createGuestOrder(req.body) });
const getOrders = async (req, res) => res.json({ success: true, orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) });
const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};
const getAllOrders = async (req, res) => res.json({ success: true, orders: await Order.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 }) });
const updateStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};
module.exports = { create, createGuest, getOrders, getOrderById, getAllOrders, updateStatus };