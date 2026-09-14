const Carousel = require("../models/Carousel");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getOverview = async (req, res) => {
  const [orders, products, customers, pendingOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.countDocuments({ status: "pending" }),
  ]);
  res.json({
    success: true,
    stats: { orders, products, customers, pendingOrders },
  });
};

const getCarousel = async (req, res) => {
  const slides = await Carousel.find({ isActive: true }).sort({
    position: 1,
    createdAt: 1,
  });
  res.json({ success: true, slides });
};

const createCarousel = async (req, res) => {
  const slide = await Carousel.create(req.body);
  res.status(201).json({ success: true, slide });
};

const updateCarousel = async (req, res) => {
  const slide = await Carousel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!slide)
    return res
      .status(404)
      .json({ success: false, message: "Carousel slide not found" });
  res.json({ success: true, slide });
};

const deleteCarousel = async (req, res) => {
  const slide = await Carousel.findByIdAndDelete(req.params.id);
  if (!slide)
    return res
      .status(404)
      .json({ success: false, message: "Carousel slide not found" });
  res.json({ success: true, message: "Carousel slide deleted" });
};

module.exports = {
  getOverview,
  getCarousel,
  createCarousel,
  updateCarousel,
  deleteCarousel,
};
