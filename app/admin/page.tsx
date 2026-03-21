"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import BentoGrid, { BentoCard } from "@/components/MagicBento";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection, deleteDoc, addDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

/* ── Revenue Line Chart Component ── */
function RevenueLineChart({ data }: { data: { label: string; value: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const W = 600;
  const H = 180;
  const PAD_X = 40;
  const PAD_Y = 20;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_Y * 2;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const stepX = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_Y + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_Y + chartH} L ${points[0].x} ${PAD_Y + chartH} Z`;

  // Grid lines (4 horizontal)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    y: PAD_Y + chartH - frac * chartH,
    label: `₹${Math.round(maxVal * frac)}`,
  }));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={PAD_X} y1={g.y} x2={W - PAD_X} y2={g.y} stroke="white" strokeOpacity="0.06" strokeWidth="1" />
            <text x={PAD_X - 6} y={g.y + 3} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="sans-serif">
              {g.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: "pointer" }}>
            {/* Invisible bigger hit area */}
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />

            {/* Visible dot */}
            <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3.5} fill="#a855f7" stroke="#1a1a2e" strokeWidth="2" style={{ transition: "r 0.15s" }} />

            {/* Glow on hover */}
            {hoveredIdx === i && (
              <circle cx={p.x} cy={p.y} r="10" fill="#a855f7" fillOpacity="0.15" />
            )}

            {/* Tooltip on hover */}
            {hoveredIdx === i && (
              <g>
                <rect x={p.x - 28} y={p.y - 26} width="56" height="18" rx="4" fill="#1f1f2e" stroke="#a855f7" strokeWidth="0.5" strokeOpacity="0.5" />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                  ₹{p.value}
                </text>
              </g>
            )}

            {/* X-axis labels */}
            <text x={p.x} y={H + 12} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="sans-serif">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}


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

  // Revenue chart data (last 7 days)
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);

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

      // Calculate revenue from purchases + build daily chart data
      let totalRevenue = 0;

      // Build daily revenue map for last 7 days
      const dailyMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        dailyMap[key] = 0;
      }

      purchasesSnap.docs.forEach((doc) => {
        const data = doc.data();
        const presetPrice = priceMap[data.presetId] || 0;
        totalRevenue += presetPrice;

        // Parse purchase date
        let purchaseDate: Date | null = null;
        if (data.createdAt?.seconds) {
          purchaseDate = new Date(data.createdAt.seconds * 1000);
        } else if (data.createdAt?.toDate) {
          purchaseDate = data.createdAt.toDate();
        }

        if (purchaseDate) {
          const key = purchaseDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          if (key in dailyMap) {
            dailyMap[key] += presetPrice;
          }
        }
      });

      setRevenueData(
        Object.entries(dailyMap).map(([label, value]) => ({ label, value }))
      );

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

        {/* 🔥 STATS BENTO GRID */}
        <BentoGrid className="grid-cols-2 md:grid-cols-4" enableSpotlight spotlightRadius={400}>
          {statCards.map((item, i) => (
            <BentoCard key={i} label={item.title} enableStars enableBorderGlow particleCount={8}>
              <h2 className="text-3xl font-semibold mt-4 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">{item.value}</h2>
            </BentoCard>
          ))}
        </BentoGrid>

        {/* 🔥 MAIN CONTENT BENTO GRID */}
        <BentoGrid className="grid-cols-1 md:grid-cols-3" enableSpotlight spotlightRadius={500}>
          <BentoCard className="md:col-span-2 h-[320px]" label="Revenue Overview (Last 7 days)" enableStars={false}>
            {revenueData.length > 0 && revenueData.some((d) => d.value > 0) ? (
              <div className="h-[220px] mt-2">
                <RevenueLineChart data={revenueData} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">No revenue data yet</p>
              </div>
            )}
          </BentoCard>

          <BentoCard label="Quick Stats" particleCount={6}>
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Revenue</span>
                <span className="text-green-400 font-semibold px-2 py-1 bg-green-500/10 rounded-md">₹{stats.revenue}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/10 my-1"><div className="w-full border-t border-white/5 border-dashed" /></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Avg. per Sale</span>
                <span className="text-yellow-400 font-semibold px-2 py-1 bg-yellow-500/10 rounded-md">
                  ₹{stats.presetsSold > 0 ? Math.round(stats.revenue / stats.presetsSold) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/10 my-1"><div className="w-full border-t border-white/5 border-dashed" /></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Free Presets</span>
                <span className="text-purple-400 font-semibold px-2 py-1 bg-purple-500/10 rounded-md">
                  {presets.filter((p) => p.price === 0).length}
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-3 lg:col-span-1" label="Manage Categories" enableStars={false}>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6 mt-2">
              <input
                type="text"
                placeholder="New Category Name"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-purple-500/20">Add</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] pl-3 pr-1 py-1 rounded-full text-sm hover:bg-white/[0.1] transition-colors">
                  <span className="text-gray-200">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">×</button>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-3 lg:col-span-2" label="Manage Promo Codes" enableStars={false}>
            <form onSubmit={handleAddPromo} className="flex gap-3 mb-6 mt-2">
              <input
                type="text"
                placeholder="CODE (e.g. SUMMER20)"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 uppercase transition-colors"
              />
              <input
                type="number"
                placeholder="% Off"
                value={newPromoDiscount}
                onChange={(e) => setNewPromoDiscount(e.target.value)}
                className="w-24 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                min="1"
                max="100"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8 py-2.5 rounded-xl text-sm text-white font-medium transition shadow-lg shadow-purple-500/20">Create</button>
            </form>
            <div className="flex flex-wrap gap-3">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="flex items-center gap-2 bg-white/[0.06] border border-purple-500/20 pl-4 pr-1 py-1 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full hover:bg-white/[0.1] transition-colors">
                  <span className="text-sm font-semibold text-purple-300">{promo.code}</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-medium ml-1">-{promo.discountPercent}%</span>
                  <button onClick={() => handleDeletePromo(promo.id)} className="w-6 h-6 ml-1 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">×</button>
                </div>
              ))}
            </div>
          </BentoCard>
        </BentoGrid>

        {/* 🔥 PRESETS TABLE BENTO */}
        <div className="mt-4">
          <BentoGrid className="grid-cols-1" enableSpotlight spotlightRadius={800}>
            <BentoCard label={`All Presets (${presets.length})`} enableStars={false}>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 text-xs tracking-wider uppercase border-b border-white/10">
                    <tr>
                      <th className="text-left pb-4 font-medium">Image</th>
                      <th className="text-left pb-4 font-medium">Name</th>
                      <th className="text-center pb-4 font-medium">Category</th>
                      <th className="text-center pb-4 font-medium">Price</th>
                      <th className="text-center pb-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presets.length === 0 ? (
                      <tr>
                        <td className="py-8 text-center text-gray-500 bg-white/[0.02] rounded-xl" colSpan={5}>
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl mb-2">📸</span>
                            No presets yet
                          </div>
                        </td>
                      </tr>
                    ) : (
                      presets.map((preset) => (
                        <tr key={preset.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                          <td className="py-4">
                            {preset.afterImage ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-purple-500/30 transition-colors">
                                <Image src={preset.afterImage} alt={preset.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10" />
                            )}
                          </td>
                          <td className="py-4 font-medium text-gray-200">{preset.name}</td>
                          <td className="text-center py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">
                              {preset.category || "—"}
                            </span>
                          </td>
                          <td className="text-center py-4">
                            {preset.price === 0 ? (
                              <span className="text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded-md">Free</span>
                            ) : (
                              <span className="text-gray-200">₹{preset.price}</span>
                            )}
                          </td>
                          <td className="text-center py-4">
                            <button
                              onClick={() => handleDeletePreset(preset.id, preset.name)}
                              className="text-red-400 hover:text-red-300 text-xs px-4 py-1.5 border border-red-500/20 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all opacity-70 group-hover:opacity-100"
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
            </BentoCard>
          </BentoGrid>
        </div>

      </div>

    </AdminLayout>
  );
}