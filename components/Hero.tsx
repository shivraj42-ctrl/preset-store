"use client";

import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center mt-28 px-4">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text"
      >
        <Typewriter
          options={{
            strings: [
              "XMP Store",
              "Premium Lightroom Presets",
              "Transform Your Photos"
            ],
            autoStart: true,
            loop: true,
            deleteSpeed: 30,
          }}
        />
      </motion.h1>

      <p className="text-gray-400 mt-4 max-w-xl">
        Discover professional presets designed to elevate your photos instantly.
      </p>

    </section>
  );
}