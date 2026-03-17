import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY:", body); // debug

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      presetId,
      amount,
    } = body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {

      const purchaseId = `${userId}_${presetId}`;

      await setDoc(doc(db, "purchases", purchaseId), {
        userId,
        presetId,
        amount,
        paymentId: razorpay_payment_id,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true });

    } else {
      return NextResponse.json({ success: false });
    }

  } catch (error) {
    console.log("VERIFY ERROR:", error); // 🔥 IMPORTANT
    return NextResponse.json({ success: false, error: "Server error" });
  }
}