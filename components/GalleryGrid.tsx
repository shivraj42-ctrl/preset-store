"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function GalleryGrid({
  photos,
}: {
  photos: { id: string; imageUrl: string; title?: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPhoto = photos.find((p) => p.id === selected);

  return (
    <>
      {/* 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => setSelected(photo.id)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer bg-zinc-900"
          >
            <img
              src={photo.imageUrl}
              alt={photo.title || "Photo"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {photo.title && (
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="text-sm font-medium text-white truncate">
                    {photo.title}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || "Photo"}
                className="w-full h-full object-contain rounded-xl"
              />

              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

              {/* Title */}
              {selectedPhoto.title && (
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                  <p className="text-lg font-medium text-white">
                    {selectedPhoto.title}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
