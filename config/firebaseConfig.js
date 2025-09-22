import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlEwarWoDO7Xox_TQGakHRjgkmGdsTbC0",
  authDomain: "picky-kipiluv.firebaseapp.com",
  projectId: "picky-kipiluv",
  storageBucket: "picky-kipiluv.firebasestorage.app",
  messagingSenderId: "875111719901",
  appId: "1:875111719901:web:aaf51a5d440580d27b4c34",
  measurementId: "G-541BJXF3R0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;