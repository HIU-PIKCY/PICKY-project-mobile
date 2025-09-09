// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 파이어베이스 설정 (실제 프로젝트의 설정으로 교체해야 함)
const firebaseConfig = {
  apiKey: "AIzaSyDlEwarWoDO7Xox_TQGakHRjgkmGdsTbC0",
  authDomain: "picky-kipiluv.firebaseapp.com",
  projectId: "picky-kipiluv",
  storageBucket: "picky-kipiluv.firebasestorage.app",
  messagingSenderId: "875111719901",
  appId: "1:875111719901:web:aaf51a5d440580d27b4c34",
  measurementId: "G-541BJXF3R0"
};

// 파이어베이스 앱 초기화
const app = initializeApp(firebaseConfig);

// React Native용 Auth 초기화
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;