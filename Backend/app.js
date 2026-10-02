const express = require("express");
const path = require("node:path");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
const carouselRoutes = require("./routes/carousel.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();
const clientUrl = process.env.CLIENT_URL || "https://amara-bakery-5.onrender.com";
const allowedOrigins = new Set([
  new URL(clientUrl).origin,
  "https://amara-bakery-3.onrender.com",
]);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
  }),
);
app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API is healthy" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use(errorMiddleware);

module.exports = app;
