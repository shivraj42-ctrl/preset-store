"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

import { getCart, clearCart, loadFirebaseCart } from "@/lib/cart";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        try {
          // Check admin status
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setIsAdmin(userDoc.exists() && userDoc.data().isAdmin === true);

          // Guest cart merge
          const guestCart = getCart(null);
          if (guestCart.length > 0) {
            for (const item of guestCart) {
              await setDoc(
                doc(db, "users", user.uid, "cart", item.id),
                item
              );
            }
            clearCart(null);
          }

          // Load Firebase cart → local
          await loadFirebaseCart(user.uid);

        } catch (err) {
          console.log("Cart merge/load error:", err);
        }
      } else {
        setIsAdmin(false);
        window.dispatchEvent(new Event("cart:update"));
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);