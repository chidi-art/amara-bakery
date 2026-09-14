const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/message.controller");

const router = express.Router();
router.post("/", asyncHandler(controller.create));

module.exports = router;
