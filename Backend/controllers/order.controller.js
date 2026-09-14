const Order = require("../models/Order");
const { createOrder, createGuestOrder } = require("../services/order.service");
const { notifyOwnerSafely } = require("../services/notification.service");

const notifyOrder = (order, account) =>
  notifyOwnerSafely(
    "New bakery order received",
    `Order: ${order._id}\nCustomer: ${order.customer?.name || (account ? `${account.firstName} ${account.lastName}` : "Registered customer")}\nEmail: ${order.customer?.email || account?.email || "Account order"}\nTotal: ${order.totalAmount}`,
  );
const create = async (req, res) => {
  const order = await createOrder(req.user._id, req.body.deliveryAddress);
  notifyOrder(order, req.user);
  res.status(201).json({ success: true, order });
};
const createGuest = async (req, res) => {
  const order = await createGuestOrder(req.body);
  notifyOrder(order);
  res.status(201).json({ success: true, order });
};
const getOrders = async (req, res) =>
  res.json({
    success: true,
    orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }),
  });
const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order });
};
const getAllOrders = async (req, res) =>
  res.json({
    success: true,
    orders: await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 }),
  });
const updateStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order });
};
module.exports = {
  create,
  createGuest,
  getOrders,
  getOrderById,
  getAllOrders,
  updateStatus,
};
