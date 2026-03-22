"use client";

import { LayoutDashboard, Package, Users, ImageIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Presets", icon: Package, path: "/admin/presets" },
    { name: "Gallery", icon: ImageIcon, path: "/admin/gallery" },
    { name: "Users", icon: Users, path: "/admin/users" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 relative text-white flex flex-col md:flex-row overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-full md:w-64 p-3 md:p-5 border-b md:border-b-0 md:border-r border-white/10 backdrop-blur-xl bg-white/5 z-10 flex-shrink-0">
        <h1 className="text-lg font-semibold mb-4 md:mb-10 hidden md:block">Preset Admin</h1>

        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={index} href={item.path} className="flex-shrink-0">
                <div
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition whitespace-nowrap
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
      <div className="flex-1 p-4 md:p-6 z-10 overflow-y-auto w-full min-w-0">

        {/* GLASS CONTAINER */}
        <div className="backdrop-blur-[40px] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 min-w-0">
          {children}
        </div>

      </div>

      </div>
    </div>
  );
}