"use client";

import { useState, Suspense } from "react";
import { login, googleLogin, resetPassword } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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

    return true;
  };

  const handleLogin = async () => {
    setError("");
    setInfo("");
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(email, password);
      await createUserIfNotExists(result.user);
      router.push(redirect || "/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Enter your email address first, then click Forgot password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await resetPassword(email);
      setInfo("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const result = await googleLogin();
      await createUserIfNotExists(result.user);
      router.push(redirect || "/");
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-black">
          Welcome back
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Info Message */}
        {info && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg">
            {info}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          className="w-full border border-gray-300 p-3 rounded-lg text-black placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            className="w-full border border-gray-300 p-3 rounded-lg pr-10 text-black placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <div
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* Forgot */}
        <p
          onClick={handleReset}
          className="text-sm text-blue-600 cursor-pointer hover:underline"
        >
          Forgot password?
        </p>

        {/* Button */}
        <button
          onClick={handleLogin}
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
              Signing in...
            </span>
          ) : (
            "Continue"
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

        {/* Signup */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-purple-600 font-medium">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}