"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ImageZoom from "@/components/ImageZoom";

export default function PresetDetail() {

const { id } = useParams();

const presets = [
{
id: "1",
name: "Cinematic Warm",
price: "$3",
description: "A cinematic preset that adds warm tones and dramatic contrast.",
image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
},
{
id: "2",
name: "Moody Dark",
price: "$2",
description: "Perfect for portraits with dark shadows and soft highlights.",
image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7"
},
{
id: "3",
name: "Golden Hour",
price: "FREE",
description: "Bright golden tones ideal for travel and sunset photography.",
image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
},
{
id: "4",
name: "Street Contrast",
price: "$4",
description: "High contrast preset designed for street photography.",
image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d"
}
];

const preset = presets.find((p) => p.id === id);

if (!preset) {
return <div className="text-white p-20">Preset not found</div>;
}

return ( <div className="bg-black min-h-screen text-white">


  <Navbar />

  <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">

    {/* PREVIEW IMAGE */}
   <ImageZoom image={preset.image} />

    {/* PRESET INFO */}
    <div>

      <h1 className="text-4xl font-bold mb-4">
        {preset.name}
      </h1>

      <p className="text-gray-400 mb-6">
        {preset.description}
      </p>

      <p className="text-2xl font-semibold mb-6">
        {preset.price}
      </p>

      <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
        Download Preset
      </button>

    </div>

  </div>

  {/* BEFORE AFTER DEMO */}
  <BeforeAfterSlider />

</div>


);
}
