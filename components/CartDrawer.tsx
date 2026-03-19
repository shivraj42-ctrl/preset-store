"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { saveUserPreset } from "@/lib/saveUserPreset";

export default function CartDrawer({ open, setOpen }: any) {

  /* ✅ CRITICAL FIX — DO NOT REMOVE */
  if (!open) return null;

  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);

  /* ✅ LOAD CART */
  const loadCart = () => {
    setCart(getCart(user?.uid));
  };

  useEffect(() => {
    loadCart();

    window.addEventListener("storage", loadCart);
    window.addEventListener("cart:update", loadCart);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cart:update", loadCart);
    };
  }, [user]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  /* ✅ REMOVE ITEM */
  const handleRemove = (id: string) => {
    removeFromCart(id, user?.uid);
    loadCart();
  };

  /* ✅ CHECKOUT */
  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: total }),
      });

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "XMP Store",
        description: "Cart Checkout",
        order_id: order.id,

        handler: async function (response: any) {
          try {
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
              // ✅ SAVE ALL
              for (const item of cart) {
                await saveUserPreset({
                  userId: user.uid,
                  presetId: item.id,
                  type: "purchased",
                });
              }

              // ✅ CLEAR CART
              clearCart(user?.uid);
              setCart([]);

              window.dispatchEvent(new Event("cart:update"));

              setOpen(false);

              setTimeout(() => {
                window.location.href = "/my-presets";
              }, 1200);

            } else {
              alert("Payment verification failed");
            }

          } catch (err) {
            console.log(err);
            alert("Verification error");
          }
        },

        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.log(err);
      alert("Payment failed");
    }
  };

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 z-50 transform transition-transform duration-300 shadow-2xl ${
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-purple-400">
            Your Cart 🛒
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-xl hover:text-red-400"
          >
            ✕
          </button>
        </div>

        {/* ITEMS */}
        <div className="p-4 space-y-4 overflow-y-auto h-[70%]">
          {cart.length === 0 ? (
            <p className="text-gray-400">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-400">₹{item.price}</p>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-700">
          <div className="flex justify-between mb-3">
            <span>Total:</span>
            <span className="font-semibold">₹{total}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition shadow-[0_0_15px_rgba(168,85,247,0.8)]"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}