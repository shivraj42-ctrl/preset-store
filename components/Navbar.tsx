"use client";

import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {

const { user } = useAuth();
const [open, setOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

const handleLogout = async () => {
await signOut(auth);
setOpen(false);
};

/* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */
useEffect(() => {

function handleClickOutside(event: any) {
if (menuRef.current && !menuRef.current.contains(event.target)) {
setOpen(false);
}
}

document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);

}, []);

return (

<nav className="flex justify-between items-center px-8 py-5 border-b border-zinc-800 bg-black text-white">

{/* LOGO */}
<Link href="/" className="flex items-center group">
  <img
    src="/logo.png"
    alt="XMPStore Logo"
    className="h-28 w-auto cursor-pointer transition-all duration-300 group-hover:scale-110"
    style={{
      filter: "drop-shadow(0 0 10px rgba(168,85,247,0.8))",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.filter =
        "drop-shadow(0 0 25px rgba(168,85,247,1)) drop-shadow(0 0 50px rgba(168,85,247,0.9))")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.filter =
        "drop-shadow(0 0 10px rgba(168,85,247,0.8))")
    }
  />
</Link>

{/* NAV LINKS */}
<div className="flex items-center gap-6 text-gray-400">

<Link href="/" className="hover:text-white transition">
Home
</Link>

<Link href="#" className="hover:text-white transition">
Presets
</Link>

<Link href="#" className="hover:text-white transition">
Free
</Link>

{user ? (

<div className="relative" ref={menuRef}>

{/* PROFILE IMAGE */}
<img
src={user.photoURL || "/avatar.png"}
alt="profile"
className="w-9 h-9 rounded-full cursor-pointer border border-zinc-700"
onClick={() => setOpen(!open)}
/>

{/* DROPDOWN */}
<div
className={`absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden transition-all duration-200 ${
open
? "opacity-100 scale-100"
: "opacity-0 scale-95 pointer-events-none"
}`}
>

{/* USER INFO */}
<div className="px-4 py-3 border-b border-zinc-800">

<p className="text-sm font-medium text-white">
{user.displayName || "User"}
</p>

<p className="text-xs text-gray-400">
{user.email}
</p>

</div>

{/* MENU OPTIONS */}
<button className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm">
Manage Account
</button>

<button className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm">
My Presets
</button>

<button
onClick={handleLogout}
className="block w-full text-left px-4 py-3 hover:bg-red-600 text-red-400 text-sm"
>
Sign Out
</button>

</div>

</div>

) : (

<Link
href="/login"
className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold"
>
Login
</Link>

)}

</div>

</nav>

);
}