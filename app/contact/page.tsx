"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

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
      // Dynamic import to avoid loading Firebase on initial render
      const { db } = await import("@/lib/firebase");
      const { addDoc, collection } = await import("firebase/firestore");

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