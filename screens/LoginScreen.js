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
import LoginLogo from '../assets/icons/LoginLogo.svg';
import { useAuth } from '../AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginWithEmail, getErrorMessage } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // 입력 검증
        if (!email.trim()) {
            Alert.alert('알림', '이메일을 입력해주세요.');
            return;
        }

        if (!validateEmail(email.trim())) {
            Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
            return;
        }

        if (!password.trim()) {
            Alert.alert('알림', '비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            console.log('로그인 시도:', email);
            
            const result = await loginWithEmail(email.trim(), password.trim());
            
            if (result.success) {
                console.log('로그인 성공');
                // AuthProvider가 자동으로 메인 화면으로 이동시킴
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            
            const errorMessage = getErrorMessage(error);
            Alert.alert('로그인 실패', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const handleForgotPassword = () => {
        Alert.alert(
            '비밀번호 재설정',
            '비밀번호 재설정 기능은 추후 구현 예정입니다.',
            [{ text: '확인' }]
        );
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
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>이메일</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="이메일을 입력하세요"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                                allowFontScaling={false}
                                textAlignVertical="center"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>비밀번호</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호를 입력하세요"
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
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>로그인</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* 링크 섹션 */}
                    <View style={styles.linksContainer}>
                        <TouchableOpacity 
                            onPress={handleForgotPassword} 
                            disabled={loading}
                            style={styles.linkButton}
                        >
                            <Text style={styles.linkText}>비밀번호를 잊으셨나요?</Text>
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerPrompt}>계정이 없으신가요? </Text>
                            <TouchableOpacity 
                                onPress={handleRegister} 
                                disabled={loading}
                            >
                                <Text style={styles.registerLink}>회원가입</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 개발/테스트를 위한 안내 */}
                    {__DEV__ && (
                        <View style={styles.devContainer}>
                            <Text style={styles.devText}>
                                개발용: Firebase 인증 시스템 사용
                            </Text>
                            <Text style={styles.devSubText}>
                                실제 이메일/비밀번호로 회원가입 후 로그인
                            </Text>
                        </View>
                    )}
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
        marginBottom: 40,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#333',
        marginBottom: 8,
        letterSpacing: -0.3,
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
        marginTop: 10,
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
    linksContainer: {
        alignItems: 'center',
    },
    linkButton: {
        marginBottom: 16,
    },
    linkText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#90D1BE',
        letterSpacing: -0.35,
    },
    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerPrompt: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        letterSpacing: -0.35,
    },
    registerLink: {
        fontSize: 14,
        fontFamily: 'SUIT-SemiBold',
        color: '#0D2525',
        letterSpacing: -0.35,
    },
    devContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#B3D9FF',
    },
    devText: {
        fontSize: 12,
        color: '#1E90FF',
        fontFamily: 'SUIT-SemiBold',
        textAlign: 'center',
        marginBottom: 4,
    },
    devSubText: {
        fontSize: 11,
        color: '#4682B4',
        fontFamily: 'SUIT-Medium',
        textAlign: 'center',
        lineHeight: 14,
    },
});

export default LoginScreen;