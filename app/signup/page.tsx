"use client";

import { useState, Suspense } from "react";
import { signup, googleLogin } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-black">
          Create your account
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          className="w-full border border-gray-300 p-3 rounded-lg text-black placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password (min. 6 characters)"
            value={password}
            className="w-full border border-gray-300 p-3 rounded-lg pr-10 text-black placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />
          <div
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            className="w-full border border-gray-300 p-3 rounded-lg pr-10 text-black placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
          />
          <div
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 2 ? (password.length >= 8 ? "bg-green-500" : "bg-yellow-500") : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6 ? (password.length >= 8 ? "bg-green-500" : "bg-yellow-500") : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-200"}`} />
            </div>
            <p className="text-xs text-gray-400">
              {password.length < 6
                ? "Too short"
                : password.length < 8
                ? "Good"
                : /[A-Z]/.test(password) && /[0-9]/.test(password)
                ? "Strong"
                : "Good"}
            </p>
          </div>
        )}

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-medium
          bg-gradient-to-r from-purple-500 to-indigo-500
          hover:opacity-90 transition
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-[1px] bg-gray-300" />
          OR
          <div className="flex-1 h-[1px] bg-gray-300" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 font-medium">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}