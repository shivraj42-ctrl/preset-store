"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function BeforeAfterSlider({
  before = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
  after = "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80",
  showHeader = false,
}: {
  before?: string;
  after?: string;
  showHeader?: boolean;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

  const slider = (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] shadow-2xl select-none"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{ cursor: "ew-resize" }}
    >
      {/* After image — full natural size, no cropping */}
      <div className="relative w-full">
        <img
          src={after}
          alt="After"
          className="block w-full h-auto"
          draggable={false}
        />
        <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10 z-10">
          After
        </span>
      </div>

      {/* Before image — absolute positioned at full container width, clipped by parent */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute top-0 left-0 h-auto"
          style={{
            width: containerRef.current?.offsetWidth
              ? `${containerRef.current.offsetWidth}px`
              : "100%",
          }}
          draggable={false}
        />
        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10 z-10">
          Before
        </span>
      </div>

      {/* Drag handle */}
      <div
        className="absolute top-0 h-full z-20"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-[2px] h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-purple-400 cursor-ew-resize"
          onMouseDown={handleMouseDown}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );

  // When used standalone (e.g. homepage), wrap with section header and ambient effects
  if (showHeader) {
    return (
      <section className="py-20 relative overflow-visible">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-xs uppercase tracking-[3px] text-purple-400 font-medium">
              Before & After
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              See the Difference
            </h2>
          </motion.div>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {slider}
        </div>
      </section>
    );
  }

  // When used in a grid (view-live-preset page), just return the slider
  return slider;
}