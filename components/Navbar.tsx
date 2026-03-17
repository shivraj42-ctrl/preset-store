"use client";

import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {

const { user } = useAuth();
const [open, setOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);
const [isAdmin, setIsAdmin] = useState(false);
const router = useRouter();

const handleLogout = async () => {
  await signOut(auth);
  setOpen(false);
};

/* ✅ FETCH ADMIN STATUS (NEW) */
useEffect(() => {
  const fetchAdmin = async () => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      setIsAdmin(snap.data().isAdmin === true);
    }
  };

  fetchAdmin();
}, [user]);

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

<nav className="flex justify-between items-center px-8 py-6 border-b border-zinc-800 bg-black text-white">

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
<div className="flex items-center gap-8 text-gray-400">

<Link 
href="/" 
className="transition hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]"
>
Home
</Link>

<Link 
href="/contact" 
className="transition hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]"
>
Contact
</Link>

<a
href="https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
target="_blank"
rel="noopener noreferrer"
className="transition hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]"
>
Social
</a>

{user ? (

<div className="relative flex items-center" ref={menuRef}>

{/* PROFILE IMAGE */}
<div
  onClick={() => setOpen(!open)}
  className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border border-zinc-700 
  flex items-center justify-center bg-zinc-800 text-sm font-semibold
  hover:border-purple-500 hover:shadow-[0_0_10px_rgba(168,85,247,0.8)] transition"
>

  {user.photoURL ? (
    <Image
      src={user.photoURL}
      alt="profile"
      width={36}
      height={36}
      className="object-cover w-full h-full"
    />
  ) : (
    <span>
      {user.email?.[0]?.toUpperCase() || "U"}
    </span>
  )}

</div>

{/* DROPDOWN */}
<div
className={`absolute right-0 top-12 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden transition-all duration-200 ${
open
? "opacity-100 scale-100"
: "opacity-0 scale-95 pointer-events-none"
}`}
>

<div className="px-4 py-3 border-b border-zinc-800">

<p className="text-sm font-medium text-white">
{user.displayName || "User"}
</p>

<p className="text-xs text-gray-400">
{user.email}
</p>

</div>

{/* ✅ ADMIN BUTTON (NEW) */}
{isAdmin && (
<button
onClick={() => router.push("/admin")}
className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm"
>
Admin Panel
</button>
)}

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