const Carousel = require("../models/Carousel");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const uploadImageToCloudinary = require("../services/image-upload.service");

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Choose an image file." });
  }
  const image = await uploadImageToCloudinary(req.file.buffer, "products");
  res.status(201).json({ success: true, image });
};

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
  const slides = await Carousel.find({
    isActive: true,
    image: { $not: /^Images\/carosel_images\//i },
  }).sort({ position: 1, createdAt: 1 });
  res.json({ success: true, slides });
};

const createCarousel = async (req, res) => {
  const data = { ...req.body };
  if (req.file)
    data.image = await uploadImageToCloudinary(req.file.buffer, "carousel");
  const slide = await Carousel.create(data);
  res.status(201).json({ success: true, slide });
};

const updateCarousel = async (req, res) => {
  const data = { ...req.body };
  if (req.file)
    data.image = await uploadImageToCloudinary(req.file.buffer, "carousel");
  const slide = await Carousel.findByIdAndUpdate(req.params.id, data, {
    returnDocument: "after",
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
  uploadImage,
  getOverview,
  getCarousel,
  createCarousel,
  updateCarousel,
  deleteCarousel,
};
