import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 알림 핸들러 설정
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // 회원가입 직후인지 확인하는 플래그
    const isSignupProcess = useRef(false);

    // 서버 API URL
    const API_BASE_URL = 'http://13.124.86.254';

    // 토큰 초기화 함수
    const initializeTokens = async (accessToken, refreshToken) => {
        try {
            if (accessToken && refreshToken) {
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                console.log('토큰 초기화 완료');
            }
        } catch (error) {
            console.error('토큰 초기화 실패:', error);
            throw error;
        }
    };

    // Expo Push Token 받기
    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('알림 권한이 거부되었습니다.');
                return null;
            }

            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: '59f60846-0250-4c8a-adb9-fcdef1434fc0'
                })).data;
                console.log('Expo Push Token:', token);
            } catch (error) {
                console.error('Push Token 받기 실패:', error);
                return null;
            }
        } else {
            console.log('실제 기기에서만 푸시 알림을 사용할 수 있습니다.');
        }

        return token;
    };

    // FCM 토큰을 서버에 저장
    const saveFCMTokenToServer = async () => {
        try {
            const pushToken = await registerForPushNotificationsAsync();

            if (pushToken) {
                const response = await authenticatedFetch(
                    `${API_BASE_URL}/api/notifications/fcm-token`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fcmToken: pushToken }),
                    }
                );

                if (response.ok) {
                    console.log('FCM 토큰 서버에 저장 성공');
                    return true;
                } else {
                    console.error('FCM 토큰 서버 저장 실패:', response.status);
                    return false;
                }
            } else {
                console.log('푸시 토큰을 받지 못했습니다. 더미 토큰 사용');
                // 더미 토큰 저장
                return await saveDummyFCMToken();
            }
        } catch (error) {
            console.error('FCM 토큰 저장 중 에러:', error);
            // 에러 발생 시 더미 토큰 저장
            return await saveDummyFCMToken();
        }
    };

    // 더미 FCM 토큰 저장 - 실패 시에도 조회는 동작
    const saveDummyFCMToken = async () => {
        try {
            const dummyToken = `test-fcm-token-${Date.now()}`;

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/notifications/fcm-token`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fcmToken: dummyToken }),
                }
            );

            if (response.ok) {
                console.log('더미 FCM 토큰 저장 성공:', dummyToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('더미 FCM 토큰 저장 실패:', error);
            return false;
        }
    };

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
                await initializeTokens(data.result.tokenInfo.accessToken, data.result.tokenInfo.refreshToken);

                // 로그인 성공 후 FCM 토큰 저장
                saveFCMTokenToServer().catch(err =>
                    console.error('FCM 토큰 저장 실패했지만 로그인은 계속:', err)
                );

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

    // 회원가입 플래그 설정 함수 (회원가입 화면에서 호출)
    const setSignupFlag = () => {
        isSignupProcess.current = true;
        console.log('회원가입 플래그 설정');
    };

    // 회원가입 플래그 초기화 함수 (회원가입 완료 후 호출)
    const clearSignupFlag = () => {
        isSignupProcess.current = false;
        console.log('회원가입 플래그 초기화');
    };

    // Firebase 인증 상태 변화 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Firebase 인증 상태 변화:', firebaseUser ? '로그인됨' : '로그아웃됨');

            try {
                if (firebaseUser) {
                    // 회원가입 직후라면 백엔드 로그인 스킵
                    if (isSignupProcess.current) {
                        console.log('회원가입 직후 - 백엔드 로그인 스킵, 로딩 상태 유지');
                        // 회원가입 중에는 user를 설정하지 않고 loading 상태를 유지
                        // 이렇게 하면 메인 화면으로 이동하지 않음
                        return;
                    }

                    // 일반 로그인 - 백엔드 로그인 시도
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
                        await signOut(auth);
                        setUser(null);
                    }
                } else {
                    // Firebase 사용자가 없으면 로그아웃 처리
                    console.log('Firebase 사용자 없음, 로그아웃 처리');
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    setUser(null);
                    isSignupProcess.current = false; // 로그아웃 시 플래그 초기화
                }
            } catch (error) {
                console.error('인증 상태 변화 처리 중 에러:', error);
                // 에러 발생 시 로그아웃 처리
                setUser(null);
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                isSignupProcess.current = false; // 에러 시 플래그 초기화
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // 알림 수신 리스너
    useEffect(() => {
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('알림 수신:', notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('알림 클릭:', response);
            // 여기서 알림 클릭 시 화면 이동 처리
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
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
                await initializeTokens(data.result.accessToken, data.result.refreshToken);
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
        initializeTokens,
        setSignupFlag, // 회원가입 플래그 설정 함수 추가
        clearSignupFlag, // 회원가입 플래그 초기화 함수 추가
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};