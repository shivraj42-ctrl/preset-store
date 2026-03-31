"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy-load Plasma to avoid SSR issues with WebGL
const Plasma = dynamic(() => import("@/components/Plasma"), { ssr: false });

export default function PlasmaBackground() {
  const [isMobile, setIsMobile] = useState(true); // default to mobile (no flash)

  useEffect(() => {
    // All mobile / small screens skip WebGL Plasma entirely
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Completely static background for mobile — no WebGL, no animation, no gradients
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "#000000" }}
      />
    );
  }

  // Full Plasma for desktop
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Plasma
        color="#7c3aed"
        speed={0.3}
        direction="forward"
        scale={1.2}
        opacity={0.6}
        mouseInteractive={false}
      />
    </div>
  );
}

