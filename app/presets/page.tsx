"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PresetCard from "@/components/PresetCard";
import PresetCardSkeleton from "@/components/PresetCardSkeleton";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

function PresetsContent() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("q") || "";

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(querySearch);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ["All", "Portrait", "Travel", "Cinematic", "Street"];

  // Update local search if URL query changes
  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "presets"));
        const presetList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
    const matchesSearch = preset.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || preset.category === category;
    return matchesSearch && matchesCategory;
  });

  const paginatedPresets = filteredPresets.slice(0, page * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  return (
    <>
      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold mb-4 text-center">All Presets</h1>
        <p className="text-gray-400 text-center mb-10">
          Browse our complete collection of premium Lightroom presets
        </p>

        {/* SEARCH */}
        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white
              focus:ring-2 focus:ring-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          />
        </div>

        {/* CATEGORY FILTER */}
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

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[...Array(8)].map((_, i) => (
              <PresetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* GRID */}
        {!loading && filteredPresets.length === 0 ? (
          <p className="text-center text-gray-400">No presets found.</p>
        ) : (
          !loading && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {paginatedPresets.map((preset: any) => (
                  <PresetCard key={preset.id} preset={preset} />
                ))}
              </div>

              {paginatedPresets.length < filteredPresets.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-3 rounded-lg border border-purple-500/50 text-purple-400 font-medium hover:bg-purple-500/10 transition"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </>
  );
}

export default function PresetsPage() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 w-full flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex justify-center py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-6xl w-full px-6">
              {[...Array(8)].map((_, i) => (
                <PresetCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }>
          <PresetsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
