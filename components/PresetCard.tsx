export default function PresetCard({name, price}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <div className="h-40 bg-zinc-700 rounded"></div>

      <h2 className="mt-3 text-lg font-semibold">
        {name}
      </h2>

      <p className="text-gray-400">
        ₹{price}
      </p>

      <button className="mt-3 bg-white text-black px-4 py-2 rounded">
        Download
      </button>
    </div>
  )
}