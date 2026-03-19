"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { addToCart } from "@/lib/cart";

/* ✅ KEEP THIS (not removed) */
import { addDoc, collection } from "firebase/firestore";

/* ✅ ADDED */
import { saveUserPreset } from "@/lib/saveUserPreset";

import Navbar from "@/components/Navbar";
import { useProtectedAction } from "@/lib/useProtectedAction";
import { useAuth } from "@/context/AuthContext";

export default function PresetPage() {

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [preset, setPreset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const { checkAuth } = useProtectedAction();
  const { user } = useAuth();

  const [isPurchased, setIsPurchased] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ✅ NEW: TOAST STATE */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  /* ✅ ADDED: FLY TO CART FUNCTION */
  const flyToCart = () => {
    const img = document.getElementById("preset-image");
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

    setTimeout(() => {
      clone.remove();
    }, 700);
  };

  const handleDownloadFile = async () => {
    console.log("DOWNLOAD CLICKED", preset);

    if (!preset?.downloadUrl) {
      showToast("No download available", "error"); // ✅ replaced alert
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

  useEffect(() => {
    const fetchPreset = async () => {
      try {
        const docRef = doc(db, "presets", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          console.log("PRESET DATA:", data);
          setPreset(data);
        }
      } catch (error) {
        console.error("Error loading preset:", error);
      }

      setLoading(false);
    };

    if (id) fetchPreset();
  }, [id]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user) return;

      const res = await fetch(`/api/check-purchase?userId=${user.uid}&presetId=${id}`);
      const data = await res.json();

      setIsPurchased(data.purchased);
    };

    checkPurchase();
  }, [user, id]);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateTitle(true), 200);
    const t2 = setTimeout(() => setShowPrice(true), 1600);
    const t3 = setTimeout(() => setShowDescription(true), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading preset...</div>;
  }

  if (!preset) {
    return <div className="text-white text-center mt-20">Preset not found</div>;
  }

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

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center text-gray-300 text-sm transition-all duration-300 hover:text-white"
        >
          <span className="px-4 py-2 rounded-full border border-purple-500 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.9)]">
            Back
          </span>

          <span className="ml-2 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            →
          </span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6">

        <div className="relative h-32 mb-16">

          <div className={`absolute flex flex-col items-center transition-all duration-[1400ms] ease-out ${animateTitle ? "left-6 translate-x-0" : "left-1/2 -translate-x-1/2"}`}>

            <h1 className="px-6 py-2 text-3xl font-semibold rounded-full border border-purple-500 text-purple-300 bg-zinc-900 shadow-[0_0_15px_rgba(168,85,247,0.8)] tracking-wider uppercase">
              {preset.name}
            </h1>

            <button
              onClick={async () => {

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
                            userId: user.uid,
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

              }}
              className={`mt-4 px-6 py-3 rounded-full font-semibold bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] hover:shadow-[0_0_35px_rgba(168,85,247,1)] transition-all duration-700 ease-out ${showPrice ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}
            >
              {preset.price === 0
                ? "Download Free Preset"
                : isPurchased
                ? "Download Preset"
                : `Buy ₹${preset.price}`}
            </button>

            <button
              onClick={() => {
                if (isPurchased) {
                  showToast("Already purchased", "error");
                  return;
                }

                flyToCart();
                addToCart(preset);
                showToast("Added to cart 🛒");
              }}
              disabled={isPurchased}
              className={`mt-3 px-6 py-2 rounded-full border border-purple-500 transition ${
                isPurchased
                  ? "opacity-50 cursor-not-allowed"
                  : "text-purple-300 hover:bg-purple-600 hover:text-white"
              }`}
            >
              {isPurchased ? "Already Owned" : "Add to Cart"}
            </button>

            <div className="mt-8 max-w-md relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-[3px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>

              <p className={`pl-6 text-lg text-gray-300 leading-relaxed transition-all duration-700 ease-out ${showDescription ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
                {preset.description}
              </p>
            </div>

          </div>

        </div>

        <div className="flex justify-center mb-10">
          <img
            id="preset-image"
            src={preset.afterImage}
            className={`rounded-xl max-w-md w-full transition-all duration-[1400ms] ease-out hover:scale-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] ${animateTitle ? "translate-x-[35vw] -translate-y-[160px] scale-105" : "translate-x-0 translate-y-0"}`}
          />
        </div>

      </div>

    </div>
  );
}