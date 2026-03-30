"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy-load Plasma to avoid SSR issues with WebGL
const Plasma = dynamic(() => import("@/components/Plasma"), { ssr: false });

export default function PlasmaBackground() {
  const [canRunPlasma, setCanRunPlasma] = useState(false);

  useEffect(() => {
    // Skip heavy WebGL on low-end devices
    const cores = navigator.hardwareConcurrency || 2;
    const isSmallScreen = window.innerWidth < 768;
    const isLowEnd = cores <= 4 && isSmallScreen;

    setCanRunPlasma(!isLowEnd);
  }, []);

  // Lightweight CSS fallback for low-end devices
  if (!canRunPlasma) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)",
        }}
      />
    );
  }

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

