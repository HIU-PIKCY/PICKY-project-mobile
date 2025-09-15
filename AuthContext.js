import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import { loginWithFirebase } from './services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase 인증 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase 로그인 성공 시 백엔드 로그인
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await loginWithFirebase(idToken);
          
          if (response.isSuccess) {
            // 토큰과 사용자 정보 저장
            await AsyncStorage.setItem('authToken', response.result.tokenInfo.accessToken);
            await AsyncStorage.setItem('refreshToken', response.result.tokenInfo.refreshToken);
            
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              isNewUser: response.result.status === 'SIGN_UP'
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('백엔드 로그인 실패:', error);
          await signOut(auth); // Firebase 로그아웃
        }
      } else {
        // Firebase 로그아웃 시 앱 상태도 로그아웃
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth); // Firebase 로그아웃
  };

  const value = {
    isLoggedIn,
    isLoading,
    user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};