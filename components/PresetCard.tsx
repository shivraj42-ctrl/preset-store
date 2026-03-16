"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function PresetCard({ preset }: any) {

  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect()

    const x = (e.clientX - rect.left - rect.width / 2) / 15
    const y = (e.clientY - rect.top - rect.height / 2) / 15

    setPos({ x, y })
  }

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 })
  }

  // prevent crash if preset missing
  if (!preset) return null

  return (
    <Link href={`/preset/${preset.id}`}>

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 
transition-all duration-300 cursor-pointer
hover:border-purple-500
hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]">

        {/* Image container */}
        <div className="relative h-64 w-full overflow-hidden">

          {/* Moving wrapper */}
          <div
            style={{
              transform: `scale(1.15) translate(${pos.x}px, ${pos.y}px)`
            }}
            className="absolute inset-0 transition-transform duration-200 ease-out"
          >

            {preset.afterImage && (
              <Image
                src={preset.afterImage}
                alt={preset.name || "Preset"}
                fill
                className="object-cover"
              />
            )}

          </div>

        </div>

        <div className="p-4">

          <h3 className="text-white font-semibold text-lg">
            {preset.name || "Untitled Preset"}
          </h3>

          <p className="text-green-400 font-semibold mt-2">
            {preset.price === 0 ? "Free" : `₹${preset.price}`}
          </p>

        </div>

      </div>

    </Link>
  )
}