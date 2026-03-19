import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">

        <h1 className="text-8xl font-bold text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-white">
          Page Not Found
        </h2>

        <p className="text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}
