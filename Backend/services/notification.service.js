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
  const recipient = process.env.OWNER_EMAIL;
  if (!mailer || !recipient) {
    console.warn(
      "Owner email notification skipped: configure OWNER_EMAIL and SMTP settings.",
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

module.exports = { notifyOwnerSafely };
