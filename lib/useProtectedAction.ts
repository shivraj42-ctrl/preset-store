"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const useProtectedAction = () => {
  const { user } = useAuth();
  const router = useRouter();

  const checkAuth = () => {
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return false;
    }
    return true;
  };

  return { checkAuth, user };
};