"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getCart } from "@/lib/cart";
import {
  Home,
  Mail,
  ImageIcon,
  Instagram,
  Search,
  ShoppingCart,
  User,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import Dock from "@/components/Dock";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Cart state
  const [cartCount, setCartCount] = useState(0);
  const [animateCart, setAnimateCart] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Auth / Admin ──
  useEffect(() => {
    const fetchAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setIsAdmin(snap.data().isAdmin === true);
    };
    fetchAdmin();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  // ── Cart ──
  useEffect(() => {
    const update = () => setCartCount(getCart(user?.uid).length);
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart:update", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart:update", update);
    };
  }, [user, refreshKey]);

  useEffect(() => {
    setRefreshKey((p) => p + 1);
  }, [user]);

  useEffect(() => {
    if (cartCount === 0) return;
    setAnimateCart(true);
    const t = setTimeout(() => setAnimateCart(false), 300);
    return () => clearTimeout(t);
  }, [cartCount]);

  // ── Search ──
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/presets?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // ── Resize ──
  useEffect(() => {
    const h = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── Build dock items ──
  const dockItems = [
    {
      icon: <Home size={20} className="text-white" />,
      label: "Home",
      onClick: () => router.push("/"),
    },
    {
      icon: <Mail size={20} className="text-white" />,
      label: "Contact",
      onClick: () => router.push("/contact"),
    },
    {
      icon: <ImageIcon size={20} className="text-white" />,
      label: "Gallery",
      onClick: () => router.push("/gallery"),
    },
    {
      icon: <Instagram size={20} className="text-white" />,
      label: "Social",
      onClick: () =>
        window.open(
          "https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
          "_blank"
        ),
    },
    {
      icon: <Search size={20} className="text-white" />,
      label: "Search",
      onClick: () => setSearchOpen(!searchOpen),
    },
    {
      icon: (
        <div className="relative">
          <ShoppingCart size={20} className="text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-[9px] w-4 h-4 flex items-center justify-center rounded-full text-white font-bold">
              {cartCount}
            </span>
          )}
        </div>
      ),
      label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`,
      onClick: () => setCartOpen(true),
    },
    {
      icon: user ? (
        user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="profile"
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-white text-sm font-bold">
            {user.email?.[0]?.toUpperCase() || "U"}
          </span>
        )
      ) : (
        <LogIn size={20} className="text-white" />
      ),
      label: user ? "Profile" : "Login",
      onClick: () => {
        if (user) {
          setProfileOpen(!profileOpen);
        } else {
          router.push("/login");
        }
      },
    },
  ];

  return (
    <>
      {/* ── MOBILE TOP BAR (logo + hamburger) ── */}
      <div className="md:hidden sticky top-0 z-[900] w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="XMPStore Logo"
              className="h-12 w-auto"
              style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.8))" }}
            />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── DOCK (Desktop — fixed top) ── */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[1000]">
        <Dock
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>

      {/* Spacer so page content doesn't hide behind the dock */}
      <div className="hidden md:block h-[80px]" />

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1100] flex items-center justify-center"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-4"
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search presets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-700 text-white text-lg px-12 py-4 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
            <p className="text-center text-gray-500 text-sm mt-3">
              Press Enter to search • Esc to close
            </p>
          </div>
        </div>
      )}

      {/* ── Profile Dropdown (Desktop) ── */}
      {user && profileOpen && (
        <div>
          {/* Clickaway overlay */}
          <div
            className="fixed inset-0 z-[1050]"
            onClick={() => setProfileOpen(false)}
          />
          <div
            ref={profileRef}
            className="fixed top-[80px] right-[calc(50%-280px)] w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[1100]"
          >
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-medium text-white">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                router.push("/admin");
                setProfileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm text-white"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={() => {
              router.push("/account");
              setProfileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm text-white"
          >
            Account Settings
          </button>
          <button
            onClick={() => {
              router.push("/my-presets");
              setProfileOpen(false);
            }}
            className="block w-full text-left px-4 py-3 hover:bg-zinc-800 text-sm text-white"
          >
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
      )}

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[950] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE MENU ── */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-zinc-900 z-[960] md:hidden transform transition-transform duration-300 shadow-2xl ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span className="text-lg font-semibold text-purple-400">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b border-zinc-800">
          <form
            onSubmit={(e) => {
              handleSearch(e);
              setMobileOpen(false);
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-sm font-semibold border border-zinc-700">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-white">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="p-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
          >
            <Home size={18} /> Home
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
          >
            <Mail size={18} /> Contact
          </Link>
          <Link
            href="/gallery"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
          >
            <ImageIcon size={18} /> Gallery
          </Link>
          <a
            href="https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
          >
            <Instagram size={18} /> Social
          </a>

          <div className="border-t border-zinc-800 my-2" />

          {/* Cart */}
          <button
            onClick={() => {
              setCartOpen(true);
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
          >
            <ShoppingCart size={18} /> Cart
            {cartCount > 0 && (
              <span className="ml-auto bg-red-500 text-[10px] px-2 py-0.5 rounded-full text-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="border-t border-zinc-800 my-2" />

          {user ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => {
                    router.push("/admin");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  router.push("/account");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  router.push("/my-presets");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-purple-400 transition"
              >
                My Presets
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-purple-400 font-medium hover:bg-white/10 transition"
            >
              <LogIn size={18} /> Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* ── Esc to close search ── */}
      {searchOpen && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener("keydown", function(e) { if (e.key === "Escape") { document.querySelector("[data-search-close]")?.click(); } }, { once: true });`,
          }}
        />
      )}

      {/* ── CART DRAWER ── */}
      {cartOpen && <CartDrawer open={cartOpen} setOpen={setCartOpen} />}
    </>
  );
}