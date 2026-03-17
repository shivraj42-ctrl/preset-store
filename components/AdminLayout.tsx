"use client";

import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import BubblesBackground from "./BubblesBackground";

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Presets", icon: Package, path: "/admin/presets" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Users", icon: Users, path: "/admin/users" },
  ];

  return (
    <div className="min-h-screen relative bg-[#0b0a09] text-white flex overflow-hidden">

      {/* 🌫️ BUBBLES */}
      <BubblesBackground />

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
                  <span className="text-sm">{item.name}</span>
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
  );
}