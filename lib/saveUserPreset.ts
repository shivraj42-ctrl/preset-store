import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

export const saveUserPreset = async ({
  userId,
  presetId,
  type,
}: {
  userId: string;
  presetId: string;
  type: "purchased" | "downloaded";
}) => {
  try {
    const q = query(
      collection(db, "user_presets"),
      where("userId", "==", userId),
      where("presetId", "==", presetId)
    );

    const snapshot = await getDocs(q);

    // ✅ ALREADY EXISTS → DO NOTHING
    if (!snapshot.empty) {
      console.log("Already exists, skipping...");
      return;
    }

    // ✅ SAVE NEW
    await addDoc(collection(db, "user_presets"), {
      userId,
      presetId,
      type,
      createdAt: new Date(),
    });

  } catch (err) {
    console.log("Error saving preset:", err);
  }
};