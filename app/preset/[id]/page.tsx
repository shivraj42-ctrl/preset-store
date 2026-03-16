"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function PresetPage() {

  const params = useParams();
  const id = params.id as string;

  const [preset, setPreset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [showPrice, setShowPrice] = useState(false);

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


  /* animation timeline */
  useEffect(() => {

    const t1 = setTimeout(() => {
      setAnimateTitle(true);
    }, 200);

    const t2 = setTimeout(() => {
      setShowPrice(true);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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

      <div className="max-w-4xl mx-auto py-20 px-6">

        {/* TITLE AREA */}
        <div className="relative h-32 mb-16">

          <div
  className={`absolute flex flex-col items-center
  transition-all duration-[1400ms] ease-out
  ${animateTitle ? "left-6 translate-x-0" : "left-1/2 -translate-x-1/2"}
  `}
>

            {/* TITLE */}
            <h1
              className="px-6 py-2 text-3xl font-semibold rounded-full border border-purple-500
              text-purple-300 bg-zinc-900
              shadow-[0_0_15px_rgba(168,85,247,0.8)]
              tracking-wider uppercase"
            >
              {preset.name}
            </h1>


            {/* PRICE BUTTON */}
            <button
              onClick={() => {

                if (preset.price === 0 && preset.downloadUrl) {
                  window.open(preset.downloadUrl, "_blank");
                } else {
                  alert("Payment integration coming soon");
                }

              }}
              className={`mt-4 px-6 py-3 rounded-full font-semibold
              bg-purple-600 text-white
              shadow-[0_0_15px_rgba(168,85,247,0.8)]
              hover:shadow-[0_0_35px_rgba(168,85,247,1)]
              transition-all duration-700 ease-out
              ${showPrice ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}
              `}
            >
              {preset.price === 0 ? "Download Free Preset" : `Buy ₹${preset.price}`}
            </button>

          </div>

        </div>


        {/* IMAGE */}
        <div className="flex justify-center mb-10">

          <img
         src={preset.afterImage}
         className={`rounded-xl max-w-md w-full
         transition-all duration-[1400ms] ease-out
         hover:scale-110
         hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
         ${animateTitle ? "translate-x-[35vw] -translate-y-[160px] scale-105" : "translate-x-0 translate-y-0"}
          `}
         />

        </div>

      </div>

    </div>
  );
}