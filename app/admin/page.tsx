"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";

/* ✅ ADDED IMPORTS */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {

  /* ✅ ADDED AUTH LOGIC */
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push("/");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists() || !snap.data().isAdmin) {
        router.push("/");
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  /* ✅ PREVENT FLASH */
  if (loading) {
    return <div className="p-10 text-white">Checking access...</div>;
  }

  return (
    <AdminLayout>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* 🔙 BACK BUTTON (ADDED ONLY THIS) */}
        <motion.button
          onClick={() => router.push("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg 
          bg-white/5 border border-white/10 backdrop-blur-md
          hover:bg-white/10 hover:border-white/20
          shadow-[0_0_10px_rgba(255,255,255,0.05)]"
        >
          <span className="text-sm text-gray-300 group-hover:text-white transition">
            ← Back to Home
          </span>

          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none
            bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.15),transparent_70%)]"
          />
        </motion.button>

        {/* HEADER */}
        <h1 className="text-lg font-medium">Dashboard Overview</h1>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-4 gap-5">

          {[
            { title: "Preset Sold", value: "0"},
            { title: "Uploads", value: "4"},
            { title: "Students", value: "67"},
            { title: "Revenue", value: "$17"},
          ].map((item, i) => (

            <motion.div
              key={i}
              initial={{ scale: 1 }}
              whileHover={{
                scale: 1.06,
                y: -10,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="group relative bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md overflow-hidden"
            >

              {/* ✨ GLOW */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none
                bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_70%)]"
              />

              {/* ✨ BORDER GLOW */}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/30 transition duration-300" />

              {/* CONTENT */}
              <p className="text-xs text-gray-400">{item.title}</p>
              <h2 className="text-xl font-semibold mt-1">{item.value}</h2>
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>

            </motion.div>

          ))}

        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-3 gap-5">

          {/* 📊 CHART */}
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md h-[260px]">
            <p className="text-xs text-gray-400 mb-3">Admin Revenue</p>

            <div className="h-full flex items-end justify-between px-4">
              {[40, 60, 50, 80, 65, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* 👥 ACTIVITY */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">
            <p className="text-xs text-gray-400 mb-2">
              Requested Withdrawal
            </p>
            <p className="text-sm text-gray-300">No data yet</p>
          </div>

        </div>

        {/* 🔥 BOTTOM GRID */}
        <div className="grid grid-cols-3 gap-5">

          {/* 📦 UPLOAD */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md space-y-3">
            <h2 className="text-xs text-gray-400">Upload Preset</h2>

            <input
              className="w-full bg-white/10 border border-white/10 p-2.5 rounded-md text-sm outline-none"
              placeholder="Preset Name"
            />

            <input
              className="w-full bg-white/10 border border-white/10 p-2.5 rounded-md text-sm outline-none"
              placeholder="Price (₹)"
            />

            <input
              type="file"
              className="w-full bg-white/10 border border-white/10 p-2 rounded-md text-xs"
            />

            <button className="w-full bg-gradient-to-r from-purple-500 to-orange-500 py-2.5 rounded-md text-sm font-medium">
              Upload
            </button>
          </div>

          {/* 📋 TABLE */}
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">

            <h2 className="text-xs text-gray-400 mb-3">Presets</h2>

            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-3">Name</th>
                  <th className="text-center pb-3">Price</th>
                  <th className="text-center pb-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-white/10">
                  <td className="py-3">No presets yet</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}