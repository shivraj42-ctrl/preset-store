"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PresetCard from "@/components/PresetCard";
import PresetCardSkeleton from "@/components/PresetCardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function WishlistPage() {
  const { user } = useAuth();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "wishlist"));
        const wishlistIds = snap.docs.map((d) => d.id);

        if (wishlistIds.length === 0) {
          setPresets([]);
          setLoading(false);
          return;
        }

        const presetPromises = wishlistIds.map(async (id) => {
          const presetSnap = await getDoc(doc(db, "presets", id));
          if (presetSnap.exists()) {
            return { id: presetSnap.id, ...presetSnap.data() };
          }
          return null;
        });

        const results = await Promise.all(presetPromises);
        setPresets(results.filter(Boolean) as any[]);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();

    // Listen for wishlist updates
    const handleUpdate = () => fetchWishlist();
    window.addEventListener("wishlist:update", handleUpdate);
    return () => window.removeEventListener("wishlist:update", handleUpdate);
  }, [user]);

  return (
    <div className="min-h-screen text-white flex flex-col">

      <Navbar />

      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">

        <h1 className="text-4xl font-bold mb-4 text-center">My Wishlist</h1>
        <p className="text-gray-400 text-center mb-12">
          Presets you&apos;ve saved for later
        </p>

        {!user && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Please login to view your wishlist</p>
            <a href="/login?redirect=/wishlist" className="inline-block mt-4 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
              Login
            </a>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <PresetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && user && presets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💜</p>
            <p className="text-gray-400 text-lg">Your wishlist is empty</p>
            <p className="text-gray-500 mt-2 text-sm">Browse presets and tap the heart icon to save them here</p>
            <a href="/presets" className="inline-block mt-6 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
              Browse Presets
            </a>
          </div>
        )}

        {!loading && presets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}

      </section>

      <Footer />

    </div>
  );
}
