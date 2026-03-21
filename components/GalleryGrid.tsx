"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Masonry from "./Masonry";

export default function GalleryGrid({
  photos,
}: {
  photos: { id: string; imageUrl: string; title?: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPhoto = photos.find((p) => p.id === selected);

  return (
    <>
      <div className="w-full" style={{ paddingBottom: '50px' }}>
        <Masonry 
          items={photos.map((photo, i) => {
            const heights = [400, 250, 500, 300, 450, 350, 550, 280];
            return {
              id: photo.id,
              img: photo.imageUrl,
              title: photo.title,
              height: heights[i % heights.length]
            };
          })}
          onItemClick={(id) => setSelected(id)}
          colorShiftOnHover={true}
        />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || "Photo"}
                className="max-h-[85vh] max-w-full object-contain rounded-xl"
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
