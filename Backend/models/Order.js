const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        name: {
          type: String,
          required: true
        },

        price: {
          type: Number,
          required: true,
          min: 0
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    customer: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true }
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
