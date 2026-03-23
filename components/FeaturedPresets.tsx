"use client";

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

      {/* Preset Grid — no duplicates */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {presets.map((preset, i) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={`/preset/${preset.id}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900 transition-all duration-500 group-hover:border-purple-500/40 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                  {(preset.coverImage || preset.afterImage) && (
                    <Image
                      src={preset.coverImage || preset.afterImage!}
                      alt={preset.name || "Preset"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                    <h3 className="text-white font-semibold text-base sm:text-lg mb-1 truncate">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
