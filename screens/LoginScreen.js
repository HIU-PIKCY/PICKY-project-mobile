import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginLogo from '../assets/icons/LoginLogo.svg';
import { useAuth } from '../AuthContext';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    // 더미 로그인 데이터
    const dummyUser = {
        username: 'testuser',
        password: 'password123'
    };

    const handleLogin = async () => {
        if (!username.trim()) {
            Alert.alert('알림', '아이디를 입력해주세요.');
            return;
        }

        if (!password.trim()) {
            Alert.alert('알림', '비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 더미 로그인 검증
            setTimeout(async () => {
                if (username.trim() === dummyUser.username && password.trim() === dummyUser.password) {
                    // 로그인 성공
                    const userData = {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        nickname: '테스트유저'
                    };

                    const token = 'dummy_jwt_token_12345';
                    const refreshToken = 'dummy_refresh_token_67890';

                    // AuthContext의 login 함수 사용
                    const success = await login(userData, token, refreshToken);

                    setLoading(false);

                    if (success) {
                        Alert.alert('로그인 성공', `${userData.nickname}님 환영합니다!`);
                    } else {
                        Alert.alert('로그인 실패', '로그인 정보 저장 중 오류가 발생했습니다.');
                    }
                } else {
                    // 로그인 실패
                    setLoading(false);
                    Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
                }
            }, 1500);
        } catch (error) {
            console.error('로그인 실패:', error);
            setLoading(false);
            Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
        }
    };


    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {/* 로고 영역 */}
                    <View style={styles.logoContainer}>
                        <LoginLogo width={200} height={80} />
                    </View>

                    {/* 입력 폼 영역 */}
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="아이디"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            allowFontScaling={false}
                            textAlignVertical="center"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            allowFontScaling={false}
                            textAlignVertical="center"
                        />

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>로그인하기</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* 회원가입 링크 */}
                    <View style={styles.registerContainer}>
                        <TouchableOpacity onPress={handleRegister} disabled={loading}>
                            <Text style={styles.registerText}>계정이 없으신가요? 회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 40,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    formContainer: {
        marginBottom: 20,
    },
    input: {
        height: 52,
        backgroundColor: '#F3FCF9',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 16 : 14,
        fontSize: 16,
        fontFamily: 'SUIT-Regular',
        color: '#4B4B4B',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#90D1BE',
        allowFontScaling: false,
        textAlignVertical: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            lineHeight: 20
        }),
    },
    loginButton: {
        height: 52,
        backgroundColor: '#0D2525',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        letterSpacing: -0.4,
    },
    registerContainer: {
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        letterSpacing: -0.35,
    },
});

export default LoginScreen;