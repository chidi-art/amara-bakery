const Order = require("../models/Order");
const { createOrder, createGuestOrder } = require("../services/order.service");
const {
  notifyOwnerSafely,
  sendEmail,
} = require("../services/notification.service");

const notifyOrder = (order, account) => {
  const items = order.items
    ?.map((item) => `- ${item.name} x${item.quantity} @ ${item.price}`)
    .join("\n");

  notifyOwnerSafely(
    "New bakery order received",
    `Order: ${order._id}\nCustomer: ${order.customer?.name || (account ? `${account.firstName} ${account.lastName}` : "Registered customer")}\nEmail: ${order.customer?.email || account?.email || "Account order"}\nPhone: ${order.customer?.phone || account?.phone || "Not provided"}\nDelivery address: ${order.deliveryAddress || "Not provided"}\nItems ordered:\n${items || "No items"}\nTotal: ${order.totalAmount}`,
  );
};
const notifyCustomerSafely = (order, account) => {
  const email = order.customer?.email || account?.email;
  if (!email) return;

  const items = order.items
    ?.map((item) => `- ${item.name} x${item.quantity} @ ${item.price} kr`)
    .join("\n");
  const name =
    order.customer?.name ||
    (account ? `${account.firstName} ${account.lastName}` : "there");
  sendEmail(
    email,
    "We received your order at Amara's Bakery",
    `Hi ${name},\n\nThank you for your order. Here are your order details:\n\nOrder: ${order._id}\nFulfillment: ${order.deliveryAddress}\nItems:\n${items || "No items"}\n\nTotal: ${order.totalAmount} kr\n\nAmara will get back to you soon.`,
  ).catch((error) =>
    console.error("Customer order email failed:", error.message),
  );
};
const create = async (req, res) => {
  const order = await createOrder(req.user._id, req.body.deliveryAddress);
  notifyOrder(order, req.user);
  notifyCustomerSafely(order, req.user);
  res.status(201).json({ success: true, order });
};
const createGuest = async (req, res) => {
  const order = await createGuestOrder(req.body, req.user?._id);
  notifyOrder(order, req.user);
  notifyCustomerSafely(order, req.user);
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
  const previousOrder = await Order.findById(req.params.id);
  if (!previousOrder)
    return res.status(404).json({ success: false, message: "Order not found" });
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: "after", runValidators: true },
  );
  if (req.body.status === "completed" && previousOrder.status !== "completed") {
    const customer = order.customer || {};
    const items = order.items
      .map((item) => `- ${item.name} x${item.quantity} @ ${item.price}`)
      .join("\n");
    const orderedAt = new Date(order.createdAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    notifyOwnerSafely(
      `Order completed: ${order._id}`,
      `Order ${order._id} has been completed.\n\nCustomer: ${customer.name || "Registered customer"}\nEmail: ${customer.email || "Account order"}\nPhone: ${customer.phone || "Not provided"}\nOrder date and time: ${orderedAt}\nDelivery address: ${order.deliveryAddress}\n\nItems ordered:\n${items}\n\nTotal: ${order.totalAmount}`,
    );
  }
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
