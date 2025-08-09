import nodemailer from 'nodemailer';

// Gmail transporter reused by API routes
// Requires env vars: NEXT_PUBLIC_EMAIL, NEXT_PUBLIC_EMAIL_PASS
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
  },
});

export default transporter;

