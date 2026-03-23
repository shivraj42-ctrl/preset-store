"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import BentoGrid, { BentoCard } from "@/components/MagicBento";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  ImageIcon,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Upload,
  Link2,
} from "lucide-react";

export default function AdminGalleryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

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
        fetchPhotos();
      }
    };
    checkAdmin();
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const snap = await getDocs(collection(db, "gallery"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPhotos(list);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Upload file via server-side API route (signed upload, no preset needed)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
    }

    setUploadProgress("Uploading to Cloudinary...");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();

    if (!res.ok) {
      let errorMsg = "Upload failed";
      try {
        const err = JSON.parse(text);
        errorMsg = err.error || errorMsg;
      } catch {
        errorMsg = text || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const data = JSON.parse(text);
    setUploadProgress(null);
    return data.url;
  };

  const handleUpload = async () => {
    // Determine the final image URL
    let finalUrl = "";

    if (uploadMode === "file") {
      if (!selectedFile) {
        showToast("Please select a file");
        return;
      }
      try {
        finalUrl = await uploadToCloudinary(selectedFile);
      } catch (err: any) {
        showToast(err.message || "Upload to Cloudinary failed");
        setUploadProgress(null);
        return;
      }
    } else {
      if (!imageUrl.trim()) {
        showToast("Please enter an image URL");
        return;
      }
      finalUrl = imageUrl.trim();
    }

    setSubmitting(true);
    setUploadProgress("Saving to gallery...");
    try {
      await addDoc(collection(db, "gallery"), {
        title: title.trim() || "Untitled",
        imageUrl: finalUrl,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setImageUrl("");
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPhotos();
      showToast("Photo uploaded ✓");
    } catch (err) {
      console.error(err);
      showToast("Failed to save photo");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      showToast("Photo deleted");
    } catch (err) {
      console.error(err);
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
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-green-600/90 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={14} />
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <BentoGrid className="grid-cols-1" enableSpotlight spotlightRadius={800}>
          {/* Upload Form */}
          <BentoCard label="Add Photo" enableStars={false}>

          {/* Toggle: File Upload vs URL */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setUploadMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                uploadMode === "file"
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Upload size={13} />
              Upload File
            </button>
            <button
              onClick={() => setUploadMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                uploadMode === "url"
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Link2 size={13} />
              Paste URL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
            />

            {/* File / URL input */}
            {uploadMode === "file" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/5 border border-white/10 border-dashed rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-pointer hover:border-purple-500/40 hover:bg-white/[0.07] transition flex items-center gap-2"
              >
                <Upload size={14} />
                {selectedFile ? (
                  <span className="text-white truncate">{selectedFile.name}</span>
                ) : (
                  <span>Choose image file...</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder="Image URL (Cloudinary, etc.)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
              />
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={submitting || (uploadMode === "file" ? !selectedFile : !imageUrl.trim())}
              className="px-6 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting || uploadProgress ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {uploadProgress || "Uploading..."}
                </>
              ) : (
                <>
                  <Plus size={14} /> Upload Photo
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          {(filePreview || (uploadMode === "url" && imageUrl)) && (
            <div className="mt-4 flex items-start gap-4">
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
                <img
                  src={uploadMode === "file" ? filePreview! : imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Preview</p>
            </div>
          )}
          </BentoCard>

          {/* Photos Grid */}
          <BentoCard label={`All Photos (${photos.length})`} enableStars={false}>

          {photos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No photos uploaded yet
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-lg overflow-hidden border border-white/10 aspect-square bg-zinc-900"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || "Photo"}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <p className="text-xs text-white font-medium px-2 text-center">
                      {photo.title || "Untitled"}
                    </p>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-[11px] hover:bg-red-600 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </BentoCard>
        </BentoGrid>
      </div>
    </AdminLayout>
  );
}
