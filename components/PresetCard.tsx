"use client";

import Link from "next/link";

export default function PresetCard({ name, price, image, id }) {
return (

<Link href={`/preset/${id}`}>

  <div className="group bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition duration-300">

    <img
      src={image}
      alt={name}
      className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
    />

    <div className="p-5">

      <h3 className="text-lg font-semibold mb-1">
        {name}
      </h3>

      <p className="text-gray-400 mb-4">
        {price}
      </p>

      <button className="w-full bg-white text-black py-2 rounded-lg">
        View Preset
      </button>

    </div>

  </div>

</Link>
);
}
