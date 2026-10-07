const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  notifyCustomerSafely,
  sendEmail,
} = require("../services/notification.service");

const publicUser = (user) => {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
};

const registerUser = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, phone } = req.body;
    const splitName = (name || "").trim().split(/\s+/);
    const resolvedFirstName = (firstName || splitName[0] || "").trim();
    const resolvedLastName = (
      lastName ||
      splitName.slice(1).join(" ") ||
      ""
    ).trim();

    if (!resolvedFirstName || !resolvedLastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      ...(phone ? { phone: phone.trim() } : {}),
    });
    notifyCustomerSafely(
      user.email,
      "Welcome to Amara's Bakery",
      `Hi ${user.firstName},\n\nYour Amara's Bakery account has been created successfully.\n\nIf you did not create this account, please contact us.`,
    );
    return res.status(201).json({
      success: true,
      user: publicUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to register user" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email: (email || "").trim().toLowerCase(),
  });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
  return res.json({
    success: true,
    user: publicUser(user),
    token: generateToken(user),
  });
};

const getMe = (req, res) => res.json({ success: true, user: req.user });

const requestPasswordReset = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    const clientUrl =
      process.env.CLIENT_URL || "https://amara-bakery.onrender.com";
    const resetUrl = `${clientUrl}/reset-password.html?token=${token}`;
    await sendEmail(
      user.email,
      "Reset your Amara's Bakery password",
      `We received a password reset request. Use this link within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    );
  }
  res.json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token || "")
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res
      .status(400)
      .json({
        success: false,
        message: "This reset link is invalid or expired.",
      });
  if (!req.body.password || req.body.password.length < 6)
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  notifyCustomerSafely(
    user.email,
    "Your Amara's Bakery password was changed",
    `Hi ${user.firstName},\n\nYour Amara's Bakery account password was changed successfully.\n\nIf you did not make this change, please contact us immediately.`,
  );
  res.json({
    success: true,
    message: "Password reset successfully. You can now log in.",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  requestPasswordReset,
  resetPassword,
};
