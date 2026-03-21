"use client";

import Navbar from "@/components/Navbar";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function ViewLivePreset() {

  const presets = [
    {
      name: "Cinematic Preset",
      before: "/presets/cinematic-before.jpg",
      after: "/presets/cinematic-after.jpg",
    },
    {
      name: "Portrait Preset",
      before: "/presets/portrait-before.jpg",
      after: "/presets/portrait-after.jpg",
    },
    {
      name: "Travel Preset",
      before: "/presets/travel-before.jpg",
      after: "/presets/travel-after.jpg",
    },
    {
      name: "Street Preset",
      before: "/presets/street-before.jpg",
      after: "/presets/street-after.jpg",
    },
    {
      name: "Moody Preset",
      before: "/presets/moody-before.jpg",
      after: "/presets/moody-after.jpg",
    },
    {
      name: "Vintage Preset",
      before: "/presets/vintage-before.jpg",
      after: "/presets/vintage-after.jpg",
    },
  ];

  return (
    <div className="min-h-screen text-white">

      <Navbar />

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-4xl font-bold text-center mb-16">
          Live Preset Preview
        </h1>

        <div className="grid md:grid-cols-2 gap-16">

          {presets.map((preset, index) => (

            <div key={index}>

              <h2 className="text-xl font-semibold mb-4 text-center">
                {preset.name}
              </h2>

              <BeforeAfterSlider
                before={preset.before}
                after={preset.after}
              />

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}