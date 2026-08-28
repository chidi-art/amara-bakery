const Order = require('../models/Order');
const service = require('../services/payment.service');

const initialize = async (req, res) => {
  const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, payment: await service.initializePayment(order, req.user) });
};
const verify = async (req, res) => res.json({ success: true, payment: await service.verifyPayment(req.params.reference) });
const webhook = async (req, res) => { await service.processWebhook(req.body, req.headers['x-paystack-signature'], req.rawBody); res.sendStatus(200); };
module.exports = { initialize, verify, webhook };