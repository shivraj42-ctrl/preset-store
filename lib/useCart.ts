"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);

  const loadCart = () => {
    setCart(getCart(user?.uid));
  };

  useEffect(() => {
    loadCart();

    const handleUpdate = () => loadCart();

    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
    };
  }, [user]);

  return { cart, setCart };
};