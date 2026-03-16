import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
<<<<<<< HEAD
=======
import { getStorage } from "firebase/storage";
>>>>>>> 24fd8379a54a93e57c7f05c9cd61607917ec7c74

const firebaseConfig = {
  apiKey: "AIzaSyAfzDHA71Erfcq6xpP4mozjJMddS198CPw",
  authDomain: "preset42-b7dad.firebaseapp.com",
  projectId: "preset42-b7dad",
  storageBucket: "preset42-b7dad.firebasestorage.app",
  messagingSenderId: "236069969011",
  appId: "1:236069969011:web:a6f2abfc7c714f66ac9e06"
};

const app = initializeApp(firebaseConfig);

<<<<<<< HEAD
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
=======
// Firebase Services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
>>>>>>> 24fd8379a54a93e57c7f05c9cd61607917ec7c74
