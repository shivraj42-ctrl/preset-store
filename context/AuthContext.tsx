"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

/* ✅ NEW IMPORTS */
import { getCart, clearCart, loadFirebaseCart } from "@/lib/cart";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      /* 🔥 NEW LOGIC START */

      if (user) {
        try {
          // ✅ 1. GET GUEST CART
          const guestCart = getCart(null);

          // ✅ 2. MERGE INTO FIREBASE
          if (guestCart.length > 0) {
            for (const item of guestCart) {
              await setDoc(
                doc(db, "users", user.uid, "cart", item.id),
                item
              );
            }

            // ✅ 3. CLEAR GUEST CART
            clearCart(null);
          }

          // ✅ 4. LOAD FIREBASE CART → LOCAL
          await loadFirebaseCart(user.uid);

        } catch (err) {
          console.log("Cart merge/load error:", err);
        }
      } else {
        // ✅ USER LOGGED OUT → SWITCH TO GUEST CART
        window.dispatchEvent(new Event("cart:update"));
      }

      /* 🔥 NEW LOGIC END */

      // ✅ ONLY redirect if on login/signup page

    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);