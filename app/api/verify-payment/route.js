import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = data;

    console.log("BODY:", data);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("EXPECTED:", generated_signature);
    console.log("RECEIVED:", razorpay_signature);

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    return NextResponse.json({ success: false });
  }
}