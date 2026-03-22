"use client";

import Typewriter from "typewriter-effect";

export default function DynamicTitle() {
  return (
    <h1 className="text-5xl md:text-6xl font-bold text-center">
      <Typewriter
        options={{
          strings: [
            "SnapGrid",
            "Premium Lightroom Presets",
            "Upgrade Your Photos"
          ],
          autoStart: true,
          loop: true,
          deleteSpeed: 30,
        }}
      />
    </h1>
  );
}