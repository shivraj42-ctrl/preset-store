"use client";

import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Navbar() {

  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="flex justify-between items-center p-6 border-b border-zinc-800">

      <h1 className="text-2xl font-bold">
        PresetStore
      </h1>

      <div className="flex items-center gap-6 text-gray-400">

        <Link href="/">Home</Link>
        <Link href="#">Presets</Link>
        <Link href="#">Free</Link>

        {user ? (

          <div className="flex items-center gap-4">

            <img
              src={user.photoURL}
              className="w-8 h-8 rounded-full"
            />

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded text-white"
            >
              Sign out
            </button>

          </div>

        ) : (

          <Link href="/login">
            Login
          </Link>

        )}

      </div>

    </nav>
  );
}