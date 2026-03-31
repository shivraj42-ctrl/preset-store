"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PresetCard from "@/components/PresetCard";
import type { Preset } from "@/lib/types";
import { Search, ArrowUpDown } from "lucide-react";

export default function HomeClient({
  initialPresets,
  categories,
}: {
  initialPresets: Preset[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"high-to-low" | "low-to-high">("high-to-low");

  const filteredPresets = useMemo(() => {
    const filtered = initialPresets.filter((preset) => {
      const matchesSearch = preset.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || preset.category === category;
      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      return sortOrder === "high-to-low" ? priceB - priceA : priceA - priceB;
    });
  }, [initialPresets, search, category, sortOrder]);

  return (
    <section id="presets" className="py-24 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500/8 blur-[120px]" />
      </div>
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-[3px] text-purple-400 font-medium">
            Collection
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Explore All Presets
          </h2>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search presets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:bg-white/[0.06] transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Category pills + Sort */}
        <div className="flex flex-col items-center gap-4 mb-14">
          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                  category === cat
                    ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500"
                    : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white hover:border-purple-500/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort toggle */}
          <div className="flex items-center gap-2.5">
            <ArrowUpDown size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Price</span>
            <div className="inline-flex rounded-full border border-white/[0.08] overflow-hidden backdrop-blur-sm">
              <button
                onClick={() => setSortOrder("high-to-low")}
                className={`px-3.5 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-300 ${
                  sortOrder === "high-to-low"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                High → Low
              </button>
              <button
                onClick={() => setSortOrder("low-to-high")}
                className={`px-3.5 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-300 ${
                  sortOrder === "low-to-high"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                Low → High
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredPresets.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No presets found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
