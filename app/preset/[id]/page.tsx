"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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

  useEffect(() => {
    const fetchPreset = async () => {
      try {
        const docRef = doc(db, "presets", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPreset({
            id: docSnap.id,
            ...docSnap.data(),
          });
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

      if (data.purchased) {
        setIsPurchased(true);
      }
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

      {/* BACK BUTTON */}
      <div className="max-w-6xl mx-auto px-6 pt-8">

        <button
          onClick={() => router.back()} // ✅ FIXED
          className="group flex items-center text-gray-300 text-sm transition-all duration-300 hover:text-white"
        >
          <span
            className="px-4 py-2 rounded-full border border-purple-500
            transition-all duration-300
            group-hover:shadow-[0_0_20px_rgba(168,85,247,0.9)]"
          >
            Back
          </span>

          <span
            className="ml-2 opacity-0 -translate-x-2
            transition-all duration-300
            group-hover:opacity-100 group-hover:translate-x-0"
          >
            →
          </span>
        </button>

      </div>

      <div className="max-w-4xl mx-auto py-20 px-6">

        {/* TITLE AREA */}
        <div className="relative h-32 mb-16">

          <div
            className={`absolute flex flex-col items-center
            transition-all duration-[1400ms] ease-out
            ${animateTitle ? "left-6 translate-x-0" : "left-1/2 -translate-x-1/2"}`}
          >

            <h1 className="px-6 py-2 text-3xl font-semibold rounded-full border border-purple-500 text-purple-300 bg-zinc-900 shadow-[0_0_15px_rgba(168,85,247,0.8)] tracking-wider uppercase">
              {preset.name}
            </h1>

            {/* PRICE BUTTON */}
            <button
              onClick={async () => {

                if (!checkAuth()) return;

                if (isPurchased && preset.downloadUrl) {
                  window.open(preset.downloadUrl, "_blank");
                  return;
                }

                if (preset.price === 0 && preset.downloadUrl) {
                  window.open(preset.downloadUrl, "_blank");
                  return;
                }

                try {
                  const res = await fetch("/api/create-order", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
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
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...response,
                            userId: user?.uid,
                            presetId: preset.id,
                            amount: preset.price,
                          }),
                        });

                        const data = await verifyRes.json();

                        if (data.success) {
                          alert("Payment successful 🎉");

                          if (preset.downloadUrl) {
                            window.open(preset.downloadUrl, "_blank");
                          }
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

                } catch {
                  alert("Payment failed");
                }

              }}
              className={`mt-4 px-6 py-3 rounded-full font-semibold
              bg-purple-600 text-white
              shadow-[0_0_15px_rgba(168,85,247,0.8)]
              hover:shadow-[0_0_35px_rgba(168,85,247,1)]
              transition-all duration-700 ease-out
              ${showPrice ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}
            >
              {preset.price === 0
                ? "Download Free Preset"
                : isPurchased
                ? "Download Preset"
                : `Buy ₹${preset.price}`}
            </button>

            {/* DESCRIPTION */}
            <div className="mt-8 max-w-md relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-[3px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>

              <p className={`pl-6 text-lg text-gray-300 leading-relaxed transition-all duration-700 ease-out ${showDescription ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
                {preset.description}
              </p>
            </div>

          </div>

        </div>

        {/* IMAGE */}
        <div className="flex justify-center mb-10">
          <img
            src={preset.afterImage}
            className={`rounded-xl max-w-md w-full transition-all duration-[1400ms] ease-out hover:scale-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
            ${animateTitle ? "translate-x-[35vw] -translate-y-[160px] scale-105" : "translate-x-0 translate-y-0"}`}
          />
        </div>

      </div>

    </div>
  );
}