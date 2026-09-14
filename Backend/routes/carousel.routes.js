const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/admin.controller");

const router = express.Router();
router.get("/", asyncHandler(controller.getCarousel));

module.exports = router;
