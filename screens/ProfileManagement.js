import React, { useState, useEffect } from 'react';
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
    Platform,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const ProfileManagement = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [name, setName] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [checkingNickname, setCheckingNickname] = useState(false);
    
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [nicknameCheckTimeout, setNicknameCheckTimeout] = useState(null);

    // 개선된 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyUserData = {
        email: 'keepitup@example.com',
        userId: 'kipiluv',
        name: '이재이',
        nickname: '키피럽',
        profileImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=center'
    };

    const dummyImages = [
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=150&h=150&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop&crop=center',
    ];

    useEffect(() => {
        loadUserProfile();
    }, []);

    // 화면 포커스 시 프로필 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            loadUserProfile();
        }, [])
    );

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getUserProfile(userId);
            // const profile = response.data;
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setUserData(dummyUserData);
                setName(dummyUserData.name);
                setNickname(dummyUserData.nickname);
                setLoading(false);
            }, 300);
        } catch (error) {
            console.error('프로필 로딩 실패:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserProfile();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

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

    const checkNicknameAvailability = async (nicknameToCheck) => {
        if (!nicknameToCheck || nicknameToCheck === userData.nickname) {
            setNicknameAvailable(null);
            return;
        }

        if (nicknameToCheck.length < 2) {
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

    const validateForm = () => {
        if (password && passwordConfirm && password !== passwordConfirm) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return false;
        }

        if (nicknameAvailable === false) {
            Alert.alert('오류', '사용할 수 없는 닉네임입니다.');
            return false;
        }

        if (nickname.length < 2) {
            Alert.alert('오류', '닉네임은 2자 이상이어야 합니다.');
            return false;
        }

        if (!name.trim()) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            // 실제 구현 시 API 호출
            // const updateData = {
            //     name: name.trim(),
            //     nickname: nickname.trim(),
            //     profileImage: userData.profileImage
            // };
            // if (password) updateData.password = password;
            // 
            // await apiService.updateUserProfile(userId, updateData);

            // 더미 저장 시뮬레이션
            setTimeout(() => {
                setUserData(prev => ({
                    ...prev,
                    name: name.trim(),
                    nickname: nickname.trim()
                }));
                
                // 비밀번호 필드 초기화
                setPassword('');
                setPasswordConfirm('');
                setPasswordMismatch(false);
                setNicknameAvailable(null);
                
                setSaving(false);
                Alert.alert('완료', '프로필이 성공적으로 저장되었습니다.');
            }, 1500);
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            setSaving(false);
            Alert.alert('오류', '프로필 저장 중 오류가 발생했습니다.');
        }
    };

    const renderNicknameStatus = () => {
        if (checkingNickname) {
            return (
                <View style={styles.nicknameStatusContainer}>
                    <ActivityIndicator size="small" color="#90D1BE" />
                    <Text style={styles.checkingText}>확인 중...</Text>
                </View>
            );
        }

        if (nicknameAvailable === true) {
            return <Text style={styles.successText}>* 사용 가능한 닉네임입니다.</Text>;
        }

        if (nicknameAvailable === false) {
            return <Text style={styles.errorText}>* 사용할 수 없는 닉네임입니다.</Text>;
        }

        return null;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <CustomHeader title="프로필 관리" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                </View>
            </SafeAreaView>
        );
    }

    if (!userData) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <CustomHeader title="프로필 관리" onBackPress={handleGoBack} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>프로필을 불러올 수 없습니다</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <CustomHeader
                title="프로필 관리"
                onBackPress={handleGoBack}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#90D1BE']}
                            tintColor="#90D1BE"
                        />
                    }
                >
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
                                disabled={saving}
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
                            editable={!saving}
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
                            editable={!saving}
                        />
                    </View>

                    {/* 이름 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이름</Text>
                        <TextInput
                            style={styles.coloredInput}
                            placeholder="이케이"
                            placeholderTextColor="#4B4B4B"
                            value={name}
                            onChangeText={setName}
                            editable={!saving}
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
                                styles.coloredInput,
                                nicknameAvailable === true && styles.successInput,
                                nicknameAvailable === false && styles.errorInput
                            ]}
                            placeholder="키티키티키티"
                            placeholderTextColor="#4B4B4B"
                            value={nickname}
                            onChangeText={handleNicknameChange}
                            editable={!saving}
                        />
                    </View>

                    {/* 저장 버튼 */}
                    <View style={styles.saveSection}>
                        <TouchableOpacity 
                            style={[
                                styles.saveButton,
                                saving && styles.saveButtonDisabled
                            ]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveText}>저장하기</Text>
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
    content: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontWeight: '500',
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
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginBottom: 15,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    nicknameStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    checkingText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
        marginLeft: 4,
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
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
});

export default ProfileManagement;