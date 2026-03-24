import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { to, subject, replyText, queryId } = await req.json();

    if (!to || !replyText || !queryId) {
      return NextResponse.json(
        { error: "Missing required fields: to, replyText, queryId" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "test@ethereal.email",
        pass: process.env.SMTP_PASS || "pass123",
      },
    });

    const mailOptions = {
      from: '"SnapGrid Support" <noreply@snapgrid.com>',
      to,
      subject: subject || "Re: Your query on SnapGrid",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">SnapGrid Support</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi there,</p>
            <p style="font-size: 16px; color: #333;">Thank you for reaching out. Here is our response to your query:</p>
            <div style="background-color: #f3f0ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap;">${replyText}</p>
            </div>
            <p style="font-size: 14px; color: #666;">If you have any further questions, feel free to reply to this email or contact us again.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #888; font-size: 12px;">
            &copy; ${new Date().getFullYear()} SnapGrid. All rights reserved.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reply sent:", info.messageId);

    // Update the contact_messages document
    await updateDoc(doc(db, "contact_messages", queryId), {
      replied: true,
      replyText,
      repliedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Error sending reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
