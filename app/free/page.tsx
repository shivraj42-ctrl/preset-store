"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PresetCard from "@/components/PresetCard";
import PresetCardSkeleton from "@/components/PresetCardSkeleton";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FreePresetsPage() {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "presets"));
        const freePresets = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p: any) => p.price === 0);

        setPresets(freePresets);
      } catch (error) {
        console.error("Error fetching free presets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col">

      <Navbar />

      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">

        <h1 className="text-4xl font-bold mb-4 text-center">Free Presets</h1>
        <p className="text-gray-400 text-center mb-12">
          Download these presets for free — no purchase required
        </p>

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <PresetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* GRID */}
        {!loading && presets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No free presets available yet.</p>
            <p className="text-gray-500 mt-2 text-sm">Check back soon — we add new free presets regularly!</p>
          </div>
        ) : (
          !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {presets.map((preset: any) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          )
        )}

      </section>

      <Footer />

    </div>
  );
}
