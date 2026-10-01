const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  )
    return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
};

const notifyOwner = async (subject, text) => {
  const mailer = getTransporter();
  const recipient = process.env.OWNER_EMAIL || "amarasbakerymenu@gmail.com";
  if (!mailer || !recipient) {
    console.warn(
      "Owner email notification skipped: configure OWNER_EMAIL or SMTP_USER and SMTP settings.",
    );
    return;
  }
  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject,
    text,
  });
};

const notifyOwnerSafely = (subject, text) => {
  notifyOwner(subject, text).catch((error) =>
    console.error("Owner email failed:", error.message),
  );
};

const sendEmail = async (to, subject, text) => {
  const mailer = getTransporter();
  if (!mailer) throw new Error("SMTP is not configured");
  return mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
};

module.exports = { notifyOwnerSafely, sendEmail };
