import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyAfzDHA71Erfcq6xpP4mozjJMddS198CPw",
  authDomain: "preset42-b7dad.firebaseapp.com",
  projectId: "preset42-b7dad",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ ADD THIS