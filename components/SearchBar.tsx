"use client";

export default function SearchBar({ search, setSearch }) {
return ( <div className="max-w-xl mx-auto mb-10">
  <input
    type="text"
    placeholder="Search presets..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
  />

</div>
);
}
