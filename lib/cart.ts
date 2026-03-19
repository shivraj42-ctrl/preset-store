import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

/* ✅ EXISTING */
const getKey = (userId?: string | null) => {
  return userId ? `cart_${userId}` : "cart_guest";
};

/* ✅ EXISTING */
export const getCart = (userId?: string | null) => {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(getKey(userId));
  return data ? JSON.parse(data) : [];
};

/* ✅ NEW: FIREBASE ADD */
const addToFirebaseCart = async (userId: string, item: any) => {
  try {
    await setDoc(doc(db, "users", userId, "cart", item.id), item);
  } catch (err) {
    console.log("Firebase add error:", err);
  }
};

/* ✅ NEW: FIREBASE REMOVE */
const removeFromFirebaseCart = async (userId: string, id: string) => {
  try {
    await deleteDoc(doc(db, "users", userId, "cart", id));
  } catch (err) {
    console.log("Firebase remove error:", err);
  }
};

/* ✅ NEW: FIREBASE CLEAR */
const clearFirebaseCart = async (userId: string) => {
  try {
    const snap = await getDocs(collection(db, "users", userId, "cart"));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    console.log("Firebase clear error:", err);
  }
};

/* ✅ NEW: LOAD FIREBASE CART */
export const loadFirebaseCart = async (userId: string) => {
  try {
    const snap = await getDocs(collection(db, "users", userId, "cart"));
    const items = snap.docs.map((doc) => doc.data());

    localStorage.setItem(`cart_${userId}`, JSON.stringify(items));

    /* ✅ TRIGGER GLOBAL UPDATE */
    window.dispatchEvent(new Event("cart:update"));
  } catch (err) {
    console.log("Firebase load error:", err);
  }
};

/* ✅ EXISTING + ENHANCED */
export const addToCart = (preset: any, userId?: string | null) => {
  const cart = getCart(userId);

  const exists = cart.find((item: any) => item.id === preset.id);
  if (exists) return;

  cart.push(preset);
  localStorage.setItem(getKey(userId), JSON.stringify(cart));

  /* ✅ NEW: FIREBASE SYNC */
  if (userId) {
    addToFirebaseCart(userId, preset);
  }

  /* ✅ KEEP YOUR BOOST */
  window.dispatchEvent(new Event("storage"));

  /* ✅ NEW: STRONG EVENT */
  window.dispatchEvent(new Event("cart:update"));
};

/* ✅ EXISTING + ENHANCED */
export const removeFromCart = (id: string, userId?: string | null) => {
  const cart = getCart(userId).filter((item: any) => item.id !== id);
  localStorage.setItem(getKey(userId), JSON.stringify(cart));

  /* ✅ NEW: FIREBASE SYNC */
  if (userId) {
    removeFromFirebaseCart(userId, id);
  }

  /* ✅ KEEP YOUR BOOST */
  window.dispatchEvent(new Event("storage"));

  /* ✅ NEW */
  window.dispatchEvent(new Event("cart:update"));
};

/* ✅ EXISTING + ENHANCED */
export const clearCart = (userId?: string | null) => {
  localStorage.removeItem(getKey(userId));

  /* ✅ NEW: FIREBASE SYNC */
  if (userId) {
    clearFirebaseCart(userId);
  }

  /* ✅ KEEP YOUR BOOST */
  window.dispatchEvent(new Event("storage"));

  /* ✅ NEW */
  window.dispatchEvent(new Event("cart:update"));
};