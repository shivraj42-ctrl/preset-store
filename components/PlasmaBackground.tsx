"use client";

import dynamic from "next/dynamic";

// Lazy-load Plasma to avoid SSR issues with WebGL
const Plasma = dynamic(() => import("@/components/Plasma"), { ssr: false });

export default function PlasmaBackground() {
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
