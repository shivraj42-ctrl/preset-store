import { db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

export const addToFirebaseCart = async (userId: string, item: any) => {
  await setDoc(doc(db, "users", userId, "cart", item.id), item);
};

export const getFirebaseCart = async (userId: string) => {
  const snap = await getDocs(collection(db, "users", userId, "cart"));
  return snap.docs.map(doc => doc.data());
};

export const clearFirebaseCart = async (userId: string) => {
  const snap = await getDocs(collection(db, "users", userId, "cart"));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
};