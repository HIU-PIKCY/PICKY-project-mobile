import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // 서버 API URL
    const API_BASE_URL = 'http://13.124.86.254';

    // 백엔드 로그인 함수
    const loginWithBackend = async (firebaseIdToken) => {
        try {
            console.log('백엔드 로그인 요청 시작');
            
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseIdToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('백엔드 로그인 응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('백엔드 로그인 에러:', errorText);
                throw new Error(`백엔드 로그인 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('백엔드 로그인 성공:', data);

            if (data.isSuccess && data.result && data.result.tokenInfo) {
                // 토큰 저장
                await AsyncStorage.setItem('accessToken', data.result.tokenInfo.accessToken);
                await AsyncStorage.setItem('refreshToken', data.result.tokenInfo.refreshToken);
                console.log('토큰 저장 완료');
                return data;
            } else {
                throw new Error(data.message || '백엔드 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('백엔드 로그인 에러:', error);
            throw error;
        }
    };

    // 백엔드 로그아웃 함수
    const logoutWithBackend = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            
            if (accessToken) {
                console.log('백엔드 로그아웃 요청');
                
                const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('백엔드 로그아웃 응답 상태:', response.status);
                
                if (response.ok) {
                    console.log('백엔드 로그아웃 성공');
                }
            }
        } catch (error) {
            console.error('백엔드 로그아웃 에러:', error);
            // 백엔드 로그아웃 실패해도 로컬 토큰은 삭제
        }
    };

    // Firebase 인증 상태 변화 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Firebase 인증 상태 변화:', firebaseUser ? '로그인됨' : '로그아웃됨');
            
            try {
                if (firebaseUser) {
                    // Firebase 사용자가 있으면 백엔드에 로그인 시도
                    console.log('Firebase 사용자 감지, 백엔드 로그인 시도');
                    const idToken = await firebaseUser.getIdToken();
                    
                    try {
                        const backendResponse = await loginWithBackend(idToken);
                        
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
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    setUser(null);
                }
            } catch (error) {
                console.error('인증 상태 변화 처리 중 에러:', error);
                // 에러 발생 시 로그아웃 처리
                setUser(null);
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
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
            
            // 1. 백엔드 로그아웃
            await logoutWithBackend();
            
            // 2. Firebase 로그아웃
            await signOut(auth);
            
            // 3. 로컬 토큰 삭제
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            
            console.log('로그아웃 완료');
            return true;
        } catch (error) {
            console.error('로그아웃 실패:', error);
            return false;
        }
    };

    // 토큰 갱신 함수
    const refreshToken = async () => {
        try {
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
            
            if (!storedRefreshToken) {
                throw new Error('리프레시 토큰이 없습니다.');
            }

            console.log('토큰 갱신 요청');
            
            const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedRefreshToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`토큰 갱신 실패: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                await AsyncStorage.setItem('accessToken', data.result.accessToken);
                await AsyncStorage.setItem('refreshToken', data.result.refreshToken);
                console.log('토큰 갱신 성공');
                return data.result.accessToken;
            } else {
                throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
            // 토큰 갱신 실패 시 로그아웃 처리
            await logout();
            throw error;
        }
    };

    // API 요청을 위한 인증된 fetch 함수
    const authenticatedFetch = async (url, options = {}) => {
        try {
            let accessToken = await AsyncStorage.getItem('accessToken');
            
            if (!accessToken) {
                throw new Error('액세스 토큰이 없습니다.');
            }

            // 첫 번째 요청
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // 토큰 만료 시 갱신 후 재시도
            if (response.status === 401) {
                console.log('토큰 만료, 갱신 후 재시도');
                accessToken = await refreshToken();
                
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            }

            return response;
        } catch (error) {
            console.error('인증된 요청 실패:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        logout,
        refreshToken,
        authenticatedFetch,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};