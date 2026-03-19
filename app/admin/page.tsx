"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection, deleteDoc, addDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Live stats
  const [stats, setStats] = useState({
    presetsSold: 0,
    uploads: 0,
    users: 0,
    revenue: 0,
  });

  // Presets list
  const [presets, setPresets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState("");
  
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("");

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
        fetchDashboardData();
      }
    };

    checkAdmin();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all collections in parallel
      const [purchasesSnap, presetSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "purchases")),
        getDocs(collection(db, "presets")),
        getDocs(collection(db, "users")),
      ]);

      // Build presets list
      const presetList = presetSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPresets(presetList);

      // Fetch Categories
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Fetch Promos
      const promoSnap = await getDocs(collection(db, "promoCodes"));
      setPromoCodes(promoSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Revenue logice lookup map for revenue calculation
      const priceMap: Record<string, number> = {};
      presetList.forEach((p: any) => {
        priceMap[p.id] = p.price || 0;
      });

      // Calculate revenue from purchases
      let totalRevenue = 0;
      purchasesSnap.docs.forEach((doc) => {
        const data = doc.data();
        const presetPrice = priceMap[data.presetId] || 0;
        totalRevenue += presetPrice;
      });

      setStats({
        presetsSold: purchasesSnap.size,
        uploads: presetSnap.size,
        users: usersSnap.size,
        revenue: totalRevenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const handleDeletePreset = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "presets", id));
      setPresets(presets.filter((p) => p.id !== id));
      alert("Preset deleted");
      // Refresh stats
      setStats((prev) => ({
        ...prev,
        uploads: prev.uploads - 1,
      }));
    } catch (err) {
      alert("Error deleting preset");
      console.error("Delete error:", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "categories"), { name: newCat.trim() });
      setCategories([...categories, { id: docRef.id, name: newCat.trim() }]);
      setNewCat("");
    } catch (err) {
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !newPromoDiscount) return;
    try {
      const code = newPromoCode.trim().toUpperCase();
      const percent = parseInt(newPromoDiscount);
      await setDoc(doc(db, "promoCodes", code), {
        code,
        discountPercent: percent,
        isActive: true,
      });
      setPromoCodes([...promoCodes, { id: code, code, discountPercent: percent, isActive: true }]);
      setNewPromoCode("");
      setNewPromoDiscount("");
    } catch (err) {
      alert("Failed to add promo code");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      await deleteDoc(doc(db, "promoCodes", id));
      setPromoCodes(promoCodes.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete promo code");
    }
  };

  if (loading) {
    return <div className="p-10 text-white">Checking access...</div>;
  }

  const statCards = [
    { title: "Presets Sold", value: stats.presetsSold.toString() },
    { title: "Uploads", value: stats.uploads.toString() },
    { title: "Users", value: stats.users.toString() },
    { title: "Revenue", value: `₹${stats.revenue}` },
  ];

  return (
    <AdminLayout>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* 🔙 BACK BUTTON */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {statCards.map((item, i) => (

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

            </motion.div>

          ))}

        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* 📊 CHART */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md h-[260px]">
            <p className="text-xs text-gray-400 mb-3">Revenue Overview</p>

            {stats.revenue > 0 ? (
              <div className="h-full flex items-end justify-between px-4 pb-4">
                {[40, 60, 50, 80, 65, 90, 70].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-2 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400"
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">No revenue data yet</p>
              </div>
            )}
          </div>

          {/* 👥 ACTIVITY */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">
            <p className="text-xs text-gray-400 mb-2">
              Quick Stats
            </p>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Revenue</span>
                <span className="text-green-400 font-medium">₹{stats.revenue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg. per Sale</span>
                <span className="text-yellow-400 font-medium">
                  ₹{stats.presetsSold > 0 ? Math.round(stats.revenue / stats.presetsSold) : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Free Presets</span>
                <span className="text-purple-400 font-medium">
                  {presets.filter((p) => p.price === 0).length}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 🗂 CATEGORIES MANAGER */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md mb-8">
          <h2 className="text-xs text-gray-400 mb-4">Manage Categories</h2>
          <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="New Category Name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-sm text-white font-medium transition"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full">
                <span className="text-sm">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-400 hover:text-red-300 ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🎟️ PROMO CODES MANAGER */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md mb-8">
          <h2 className="text-xs text-gray-400 mb-4">Manage Promo Codes</h2>
          <form onSubmit={handleAddPromo} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="CODE (e.g. SUMMER20)"
              value={newPromoCode}
              onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-purple-500 uppercase"
            />
            <input
              type="number"
              placeholder="% Off"
              value={newPromoDiscount}
              onChange={(e) => setNewPromoDiscount(e.target.value)}
              className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-purple-500"
              min="1"
              max="100"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-sm text-white font-medium transition"
            >
              Create
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full">
                <span className="text-sm font-semibold text-purple-400">{promo.code}</span>
                <span className="text-xs text-green-400">-{promo.discountPercent}%</span>
                <button
                  onClick={() => handleDeletePromo(promo.id)}
                  className="text-red-400 hover:text-red-300 ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 PRESETS TABLE */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs text-gray-400">All Presets ({presets.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-3">Image</th>
                  <th className="text-left pb-3">Name</th>
                  <th className="text-center pb-3">Category</th>
                  <th className="text-center pb-3">Price</th>
                  <th className="text-center pb-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {presets.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td className="py-3 text-gray-500" colSpan={5}>
                      No presets yet
                    </td>
                  </tr>
                ) : (
                  presets.map((preset) => (
                    <tr key={preset.id} className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="py-3">
                        {preset.afterImage ? (
                          <div className="relative w-10 h-10">
                            <Image
                              src={preset.afterImage}
                              alt={preset.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-800" />
                        )}
                      </td>
                      <td className="py-3 font-medium">{preset.name}</td>
                      <td className="text-center py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                          {preset.category || "—"}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        {preset.price === 0 ? (
                          <span className="text-green-400">Free</span>
                        ) : (
                          `₹${preset.price}`
                        )}
                      </td>
                      <td className="text-center py-3">
                        <button
                          onClick={() => handleDeletePreset(preset.id, preset.name)}
                          className="text-red-400 hover:text-red-500 text-xs px-3 py-1 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </AdminLayout>
  );
}