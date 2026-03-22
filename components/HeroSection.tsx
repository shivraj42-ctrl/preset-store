"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function HeroSection({ previewImages }: { previewImages: string[] }) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[150px]" />
      </div>

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "128px" }} />

      {/* Floating preset images */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {previewImages.slice(0, 3).map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 + i * 0.3, ease: "easeOut" }}
            className="absolute"
            style={{
              top: i === 0 ? "18%" : i === 1 ? "30%" : "55%",
              left: i === 0 ? "8%" : i === 1 ? "82%" : "5%",
              right: i === 2 ? "auto" : undefined,
            }}
          >
            <motion.div
              animate={{
                y: [0, i % 2 === 0 ? -15 : 15, 0],
                rotate: [0, i === 1 ? 3 : -2, 0],
              }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-36 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20 rotate-[-6deg]"
                style={{ transform: `rotate(${i === 0 ? -6 : i === 1 ? 4 : -3}deg)` }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* SnapGrid Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <Image
            src="/snapgrade-logo.png"
            alt="SnapGrid"
            width={280}
            height={70}
            className="w-[220px] sm:w-[280px] md:w-[320px] h-auto object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <span className="inline-block text-xs uppercase tracking-[4px] text-purple-400 mb-6 font-medium">
            Premium Lightroom Presets
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8"
        >
          <span className="block text-white">Elevate</span>
          <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Your Edits
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Transform your photography with presets crafted by professional creators. One click, stunning results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* <Link
            href="#presets"
            className="group relative px-8 py-4 rounded-xl bg-purple-600 text-white font-semibold text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:bg-purple-500"
          >
            <span className="relative z-10">Browse Presets</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link
            href="/gallery"
            className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/5 hover:border-purple-500/50 transition-all duration-300"
          >
            View Gallery
          </Link> */}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[3px] text-gray-500">Scroll</span>
          <ChevronDown size={16} className="text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
