const bcrypt = require('bcrypt');
const User = require('../models/User');

const getProfile = (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'addresses'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
  res.json({ success: true, user });
};

const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
};

const getUsers = async (req, res) => res.json({ success: true, users: await User.find().select('-password') });
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

module.exports = { getProfile, updateProfile, deleteAccount, getUsers, getUserById, bcrypt };