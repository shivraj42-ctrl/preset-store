"use client";

import { useState } from "react";
import PresetCard from "@/components/PresetCard";
import PresetCardSkeleton from "@/components/PresetCardSkeleton";
import type { Preset } from "@/lib/types";

export default function HomeClient({ 
  initialPresets, 
  categories 
}: { 
  initialPresets: Preset[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredPresets = initialPresets.filter((preset) => {
    const matchesSearch = preset.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || preset.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <h2 className="text-3xl font-bold mb-10 text-center">Popular Presets</h2>

      {/* SEARCH */}
      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Search presets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:ring-2 focus:ring-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.5)]"
        />
      </div>

      {/* CATEGORY */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm border transition-all duration-300 transform ${
              category === cat
                ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.9)] scale-105"
                : "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 hover:border-purple-500 hover:shadow-[0_0_12px_rgba(168,85,247,0.6)] hover:scale-110"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      {filteredPresets.length === 0 ? (
        <p className="text-center text-gray-400">No presets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {filteredPresets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
      )}
    </section>
  );
}
