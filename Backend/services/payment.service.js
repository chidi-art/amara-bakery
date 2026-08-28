const crypto = require('node:crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const paystackRequest = async (path, options = {}) => {
  if (!process.env.PAYSTACK_SECRET_KEY) { const error = new Error('PAYSTACK_SECRET_KEY is not configured'); error.statusCode = 503; throw error; }
  const response = await fetch(`https://api.paystack.co${path}`, { ...options, headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json();
  if (!response.ok || !body.status) { const error = new Error(body.message || 'Paystack request failed'); error.statusCode = 502; throw error; }
  return body.data;
};

const initializePayment = async (order, user) => {
  const reference = `order_${order._id}_${Date.now()}`;
  const data = await paystackRequest('/transaction/initialize', { method: 'POST', body: JSON.stringify({ email: user.email, amount: Math.round(order.totalAmount * 100), reference }) });
  await Payment.create({ order: order._id, user: user._id, amount: order.totalAmount, reference });
  return data;
};

const verifyPayment = async (reference) => {
  const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
  const status = data.status === 'success' ? 'successful' : 'failed';
  const payment = await Payment.findOneAndUpdate({ reference }, { status, paidAt: status === 'successful' ? new Date() : undefined }, { new: true });
  if (payment && status === 'successful') await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
  return payment;
};

const processWebhook = async (payload, signature, rawBody) => {
  const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(rawBody || JSON.stringify(payload)).digest('hex');
  if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) { const error = new Error('Invalid webhook signature'); error.statusCode = 401; throw error; }
  if (payload.event === 'charge.success') await verifyPayment(payload.data.reference);
};

module.exports = { initializePayment, verifyPayment, processWebhook };