import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDH85kht0nQxDA2jtZ_bnG91xGpiPiP_Ag",
  authDomain: "aplikasi-cuaca-1.firebaseapp.com",
  projectId: "aplikasi-cuaca-1",
  storageBucket: "aplikasi-cuaca-1.firebasestorage.app",
  messagingSenderId: "948005763109",
  appId: "1:948005763109:web:138f6c5d7c67b87312a7cc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);