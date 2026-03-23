"use client";

import { motion } from "framer-motion";
import { Camera, Sparkles, Heart } from "lucide-react";
import SplitText from "@/components/SplitText";

export default function AboutMe() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs uppercase tracking-[3px] text-purple-400 font-medium">
            The Story
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Behind the Lens
          </h2>
        </motion.div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 sm:p-10 shadow-[0_0_60px_rgba(168,85,247,0.06)]"
        >
          {/* Decorative top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full" />

          {/* Icon row */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {[
              { icon: Camera, delay: 0.2 },
              { icon: Sparkles, delay: 0.35 },
              { icon: Heart, delay: 0.5 },
            ].map(({ icon: Icon, delay }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay, type: "spring", stiffness: 200 }}
                className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
              >
                <Icon size={18} className="text-purple-400" />
              </motion.div>
            ))}
          </div>

          {/* Paragraph */}
          <SplitText
            text="My journey into photography began with the Canon 3000D, where I first discovered the joy of capturing moments through my own perspective. What started as simple experimentation quickly turned into a deeper exploration across different genres—from the raw, candid energy of street photography to the calm and beauty of nature. Each phase helped me understand light, composition, and storytelling in a more meaningful way. Over time, as I refined my style and editing process, I realized the power of presets in transforming images efficiently. This led me to create my own presets, not just to enhance my work but to help others simplify their editing process and achieve stunning results with ease. Photography, for me, has grown into more than just a skill—it's a journey of constant learning, creativity, and sharing."
            className="text-gray-300 text-base sm:text-lg leading-relaxed sm:leading-loose"
            splitType="words"
            delay={30}
            duration={0.6}
            ease="power3.out"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-50px"
            textAlign="center"
            tag="p"
          />

          {/* Decorative bottom accent line */}
          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
