"use client"

import { useState } from "react"

export default function BeforeAfterSlider({
  before,
  after
}: {
  before: string
  after: string
}) {

  const [position, setPosition] = useState(50)

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl">

      {/* Before image */}
      <img
        src={before}
        className="w-full block"
      />

      {/* After image */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={after}
          className="w-full block"
        />
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