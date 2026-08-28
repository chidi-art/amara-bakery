const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    image: {
      type: String,
      required: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;