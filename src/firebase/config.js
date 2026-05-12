// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// 🔧 REPLACE with your Firebase project config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYg1GTAaVC2D6VKNxQ5-sc6qLqN7HZp68",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nachlefeed.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nachlefeed",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nachlefeed.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "785310629182",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:785310629182:web:fd139b7d3486a2a438406f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SFGMKD316V",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
