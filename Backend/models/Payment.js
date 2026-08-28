const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    reference: {
      type: String,
      required: true,
      unique: true
    },

    method: {
      type: String,
      default: "paystack"
    },

    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending"
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);

