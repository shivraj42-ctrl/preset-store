"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import BentoGrid, { BentoCard } from "@/components/MagicBento";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Users, Loader2, Mail, ShieldCheck, Calendar } from "lucide-react";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push("/");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || !snap.data().isAdmin) {
        router.push("/");
      } else {
        setLoading(false);
        fetchUsers();
      }
    };
    checkAdmin();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const userList = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Checking access...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BentoGrid className="grid-cols-1" enableSpotlight spotlightRadius={800}>
          {/* Users Table */}
          <BentoCard label={`All Users (${users.length})`} enableStars={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-3">#</th>
                  <th className="text-left pb-3">Email</th>
                  <th className="text-center pb-3">Role</th>
                  <th className="text-center pb-3">Joined</th>
                  <th className="text-center pb-3">UID</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td className="py-6 text-gray-500 text-center" colSpan={5}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="py-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                            <span className="text-xs font-semibold text-purple-300 uppercase">
                              {(u.email || "?").charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {u.email || "No email"}
                            </p>
                            {u.displayName && (
                              <p className="text-[11px] text-gray-500">
                                {u.displayName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                            <ShieldCheck size={10} />
                            Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
                            User
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 text-gray-400 text-xs">
                        {u.createdAt?.seconds
                          ? new Date(u.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : u.createdAt?.toDate
                          ? u.createdAt.toDate().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="text-center py-3">
                        <span className="text-[10px] text-gray-500 font-mono bg-zinc-900 px-2 py-1 rounded">
                          {u.id.slice(0, 12)}…
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </AdminLayout>
  );
}
