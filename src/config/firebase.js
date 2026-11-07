import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBg6oo11lEpfF3qxMhohxfmRYMJUvumj8Q",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "chatbot03-e3425.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "chatbot03-e3425",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "chatbot03-e3425.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "535367937162",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:535367937162:web:3a850c50604139fc42d173"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;

