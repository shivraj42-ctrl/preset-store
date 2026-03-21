"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Preset = {
  id: string;
  name: string;
  price: number;
  afterImage?: string;
  coverImage?: string;
};

export default function FeaturedPresets({ presets }: { presets: Preset[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || presets.length === 0) return;

    let animId: number;
    const speed = 0.5;

    const scroll = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        // Loop back
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, presets.length]);

  if (presets.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
      </div>
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <span className="text-xs uppercase tracking-[3px] text-purple-400 font-medium">
              Popular
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Trending Now
            </h2>
          </div>
          <Link
            href="#presets"
            className="hidden sm:flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition group"
          >
            View all
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Scrolling strip */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Double the items for seamless loop */}
        {[...presets, ...presets].map((preset, i) => (
          <Link
            key={`${preset.id}-${i}`}
            href={`/preset/${preset.id}`}
            className="group flex-shrink-0 w-72"
          >
            <div className="relative h-80 rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900 transition-all duration-500 group-hover:border-purple-500/40 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              {(preset.coverImage || preset.afterImage) && (
                <Image
                  src={preset.coverImage || preset.afterImage!}
                  alt={preset.name || "Preset"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="288px"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 inset-x-0 p-5">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {preset.name || "Untitled"}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-bold text-sm">
                    {preset.price === 0 ? "Free" : `₹${preset.price}`}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-purple-400 transition flex items-center gap-1">
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
