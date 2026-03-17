"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${window.location.pathname}`); // 🚫 block access
    }
  }, [user, loading]);

  // ⏳ while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking auth...
      </div>
    );
  }

  // 🚫 not logged in
  if (!user) return null;

  // ✅ logged in
  return children;
}