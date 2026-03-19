"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { saveUserPreset } from "@/lib/saveUserPreset";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const { user } = useAuth();

  /* ✅ NEW: TOAST STATE */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please login first", "error"); // ✅ replaced alert
      return;
    }

    if (cart.length === 0) {
      showToast("Cart is empty", "error"); // ✅ replaced alert
      return;
    }

    try {
      // ✅ CREATE ORDER
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: total }),
      });

      const order = await res.json();

      // ✅ RAZORPAY
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "XMP Store",
        description: "Cart Checkout",
        order_id: order.id,

        handler: async function (response: any) {
          try {
            // ✅ VERIFY
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...response,
                userId: user.uid,
              }),
            });

            const data = await verifyRes.json();

            if (data.success) {

              // ✅ SAVE ALL PRESETS (NO DUPLICATES)
              for (const item of cart) {
                await saveUserPreset({
                  userId: user.uid,
                  presetId: item.id,
                  type: "purchased",
                });
              }

              // ✅ CLEAR CART
              clearCart();
              setCart([]); // ✅ added for UI update

              showToast("Payment successful 🎉"); // ✅ replaced alert

              setTimeout(() => {
                window.location.href = "/my-presets";
              }, 1500);

            } else {
              showToast("Payment verification failed", "error"); // ✅ replaced alert
            }

          } catch (err) {
            console.log(err);
            showToast("Verification error", "error"); // ✅ replaced alert
          }
        },

        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.log(err);
      showToast("Payment failed", "error"); // ✅ replaced alert
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* ✅ TOAST UI */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl text-white shadow-lg z-50
          ${toast.type === "success"
            ? "bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.9)]"
            : "bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
          }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl mb-6">Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-gray-400">No items in cart</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-zinc-900 p-4 mb-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400">₹{item.price}</p>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(item.id);
                    setCart(getCart());
                  }}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}

            <h2 className="text-xl mt-6">Total: ₹{total}</h2>

            <button
              onClick={handleCheckout}
              className="mt-4 w-full bg-purple-600 py-3 rounded-lg hover:bg-purple-700"
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}