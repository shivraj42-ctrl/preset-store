"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  collection,
} from "firebase/firestore";
import Masonry from "./Masonry";

interface Photo {
  id: string;
  imageUrl: string;
  title?: string;
}

function LikeButton({ photoId }: { photoId: string }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Listen to like count in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gallery", photoId), (snap) => {
      if (snap.exists()) {
        setLikeCount(snap.data().likeCount || 0);
      }
    });
    return () => unsub();
  }, [photoId]);

  // Check if current user has liked this photo
  useEffect(() => {
    if (!user) return;
    const checkLike = async () => {
      const likeDoc = await getDoc(
        doc(db, "gallery", photoId, "likes", user.uid)
      );
      setLiked(likeDoc.exists());
    };
    checkLike();
  }, [user, photoId]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    const likeRef = doc(db, "gallery", photoId, "likes", user.uid);
    const photoRef = doc(db, "gallery", photoId);

    try {
      if (liked) {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
        await deleteDoc(likeRef);
        await updateDoc(photoRef, { likeCount: increment(-1) });
      } else {
        setLiked(true);
        setLikeCount((c) => c + 1);
        await setDoc(likeRef, { uid: user.uid, createdAt: new Date() });
        await updateDoc(photoRef, { likeCount: increment(1) });
      }
    } catch (err) {
      console.error("Like error:", err);
      // Revert optimistic update
      setLiked(!liked);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1.5 group/like"
      title={user ? (liked ? "Unlike" : "Like") : "Sign in to like"}
    >
      <motion.div
        animate={animating ? { scale: [1, 1.4, 0.9, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Heart
          size={20}
          className={`transition-all duration-200 ${
            liked
              ? "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
              : "text-white/80 group-hover/like:text-red-400"
          }`}
        />
      </motion.div>
      <span
        className={`text-sm font-medium tabular-nums ${
          liked ? "text-red-400" : "text-white/70"
        }`}
      >
        {likeCount}
      </span>
    </button>
  );
}

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPhoto = photos.find((p) => p.id === selected);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <>
      <div className="w-full" style={{ paddingBottom: "50px" }}>
        <Masonry
          items={photos.map((photo, i) => {
            const heights = [400, 250, 500, 300, 450, 350, 550, 280];
            return {
              id: photo.id,
              img: photo.imageUrl,
              title: photo.title,
              height: heights[i % heights.length],
            };
          })}
          onItemClick={(id) => setSelected(id)}
          colorShiftOnHover={true}
          likeButton={(id: string) => <LikeButton photoId={id} />}
        />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && selectedPhoto && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            style={{ zIndex: 9999 }}
            onClick={closeLightbox}
          >
            {/* Close button — outside the inner div, always accessible */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              style={{ zIndex: 10000 }}
            >
              <X size={20} />
            </button>

            {/* Image container */}
            <motion.div
              key="lightbox-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || "Photo"}
                className="max-h-[80vh] max-w-full object-contain rounded-xl"
              />

              {/* Bottom bar: title + like */}
              <div className="w-full flex items-center justify-between mt-4 px-2">
                <p className="text-white/80 text-base font-medium truncate">
                  {selectedPhoto.title || ""}
                </p>
                <LikeButton photoId={selectedPhoto.id} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
