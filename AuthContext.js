import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import apiService, { api } from './services/apiService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Firebase 인증 상태 변화 감지
    useEffect(() => {
        // 앱 시작 시 저장된 토큰 초기화
        apiService.initializeTokens();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Firebase 인증 상태 변화:', firebaseUser ? '로그인됨' : '로그아웃됨');
            
            try {
                if (firebaseUser) {
                    // Firebase 사용자가 있으면 백엔드에 로그인 시도
                    console.log('Firebase 사용자 감지, 백엔드 로그인 시도');
                    const idToken = await firebaseUser.getIdToken();
                    
                    try {
                        const backendResponse = await api.login(idToken);
                        
                        if (backendResponse.isSuccess) {
                            setUser(firebaseUser);
                            console.log('사용자 로그인 완료 - 메인 화면으로 이동');
                        } else {
                            console.error('백엔드 로그인 실패:', backendResponse.message);
                            // 백엔드 로그인 실패 시 Firebase에서도 로그아웃
                            await signOut(auth);
                            setUser(null);
                        }
                    } catch (backendError) {
                        console.error('백엔드 로그인 에러:', backendError);
                        
                        // 회원가입 직후가 아닌 일반 로그인 실패의 경우에만 Firebase 로그아웃
                        if (!backendError.message.includes('가입되지 않은')) {
                            await signOut(auth);
                        }
                        setUser(null);
                    }
                } else {
                    // Firebase 사용자가 없으면 로그아웃 처리
                    console.log('Firebase 사용자 없음, 로그아웃 처리');
                    await apiService.clearTokens();
                    setUser(null);
                }
            } catch (error) {
                console.error('인증 상태 변화 처리 중 에러:', error);
                // 에러 발생 시 로그아웃 처리
                setUser(null);
                await apiService.clearTokens();
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // 로그아웃 함수
    const logout = async () => {
        try {
            console.log('로그아웃 프로세스 시작');
            
            // 1. 백엔드 로그아웃 및 토큰 클리어
            await api.logout();
            
            // 2. Firebase 로그아웃
            await signOut(auth);
            
            console.log('로그아웃 완료');
            return true;
        } catch (error) {
            console.error('로그아웃 실패:', error);
            return false;
        }
    };

    const value = {
        user,
        loading,
        logout,
        // API 서비스 인스턴스도 제공
        apiService,
        api,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};