import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase konfigürasyonu - Ficonica projesi
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ficonica-5256d.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ficonica-5256d",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ficonica-5256d.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Storage servislerini al
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 