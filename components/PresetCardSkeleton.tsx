export default function PresetCardSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 animate-pulse">

      {/* Image skeleton */}
      <div className="h-64 w-full bg-zinc-800" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-800 rounded w-1/4" />
      </div>

    </div>
  );
}
