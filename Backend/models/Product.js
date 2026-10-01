const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    breadOptions: [
      {
        key: {
          type: String,
          enum: ["single-serving", "classic-loaf", "premium-loaf"],
          required: true,
        },
        label: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    cookieType: {
      type: String,
      enum: ["classic", "signature"],
    },

    isSpecial: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
