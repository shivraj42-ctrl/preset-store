export default function CTASection() {
  return (
    <section className="py-24 bg-black text-white text-center">

      <h2 className="text-4xl font-bold">
        Ready to transform your photos?
      </h2>

      <p className="text-gray-400 mt-4">
        Explore our premium presets now.
      </p>

      <a
        href="/presets"
        className="inline-block mt-8 px-8 py-4 bg-white text-black rounded-xl font-semibold"
      >
        Browse Presets
      </a>

    </section>
  );
}