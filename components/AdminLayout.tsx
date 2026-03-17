"use client";

import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Presets", icon: Package, path: "/admin/presets" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Users", icon: Users, path: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-[#0e0c0a] text-white flex">

      {/* SIDEBAR */}
      <div className="w-64 p-5 border-r border-[#2a2622] bg-[#141210]">

        <h1 className="text-lg font-semibold mb-10">Preset Admin</h1>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={index} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${
                    isActive
                      ? "bg-[#1f1b17] text-white"
                      : "text-gray-400 hover:bg-[#1a1714]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <input
            placeholder="Search..."
            className="bg-[#1a1714] border border-[#2a2622] px-4 py-2 rounded-lg text-sm outline-none w-[260px]"
          />

          <div className="w-8 h-8 rounded-full bg-[#1a1714] flex items-center justify-center text-sm">
            JD
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}