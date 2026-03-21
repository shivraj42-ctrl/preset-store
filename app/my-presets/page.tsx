"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function MyPresets() {
  const { user } = useAuth();

  /* ✅ CHANGED: single state */
  const [owned, setOwned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH EVERYTHING
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "user_presets"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        const raw = snapshot.docs.map(doc => doc.data());

        // 🔥 FETCH FULL PRESET DETAILS
        const fullData = await Promise.all(
          raw.map(async (item) => {
            const ref = doc(db, "presets", item.presetId);
            const snap = await getDoc(ref);

            return {
              ...item,
              ...(snap.exists() ? snap.data() : {}),
            };
          })
        );

        /* ✅ ADDED: REMOVE DUPLICATES */
        const unique = Array.from(
          new Map(fullData.map(p => [p.presetId, p])).values()
        );

        setOwned(unique);

      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-white">

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl mb-8">My Presets</h1>

        {/* ✅ SINGLE PREMIUM SECTION */}
        <h2 className="text-xl mb-4 text-purple-400">Owned</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {owned.map((p, i) => (
            <div
              key={i}
              className="bg-zinc-900 p-4 rounded-xl border border-purple-500 shadow hover:shadow-purple-500/40 hover:scale-105 transition"
            >
              <div className="relative w-full h-48 mb-3">
                <Image
                  src={p.afterImage}
                  alt={p.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>

              <h3 className="text-lg font-semibold">{p.name}</h3>

              <p className="text-sm text-gray-400 mb-3">
                {p.price === 0 ? "FREE" : `₹${p.price}`}
              </p>

              <button
                onClick={() => window.open(p.downloadUrl)}
                className="w-full bg-green-600 py-2 rounded-lg hover:bg-green-700"
              >
                Download
              </button>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}