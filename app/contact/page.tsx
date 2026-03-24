"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, addDoc } from "firebase/firestore";

export default function ContactPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect admin to dashboard
  useEffect(() => {
    if (isAdmin) {
      router.push("/admin#queries");
    }
  }, [isAdmin, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  // User's previous queries
  const [userQueries, setUserQueries] = useState<any[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  // Fetch user's submitted queries
  useEffect(() => {
    if (!user?.email || isAdmin) return;
    setLoadingQueries(true);

    const fetchUserQueries = async () => {
      try {
        const q = query(
          collection(db, "contact_messages"),
          where("email", "==", user.email)
        );
        const snap = await getDocs(q);
        const queries = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              createdAt: data.createdAt?.seconds
                ? new Date(data.createdAt.seconds * 1000)
                : data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
            };
          })
          .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        setUserQueries(queries);
      } catch (err) {
        console.log("Error fetching user queries:", err);
      }
      setLoadingQueries(false);
    };

    fetchUserQueries();
  }, [user, isAdmin, status]); // re-fetch after successful submission

  if (isAdmin) return null;

  const validate = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!message.trim()) {
      setError("Message is required");
      return false;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;

    setStatus("sending");

    try {
      await addDoc(collection(db, "contact_messages"), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: new Date(),
      });

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
      setError("Failed to send message. Please try again.");
    }
  };

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user]);

  return (
    <div className="min-h-screen text-white flex flex-col">

      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto px-6 py-24 w-full">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Contact
        </h1>

        <p className="text-gray-400 mb-12 text-center">
          If you have questions about presets or downloads, feel free to reach out.
        </p>

        {/* Success Message */}
        {status === "success" && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl mb-8 text-center">
            ✅ Message sent successfully! We&apos;ll get back to you soon.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Message</label>
            <textarea
              placeholder="How can we help?"
              rows={5}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(""); }}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status === "sending"}
            className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            {status === "sending" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>

        </div>

        {/* ═══════ YOUR QUERIES SECTION ═══════ */}
        {user && userQueries.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Queries</h2>
            <div className="space-y-4">
              {userQueries.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-6 transition-colors ${
                    q.replied
                      ? "bg-zinc-900/80 border-green-500/20"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  {/* Query header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      {q.createdAt instanceof Date
                        ? q.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        q.replied
                          ? "bg-green-500/15 text-green-400 border border-green-500/25"
                          : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                      }`}
                    >
                      {q.replied ? "Replied ✓" : "Pending"}
                    </span>
                  </div>

                  {/* Your message */}
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {q.message}
                  </p>

                  {/* Admin reply */}
                  {q.replied && q.replyText && (
                    <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-purple-400 font-semibold mb-2 uppercase tracking-wider">
                        Admin Response
                      </p>
                      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {q.replyText}
                      </p>
                    </div>
                  )}

                  {/* Waiting indicator */}
                  {!q.replied && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      Waiting for admin response
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Email</h2>
            <a
              href="mailto:shivrajmali6412@gmail.com"
              className="text-purple-400 hover:text-purple-300 transition text-sm"
            >
              shivrajmali6412@gmail.com
            </a>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Business Inquiries</h2>
            <p className="text-gray-400 text-sm">
              For collaborations, partnerships, or licensing, contact us via email.
            </p>
          </div>
        </div>

      </div>

      <Footer />

    </div>
  );
}