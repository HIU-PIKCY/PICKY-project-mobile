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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import LoginLogo from '../assets/icons/LoginLogo.svg';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('알림', '이메일을 입력해주세요.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
            return;
        }

        if (!password.trim()) {
            Alert.alert('알림', '비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AuthContext에서 자동으로 백엔드 로그인 처리됨
            Alert.alert('로그인 성공', '환영합니다!');
        } catch (error) {
            console.error('로그인 실패:', error);
            
            let errorMessage = '로그인에 실패했습니다.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = '존재하지 않는 계정입니다.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = '비밀번호가 올바르지 않습니다.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '올바르지 않은 이메일 형식입니다.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = '비활성화된 계정입니다.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = '네트워크 연결을 확인해주세요.';
                    break;
                default:
                    errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
            }
            
            Alert.alert('로그인 실패', errorMessage);
        } finally {
            setLoading(false);
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
                            placeholder="이메일"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
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