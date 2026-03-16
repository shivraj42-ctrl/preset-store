"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

<<<<<<< HEAD
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
=======
const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
>>>>>>> 24fd8379a54a93e57c7f05c9cd61607917ec7c74

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
<<<<<<< HEAD
      setLoading(false);
=======
>>>>>>> 24fd8379a54a93e57c7f05c9cd61607917ec7c74
    });

    return () => unsubscribe();
  }, []);

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
=======
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
>>>>>>> 24fd8379a54a93e57c7f05c9cd61607917ec7c74
