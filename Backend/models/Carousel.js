const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
  {
    image: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: "" },
    alt: { type: String, trim: true, default: "Bakery selection" },
    position: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Carousel", carouselSchema);
