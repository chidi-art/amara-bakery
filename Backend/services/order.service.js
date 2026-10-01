const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createOrder = async (userId, deliveryAddress) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart?.items.length) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }
  if (!deliveryAddress) {
    const error = new Error("Delivery address is required");
    error.statusCode = 400;
    throw error;
  }
  const items = cart.items.map(({ product, quantity }) => ({
    product: product._id,
    name: product.name,
    price: product.price,
    quantity,
  }));
  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    deliveryAddress,
  });
  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
  return order;
};

const createGuestOrder = async (
  { items: requestedItems, deliveryAddress, customer },
  userId,
) => {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const error = new Error("Order must contain at least one product");
    error.statusCode = 400;
    throw error;
  }
  if (!deliveryAddress) {
    const error = new Error("Delivery address is required");
    error.statusCode = 400;
    throw error;
  }

  const items = [];
  const cookieUnits = { classic: [], signature: [] };
  let totalAmount = 0;
  for (const requestedItem of requestedItems) {
    const quantity = Number(requestedItem.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      const error = new Error("Each product quantity must be between 1 and 10");
      error.statusCode = 400;
      throw error;
    }
    const product = await Product.findOne({
      _id: requestedItem.product,
      isAvailable: true,
    });
    if (!product) {
      const error = new Error("One or more products are unavailable");
      error.statusCode = 400;
      throw error;
    }
    const breadOption = requestedItem.breadOption
      ? product.breadOptions.find(
          (option) => option.key === requestedItem.breadOption,
        )
      : null;
    if (product.breadOptions.length && !breadOption) {
      const error = new Error("Choose a valid bread size for each loaf");
      error.statusCode = 400;
      throw error;
    }
    const price = breadOption?.price ?? product.price;
    const cookieType = product.cookieType;
    if (cookieType === "classic" || cookieType === "signature") {
      for (let count = 0; count < quantity; count += 1) {
        cookieUnits[cookieType].push(price);
      }
    } else {
      totalAmount += price * quantity;
    }
    items.push({
      product: product._id,
      name: breadOption
        ? `${product.name} (${breadOption.label})`
        : product.name,
      price,
      quantity,
    });
  }

  for (const [type, bundlePrice] of Object.entries({
    classic: 50,
    signature: 55,
  })) {
    const prices = cookieUnits[type].sort((left, right) => right - left);
    const bundleCount = Math.floor(prices.length / 3);
    totalAmount +=
      bundleCount * bundlePrice +
      prices.slice(bundleCount * 3).reduce((sum, price) => sum + price, 0);
  }
  return Order.create({
    user: userId,
    items,
    totalAmount,
    deliveryAddress,
    customer,
  });
};

module.exports = { createOrder, createGuestOrder };
