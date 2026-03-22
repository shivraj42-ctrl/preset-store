"use client";

import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { saveUserPreset } from "@/lib/saveUserPreset";
import { db } from "@/lib/firebase";
import { gsap } from "gsap";
import { X, ShoppingCart, Trash2, Tag, ArrowRight } from "lucide-react";

export default function CartDrawer({ open, setOpen }: any) {
  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Refs for GSAP
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const preLayer1Ref = useRef<HTMLDivElement>(null);
  const preLayer2Ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const openTlRef = useRef<GSAPTimeline | null>(null);
  const wasOpenRef = useRef(false);

  /* ── Load cart ── */
  const loadCart = useCallback(() => {
    setCart(getCart(user?.uid));
  }, [user]);

  useEffect(() => {
    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cart:update", loadCart);
    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cart:update", loadCart);
    };
  }, [loadCart]);

  /* ── Totals ── */
  const total = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  const finalTotal = discount ? total - Math.round((total * discount.percent) / 100) : total;

  /* ── Remove item ── */
  const handleRemove = (id: string) => {
    removeFromCart(id, user?.uid);
    loadCart();
  };

  /* ── Promo code ── */
  const handleApplyPromo = async () => {
    if (!promoCode) { setPromoMsg({ text: "Please enter a promo code", type: "error" }); return; }
    setPromoMsg(null); setDiscount(null);
    try {
      const promoRef = doc(db, "promoCodes", promoCode.toUpperCase());
      const promoSnap = await getDoc(promoRef);
      if (promoSnap.exists()) {
        const data = promoSnap.data();
        if (data.isActive && data.discountPercent) {
          setDiscount({ code: promoCode.toUpperCase(), percent: data.discountPercent });
          setPromoMsg({ text: `${data.discountPercent}% off applied!`, type: "success" });
        } else {
          setPromoMsg({ text: "Code is not active.", type: "error" });
        }
      } else {
        setPromoMsg({ text: "Invalid promo code.", type: "error" });
      }
    } catch { setPromoMsg({ text: "Error applying code.", type: "error" }); }
  };

  /* ── Checkout ── */
  const handleCheckout = async () => {
    if (!user) { alert("Please login first"); setOpen(false); return; }
    if (finalTotal === 0) { alert("Cart is empty"); return; }
    try {
      const res = await fetch("/api/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const order = await res.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, currency: "INR",
        name: "SnapGrid", description: "Cart Checkout",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, userId: user.uid }),
            });
            const data = await verifyRes.json();
            if (data.success) {
              for (const item of cart) { await saveUserPreset({ userId: user.uid, presetId: item.id, type: "purchased" }); }
              clearCart(user?.uid); setCart([]);
              window.dispatchEvent(new Event("cart:update"));
              setOpen(false);
              setTimeout(() => { window.location.href = "/my-presets"; }, 1200);
            } else { alert("Payment verification failed"); }
          } catch { alert("Verification error"); }
        },
        theme: { color: "#7c3aed" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch { alert("Payment failed"); }
  };

  /* ── GSAP init: set offscreen ── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (preLayer1Ref.current) gsap.set(preLayer1Ref.current, { xPercent: 100 });
      if (preLayer2Ref.current) gsap.set(preLayer2Ref.current, { xPercent: 100 });
      if (panelRef.current) gsap.set(panelRef.current, { xPercent: 100 });
      if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 0 });
    });
    return () => ctx.revert();
  }, []);

  /* ── GSAP open / close ── */
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      wasOpenRef.current = true;
      // Open animation
      openTlRef.current?.kill();

      const tl = gsap.timeline();

      // Backdrop fade
      tl.to(backdropRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);

      // PreLayers stagger in
      tl.to(preLayer1Ref.current, { xPercent: 0, duration: 0.45, ease: "power4.out" }, 0);
      tl.to(preLayer2Ref.current, { xPercent: 0, duration: 0.45, ease: "power4.out" }, 0.06);

      // Panel slides in
      tl.to(panelRef.current, { xPercent: 0, duration: 0.55, ease: "power4.out" }, 0.12);

      // Header stagger
      if (headerRef.current) {
        gsap.set(headerRef.current, { opacity: 0, y: -20 });
        tl.to(headerRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.35);
      }

      // Cart items stagger in
      if (itemsContainerRef.current) {
        const items = itemsContainerRef.current.querySelectorAll(".cart-item");
        if (items.length) {
          gsap.set(items, { yPercent: 80, opacity: 0, rotate: 3 });
          tl.to(items, {
            yPercent: 0, opacity: 1, rotate: 0,
            duration: 0.6, ease: "power4.out",
            stagger: { each: 0.08, from: "start" },
          }, 0.4);
        }
      }

      // Footer stagger
      if (footerRef.current) {
        gsap.set(footerRef.current, { opacity: 0, y: 30 });
        tl.to(footerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.55);
      }

      // Plus icon → X
      if (plusHRef.current && plusVRef.current) {
        tl.to(plusHRef.current, { rotate: 45, duration: 0.4, ease: "power4.out" }, 0.1);
        tl.to(plusVRef.current, { rotate: -45, duration: 0.4, ease: "power4.out" }, 0.1);
      }

      openTlRef.current = tl;
    } else if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      // Close animation
      openTlRef.current?.kill();

      const tl = gsap.timeline();

      tl.to(backdropRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
      tl.to([panelRef.current, preLayer2Ref.current, preLayer1Ref.current], {
        xPercent: 100, duration: 0.3, ease: "power3.in", stagger: 0.04,
      }, 0);

      if (plusHRef.current && plusVRef.current) {
        tl.to(plusHRef.current, { rotate: 0, duration: 0.3, ease: "power3.inOut" }, 0);
        tl.to(plusVRef.current, { rotate: 90, duration: 0.3, ease: "power3.inOut" }, 0);
      }

      openTlRef.current = tl;
    }
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[1200] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* PreLayers (staggered color panels) */}
      <div
        ref={preLayer1Ref}
        className="absolute top-0 right-0 h-full w-[clamp(280px,38vw,420px)]"
        style={{ background: "rgba(124, 58, 237, 0.15)" }}
      />
      <div
        ref={preLayer2Ref}
        className="absolute top-0 right-0 h-full w-[clamp(280px,38vw,420px)]"
        style={{ background: "rgba(82, 39, 255, 0.1)" }}
      />

      {/* Main Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full w-[clamp(280px,38vw,420px)] bg-black/70 backdrop-blur-2xl border-l border-white/10 flex flex-col overflow-hidden"
      >
        {/* Ambient glow inside panel */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-purple-600/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>

        {/* Header with toggle */}
        <div
          ref={headerRef}
          className="relative z-10 flex items-center justify-between p-6 border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white tracking-wide">Your Cart</h2>
            {cart.length > 0 && (
              <span className="bg-purple-600/30 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                {cart.length}
              </span>
            )}
          </div>

          <button
            ref={toggleRef}
            onClick={() => setOpen(false)}
            className="relative w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <span
              ref={plusHRef}
              className="absolute w-5 h-[2px] bg-current rounded-full"
              style={{ transformOrigin: "50% 50%" }}
            />
            <span
              ref={plusVRef}
              className="absolute w-5 h-[2px] bg-current rounded-full"
              style={{ transformOrigin: "50% 50%", transform: "rotate(90deg)" }}
            />
          </button>
        </div>

        {/* Cart Items */}
        <div ref={itemsContainerRef} className="relative z-10 flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart size={48} className="text-white/10 mb-4" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <p className="text-gray-600 text-xs mt-1">Add some presets to get started</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.id}
                className="cart-item group flex items-center gap-4 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.08] hover:border-purple-500/20 transition-all duration-300"
              >
                {item.afterImage && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <Image src={item.afterImage} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-purple-400 font-medium mt-0.5">
                    {item.price > 0 ? `₹${item.price}` : "Free"}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div ref={footerRef} className="relative z-10 p-6 border-t border-white/10">
          {/* Promo Code */}
          {cart.length > 0 && total > 0 && (
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 uppercase tracking-wider transition-all"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-xs font-medium hover:bg-white/[0.1] hover:border-purple-500/30 transition-all"
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

          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            {discount && (
              <div className="flex justify-between text-green-400 text-sm font-medium">
                <span>Discount ({discount.percent}%)</span>
                <span>-₹{Math.round((total * discount.percent) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-3 mt-2">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full group relative py-3.5 rounded-xl bg-purple-600 text-white font-semibold text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-purple-600 flex items-center justify-center gap-2"
          >
            <span>Checkout</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </button>
        </div>
      </div>
    </div>
  );
}