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
  BookOpen,
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import Dock from "@/components/Dock";
import StaggeredMenu from "@/components/StaggeredMenu";

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
      icon: <BookOpen size={20} className="text-white" />,
      label: "Tutorial",
      onClick: () => router.push("/how-to-install"),
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
            <span className="absolute -top-2 -right-2 bg-purple-500/80 backdrop-blur-sm border border-purple-400/30 text-[9px] w-4 h-4 flex items-center justify-center rounded-full text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.5)]">
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
        <div className="w-6 h-6 rounded-full bg-gray-500/40 border border-white/20 flex items-center justify-center overflow-hidden">
          <User size={14} className="text-gray-300 translate-y-[1px]" />
        </div>
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

  const mobileMenuItems = [
    { label: "Home", link: "/" },
    { label: "Contact", link: "/contact" },
    { label: "Gallery", link: "/gallery" },
    { label: "Tutorial", link: "/how-to-install" },
    { label: "Search", onClick: () => setSearchOpen(true) },
    { label: `Cart (${cartCount})`, onClick: () => setCartOpen(true) },
    ...(user
      ? [
        ...(isAdmin ? [{ label: "Admin Panel", link: "/admin" }] : []),
        { label: "Account Settings", link: "/account" },
        { label: "My Presets", link: "/my-presets" },
        { label: "Sign Out", onClick: handleLogout },
      ]
      : [{ label: "Login", link: "/login" }]),
  ];

  const socialItems = [
    { label: "Instagram", link: "https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" }
  ];

  return (
    <>
      {/* ── MOBILE MENU (StaggeredMenu) ── */}
      <div className="md:hidden">
        <StaggeredMenu
          isFixed={true}
          position="right"
          items={mobileMenuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          logoUrl="/snapgrade-logo.png"
          colors={['#2e1065', '#3b0764', '#4c1d95']}
          accentColor="#a855f7"
          menuButtonColor="#ffffff"
          openMenuButtonColor="#ffffff"
          changeMenuColorOnOpen={true}
          onMenuOpen={() => setMobileOpen(true)}
          onMenuClose={() => setMobileOpen(false)}
        />

        {/* ── Mobile Profile Picture (top-left, login status only) ── */}
        <div className="fixed top-[2em] left-[2em] z-[50] pointer-events-none flex items-center">
          {user ? (
            user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full object-cover border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-600/30 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
          )}
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