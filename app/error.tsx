"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">

        <div className="text-6xl">⚠️</div>

        <h1 className="text-2xl font-bold text-white">
          Something went wrong
        </h1>

        <p className="text-gray-400">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          >
            Try Again
          </button>

          <a
            href="/"
            className="px-6 py-3 rounded-lg border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
          >
            Go Home
          </a>
        </div>

      </div>
    </div>
  );
}
