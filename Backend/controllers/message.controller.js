const Message = require("../models/Message");
const { notifyOwnerSafely } = require("../services/notification.service");

const create = async (req, res) => {
  const message = await Message.create({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });
  notifyOwnerSafely(
    `New bakery message: ${message.subject}`,
    `From: ${message.name} (${message.email})\n\n${message.message}`,
  );
  res.status(201).json({ success: true, message: "Message sent" });
};

module.exports = { create };
