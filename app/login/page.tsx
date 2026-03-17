"use client";

import { useState } from "react";
import { login, googleLogin, resetPassword } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // ✅ ADD THIS FUNCTION (NEW)
  const createUserIfNotExists = async (user: any) => {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        isAdmin: false, // 👈 default normal user
        createdAt: new Date()
      });
    }
  };

  const handleLogin = async () => {
  try {
    const result = await login(email, password); // ✅ CHANGED (store result)

    // ✅ ADD THIS LINE
    await createUserIfNotExists(result.user);

    // ✅ redirect after login
    router.push(redirect || "/");

  } catch (err: any) {
    alert(err.message);
  }
};

  const handleReset = async () => {
    if (!email) return alert("Enter email first");
    await resetPassword(email);
    alert("Reset email sent!");
  };

  const handleGoogle = async () => {
  try {
    const result = await googleLogin(); // ✅ CHANGED

    // ✅ ADD THIS LINE
    await createUserIfNotExists(result.user);

    // ✅ redirect after login
    router.push(redirect || "/");

  } catch {
    alert("Google login failed");
  }
};

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center">
          Welcome back
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setPassword(e.target.value)}
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
          className="text-sm text-blue-600 cursor-pointer"
        >
          Forgot password?
        </p>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg text-white font-medium 
          bg-gradient-to-r from-purple-500 to-indigo-500 
          hover:opacity-90 transition"
        >
          Continue
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
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Signup */}
        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-600 font-medium">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}