"use client";

import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import BentoGrid, { BentoCard } from "@/components/MagicBento";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminQueries() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Queries state
  const [queries, setQueries] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [queryTab, setQueryTab] = useState<"unread" | "read" | "replied">("unread");

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
        fetchQueries();
      }
    };

    checkAdmin();
  }, [user]);

  const fetchQueries = async () => {
    try {
      const queryRef = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const queriesSnap = await getDocs(queryRef);
      setQueries(queriesSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : data.createdAt?.toDate ? data.createdAt.toDate()
            : new Date(data.createdAt),
        };
      }));
    } catch (err) {
      console.log("Queries fetch error:", err);
    }
  };

  // Mark query as read
  const markAsRead = async (queryId: string) => {
    try {
      await updateDoc(doc(db, "contact_messages", queryId), {
        readAt: new Date(),
      });
      setQueries(queries.map((q) =>
        q.id === queryId ? { ...q, readAt: new Date() } : q
      ));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  // Handle reply to user query
  const handleReply = async (queryItem: any) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      // 1. Update Firestore — mark as replied AND read
      await updateDoc(doc(db, "contact_messages", queryItem.id), {
        replied: true,
        replyText: replyText.trim(),
        repliedAt: new Date(),
        readAt: queryItem.readAt || new Date(),
      });

      // 2. Update local state
      setQueries(queries.map((q) =>
        q.id === queryItem.id
          ? { ...q, replied: true, replyText: replyText.trim(), readAt: q.readAt || new Date() }
          : q
      ));
      setReplyingTo(null);
      setReplyText("");

      // 3. Try to send email notification (best-effort, won't block)
      fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: queryItem.email,
          subject: `Re: Your query on SnapGrid`,
          replyText: replyText.trim(),
          queryId: queryItem.id,
        }),
      }).catch(() => console.log("Email send failed (non-critical)"));

    } catch (err) {
      alert("Failed to send reply");
      console.error(err);
    }
    setSendingReply(false);
  };

  if (loading) {
    return <div className="p-10 text-white">Checking access...</div>;
  }

  const unreadQueries = queries.filter((q) => !q.replied && !q.readAt);
  const readQueries = queries.filter((q) => !q.replied && q.readAt);
  const repliedQueries = queries.filter((q) => q.replied);
  const filteredQueries = queryTab === "unread" ? unreadQueries : queryTab === "read" ? readQueries : repliedQueries;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">User Queries</h1>
          <span className="text-sm text-gray-500">{queries.length} total queries</span>
        </div>

        {/* 🔥 USER QUERIES SECTION */}
        <BentoGrid className="grid-cols-1" enableSpotlight spotlightRadius={800}>
          <BentoCard label={`Queries (${queries.length})`} enableStars={false}>

            {/* ── Tab Bar ── */}
            <div className="flex gap-2 mt-4 mb-5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              {[
                { key: "unread" as const, label: "Unread", count: unreadQueries.length, color: "yellow" },
                { key: "read" as const, label: "Read", count: readQueries.length, color: "blue" },
                { key: "replied" as const, label: "Replied", count: repliedQueries.length, color: "green" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setQueryTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    queryTab === tab.key
                      ? tab.color === "yellow"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                        : tab.color === "blue"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/10"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    queryTab === tab.key
                      ? tab.color === "yellow"
                        ? "bg-yellow-500/30 text-yellow-200"
                        : tab.color === "blue"
                          ? "bg-blue-500/30 text-blue-200"
                          : "bg-green-500/30 text-green-200"
                      : "bg-white/[0.06] text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Query List ── */}
            <div className="space-y-4">
              {filteredQueries.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">
                    {queryTab === "unread" ? "✉️" : queryTab === "read" ? "📖" : "✅"}
                  </span>
                  <p className="text-gray-500 text-sm">
                    {queryTab === "unread" ? "No unread queries" : queryTab === "read" ? "No read queries" : "No replied queries"}
                  </p>
                </div>
              ) : (
                filteredQueries.map((q) => (
                  <div
                    key={q.id}
                    className={`p-5 rounded-xl border transition-colors ${
                      q.replied
                        ? "bg-white/[0.02] border-green-500/20"
                        : q.readAt
                          ? "bg-white/[0.03] border-blue-500/20"
                          : "bg-white/[0.04] border-yellow-500/20 hover:border-purple-500/30"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          q.replied
                            ? "bg-green-500/20 border border-green-500/30 text-green-300"
                            : q.readAt
                              ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                              : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
                        }`}>
                          {q.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{q.name}</p>
                          <p className="text-xs text-gray-500">{q.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">
                          {q.createdAt instanceof Date
                            ? q.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : ""}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          q.replied
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : q.readAt
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}>
                          {q.replied ? "Replied" : q.readAt ? "Read" : "New"}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-300 bg-white/[0.03] rounded-lg p-3 mb-3 leading-relaxed">
                      {q.message}
                    </p>

                    {/* Previous reply */}
                    {q.replied && q.replyText && (
                      <div className="text-xs text-green-300/80 bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                        <span className="font-semibold">Your reply: </span>{q.replyText}
                      </div>
                    )}

                    {/* Reply form */}
                    {!q.replied && (
                      <>
                        {replyingTo === q.id ? (
                          <div className="space-y-2">
                            <textarea
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={3}
                              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReply(q)}
                                disabled={sendingReply || !replyText.trim()}
                                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                              >
                                {sendingReply ? "Sending..." : "Send Reply"}
                              </button>
                              <button
                                onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-gray-400 text-xs font-medium hover:bg-white/[0.1] transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(q.id);
                                // DO NOT mark as read here — stays in unread until reply is sent
                              }}
                              className="text-xs px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 hover:bg-purple-500/25 transition font-medium"
                            >
                              💬 Reply
                            </button>
                            {!q.readAt && (
                              <button
                                onClick={() => markAsRead(q.id)}
                                className="text-xs px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition font-medium"
                              >
                                👁 Mark as Read
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </BentoCard>
        </BentoGrid>

      </div>
    </AdminLayout>
  );
}
