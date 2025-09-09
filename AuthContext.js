import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getIdToken
} from 'firebase/auth';
import { auth } from './config/firebase';

// AuthContext 생성
const AuthContext = createContext();

// AuthContext를 사용하기 위한 커스텀 훅
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
    }
    return context;
};

// AuthProvider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [backendTokens, setBackendTokens] = useState({
        accessToken: null,
        refreshToken: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // API 서버 URL
    const API_BASE_URL = 'http://13.124.86.254';
    
    // AsyncStorage 키들
    const STORAGE_KEYS = {
        USER: '@auth_user',
        ACCESS_TOKEN: '@auth_access_token',
        REFRESH_TOKEN: '@auth_refresh_token'
    };

    // 인증 상태 변경 시 로그
    useEffect(() => {
        console.log('🔐 Auth State Changed:', {
            isAuthenticated,
            isLoading,
            hasUser: !!user,
            hasFirebaseUser: !!firebaseUser,
            hasTokens: !!backendTokens.accessToken
        });
    }, [isAuthenticated, isLoading, user, firebaseUser, backendTokens]);

    // 파이어베이스 인증 상태 변화 감지
    useEffect(() => {
        console.log('🔥 Firebase Auth Listener 설정');
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔥 Firebase 인증 상태 변화:', firebaseUser ? `로그인: ${firebaseUser.email}` : '로그아웃');
            
            if (firebaseUser) {
                setFirebaseUser(firebaseUser);
                console.log('📡 백엔드 인증 시작...');
                await authenticateWithBackend(firebaseUser);
            } else {
                console.log('🚪 로그아웃 처리...');
                await handleLogout();
            }
            
            console.log('✅ 로딩 완료');
            setIsLoading(false);
        });

        return () => {
            console.log('🔥 Firebase Auth Listener 해제');
            unsubscribe();
        };
    }, []);

    // 앱 시작 시 저장된 토큰 확인
    useEffect(() => {
        checkStoredTokens();
    }, []);

    // 저장된 토큰 확인
    const checkStoredTokens = async () => {
        try {
            console.log('💾 저장된 토큰 확인 중...');
            
            const [storedUser, storedAccessToken, storedRefreshToken] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USER),
                AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
                AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
            ]);

            if (storedUser && storedAccessToken) {
                const userData = JSON.parse(storedUser);
                console.log('💾 저장된 사용자 정보 발견:', userData.email);
                
                setUser(userData);
                setBackendTokens({
                    accessToken: storedAccessToken,
                    refreshToken: storedRefreshToken
                });
                setIsAuthenticated(true);
                console.log('✅ 자동 로그인 완료');
            } else {
                console.log('💾 저장된 토큰 없음');
            }
        } catch (error) {
            console.error('💾 저장된 토큰 확인 실패:', error);
            await clearStoredData();
        }
    };

    // 백엔드 서버와 인증
    const authenticateWithBackend = async (firebaseUser) => {
        try {
            console.log('📡 백엔드 서버 인증 시작:', firebaseUser.email);
            
            // Firebase ID Token 가져오기
            const idToken = await getIdToken(firebaseUser);
            console.log('🎫 Firebase ID Token 획득 완료');

            // 백엔드 로그인 API 호출
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('📡 백엔드 로그인 응답 상태:', response.status);

            if (!response.ok) {
                // 백엔드 인증 실패해도 Firebase만으로 진행
                console.warn('⚠️ 백엔드 인증 실패, Firebase만으로 진행');
                await proceedWithFirebaseOnly(firebaseUser);
                return;
            }

            const data = await response.json();
            console.log('📡 백엔드 로그인 응답:', data);

            if (data.isSuccess && data.result) {
                const { status, tokenInfo } = data.result;
                
                // 사용자 정보 생성
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    photoURL: firebaseUser.photoURL,
                    emailVerified: firebaseUser.emailVerified,
                    isNewUser: status === 'SIGN_UP',
                    
                    // 백엔드에서 받은 추가 정보
                    ...(data.result.userInfo && {
                        name: data.result.userInfo.name,
                        nickname: data.result.userInfo.nickname,
                        role: data.result.userInfo.role,
                        legacyUserId: data.result.userInfo.legacyUserId
                    })
                };

                // 토큰 정보 저장
                const tokens = {
                    accessToken: tokenInfo.accessToken,
                    refreshToken: tokenInfo.refreshToken
                };

                await updateAuthState(userData, tokens);
                console.log('✅ 백엔드 인증 완료:', status);
            } else {
                throw new Error(data.message || '백엔드 인증 실패');
            }
        } catch (error) {
            console.error('❌ 백엔드 인증 오류:', error);
            // 백엔드 실패해도 Firebase만으로 진행
            await proceedWithFirebaseOnly(firebaseUser);
        }
    };

    // Firebase만으로 인증 진행 (백엔드 실패 시)
    const proceedWithFirebaseOnly = async (firebaseUser) => {
        console.log('🔥 Firebase만으로 인증 진행');
        
        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isNewUser: false,
            firebaseOnly: true // 백엔드 연결 실패 표시
        };

        await updateAuthState(userData, { accessToken: null, refreshToken: null });
        console.log('✅ Firebase 전용 인증 완료');
    };

    // 인증 상태 업데이트
    const updateAuthState = async (userData, tokens) => {
        console.log('🔄 인증 상태 업데이트:', userData.email);
        
        // 상태 업데이트
        setUser(userData);
        setBackendTokens(tokens);
        setIsAuthenticated(true);

        // AsyncStorage에 저장
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
                tokens.accessToken && AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
                tokens.refreshToken && AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
            ].filter(Boolean));
            
            console.log('💾 사용자 정보 저장 완료');
        } catch (error) {
            console.error('💾 사용자 정보 저장 실패:', error);
        }
    };

    // 이메일/비밀번호로 로그인
    const loginWithEmail = async (email, password) => {
        try {
            console.log('🔑 이메일 로그인 시작:', email);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase 로그인 성공');
            
            // onAuthStateChanged에서 백엔드 인증이 자동으로 처리됨
            return { success: true };
        } catch (error) {
            console.error('❌ Firebase 로그인 실패:', error);
            throw error;
        }
    };

    // 이메일/비밀번호로 회원가입
    const registerWithEmail = async (email, password) => {
        try {
            console.log('📝 이메일 회원가입 시작:', email);
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase 회원가입 성공');
            
            // onAuthStateChanged에서 백엔드 인증이 자동으로 처리됨
            return { success: true };
        } catch (error) {
            console.error('❌ Firebase 회원가입 실패:', error);
            throw error;
        }
    };

    // 로그아웃
    const logout = async () => {
        try {
            console.log('🚪 로그아웃 시작...');
            
            // Firebase 로그아웃
            await signOut(auth);
            
            console.log('✅ 로그아웃 완료');
            return { success: true };
        } catch (error) {
            console.error('❌ 로그아웃 실패:', error);
            // 오류가 발생해도 로컬 데이터는 정리
            await handleLogout();
            return { success: false };
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        console.log('🧹 로그아웃 데이터 정리');
        
        await clearStoredData();
        setFirebaseUser(null);
        setUser(null);
        setBackendTokens({ accessToken: null, refreshToken: null });
        setIsAuthenticated(false);
        
        console.log('✅ 로그아웃 데이터 정리 완료');
    };

    // 저장된 데이터 정리
    const clearStoredData = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.USER),
                AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
            ]);
            console.log('💾 저장된 데이터 정리 완료');
        } catch (error) {
            console.error('💾 저장된 데이터 정리 실패:', error);
        }
    };

    // Firebase 에러 메시지 변환
    const getErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/user-not-found':
                return '등록되지 않은 이메일입니다.';
            case 'auth/wrong-password':
                return '비밀번호가 올바르지 않습니다.';
            case 'auth/email-already-in-use':
                return '이미 사용 중인 이메일입니다.';
            case 'auth/weak-password':
                return '비밀번호는 6자 이상이어야 합니다.';
            case 'auth/invalid-email':
                return '올바르지 않은 이메일 형식입니다.';
            case 'auth/too-many-requests':
                return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
            default:
                return error.message || '알 수 없는 오류가 발생했습니다.';
        }
    };

    // Context value
    const contextValue = {
        // 상태
        user,
        firebaseUser,
        backendTokens,
        isLoading,
        isAuthenticated,
        
        // 함수들
        loginWithEmail,
        registerWithEmail,
        logout,
        getErrorMessage,
        
        // 유틸리티
        getUserId: () => user?.uid,
        getUserEmail: () => user?.email,
        getDisplayName: () => user?.displayName,
        getAccessToken: () => backendTokens.accessToken,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;