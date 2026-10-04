const nodemailer = require("nodemailer");

let transporter;

const hasEmailProvider = () =>
  Boolean(process.env.RESEND_API_KEY || getTransporter());

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

const sendEmail = async (to, subject, text) => {
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("EMAIL_FROM or SMTP_FROM is not configured");

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Resend request failed (${response.status}): ${details || response.statusText}`,
      );
    }
    return response.json();
  }

  const mailer = getTransporter();
  if (!mailer) throw new Error("SMTP or RESEND_API_KEY is not configured");
  return mailer.sendMail({ from, to, subject, text });
};

const notifyOwner = async (subject, text) => {
  const recipient = process.env.OWNER_EMAIL || "amarasbakerymenu@gmail.com";
  if (!hasEmailProvider() || !recipient) {
    console.warn(
      "Owner email notification skipped: configure RESEND_API_KEY or SMTP settings.",
    );
    return;
  }
  await sendEmail(recipient, subject, text);
};

const notifyOwnerSafely = (subject, text) => {
  notifyOwner(subject, text).catch((error) =>
    console.error("Owner email failed:", error.message),
  );
};

module.exports = { notifyOwnerSafely, sendEmail };
