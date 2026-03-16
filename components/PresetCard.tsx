import Image from "next/image"

export default function PresetCard({ preset }: any) {
  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">

      <div className="relative h-64 w-full">
        <Image
          src={preset.afterImage}
          alt={preset.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">

        <h3 className="text-white font-semibold text-lg">
          {preset.name}
        </h3>

        {/* Price */}
        <p className="text-green-400 font-semibold mt-2">
          {preset.price === 0 ? "Free" : `₹${preset.price}`}
        </p>

      </div>
    </div>
  )
}