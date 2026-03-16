"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PresetCard from "@/components/PresetCard";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Portrait", "Travel", "Cinematic", "Street"];

  useEffect(() => {

    const fetchPresets = async () => {

      try {

        const querySnapshot = await getDocs(collection(db, "presets"));

        const presetList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Presets loaded:", presetList); // debugging

        setPresets(presetList);

      } catch (error) {

        console.error("Error fetching presets:", error);

      } finally {
        setLoading(false);
      }

    };

    fetchPresets();

  }, []);

  const filteredPresets = presets.filter((preset: any) => {

    const matchesSearch =
      preset.name?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || preset.category === category;

    return matchesSearch && matchesCategory;

  });

  return (
    <div className="bg-black min-h-screen text-white">

      <Navbar />

      {/* HERO */}
      <section className="text-center py-32 px-6 bg-gradient-to-b from-black to-zinc-900">

        <h1 className="text-6xl font-bold mb-6">
          Premium Lightroom Classic Presets
        </h1>

        <p className="text-gray-400 text-xl max-w-xl mx-auto mb-10">
          Transform your photos instantly using presets used by creators.
        </p>

        <div className="flex justify-center gap-6">

          <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:scale-105 transition">
            Download Preset
          </button>

          <button className="border border-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition">
            Free Presets
          </button>

        </div>

      </section>

      {/* BEFORE AFTER SLIDER */}
      <BeforeAfterSlider />

      {/* PRESETS */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        <h2 className="text-3xl font-bold mb-10 text-center">
          Popular Presets
        </h2>

        {/* SEARCH */}
        <div className="max-w-md mx-auto mb-10">

          <input
            type="text"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white"
          />

        </div>

        {/* CATEGORY */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                category === cat
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}

        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-400">
            Loading presets...
          </p>
        )}

        {/* GRID */}
        {!loading && filteredPresets.length === 0 ? (
          <p className="text-center text-gray-400">
            No presets found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

            {filteredPresets.map((preset: any) => (
              <PresetCard
                key={preset.id}
                preset={preset}
              />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}