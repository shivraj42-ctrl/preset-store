"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { saveUserPreset } from "@/lib/saveUserPreset";
import { db } from "@/lib/firebase";

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

  const [animateCart, setAnimateCart] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const total = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  const finalTotal = discount ? total - Math.round((total * discount.percent) / 100) : total;

  /* ✅ REMOVE ITEM */
  const handleRemove = (id: string) => {
    removeFromCart(id, user?.uid);
    loadCart();
  };

  /* ✅ APPLY PROMO CODE */
  const handleApplyPromo = async () => {
    if (!promoCode) {
      setPromoMsg({ text: "Please enter a promo code", type: "error" });
      return;
    }

    setPromoMsg(null);
    setDiscount(null);

    try {
      const promoRef = doc(db, "promoCodes", promoCode.toUpperCase());
      const promoSnap = await getDoc(promoRef);

      if (promoSnap.exists()) {
        const promoData = promoSnap.data();
        if (promoData.isActive && promoData.discountPercent) {
          setDiscount({ code: promoCode.toUpperCase(), percent: promoData.discountPercent });
          setPromoMsg({ text: `Promo code applied! ${promoData.discountPercent}% off.`, type: "success" });
        } else {
          setPromoMsg({ text: "Promo code is not active or invalid.", type: "error" });
        }
      } else {
        setPromoMsg({ text: "Invalid promo code.", type: "error" });
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoMsg({ text: "An error occurred while applying the promo code.", type: "error" });
    }
  };

  /* ✅ CHECKOUT */
  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first");
      setOpen(false);
      return;
    }

    if (finalTotal === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: finalTotal }),
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
          className="fixed inset-0 bg-black/60 z-[1200] backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 z-[1300] transform transition-transform duration-300 shadow-2xl ${
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
                <div className="flex items-center gap-3">
                  {item.afterImage && (
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <Image
                        src={item.afterImage}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-400">₹{item.price}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-700">
          
          {/* Promo Code UI */}
          {cart.length > 0 && total > 0 && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm text-white transition"
                >
                  Apply
                </button>
              </div>
              {promoMsg && (
                <p className={`text-xs mt-2 ${promoMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {promoMsg.text}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            {discount && (
              <div className="flex justify-between text-green-400 text-sm font-semibold">
                <span>Discount ({discount.percent}% off):</span>
                <span>-₹{Math.round((total * discount.percent) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-zinc-700 pt-2 mt-2">
              <span>Total:</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.8)]"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}