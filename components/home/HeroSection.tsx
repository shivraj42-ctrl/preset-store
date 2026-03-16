"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="w-full py-32 px-6 text-center bg-gradient-to-b from-black to-gray-900 text-white">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-bold"
      >
        Professional Lightroom Presets
      </motion.h1>

      <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
        Transform your photos instantly with presets used by creators.
      </p>

      <div className="flex justify-center gap-6 mt-8">

        <a
          href="/presets"
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          Browse Presets
        </a>

        <a
          href="/free"
          className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition"
        >
          Free Presets
        </a>

      </div>

    </section>
  );
}