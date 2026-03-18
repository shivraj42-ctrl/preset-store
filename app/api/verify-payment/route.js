import { NextResponse } from "next/server";
import crypto from "crypto";

// ✅ your existing firebase import
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      presetId,
    } = body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isValid = expectedSign === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ success: false });
    }

    // ✅ SAVE PURCHASE
    if (userId && presetId) {
      await setDoc(
        doc(db, "purchases", `${userId}_${presetId}`),
        {
          userId,
          presetId,
          paymentId: razorpay_payment_id,
          createdAt: serverTimestamp(),
        }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ success: false });
  }
}