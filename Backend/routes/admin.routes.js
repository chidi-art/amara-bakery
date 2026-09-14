const express = require("express");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/admin.controller");
const reviewController = require("../controllers/review.controller");

const router = express.Router();
router.use(auth, admin);
router.get("/overview", asyncHandler(controller.getOverview));
router.get("/carousel", asyncHandler(controller.getCarousel));
router.post("/carousel", asyncHandler(controller.createCarousel));
router.put("/carousel/:id", asyncHandler(controller.updateCarousel));
router.delete("/carousel/:id", asyncHandler(controller.deleteCarousel));
router.get("/reviews", asyncHandler(reviewController.adminList));
router.put("/reviews/:id", asyncHandler(reviewController.update));

module.exports = router;
