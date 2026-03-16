import PresetCard from "../PresetCard";

export default function TrendingPresets() {

  const presets = [1,2,3,4,5,6];

  return (
    <section className="px-6 max-w-6xl mx-auto">

      <h2 className="text-3xl font-bold mb-8">
        Trending Presets
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {presets.map((p) => (
          <PresetCard key={p} />
        ))}

      </div>

    </section>
  );
}