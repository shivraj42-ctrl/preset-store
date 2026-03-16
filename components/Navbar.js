"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {

  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center p-6 border-b border-zinc-800">

      <h1 className="text-2xl font-bold">PresetStore</h1>

      <div className="flex items-center gap-6 text-gray-400">

        <Link href="/">Home</Link>
        <Link href="/presets">Presets</Link>
        <Link href="/free">Free</Link>

        {user ? (
          <img
            src={user.photoURL}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <Link href="/login">Login</Link>
        )}

      </div>

    </nav>
  );
}