import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const ProfileManagement = ({ navigation }) => {
    // 더미 유저 데이터
    const [userData, setUserData] = useState({
        email: 'keepitup@example.com',
        userId: 'kipiluv',
        name: '이재이',
        profileImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=center',
        nickname: '키피럽'
    });

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState(userData.nickname);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState(null);

    const handleGoBack = () => {
        navigation.goBack();
    };

    // 더미 프로필 이미지들
    const dummyImages = [
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=center', // 고양이1
        'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=150&h=150&fit=crop&crop=center', // 고양이2
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=center', // 고양이3
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop&crop=center', // 고양이4
    ];

    const handleImagePicker = () => {
        Alert.alert(
            '프로필 사진 변경',
            '사진을 선택해주세요',
            [
                {
                    text: '귀여운 고양이 1',
                    onPress: () => setUserData({...userData, profileImage: dummyImages[0]})
                },
                {
                    text: '귀여운 고양이 2', 
                    onPress: () => setUserData({...userData, profileImage: dummyImages[1]})
                },
                {
                    text: '귀여운 고양이 3',
                    onPress: () => setUserData({...userData, profileImage: dummyImages[2]})
                },
                {
                    text: '귀여운 고양이 4',
                    onPress: () => setUserData({...userData, profileImage: dummyImages[3]})
                },
                {
                    text: '취소',
                    style: 'cancel'
                }
            ]
        );
    };

    const handlePasswordConfirmChange = (text) => {
        setPasswordConfirm(text);
        if (password && text && password !== text) {
            setPasswordMismatch(true);
        } else {
            setPasswordMismatch(false);
        }
    };

    const handleNicknameChange = (text) => {
        setNickname(text);
        // 더미 로직: 간단한 닉네임 검증
        if (text.length >= 2 && text !== userData.nickname) {
            // 랜덤으로 사용 가능/불가능 결정 (실제로는 API 호출)
            const isAvailable = Math.random() > 0.3;
            setNicknameAvailable(isAvailable);
        } else if (text === userData.nickname) {
            setNicknameAvailable(null);
        } else {
            setNicknameAvailable(null);
        }
    };

    const handleSave = () => {
        if (passwordMismatch) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        if (nicknameAvailable === false) {
            Alert.alert('오류', '사용할 수 없는 닉네임입니다.');
            return;
        }
        
        Alert.alert('완료', '프로필이 성공적으로 저장되었습니다.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <CustomHeader
                title="프로필 관리"
                onBackPress={handleGoBack}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 이미지 섹션 */}
                <View style={styles.profileImageSection}>
                    <View style={styles.imageRow}>
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{ uri: userData.profileImage }}
                                style={styles.profileImage}
                            />
                        </View>
                        <TouchableOpacity 
                            style={styles.changePhotoButton}
                            onPress={handleImagePicker}
                        >
                            <Text style={styles.changePhotoText}>사진 변경</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 이메일 섹션 */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>이메일</Text>
                    <View style={styles.disabledInput}>
                        <Text style={styles.disabledText}>{userData.email}</Text>
                    </View>
                </View>

                {/* 아이디 섹션 */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>아이디</Text>
                    <View style={styles.disabledInput}>
                        <Text style={styles.disabledText}>{userData.userId}</Text>
                    </View>
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
                    />
                </View>

                {/* 비밀번호 확인 섹션 */}
                <View style={styles.inputSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>비밀번호 확인</Text>
                        {passwordMismatch && (
                            <Text style={styles.errorText}>* 비밀번호가 일치하지 않습니다</Text>
                        )}
                    </View>
                    <TextInput
                        style={[
                            styles.coloredInput, 
                            passwordMismatch && styles.errorInput
                        ]}
                        placeholder=""
                        secureTextEntry
                        value={passwordConfirm}
                        onChangeText={handlePasswordConfirmChange}
                    />
                </View>

                {/* 이름 섹션 */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>이름</Text>
                    <TextInput
                        style={styles.coloredInput}
                        placeholder="이케이"
                        placeholderTextColor="#4B4B4B"
                        value={userData.name}
                        onChangeText={(text) => setUserData({...userData, name: text})}
                    />
                </View>

                {/* 닉네임 섹션 */}
                <View style={styles.inputSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>닉네임</Text>
                        {nicknameAvailable === true && (
                            <Text style={styles.successText}>* 사용 가능한 아이디입니다.</Text>
                        )}
                        {nicknameAvailable === false && (
                            <Text style={styles.errorText}>* 사용할 수 없는 아이디입니다.</Text>
                        )}
                    </View>
                    <TextInput
                        style={[
                            styles.coloredInput,
                            nicknameAvailable === true && styles.successInput,
                            nicknameAvailable === false && styles.errorInput
                        ]}
                        placeholder="키티키티키티"
                        placeholderTextColor="#4B4B4B"
                        value={nickname}
                        onChangeText={handleNicknameChange}
                    />
                </View>

                {/* 저장 버튼 */}
                <View style={styles.saveSection}>
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveText}>저장하기</Text>
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
    content: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    profileImageSection: {
        paddingVertical: 30,
        paddingHorizontal: 24,
    },
    imageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    changePhotoButton: {
        paddingHorizontal: 32,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#4B4B4B',
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    changePhotoText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: 500,
        letterSpacing: -0.35,
        color: '#4B4B4B',
    },
    inputSection: {
        paddingHorizontal: 24,
        marginBottom: 27,
    },
    label: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: 500,
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginBottom: 15,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    disabledInput: {
        backgroundColor: '#DFDFDF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    disabledText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#0D2525',
    },
    passwordInput: {
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
    coloredInput: {
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
    textInput: {
        borderWidth: 1,
        borderColor: '#DBDBDB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#4B4B4B',
        backgroundColor: '#FFFFFF',
    },
    errorInput: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    successInput: {
        borderColor: '#90D1BE',
        backgroundColor: '#F3FCF9',
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
    saveSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    saveButton: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#0D2525',
        alignItems: 'center',
    },
    saveText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: 500,
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
});

export default ProfileManagement;