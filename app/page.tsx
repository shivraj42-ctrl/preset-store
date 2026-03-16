"use client";

import Navbar from "@/components/Navbar";

export default function Home() {
  const presets = [
    {
      name: "Cinematic Warm",
      price: "$3",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    },
    {
      name: "Moody Dark",
      price: "$2",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7"
    },
    {
      name: "Golden Hour",
      price: "FREE",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
    },
    {
      name: "Street Contrast",
      price: "$4",
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d"
    }
  ];

  return (
    <div className="bg-black min-h-screen text-white">

      <Navbar />

      {/* HERO */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Lightroom Preset Store
        </h1>

        <p className="text-gray-400 text-lg mb-8">
          Download professional Lightroom presets for cheap prices.
        </p>

        <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold">
          Browse Presets
        </button>
      </section>

      {/* PRESET GRID */}
      <section className="px-10 pb-20">

        <h2 className="text-2xl font-bold mb-8">
          Popular Presets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {presets.map((preset, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition"
            >

              <img
                src={preset.image}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">

                <h3 className="text-lg font-semibold">
                  {preset.name}
                </h3>

                <p className="text-gray-400 mb-4">
                  {preset.price}
                </p>

                <button className="bg-white text-black px-4 py-2 rounded-lg w-full">
                  Download
                </button>

              </div>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}