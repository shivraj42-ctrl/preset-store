import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("BODY:", body); // debug

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = body.amount * 100; // ₹49 → 4900

    const order = await instance.orders.create({
      amount,
      currency: "INR",
    });

    console.log("ORDER CREATED:", order); 
    console.log("KEY:", process.env.RAZORPAY_KEY_ID);// debug

    return Response.json(order);

  } catch (error) {
    console.log("CREATE ORDER ERROR:", error); // 🔥 IMPORTANT
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}