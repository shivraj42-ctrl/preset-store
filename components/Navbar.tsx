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
import { getCart } from "@/lib/cart";
import { Menu, X, Search } from "lucide-react";

import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {

const { user } = useAuth();
const [open, setOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);
const [isAdmin, setIsAdmin] = useState(false);
const router = useRouter();

const [cartCount, setCartCount] = useState(0);
const [animateCart, setAnimateCart] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);
const [cartOpen, setCartOpen] = useState(false);

const [mobileOpen, setMobileOpen] = useState(false);

/* NEW: SEARCH STATE */
const [searchQuery, setSearchQuery] = useState("");

const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    router.push(`/presets?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileOpen(false);
  }
};

const handleLogout = async () => {
  await signOut(auth);
  setOpen(false);
  setMobileOpen(false);
};

/* FETCH ADMIN STATUS */
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

/* CLOSE DROPDOWN */
useEffect(() => {

function handleClickOutside(event: any) {
if (menuRef.current && !menuRef.current.contains(event.target)) {
setOpen(false);
}
}

document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);

}, []);

/* CART COUNT */
useEffect(() => {
  const updateCart = () => {
    const cart = getCart(user?.uid);
    setCartCount(cart.length);
  };

  updateCart();

  window.addEventListener("storage", updateCart);
  window.addEventListener("cart:update", updateCart);

  return () => {
    window.removeEventListener("storage", updateCart);
    window.removeEventListener("cart:update", updateCart);
  };
}, [user, refreshKey]);

/* FORCE UPDATE ON LOGIN/LOGOUT */
useEffect(() => {
  setRefreshKey(prev => prev + 1);
}, [user]);

/* ANIMATION */
useEffect(() => {
  if (cartCount === 0) return;

  setAnimateCart(true);

  const timer = setTimeout(() => {
    setAnimateCart(false);
  }, 300);

  return () => clearTimeout(timer);
}, [cartCount]);

/* CLOSE MOBILE MENU ON RESIZE */
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setMobileOpen(false);
    }
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

return (

<nav className="flex justify-between items-center px-6 md:px-8 py-4 md:py-6 border-b border-zinc-800 bg-black text-white relative">

{/* LOGO */}
<Link href="/" className="flex items-center group">
  <img
    src="/logo.png"
    alt="XMPStore Logo"
    className="h-16 md:h-28 w-auto cursor-pointer transition-all duration-300 group-hover:scale-110"
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

{/* DESKTOP NAV LINKS */}
<div className="hidden md:flex items-center gap-8 text-gray-400">

<Link href="/" className="transition hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]">
Home
</Link>

<Link href="/contact" className="transition hover:text-purple-400 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]">
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

{/* SEARCH BAR (Desktop) */}
<form onSubmit={handleSearch} className="relative hidden md:flex items-center">
  <input
    type="text"
    placeholder="Search presets..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-40 xl:w-60 bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 pr-10 rounded-full focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
  />
  <button type="submit" className="absolute right-3 text-gray-500 hover:text-white transition">
    <Search size={16} />
  </button>
</form>

{/* CART ICON */}
<div
  onClick={() => setCartOpen(true)}
  className="relative cursor-pointer"
  data-cart-icon
>
  <span
    className={`text-2xl transition-transform duration-300 ${
      animateCart ? "scale-125" : "scale-100"
    }`}
  >
    🛒
  </span>

  {cartCount > 0 && (
    <span
      className={`absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
        animateCart ? "scale-125" : "scale-100"
      }`}
    >
      {cartCount}
    </span>
  )}
</div>

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
className={`absolute right-0 top-12 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden transition-all duration-200 z-50 ${
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

{isAdmin && (
<button onClick={() => { router.push("/admin"); setOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm">
Admin Panel
</button>
)}

<button onClick={() => { router.push("/account"); setOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm">
Account Settings
</button>

<button onClick={() => { router.push("/my-presets"); setOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm">
My Presets
</button>

<button onClick={handleLogout} className="block w-full text-left px-4 py-3 hover:bg-red-600 text-red-400 text-sm">
Sign Out
</button>

</div>

</div>

) : (

<Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold">
Login
</Link>

)}

</div>

{/* MOBILE: CART + HAMBURGER */}
<div className="flex md:hidden items-center gap-4">

  {/* Mobile Cart Icon */}
  <div
    onClick={() => setCartOpen(true)}
    className="relative cursor-pointer"
    data-cart-icon
  >
    <span className={`text-xl transition-transform duration-300 ${animateCart ? "scale-125" : "scale-100"}`}>
      🛒
    </span>
    {cartCount > 0 && (
      <span className={`absolute -top-2 -right-2 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full ${animateCart ? "scale-125" : "scale-100"}`}>
        {cartCount}
      </span>
    )}
  </div>

  {/* Hamburger Button */}
  <button
    onClick={() => setMobileOpen(!mobileOpen)}
    className="text-white p-1"
    aria-label="Toggle menu"
  >
    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>

{/* MOBILE MENU OVERLAY */}
{mobileOpen && (
  <div
    className="fixed inset-0 bg-black/60 z-40 md:hidden"
    onClick={() => setMobileOpen(false)}
  />
)}

{/* MOBILE SLIDE-OUT MENU */}
<div
  className={`fixed top-0 right-0 h-full w-72 bg-zinc-900 z-50 md:hidden transform transition-transform duration-300 shadow-2xl ${
    mobileOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
  {/* Mobile Menu Header */}
  <div className="flex items-center justify-between p-4 border-b border-zinc-800">
    <span className="text-lg font-semibold text-purple-400">Menu</span>
    <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
      <X size={20} />
    </button>
  </div>

  {/* Mobile Search */}
  <div className="p-4 border-b border-zinc-800">
    <form onSubmit={handleSearch} className="relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:border-purple-500"
      />
      <button type="submit" className="absolute right-3 text-gray-400">
        <Search size={16} />
      </button>
    </form>
  </div>

  {/* Mobile User Info */}
  {user && (
    <div className="px-4 py-3 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-sm font-semibold border border-zinc-700">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="profile" width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <span>{user.email?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{user.displayName || "User"}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
    </div>
  )}

  {/* Mobile Nav Links */}
  <div className="p-4 space-y-1">
    <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
      Home
    </Link>
    <Link href="/presets" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
      Presets
    </Link>
    <Link href="/free" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
      Free
    </Link>
    <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
      Contact
    </Link>
    <a
      href="https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMobileOpen(false)}
      className="block px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
    >
      Social
    </a>

    <div className="border-t border-zinc-800 my-2" />

    {user ? (
      <>
        {isAdmin && (
          <button onClick={() => { router.push("/admin"); setMobileOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
            Admin Panel
          </button>
        )}
        <button onClick={() => { router.push("/account"); setMobileOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
          Account Settings
        </button>
        <button onClick={() => { router.push("/my-presets"); setMobileOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition">
          My Presets
        </button>
        <button onClick={handleLogout} className="block w-full text-left px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition">
          Sign Out
        </button>
      </>
    ) : (
      <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded-lg text-purple-400 font-medium hover:bg-white/10 transition">
        Login / Sign Up
      </Link>
    )}
  </div>
</div>

{/* CART DRAWER */}
{cartOpen && (
  <CartDrawer open={cartOpen} setOpen={setCartOpen} />
)}

</nav>

);
}