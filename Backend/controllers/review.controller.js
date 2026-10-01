const Review = require("../models/Review");
const Product = require("../models/Product");
const { notifyOwnerSafely } = require("../services/notification.service");

const list = async (req, res) => {
  const filter = { approved: true };
  if (req.params.productId) filter.product = req.params.productId;
  const reviews = await Review.find(filter)
    .populate("user", "firstName lastName")
    .populate("product", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
};

const create = async (req, res) => {
  if (
    req.params.productId &&
    !(await Product.exists({ _id: req.params.productId }))
  )
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  const review = await Review.create({
    product: req.params.productId || undefined,
    rating: req.body.rating,
    comment: req.body.comment,
    user: req.user._id,
  });
  notifyOwnerSafely(
    "New bakery review awaiting approval",
    `${req.user.firstName} ${req.user.lastName} (${req.user.email}) submitted a ${review.rating}/5 review:\n\n${review.comment}`,
  );
  res.status(201).json({ success: true, review });
};

const adminList = async (req, res) =>
  res.json({
    success: true,
    reviews: await Review.find()
      .populate("user", "firstName lastName email")
      .populate("product", "name")
      .sort({ approved: 1, createdAt: -1 }),
  });

const update = async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
  const updates =
    req.user.role === "admin"
      ? { approved: Boolean(req.body.approved) }
      : { rating: req.body.rating, comment: req.body.comment, approved: false };
  const review = await Review.findOneAndUpdate(filter, updates, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!review)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, review });
};

const remove = async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
  const review = await Review.findOneAndDelete(filter);
  if (!review)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  res.json({ success: true, message: "Review deleted" });
};

module.exports = { list, create, adminList, update, remove };
