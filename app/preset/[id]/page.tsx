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
        } else {
          console.log("Preset not found");
        }

      } catch (error) {
        console.error("Error loading preset:", error);
      }

      setLoading(false);
    };

    if (id) fetchPreset();

  }, [id]);

  /* Title animation trigger */
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateTitle(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        Loading preset...
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="text-white text-center mt-20">
        Preset not found
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">

      <Navbar />

      <div className="max-w-4xl mx-auto py-20 px-6">

        {/* Animated Title */}
<div className="relative h-16 mb-12">

  <h1
    className={`absolute left-1/2 -translate-x-1/2 
    px-6 py-2 text-3xl font-semibold rounded-full border border-purple-500
    text-purple-300 bg-zinc-900
    shadow-[0_0_15px_rgba(168,85,247,0.8)]
    tracking-wider uppercase
    transition-all duration-1000 ease-out
    ${animateTitle ? "-translate-x-[260%]" : "-translate-x-1/2"}
    `}
  >
    {preset.name}
  </h1>

</div>


{/* Animated Image */}
<div className="flex justify-center mb-10 overflow-hidden">

  <img
    src={preset.afterImage}
    className={`rounded-xl max-w-md w-full
    transition-all duration-1000 ease-out
    ${animateTitle ? "translate-x-[220px]" : "translate-x-0"}
    `}
  />

</div>


        <p className="text-green-400 text-xl mb-6">
          {preset.price === 0 ? "Free Preset" : `₹${preset.price}`}
        </p>

        {preset.price === 0 && preset.downloadUrl && (
          <a
            href={preset.downloadUrl}
            target="_blank"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
          >
            Download Preset
          </a>
        )}

      </div>

    </div>
  );
}