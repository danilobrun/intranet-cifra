const nodemailer = require("nodemailer");

const REQUIRED_SMTP_ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
  "SMTP_FROM_NAME",
];

const parseBooleanEnv = (value) => String(value).toLowerCase() === "true";

const getMissingSmtpEnvKeys = () =>
  REQUIRED_SMTP_ENV_KEYS.filter((key) => !process.env[key]);

const ensureSmtpConfig = () => {
  const missingKeys = getMissingSmtpEnvKeys();

  if (missingKeys.length) {
    throw new Error(
      `Missing SMTP environment variables: ${missingKeys.join(", ")}`,
    );
  }
};

const createMailTransporter = () => {
  ensureSmtpConfig();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: parseBooleanEnv(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildDefaultFrom = () =>
  `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`;

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = createMailTransporter();

  return transporter.sendMail({
    from: buildDefaultFrom(),
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  createMailTransporter,
  ensureSmtpConfig,
  getMissingSmtpEnvKeys,
  sendMail,
};
