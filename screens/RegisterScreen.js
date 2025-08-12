import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [checkingNickname, setCheckingNickname] = useState(false);
    
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [usernameCheckTimeout, setUsernameCheckTimeout] = useState(null);
    const [nicknameCheckTimeout, setNicknameCheckTimeout] = useState(null);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const checkUsernameAvailability = async (usernameToCheck) => {
        if (!usernameToCheck || usernameToCheck.length < 4) {
            setUsernameAvailable(null);
            return;
        }

        setCheckingUsername(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.checkUsernameAvailability(usernameToCheck);
            // setUsernameAvailable(response.data.available);
            
            // 더미 아이디 검증 (특정 아이디들은 사용 불가로 설정)
            setTimeout(() => {
                const unavailableUsernames = ['admin', 'test', 'user', 'kipiluv'];
                const isAvailable = !unavailableUsernames.includes(usernameToCheck.toLowerCase());
                setUsernameAvailable(isAvailable);
                setCheckingUsername(false);
            }, 1000);
        } catch (error) {
            console.error('아이디 확인 실패:', error);
            setUsernameAvailable(null);
            setCheckingUsername(false);
        }
    };

    const checkNicknameAvailability = async (nicknameToCheck) => {
        if (!nicknameToCheck || nicknameToCheck.length < 2) {
            setNicknameAvailable(null);
            return;
        }

        setCheckingNickname(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.checkNicknameAvailability(nicknameToCheck);
            // setNicknameAvailable(response.data.available);
            
            // 더미 닉네임 검증 (랜덤 결과)
            setTimeout(() => {
                const isAvailable = Math.random() > 0.3;
                setNicknameAvailable(isAvailable);
                setCheckingNickname(false);
            }, 1000);
        } catch (error) {
            console.error('닉네임 확인 실패:', error);
            setNicknameAvailable(null);
            setCheckingNickname(false);
        }
    };

    const handleUsernameChange = (text) => {
        setUsername(text);
        setUsernameAvailable(null);

        // 기존 타이머 클리어
        if (usernameCheckTimeout) {
            clearTimeout(usernameCheckTimeout);
        }

        // 새 타이머 설정 (디바운스)
        const timeout = setTimeout(() => {
            checkUsernameAvailability(text);
        }, 500);
        
        setUsernameCheckTimeout(timeout);
    };

    const handleNicknameChange = (text) => {
        setNickname(text);
        setNicknameAvailable(null);

        // 기존 타이머 클리어
        if (nicknameCheckTimeout) {
            clearTimeout(nicknameCheckTimeout);
        }

        // 새 타이머 설정 (디바운스)
        const timeout = setTimeout(() => {
            checkNicknameAvailability(text);
        }, 500);
        
        setNicknameCheckTimeout(timeout);
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

        if (!username.trim()) {
            Alert.alert('오류', '아이디를 입력해주세요.');
            return false;
        }

        if (username.length < 4) {
            Alert.alert('오류', '아이디는 4자 이상이어야 합니다.');
            return false;
        }

        if (usernameAvailable === false) {
            Alert.alert('오류', '이미 존재하는 아이디입니다.');
            return false;
        }

        if (usernameAvailable === null && username.length >= 4) {
            Alert.alert('오류', '아이디 중복확인을 진행해주세요.');
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

        if (nicknameAvailable === false) {
            Alert.alert('오류', '사용할 수 없는 닉네임입니다.');
            return false;
        }

        if (nicknameAvailable === null && nickname.length >= 2) {
            Alert.alert('오류', '닉네임 중복확인을 진행해주세요.');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.register({
            //     email: email.trim(),
            //     username: username.trim(),
            //     password: password.trim(),
            //     passwordConfirm: passwordConfirm.trim(),
            //     name: name.trim(),
            //     nickname: nickname.trim()
            // });

            // 더미 회원가입 시뮬레이션
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    '회원가입 완료',
                    '회원가입이 성공적으로 완료되었습니다.',
                    [
                        {
                            text: '확인',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            }, 2000);
        } catch (error) {
            console.error('회원가입 실패:', error);
            setLoading(false);
            Alert.alert('회원가입 실패', '회원가입 중 오류가 발생했습니다.');
        }
    };

    const renderUsernameStatus = () => {
        if (checkingUsername) {
            return <Text style={styles.checkingText}>확인 중...</Text>;
        }

        if (usernameAvailable === false) {
            return <Text style={styles.errorText}>* 이미 존재하는 아이디입니다.</Text>;
        }

        if (usernameAvailable === true) {
            return <Text style={styles.successText}>* 사용 가능한 아이디입니다.</Text>;
        }

        return null;
    };

    const renderNicknameStatus = () => {
        if (checkingNickname) {
            return <Text style={styles.checkingText}>확인 중...</Text>;
        }

        if (nicknameAvailable === false) {
            return <Text style={styles.errorText}>* 이미 존재하는 닉네임입니다.</Text>;
        }

        if (nicknameAvailable === true) {
            return <Text style={styles.successText}>* 사용 가능한 닉네임입니다.</Text>;
        }

        return null;
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
                        />
                    </View>

                    {/* 아이디 섹션 */}
                    <View style={styles.inputSection}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>아이디</Text>
                            {renderUsernameStatus()}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                usernameAvailable === true && styles.successInput,
                                usernameAvailable === false && styles.errorInput
                            ]}
                            value={username}
                            onChangeText={handleUsernameChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {/* 비밀번호 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>비밀번호</Text>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="비밀번호를 입력하세요."
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
                            placeholder=""
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
                            placeholder=""
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    {/* 닉네임 섹션 */}
                    <View style={styles.inputSection}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>닉네임</Text>
                            {renderNicknameStatus()}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                nicknameAvailable === true && styles.successInput,
                                nicknameAvailable === false && styles.errorInput
                            ]}
                            placeholder=""
                            value={nickname}
                            onChangeText={handleNicknameChange}
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
    successInput: {
        height: 52,
        borderColor: '#90D1BE',
        backgroundColor: '#F3FCF9',
    },
    checkingText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#90D1BE',
        letterSpacing: -0.3,
        marginLeft: 8,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#F87171',
        letterSpacing: -0.3,
        marginLeft: 8,
    },
    successText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#10B981',
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