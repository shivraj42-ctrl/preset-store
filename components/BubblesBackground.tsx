"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BubblesBackground() {
  const [bubbles, setBubbles] = useState<any[]>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }).map((_, i) => {
      let size;

      // 🎯 SIZE VARIATION (important)
      if (i < 3) size = Math.random() * 200 + 180;       // 🔥 HUGE
      else if (i < 8) size = Math.random() * 120 + 80;   // medium
      else size = Math.random() * 60 + 30;               // small

      const colors = [
        "rgba(168,85,247,0.45)",  // purple
        "rgba(236,72,153,0.45)",  // pink
        "rgba(59,130,246,0.45)",  // blue
        "rgba(251,146,60,0.45)",  // orange
      ];

      return {
        size,
        startX: Math.random() * window.innerWidth,
        startY: Math.random() * window.innerHeight,
        moveX: Math.random() * 250 - 125,
        moveY: Math.random() * 300 - 150,
        duration: 12 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    setBubbles(newBubbles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">

      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          initial={{ x: b.startX, y: b.startY }}
          animate={{
            x: [b.startX, b.startX + b.moveX, b.startX],
            y: [b.startY, b.startY + b.moveY, b.startY],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,

            // 🔥 MORE PUNCHY COLOR
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${b.color})`,

            border: "1px solid rgba(255,255,255,0.25)",

            backdropFilter: "blur(2px)",

            // 🔥 STRONGER GLOW
            boxShadow: `
              inset 0 0 30px rgba(255,255,255,0.4),
              0 0 40px ${b.color},
              0 10px 40px rgba(0,0,0,0.4)
            `,

            opacity: 0.7,
          }}
        />
      ))}

    </div>
  );
}