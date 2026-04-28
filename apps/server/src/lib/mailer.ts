import nodemailer from "nodemailer";
import { env } from "@sellspace/env/server";

function otpEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #F2F2EF; font-family: Arial, sans-serif; }
    .container { max-width: 480px; margin: 40px auto; background: #FAFAF8; border-radius: 14px; overflow: hidden; border: 1px solid #E2E2DC; }
    .header { background: #0D3B2E; padding: 28px 32px; }
    .logo { font-size: 22px; font-weight: 700; color: #FAFAF8; letter-spacing: -0.5px; margin: 0; }
    .logo span { color: #E8621A; }
    .body { padding: 32px; }
    .title { font-size: 16px; font-weight: 600; color: #1A1A18; margin: 0 0 8px; }
    .desc { font-size: 14px; color: #4A4A45; margin: 0 0 24px; }
    .otp { font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #E8621A; text-align: center; margin: 0 0 24px; padding: 16px; background: #EFEFEB; border-radius: 10px; }
    .note { font-size: 13px; color: #8A8A82; text-align: center; margin: 0; }
    .footer { padding: 16px 32px; border-top: 1px solid #E2E2DC; font-size: 12px; color: #8A8A82; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="logo">sell<span>space</span></p>
    </div>
    <div class="body">
      <p class="title">Your sign-in code</p>
      <p class="desc">Use the code below to sign in to your Sellspace account. It expires in <strong>10 minutes</strong>.</p>
      <div class="otp">${otp}</div>
      <p class="note">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">sellspace.co.zw &middot; Zimbabwe's marketplace</div>
  </div>
</body>
</html>`;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"Sellspace" <${env.EMAIL_FROM}>`,
    to,
    subject: `Your Sellspace code: ${otp}`,
    html: otpEmailHtml(otp),
  });
}
