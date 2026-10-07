const bcrypt = require("bcrypt");
const User = require("../models/User");
const { notifyCustomerSafely } = require("../services/notification.service");

const getProfile = (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res) => {
  const allowed = ["firstName", "lastName", "phone", "addresses"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );
  const changedFields = Object.keys(updates).filter(
    (key) => JSON.stringify(req.user[key] ?? null) !== JSON.stringify(updates[key] ?? null),
  );
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    returnDocument: "after",
    runValidators: true,
  }).select("-password");
  if (changedFields.length) {
    notifyCustomerSafely(
      user.email,
      "Your Amara's Bakery account was updated",
      `Hi ${user.firstName},\n\nThe following details on your Amara's Bakery account were updated: ${changedFields.join(", ")}.\n\nIf you did not make this change, please contact us.`,
    );
  }
  res.json({ success: true, user });
};

const deleteAccount = async (req, res) => {
  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin accounts cannot be deleted here",
    });
  }
  await User.findByIdAndDelete(req.user._id);
  notifyCustomerSafely(
    req.user.email,
    "Your Amara's Bakery account was deleted",
    `Hi ${req.user.firstName},\n\nYour Amara's Bakery account has been deleted.\n\nIf you did not request this, please contact us.`,
  );
  res.json({ success: true, message: "Account deleted" });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    return res.status(400).json({
      success: false,
      message: "Current password and a new password of at least 6 characters are required",
    });
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "User account no longer exists" });
  }
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res
      .status(400)
      .json({ success: false, message: "Current password is incorrect" });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  notifyCustomerSafely(
    user.email,
    "Your Amara's Bakery password was changed",
    `Hi ${user.firstName},\n\nYour Amara's Bakery account password was changed successfully.\n\nIf you did not make this change, please contact us immediately.`,
  );
  return res.json({ success: true, message: "Password updated successfully." });
};

const getUsers = async (req, res) =>
  res.json({ success: true, users: await User.find().select("-password") });
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getUsers,
  getUserById,
  bcrypt,
};
