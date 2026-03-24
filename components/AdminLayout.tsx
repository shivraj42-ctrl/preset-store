"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Users, ImageIcon, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time listener for unreplied queries
  useEffect(() => {
    const q = query(
      collection(db, "contact_messages"),
      where("replied", "!=", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, () => {
      // Fallback: if the compound query fails (no index), count all as unread
      const fallbackQ = collection(db, "contact_messages");
      const unsub2 = onSnapshot(fallbackQ, (snap) => {
        const unreplied = snap.docs.filter(d => d.data().replied !== true).length;
        setUnreadCount(unreplied);
      });
      return () => unsub2();
    });
    return () => unsub();
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Presets", icon: Package, path: "/admin/presets" },
    { name: "Gallery", icon: ImageIcon, path: "/admin/gallery" },
    { name: "Queries", icon: MessageSquare, path: "/admin#queries", badge: unreadCount },
    { name: "Users", icon: Users, path: "/admin/users" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 relative text-white flex overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-64 p-5 border-r border-white/10 backdrop-blur-xl bg-white/5 z-10">
        <h1 className="text-lg font-semibold mb-10">Preset Admin</h1>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={index} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${
                    isActive
                      ? "bg-white/20"
                      : "hover:bg-white/10 text-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white px-1.5 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 z-10">

        {/* GLASS CONTAINER */}
        <div className="backdrop-blur-[40px] bg-white/5 border border-white/10 rounded-2xl p-6">
          {children}
        </div>

      </div>

      </div>
    </div>
  );
}