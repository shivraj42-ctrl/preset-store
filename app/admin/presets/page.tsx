"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Upload, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PresetForm {
  name: string;
  downloadUrl: string;
  beforeImage: string;
  afterImage: string;
  coverImage: string;
  price: string;
  category: string;
  description: string;
}

const emptyForm: PresetForm = {
  name: "",
  downloadUrl: "",
  beforeImage: "",
  afterImage: "",
  coverImage: "",
  price: "",
  category: "",
  description: "",
};

export default function AdminPresetsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<PresetForm>(emptyForm);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Admin check
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
        fetchData();
      }
    };
    checkAdmin();
  }, [user]);

  const fetchData = async () => {
    try {
      const [presetSnap, catSnap] = await Promise.all([
        getDocs(collection(db, "presets")),
        getDocs(collection(db, "categories")),
      ]);
      setPresets(
        presetSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setCategories(
        catSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !form.name.trim() ||
      !form.downloadUrl.trim() ||
      !form.beforeImage.trim() ||
      !form.afterImage.trim() ||
      !form.coverImage.trim() ||
      form.price === ""
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, "presets"), {
        name: form.name.trim(),
        downloadUrl: form.downloadUrl.trim(),
        beforeImage: form.beforeImage.trim(),
        afterImage: form.afterImage.trim(),
        coverImage: form.coverImage.trim(),
        price: parseFloat(form.price) || 0,
        category: form.category || "",
        description: form.description.trim(),
        createdAt: serverTimestamp(),
      });

      // Add to local state
      setPresets((prev) => [
        {
          id: docRef.id,
          name: form.name.trim(),
          afterImage: form.afterImage.trim(),
          category: form.category,
          price: parseFloat(form.price) || 0,
        },
        ...prev,
      ]);

      setForm(emptyForm);
      showToast("Preset uploaded successfully! 🎉");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload preset", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "presets", id));
      setPresets(presets.filter((p) => p.id !== id));
      showToast("Preset deleted");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete preset", "error");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Checking access...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOAST */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-md ${
              toast.type === "success"
                ? "bg-green-600/90 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                : "bg-red-500/90 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {toast.message}
          </motion.div>
        )}

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Upload size={20} className="text-purple-400" />
          <h1 className="text-lg font-medium">Upload Preset</h1>
        </div>

        {/* UPLOAD FORM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Row 1: Name + Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Preset Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Golden Hour Vibes"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0 for free"
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Row 2: Download URL + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Download URL (Cloudinary) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="downloadUrl"
                  value={form.downloadUrl}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Before Image + After Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Before Image URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="beforeImage"
                  value={form.beforeImage}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  After Image URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="afterImage"
                  value={form.afterImage}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Row 4: Cover Image */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Cover Image URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="coverImage"
                value={form.coverImage}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Row 5: Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the preset look, mood, best use cases..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* Image Previews */}
            {(form.beforeImage || form.afterImage || form.coverImage) && (
              <div className="flex gap-4 flex-wrap">
                {form.beforeImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Before</p>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-700">
                      <Image
                        src={form.beforeImage}
                        alt="Before preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {form.afterImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">After</p>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-700">
                      <Image
                        src={form.afterImage}
                        alt="After preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {form.coverImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cover</p>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-700">
                      <Image
                        src={form.coverImage}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                submitting
                  ? "bg-purple-600/50 cursor-not-allowed text-white/60"
                  : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Upload Preset
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* PRESETS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs text-gray-400">
              All Presets ({presets.length})
            </h2>
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
                    <td className="py-6 text-gray-500 text-center" colSpan={5}>
                      No presets yet — upload your first one above!
                    </td>
                  </tr>
                ) : (
                  presets.map((preset) => (
                    <tr
                      key={preset.id}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
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
                          onClick={() => handleDelete(preset.id, preset.name)}
                          className="inline-flex items-center gap-1 text-red-400 hover:text-red-500 text-xs px-3 py-1 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
