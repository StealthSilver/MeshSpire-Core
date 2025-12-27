import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM not defined");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
