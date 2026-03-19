"use client"

import { useState } from "react"
import Image from "next/image"

export default function BeforeAfterSlider({
  before = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
  after = "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80"
}: {
  before?: string
  after?: string
}) {

  const [position, setPosition] = useState(50)

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl">

      {/* Before image */}
      <div className="relative w-full aspect-[4/5] sm:aspect-video">
        <Image
          src={before}
          alt="Before"
          fill
          className="object-cover"
        />
      </div>

      {/* After image */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div className="relative w-full h-full aspect-[4/5] sm:aspect-video">
          <Image
            src={after}
            alt="After"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3"
      />

    </div>
  )
}