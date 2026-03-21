"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PresetReviews from "@/components/PresetReviews";
import Image from "next/image";
import { addToCart } from "@/lib/cart";
import { saveUserPreset } from "@/lib/saveUserPreset";
import { useProtectedAction } from "@/lib/useProtectedAction";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Download,
  Zap,
  Shield,
  Monitor,
  CheckCircle,
} from "lucide-react";



/* ── Custom Draggable Before/After Slider ── */
function DraggableCompare({
  beforeImage,
  afterImage,
}: {
  beforeImage: string;
  afterImage: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] select-none touch-none"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Before (full width, underneath) */}
      <img
        src={beforeImage}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* After (clip-path reveal — no overlap) */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-purple-600 border-2 border-white shadow-[0_0_15px_rgba(168,85,247,0.6)] flex items-center justify-center">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <path d="M6 1L1 7L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 1L19 7L14 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white/80 transition-opacity ${isDragging ? "opacity-0" : "opacity-100"}`}>
        After
      </div>
      <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white/80 transition-opacity ${isDragging ? "opacity-0" : "opacity-100"}`}>
        Before
      </div>
    </div>
  );
}

export default function PresetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [preset, setPreset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { checkAuth } = useProtectedAction();
  const { user } = useAuth();

  const [isPurchased, setIsPurchased] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* TOAST STATE */
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* FLY TO CART */
  const flyToCart = () => {
    const img = document.getElementById("preset-hero-image");
    const cart = document.querySelector("[data-cart-icon]");
    if (!img || !cart) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();
    const clone = img.cloneNode(true) as HTMLElement;

    clone.style.position = "fixed";
    clone.style.top = `${imgRect.top}px`;
    clone.style.left = `${imgRect.left}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.transition = "all 0.7s cubic-bezier(0.65, 0, 0.35, 1)";
    clone.style.zIndex = "9999";
    clone.style.borderRadius = "12px";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.width = "30px";
      clone.style.height = "30px";
      clone.style.opacity = "0.5";
    });

    setTimeout(() => clone.remove(), 700);
  };

  /* DOWNLOAD */
  const handleDownloadFile = async () => {
    if (!preset?.downloadUrl) {
      showToast("No download available", "error");
      return;
    }

    try {
      if (user) {
        await saveUserPreset({
          userId: user.uid,
          presetId: preset.id,
          type: isPurchased ? "purchased" : "downloaded",
        });
      }
    } catch (err) {
      console.log("Error saving download:", err);
    }

    const link = document.createElement("a");
    link.href = preset.downloadUrl;
    link.setAttribute("download", preset.name || "preset");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* PURCHASE / BUY HANDLER */
  const handleBuy = async () => {
    if (!checkAuth()) return;

    if (isPurchased) {
      handleDownloadFile();
      return;
    }

    if (preset.price === 0) {
      handleDownloadFile();
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: preset.price }),
      });

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "XMP Store",
        description: preset.name,
        order_id: order.id,

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                userId: user?.uid,
                presetId: preset.id,
              }),
            });

            const data = await verifyRes.json();

            if (data.success) {
              await saveUserPreset({
                userId: user!.uid,
                presetId: preset.id,
                type: "purchased",
              });

              setIsPurchased(true);
              setShowSuccess(true);
              showToast("Payment successful 🎉");
            } else {
              showToast("Payment verification failed", "error");
            }
          } catch (err) {
            console.log(err);
            showToast("Verification error", "error");
          }
        },

        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      showToast("Payment failed", "error");
    }
  };

  /* FETCH PRESET */
  useEffect(() => {
    const fetchPreset = async () => {
      try {
        const docRef = doc(db, "presets", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPreset({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error loading preset:", error);
      }
      setLoading(false);
    };
    if (id) fetchPreset();
  }, [id]);

  /* CHECK PURCHASE */
  useEffect(() => {
    const checkPurchase = async () => {
      if (!user) return;
      const res = await fetch(
        `/api/check-purchase?userId=${user.uid}&presetId=${id}`
      );
      const data = await res.json();
      setIsPurchased(data.purchased);
    };
    checkPurchase();
  }, [user, id]);

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading preset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Preset not found</h2>
            <p className="text-gray-400 mb-6">
              This preset may have been removed.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Browse Presets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trustBadges = [
    { icon: Zap, label: "Instant Download" },
    { icon: Shield, label: "Secure Payment" },
    { icon: Monitor, label: "Lightroom Compatible" },
  ];

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      {/* TOAST */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl backdrop-blur-md ${
            toast.type === "success"
              ? "bg-green-600/90 shadow-[0_0_25px_rgba(34,197,94,0.4)]"
              : "bg-red-500/90 shadow-[0_0_25px_rgba(239,68,68,0.4)]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <span>✕</span>
          )}
          {toast.message}
        </motion.div>
      )}

      {/* BACK BUTTON */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back</span>
        </motion.button>
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* ─── LEFT: IMAGE GALLERY ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Hero Image */}
            <div
              id="preset-hero-image"
              className="relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)] group"
            >
              <Image
                src={preset.afterImage}
                alt={preset.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Before / After Slider */}
            {preset.beforeImage && preset.afterImage && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                    Before & After
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                </div>

                <DraggableCompare
                  beforeImage={preset.beforeImage}
                  afterImage={preset.afterImage}
                />
              </div>
            )}
          </motion.div>

          {/* ─── RIGHT: PRODUCT INFO ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col"
          >
            {/* Category Badge */}
            {preset.category && (
              <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/25 mb-4">
                {preset.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {preset.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              {preset.price === 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-400">
                    Free
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/15 text-green-400 border border-green-500/25">
                    No cost
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    ₹{preset.price}
                  </span>
                  <span className="text-sm text-gray-500">one-time</span>
                </div>
              )}
            </div>

            {/* Description */}
            {preset.description && (
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed text-base">
                  {preset.description}
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* Primary: Buy / Download */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuy}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300"
              >
                <Download size={18} />
                {preset.price === 0
                  ? "Download Free"
                  : isPurchased
                  ? "Download Preset"
                  : `Buy ₹${preset.price}`}
              </motion.button>

              {/* Secondary: Add to Cart */}
              {!isPurchased && preset.price > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    flyToCart();
                    addToCart(preset);
                    showToast("Added to cart 🛒");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-purple-300 border border-purple-500/40 hover:bg-purple-500/10 hover:border-purple-500/70 transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </motion.button>
              )}

              {isPurchased && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle size={16} />
                  <span>Already purchased</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {trustBadges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
                  >
                    <Icon
                      size={18}
                      className="text-purple-400"
                    />
                    <span className="text-[11px] text-gray-400 font-medium leading-tight">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ REVIEWS ═══════════════ */}
      <PresetReviews presetId={preset.id} isPurchased={isPurchased} />

      {/* ═══════════════ FOOTER ═══════════════ */}
      <Footer />
    </div>
  );
}