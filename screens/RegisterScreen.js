import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import CustomHeader from '../components/CustomHeader';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);

    // 서버 API URL
    const API_BASE_URL = 'http://13.124.86.254';

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handlePasswordConfirmChange = (text) => {
        setPasswordConfirm(text);
        if (password && text && password !== text) {
            setPasswordMismatch(true);
        } else {
            setPasswordMismatch(false);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        if (!email.trim()) {
            Alert.alert('오류', '이메일을 입력해주세요.');
            return false;
        }

        if (!validateEmail(email)) {
            Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
            return false;
        }

        if (!password.trim()) {
            Alert.alert('오류', '비밀번호를 입력해주세요.');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
            return false;
        }

        if (password !== passwordConfirm) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return false;
        }

        if (!name.trim()) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return false;
        }

        if (!nickname.trim()) {
            Alert.alert('오류', '닉네임을 입력해주세요.');
            return false;
        }

        if (nickname.length < 2) {
            Alert.alert('오류', '닉네임은 2자 이상이어야 합니다.');
            return false;
        }

        return true;
    };

    const signUpWithBackend = async (firebaseIdToken) => {
        try {
            console.log('백엔드 회원가입 요청 시작');
            
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseIdToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    nickname: nickname.trim()
                })
            });

            console.log('백엔드 응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('백엔드 에러 응답:', errorText);
                throw new Error(`백엔드 회원가입 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('백엔드 회원가입 성공:', data);

            if (data.isSuccess) {
                return data;
            } else {
                throw new Error(data.message || '백엔드 회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('백엔드 회원가입 에러:', error);
            throw error;
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log('회원가입 프로세스 시작');
            
            // 1. Firebase 회원가입
            console.log('Firebase 회원가입 시도');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Firebase 회원가입 성공:', userCredential.user.uid);
            
            // 2. Firebase 프로필 업데이트 (선택사항 - 백엔드에서 주로 관리)
            await updateProfile(userCredential.user, {
                displayName: JSON.stringify({
                    name: name.trim(),
                    nickname: nickname.trim()
                })
            });
            console.log('Firebase 프로필 업데이트 완료');

            // 3. Firebase ID 토큰 가져오기
            console.log('Firebase ID 토큰 가져오기');
            const idToken = await userCredential.user.getIdToken();
            console.log('Firebase ID 토큰 획득 성공');
            
            // 4. 백엔드에 회원가입 요청
            console.log('백엔드 회원가입 요청');
            const backendResponse = await signUpWithBackend(idToken);
            
            if (backendResponse.isSuccess) {
                console.log('전체 회원가입 프로세스 완료');
                
                // 회원가입 성공 시 Firebase에서 로그아웃하고 로그인 화면으로 이동
                await signOut(auth);
                
                Alert.alert(
                    '회원가입 완료',
                    '회원가입이 성공적으로 완료되었습니다. 로그인해주세요.',
                    [
                        {
                            text: '확인',
                            onPress: () => {
                                navigation.navigate('Login');
                            }
                        }
                    ]
                );
            } else {
                throw new Error('백엔드 회원가입 실패: ' + backendResponse.message);
            }
        } catch (error) {
            console.error('회원가입 실패 상세:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            let errorMessage = '회원가입 중 오류가 발생했습니다.';
            
            // Firebase 에러 처리
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = '이미 가입된 이메일입니다.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '올바르지 않은 이메일 형식입니다.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = '이메일/비밀번호 회원가입이 비활성화되어 있습니다.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = '네트워크 연결을 확인해주세요.';
                        break;
                    default:
                        errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
                }
            } 
            // 백엔드 에러 처리
            else if (error.message.includes('백엔드')) {
                if (error.message.includes('400')) {
                    errorMessage = '이미 가입된 회원이거나 잘못된 요청입니다.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Firebase 인증에 실패했습니다.';
                } else {
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                }
            }
            
            Alert.alert('회원가입 실패', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <CustomHeader
                title="회원가입"
                onBackPress={handleGoBack}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 이메일 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이메일</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                            placeholder="example@email.com"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* 비밀번호 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>비밀번호</Text>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="비밀번호를 입력하세요 (6자 이상)"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {/* 비밀번호 확인 섹션 */}
                    <View style={styles.inputSection}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>비밀번호 확인</Text>
                            {passwordMismatch && (
                                <Text style={styles.errorText}>* 비밀번호가 일치하지 않습니다.</Text>
                            )}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                passwordMismatch && styles.errorInput
                            ]}
                            placeholder="비밀번호를 다시 입력하세요"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={passwordConfirm}
                            onChangeText={handlePasswordConfirmChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {/* 이름 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이름</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="실명을 입력해주세요"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    {/* 닉네임 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>닉네임</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="사용할 닉네임을 입력해주세요 (2자 이상)"
                            placeholderTextColor="#999"
                            value={nickname}
                            onChangeText={setNickname}
                            editable={!loading}
                        />
                    </View>

                    {/* 회원가입 버튼 */}
                    <View style={styles.registerSection}>
                        <TouchableOpacity 
                            style={[
                                styles.registerButton,
                                loading && styles.registerButtonDisabled
                            ]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.registerText}>회원가입</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
        paddingTop: 30,
    },
    inputSection: {
        paddingHorizontal: 24,
        marginBottom: 27,
    },
    label: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginBottom: 15,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#90D1BE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#4B4B4B',
        backgroundColor: '#F3FCF9',
    },
    passwordInput: {
        height: 52,
        borderWidth: 1,
        borderColor: '#666666',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#4B4B4B',
        backgroundColor: '#FFFFFF',
    },
    errorInput: {
        height: 52,
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#F87171',
        letterSpacing: -0.3,
        marginLeft: 8,
    },
    registerSection: {
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    registerButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#0D2525',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerText: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '400',
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
});

export default RegisterScreen;