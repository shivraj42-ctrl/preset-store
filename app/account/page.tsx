"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      setProfileMsg({ text: "Display name cannot be empty", type: "error" });
      return;
    }

    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err: any) {
      setProfileMsg({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ text: "Current password is required", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "New password must be at least 6 characters", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match", type: "error" });
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPasswordMsg({ text: "Current password is incorrect", type: "error" });
      } else {
        setPasswordMsg({ text: err.message || "Failed to change password", type: "error" });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-lg">Please login to manage your account</p>
            <a href="/login?redirect=/account" className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
              Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isGoogleUser = user.providerData?.[0]?.providerId === "google.com";

  return (
    <div className="min-h-screen text-white flex flex-col">

      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">

        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Profile Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-purple-400" />
            Profile
          </h2>

          {profileMsg && (
            <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${profileMsg.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
              {profileMsg.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-gray-400">
                <Mail size={16} />
                {user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your name"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-semibold overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.email?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <p className="text-sm">{user.displayName || "No name set"}</p>
                <p className="text-xs text-gray-500">
                  {isGoogleUser ? "Google account" : "Email account"}
                </p>
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Password Section (only for email/password users) */}
        {!isGoogleUser && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock size={18} className="text-purple-400" />
              Change Password
            </h2>

            {passwordMsg && (
              <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${passwordMsg.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                {passwordMsg.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm text-gray-400 mb-1 block">Current Password</label>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-9 text-gray-500">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Min. 6 characters"
                />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-9 text-gray-500">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="px-6 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/my-presets" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white">
              📦 My Presets
            </Link>
            <Link href="/wishlist" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white">
              💜 Wishlist
            </Link>
            <Link href="/contact" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white">
              ✉️ Contact Support
            </Link>
          </div>
        </div>

      </div>

      <Footer />

    </div>
  );
}
