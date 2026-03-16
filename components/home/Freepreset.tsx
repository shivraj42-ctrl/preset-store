import PresetCard from "../PresetCard";

export default function FreePresets() {

  const presets = [1,2,3];

  return (
    <section className="px-6 max-w-6xl mx-auto">

      <h2 className="text-3xl font-bold mb-8">
        Free Presets
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        {presets.map((p) => (
          <PresetCard key={p} />
        ))}

      </div>

      <div className="text-center mt-10">
        <a
          href="/free"
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          View All Free Presets
        </a>
      </div>

    </section>
  );
}