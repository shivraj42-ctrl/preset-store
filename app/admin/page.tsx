"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";

export default function AdminPage() {
  return (
    <AdminLayout>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <h1 className="text-lg font-medium">Dashboard Overview</h1>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { title: "Courses", value: "24", sub: "3 Active" },
            { title: "Lessons", value: "220", sub: "20 Active" },
            { title: "Students", value: "67", sub: "60 Enrolled" },
            { title: "Revenue", value: "$17", sub: "This Month" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="bg-[#1b1714] border border-[#2f2a25] p-4 rounded-xl"
            >
              <p className="text-xs text-gray-400">{item.title}</p>
              <h2 className="text-xl font-semibold mt-1">{item.value}</h2>
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-5">

          {/* CHART */}
          <div className="col-span-2 bg-[#1b1714] border border-[#2f2a25] p-5 rounded-xl h-[280px]">
            <p className="text-xs text-gray-400 mb-3">Admin Revenue</p>

            <div className="h-full flex items-end justify-between px-4">
              {[40, 60, 50, 80, 65, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="bg-[#1b1714] border border-[#2f2a25] p-5 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">
              Requested Withdrawal
            </p>
            <p className="text-sm text-gray-300">No data yet</p>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-3 gap-5">

          {/* UPLOAD */}
          <div className="bg-[#1b1714] border border-[#2f2a25] p-5 rounded-xl space-y-3">
            <h2 className="text-xs text-gray-400">Upload Preset</h2>

            <input className="w-full bg-[#141210] border border-[#2f2a25] p-2.5 rounded-md text-sm" placeholder="Preset Name" />
            <input className="w-full bg-[#141210] border border-[#2f2a25] p-2.5 rounded-md text-sm" placeholder="Price (₹)" />
            <input type="file" className="w-full bg-[#141210] border border-[#2f2a25] p-2 rounded-md text-xs" />

            <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 py-2.5 rounded-md text-sm font-medium">
              Upload
            </button>
          </div>

          {/* TABLE */}
          <div className="col-span-2 bg-[#1b1714] border border-[#2f2a25] p-5 rounded-xl">

            <h2 className="text-xs text-gray-400 mb-3">Presets</h2>

            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-3">Name</th>
                  <th className="text-center pb-3">Price</th>
                  <th className="text-center pb-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-[#2f2a25]">
                  <td className="py-3">No presets yet</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}