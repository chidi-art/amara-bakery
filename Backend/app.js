const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

app.use(cors());
app.use(express.json({ verify: (req, res, buffer) => { req.rawBody = buffer; } }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', reviewRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorMiddleware);

module.exports = app;

