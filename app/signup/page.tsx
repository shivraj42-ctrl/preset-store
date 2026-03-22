"use client";

import { useState, Suspense } from "react";
import { signup, googleLogin } from "@/lib/auth";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

function SignupContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const createUserIfNotExists = async (user: any) => {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        isAdmin: false,
        createdAt: new Date(),
      });
    }
  };

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signup(email, password);
      await createUserIfNotExists(result.user);
      router.push(redirect || "/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await googleLogin();
      await createUserIfNotExists(result.user);
      router.push(redirect || "/");
    } catch {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength =
    password.length < 2
      ? 0
      : password.length < 6
      ? 1
      : password.length < 8
      ? 2
      : /[A-Z]/.test(password) && /[0-9]/.test(password)
      ? 3
      : 2;

  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColors = ["bg-white/10", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors group z-10"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-2xl p-8 shadow-[0_0_60px_rgba(168,85,247,0.08)]">

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Create your account</h1>
            <p className="text-sm text-gray-400">Join SnapGrid and start editing</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={show ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
                value={password}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength >= level ? strengthColors[strength] : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">{strengthLabel}</p>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Signup Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white/[0.04] border border-white/[0.08] py-3 rounded-xl flex items-center justify-center gap-2.5 text-sm text-gray-300 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all disabled:opacity-50"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={18}
              height={18}
            />
            Continue with Google
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}