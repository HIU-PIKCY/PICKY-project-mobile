import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const isSignupProcess = useRef(false);
    const isRefreshing = useRef(false); // 토큰 갱신 중복 방지

    const API_BASE_URL = 'http://13.124.86.254';

    // ==================== 토큰 관리 ====================
    
    // 토큰 초기화
    const initializeTokens = async (accessToken, refreshToken) => {
        try {
            if (accessToken && refreshToken) {
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }
        } catch (error) {
            console.error('토큰 초기화 실패:', error);
            throw error;
        }
    };

    // 토큰 갱신 함수
    const refreshToken = async () => {
        // 이미 갱신 중이면 대기
        if (isRefreshing.current) {
            // 최대 5초 대기
            for (let i = 0; i < 50; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (!isRefreshing.current) {
                    const newToken = await AsyncStorage.getItem('accessToken');
                    if (newToken) return newToken;
                }
            }
            throw new Error('토큰 갱신 대기 시간 초과');
        }

        isRefreshing.current = true;
        
        try {
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

            if (!storedRefreshToken) {
                throw new Error('리프레시 토큰이 없습니다.');
            }

            console.log('🔄 토큰 재발급 시작...');

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
                await initializeTokens(data.result.accessToken, data.result.refreshToken);
                console.log('✅ 토큰 재발급 완료');
                return data.result.accessToken;
            } else {
                throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('❌ 토큰 재발급 실패:', error.message);
            // 토큰 갱신 실패 시 로그아웃 처리
            await logout();
            throw error;
        } finally {
            isRefreshing.current = false;
        }
    };

    // ==================== 인증된 요청 ====================
    
    // 인증이 필요한 API 호출을 위한 공통 함수
    const authenticatedFetch = async (url, options = {}) => {
        try {
            let accessToken = await AsyncStorage.getItem('accessToken');

            if (!accessToken) {
                throw new Error('액세스 토큰이 없습니다.');
            }

            // 첫 번째 요청
            let response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // 토큰 만료 시 갱신 후 재시도 (401 또는 403)
            if (response.status === 401 || response.status === 403) {
                console.log('⚠️ 토큰 만료 감지, 재발급 시도 중...');
                
                try {
                    accessToken = await refreshToken();
                    
                    // 갱신된 토큰으로 재시도
                    response = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                } catch (refreshError) {
                    console.error('❌ 토큰 갱신 후 재요청 실패:', refreshError.message);
                    throw new Error('토큰 갱신 실패');
                }
            }

            return response;
        } catch (error) {
            console.error('❌ API 요청 실패:', error.message);
            throw error;
        }
    };

    // ==================== 백엔드 로그인/로그아웃 ====================
    
    // 백엔드 로그인
    const loginWithBackend = async (firebaseIdToken) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseIdToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('백엔드 로그인 실패:', errorText);
                throw new Error(`백엔드 로그인 실패: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result && data.result.tokenInfo) {
                await initializeTokens(
                    data.result.tokenInfo.accessToken,
                    data.result.tokenInfo.refreshToken
                );
                console.log('✅ 로그인 성공');
                return data;
            } else {
                throw new Error(data.message || '백엔드 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('❌ 백엔드 로그인 에러:', error.message);
            throw error;
        }
    };

    // 백엔드 로그아웃
    const logoutWithBackend = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');

            if (accessToken) {
                const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error('백엔드 로그아웃 실패:', response.status);
                }
            }
        } catch (error) {
            console.error('백엔드 로그아웃 에러:', error.message);
        }
    };

    // ==================== 회원가입 플래그 ====================
    
    const setSignupFlag = () => {
        isSignupProcess.current = true;
    };

    const clearSignupFlag = () => {
        isSignupProcess.current = false;
    };

    // ==================== Firebase 인증 상태 관리 ====================
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // 회원가입 직후라면 백엔드 로그인 스킵
                    if (isSignupProcess.current) {
                        return;
                    }

                    // 일반 로그인 - 백엔드 로그인 시도
                    const idToken = await firebaseUser.getIdToken();

                    try {
                        const backendResponse = await loginWithBackend(idToken);

                        if (backendResponse.isSuccess) {
                            setUser(firebaseUser);
                            setLoading(false);
                        } else {
                            await signOut(auth);
                            setUser(null);
                        }
                    } catch (backendError) {
                        await signOut(auth);
                        setUser(null);
                    }
                } else {
                    // Firebase 사용자가 없으면 로그아웃 처리
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    setUser(null);
                    isSignupProcess.current = false;
                }
            } catch (error) {
                console.error('인증 상태 처리 오류:', error.message);
                setUser(null);
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                isSignupProcess.current = false;
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // ==================== 로그아웃 ====================
    
    const logout = async () => {
        try {
            // 1. 백엔드 로그아웃
            await logoutWithBackend();

            // 2. Firebase 로그아웃
            await signOut(auth);

            // 3. 로컬 토큰 삭제
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

            console.log('✅ 로그아웃 완료');
            return true;
        } catch (error) {
            console.error('❌ 로그아웃 실패:', error.message);
            return false;
        }
    };

    // ==================== API 서비스 함수들 ====================
    
    // 도서 검색
    const searchBooks = async (keyword, type = 'all', page = 1, size = 20) => {
        const params = new URLSearchParams({
            keyword: keyword.trim(),
            type,
            page: page.toString(),
            size: size.toString()
        });

        const url = `${API_BASE_URL}/api/books/search?${params.toString()}`;
        const response = await authenticatedFetch(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`검색 실패: ${response.status}, ${errorText}`);
        }
        
        return response.json();
    };

    // 도서 상세 정보
    const getBookDetail = async (isbn) => {
        const url = `${API_BASE_URL}/api/books/${isbn}`;
        const response = await authenticatedFetch(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`도서 상세 정보 조회 실패: ${response.status}, ${errorText}`);
        }
        
        return response.json();
    };

    // 사용자 프로필
    const getUserProfile = async () => {
        const url = `${API_BASE_URL}/api/members/profile`;
        const response = await authenticatedFetch(url, { method: 'GET' });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`프로필 조회 실패: ${response.status}, ${errorText}`);
        }
        
        return response.json();
    };

    // Context value
    const value = {
        user,
        loading,
        logout,
        refreshToken,
        authenticatedFetch,
        initializeTokens,
        setSignupFlag,
        clearSignupFlag,
        // API 서비스 함수들
        searchBooks,
        getBookDetail,
        getUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};