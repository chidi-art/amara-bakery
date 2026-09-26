const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getMe);

module.exports = router;
