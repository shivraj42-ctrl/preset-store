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

        <h1 className="text-4xl font-bold mb-6">
          {preset.name}
        </h1>

        <img
          src={preset.afterImage}
          className="rounded-xl mb-6"
        />

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