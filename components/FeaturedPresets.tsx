"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

type Preset = {
  id: string;
  name: string;
  price: number;
  afterImage?: string;
  coverImage?: string;
};

export default function FeaturedPresets({ presets }: { presets: Preset[] }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (presets.length === 0) return null;

  // Split presets into left and right groups
  const half = Math.ceil(presets.length / 2);
  const leftPresets = presets.slice(0, half);
  const rightPresets = presets.slice(half);

  // On mobile: use touch
  const handleInteraction = () => {
    setIsRevealed(true);
  };

  const handleLeave = () => {
    setIsRevealed(false);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
      </div>
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* ── Hover-reveal card layout ── */}
      <div
        ref={containerRef}
        className="relative max-w-[1400px] mx-auto px-4 sm:px-6"
        onMouseEnter={handleInteraction}
        onMouseLeave={handleLeave}
        onTouchStart={handleInteraction}
      >
        {/* Main row: left cards + trigger card + right cards */}
        <div className="flex items-stretch justify-center gap-4 sm:gap-5 min-h-[380px] sm:min-h-[420px]">

          {/* ── LEFT preset cards (slide out from behind the trigger) ── */}
          {leftPresets.map((preset, i) => (
            <motion.div
              key={preset.id}
              className="flex-shrink-0 hidden sm:block"
              style={{ width: "clamp(180px, 18vw, 240px)" }}
              initial={false}
              animate={{
                opacity: isRevealed ? 1 : 0,
                x: isRevealed ? 0 : 120 + i * 30,
                scale: isRevealed ? 1 : 0.85,
                filter: isRevealed ? "blur(0px)" : "blur(8px)",
              }}
              transition={{
                duration: 0.5,
                delay: isRevealed ? (leftPresets.length - 1 - i) * 0.07 : i * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <PresetCard preset={preset} />
            </motion.div>
          ))}

          {/* ── TRIGGER CARD — "Trending Now" frosted glass ── */}
          <motion.div
            className="flex-shrink-0 relative cursor-pointer z-10"
            style={{ width: "clamp(220px, 22vw, 280px)" }}
            layout
          >
            <div
              className={`
                relative h-full rounded-2xl overflow-hidden
                border transition-all duration-700
                ${isRevealed
                  ? "border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                  : "border-white/[0.1] shadow-[0_0_30px_rgba(168,85,247,0.08)]"
                }
              `}
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Animated background shimmer */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, transparent 30%, rgba(168,85,247,0.3) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />

              {/* Inner glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8 min-h-[380px] sm:min-h-[420px]">
                {/* Sparkle icon */}
                <motion.div
                  animate={{ rotate: isRevealed ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="mb-5"
                >
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Sparkles size={24} className="text-purple-400" />
                  </div>
                </motion.div>

                {/* Label */}
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-purple-400/80 font-medium mb-3">
                  Popular
                </span>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center leading-tight mb-3">
                  Trending
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Now
                  </span>
                </h2>

                {/* Subtitle hint */}
                <motion.p
                  className="text-xs text-gray-500 text-center mt-2"
                  animate={{ opacity: isRevealed ? 0 : 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {typeof window !== "undefined" && "ontouchstart" in window
                    ? "Tap to explore →"
                    : "Hover to explore →"}
                </motion.p>

                {/* "View all" link — shows on reveal */}
                <motion.div
                  animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 10 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-4"
                >
                  <Link
                    href="#presets"
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-400 transition group"
                  >
                    View all presets
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(5)].map((_, i) => {
                    const size = 2 + Math.random() * 2;
                    const left = 15 + Math.random() * 70;
                    const delay = i * 0.8;
                    return (
                      <div
                        key={i}
                        className="absolute rounded-full bg-purple-400/20"
                        style={{
                          width: size,
                          height: size,
                          left: `${left}%`,
                          bottom: "-4px",
                          animation: `float-up ${4 + i}s ease-in-out ${delay}s infinite`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT preset cards (slide out from behind the trigger) ── */}
          {rightPresets.map((preset, i) => (
            <motion.div
              key={preset.id}
              className="flex-shrink-0 hidden sm:block"
              style={{ width: "clamp(180px, 18vw, 240px)" }}
              initial={false}
              animate={{
                opacity: isRevealed ? 1 : 0,
                x: isRevealed ? 0 : -(120 + i * 30),
                scale: isRevealed ? 1 : 0.85,
                filter: isRevealed ? "blur(0px)" : "blur(8px)",
              }}
              transition={{
                duration: 0.5,
                delay: isRevealed ? i * 0.07 : (rightPresets.length - 1 - i) * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <PresetCard preset={preset} />
            </motion.div>
          ))}
        </div>

        {/* ── MOBILE: show cards below trigger on tap ── */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              className="sm:hidden grid grid-cols-2 gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              {presets.map((preset, i) => (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <PresetCard preset={preset} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 200%; }
          50% { background-position: 0% 0%; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(-400px) scale(0); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ── Individual Preset Card ── */
function PresetCard({ preset }: { preset: Preset }) {
  return (
    <Link href={`/preset/${preset.id}`} className="group block h-full">
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm transition-all duration-500 group-hover:border-purple-500/40 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {(preset.coverImage || preset.afterImage) && (
            <Image
              src={preset.coverImage || preset.afterImage!}
              alt={preset.name || "Preset"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 18vw"
            />
          )}
        </div>

        {/* Frosted bottom section with name */}
        <div
          className="px-3 py-3 sm:py-4 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <h3 className="text-white/90 font-semibold text-sm sm:text-base truncate transition-all duration-500 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
            {preset.name || "Untitled"}
          </h3>
        </div>
      </div>
    </Link>
  );
}
