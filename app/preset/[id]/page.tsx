"use client"

import { useParams } from "next/navigation"

export default function PresetPage() {

  const params = useParams()
  const presetId = params.id

  // later fetch preset from firestore
  const preset = {
    id: presetId,
    name: "Cinematic Portrait",
    price: 19,
    afterImage: "cloudinary-url",
    downloadUrl: "/preset-files/cinematic.zip"
  }

  return (
    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-6">
        {preset.name}
      </h1>

      <img
        src={preset.afterImage}
        className="rounded-xl mb-6"
      />

      {preset.price === 0 ? (
        <button className="bg-green-600 px-6 py-3 rounded-lg">
          Download Free Preset
        </button>
      ) : (
        <button className="bg-blue-600 px-6 py-3 rounded-lg">
          Purchase Preset – ₹{preset.price}
        </button>
      )}

    </div>
  )
}