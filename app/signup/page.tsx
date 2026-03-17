"use client";

import { useState } from "react";
import { signup } from "@/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signup(email, password);
      alert("Account created!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">

      <input
        type="email"
        placeholder="Email address"
        className="border p-3 rounded-lg"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-3 rounded-lg"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-purple-600 text-white p-3 rounded-lg"
      >
        Sign up
      </button>

    </div>
  );
}