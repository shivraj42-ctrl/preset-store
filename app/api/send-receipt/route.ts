import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name, presetName, amount, orderId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // In production, use real SMTP credentials from .env
    // e.g. SendGrid, AWS SES, or Gmail App Passwords
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "test@ethereal.email", 
        pass: process.env.SMTP_PASS || "pass123", 
      },
    });

    const mailOptions = {
      from: '"XMP Store" <noreply@xmpstore.com>',
      to: email,
      subject: `Your Receipt for ${presetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thanks for your purchase!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi ${name || "there"},</p>
            <p style="font-size: 16px; color: #333;">We've received your payment and your new presets are ready to download.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Order Summary</h3>
              <p style="margin: 5px 0;"><strong>Item:</strong> ${presetName}</p>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0;"><strong>Total Paid:</strong> ₹${amount}</p>
            </div>

            <p style="font-size: 16px; color: #333;">You can download your presets directly from your <a href="https://yourwebsite.com/my-presets" style="color: #7c3aed; text-decoration: none;">dashboard here</a>.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #888; font-size: 12px;">
            &copy; ${new Date().getFullYear()} XMP Store. All rights reserved.
          </div>
        </div>
      `,
    };

    // If using ethereal email (for local testing without keys), it logs a preview URL
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
