import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
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
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import CustomHeader from '../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/ProfileManagementStyle';

// API 기본 URL
const API_BASE_URL = 'http://13.124.86.254';

// 상수 정의
const CONSTANTS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MIN_NICKNAME_LENGTH: 2,
    MAX_NICKNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    IMAGE_QUALITY: 0.7,
    NICKNAME_CHECK_DELAY: 500,
};

const ProfileManagement = ({ navigation }) => {
    // 사용자 정보 상태
    const [userData, setUserData] = useState(null);
    const [nickname, setNickname] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [originalProfileImage, setOriginalProfileImage] = useState('');
    
    // 비밀번호 관련 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    // 로딩 및 상태 표시
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [checkingNickname, setCheckingNickname] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    
    // 닉네임 중복 확인
    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    // 포커스 상태 관리
    const [focusedInput, setFocusedInput] = useState(null);

    // useRef로 타임아웃 관리
    const nicknameCheckTimeoutRef = useRef(null);

    // 초기 설정
    useEffect(() => {
        loadAccessToken();
        requestImagePermissions();
    }, []);

    useEffect(() => {
        if (accessToken) {
            loadUserProfile();
        }
    }, [accessToken]);

    useFocusEffect(
        useCallback(() => {
            if (accessToken) {
                loadUserProfile();
            }
        }, [accessToken])
    );

    useEffect(() => {
        return () => {
            if (nicknameCheckTimeoutRef.current) {
                clearTimeout(nicknameCheckTimeoutRef.current);
            }
        };
    }, []);

    const requestImagePermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '프로필 사진을 변경하려면 사진 라이브러리 접근 권한이 필요합니다.');
            }
        }
    };

    const loadAccessToken = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                setAccessToken(token);
            } else {
                Alert.alert('오류', '로그인이 필요합니다.');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('토큰 로드 실패:', error);
            Alert.alert('오류', '인증 정보를 불러올 수 없습니다.');
        }
    };

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/members/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('프로필 정보를 불러올 수 없습니다.');
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                setUserData(data.result);
                setNickname(data.result.nickname || '');
                setProfileImage(data.result.profileImg || '');
                setOriginalProfileImage(data.result.profileImg || '');
            } else {
                throw new Error(data.message || '프로필 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('프로필 로딩 실패:', error);
            Alert.alert('오류', error.message || '프로필을 불러오는 중 오류가 발생했습니다.');
        } finally {
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

    const uploadImageToS3 = async (imageUri) => {
        try {
            const fileInfo = await fetch(imageUri);
            const blob = await fileInfo.blob();
            
            if (blob.size > CONSTANTS.MAX_FILE_SIZE) {
                throw new Error('이미지 크기는 5MB 이하여야 합니다.');
            }

            const formData = new FormData();
            const filename = imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const fileExtension = match ? match[1].toLowerCase() : 'jpg';
            const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: mimeType,
            });

            const response = await fetch(`${API_BASE_URL}/test/s3/upload/PROFILE`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답 에러:', errorText);
                
                if (response.status === 400) {
                    throw new Error('잘못된 요청입니다. 이미지 형식을 확인해주세요.');
                } else if (response.status === 413) {
                    throw new Error('이미지 크기가 너무 큽니다. (최대 5MB)');
                } else if (response.status === 401) {
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                } else {
                    throw new Error(`이미지 업로드에 실패했습니다. (${response.status})`);
                }
            }

            const imageUrl = await response.text();
            return imageUrl.trim();
        } catch (error) {
            console.error('S3 업로드 실패:', error);
            throw error;
        }
    };

    const deleteImageFromS3 = async (imageUrl) => {
        try {
            const response = await fetch(`${API_BASE_URL}/test/s3/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileUrl: imageUrl }),
            });

            if (!response.ok) {
                throw new Error('이미지 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('S3 삭제 실패:', error);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: CONSTANTS.IMAGE_QUALITY,
            });

            if (!result.canceled && result.assets[0]) {
                setUploadingImage(true);
                try {
                    const imageUrl = await uploadImageToS3(result.assets[0].uri);
                    setProfileImage(imageUrl);
                    Alert.alert('성공', '프로필 사진이 업로드되었습니다. 저장 버튼을 눌러주세요.');
                } catch (uploadError) {
                    Alert.alert('오류', uploadError.message || '이미지 업로드 중 오류가 발생했습니다.');
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            setUploadingImage(false);
            Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '사진을 촬영하려면 카메라 권한이 필요합니다.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: CONSTANTS.IMAGE_QUALITY,
            });

            if (!result.canceled && result.assets[0]) {
                setUploadingImage(true);
                try {
                    const imageUrl = await uploadImageToS3(result.assets[0].uri);
                    setProfileImage(imageUrl);
                } catch (uploadError) {
                    Alert.alert('오류', uploadError.message || '이미지 업로드 중 오류가 발생했습니다.');
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            setUploadingImage(false);
            Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
        }
    };

    const deleteProfileImage = () => {
        Alert.alert(
            '프로필 사진 삭제',
            '프로필 사진을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => setProfileImage('') }
            ]
        );
    };

    const handleImagePicker = () => {
        const options = [
            { text: '사진 라이브러리에서 선택', onPress: pickImage },
            { text: '사진 촬영', onPress: takePhoto }
        ];

        if (profileImage) {
            options.push({ text: '프로필 사진 삭제', onPress: deleteProfileImage, style: 'destructive' });
        }

        options.push({ text: '취소', style: 'cancel' });
        Alert.alert('프로필 사진 변경', '옵션을 선택해주세요', options);
    };

    const checkNicknameAvailability = async (nicknameToCheck) => {
        try {
            setCheckingNickname(true);
            
            const response = await fetch(
                `${API_BASE_URL}/api/members/check-nickname?nickname=${encodeURIComponent(nicknameToCheck)}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (data.isSuccess && data.result) {
                setNicknameAvailable(data.result.available);
            } else {
                setNicknameAvailable(null);
            }
        } catch (error) {
            console.error('닉네임 중복 확인 실패:', error);
            setNicknameAvailable(null);
        } finally {
            setCheckingNickname(false);
        }
    };

    const handleNicknameChange = (text) => {
        setNickname(text);
        setNicknameAvailable(null);

        if (nicknameCheckTimeoutRef.current) {
            clearTimeout(nicknameCheckTimeoutRef.current);
        }

        if (text === userData?.nickname) {
            return;
        }

        if (text.length < CONSTANTS.MIN_NICKNAME_LENGTH) {
            return;
        }

        nicknameCheckTimeoutRef.current = setTimeout(() => {
            checkNicknameAvailability(text);
        }, CONSTANTS.NICKNAME_CHECK_DELAY);
    };

    const validateForm = () => {
        if (nickname.length < CONSTANTS.MIN_NICKNAME_LENGTH) {
            Alert.alert('오류', `닉네임은 ${CONSTANTS.MIN_NICKNAME_LENGTH}자 이상이어야 합니다.`);
            return false;
        }

        if (currentPassword || newPassword) {
            if (!currentPassword) {
                Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
                return false;
            }
            if (!newPassword) {
                Alert.alert('오류', '새 비밀번호를 입력해주세요.');
                return false;
            }
            if (newPassword.length < CONSTANTS.MIN_PASSWORD_LENGTH) {
                Alert.alert('오류', `새 비밀번호는 ${CONSTANTS.MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`);
                return false;
            }
            if (currentPassword === newPassword) {
                Alert.alert('오류', '새 비밀번호는 현재 비밀번호와 달라야 합니다.');
                return false;
            }
        }

        return true;
    };

    const changePasswordInFirebase = async () => {
        try {
            const user = auth.currentUser;
            
            if (!user || !user.email) {
                throw new Error('로그인 정보를 찾을 수 없습니다.');
            }

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            
            return true;
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            
            let errorMessage = '비밀번호 변경에 실패했습니다.';
            
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = '현재 비밀번호가 올바르지 않습니다.';
                    break;
                case 'auth/weak-password':
                    errorMessage = '새 비밀번호가 너무 약합니다.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = '보안을 위해 다시 로그인해주세요.';
                    break;
            }
            
            throw new Error(errorMessage);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const hasProfileChanges = nickname !== userData?.nickname || profileImage !== originalProfileImage;
        const hasPasswordChange = currentPassword && newPassword;

        if (!hasProfileChanges && !hasPasswordChange) {
            Alert.alert('알림', '변경된 내용이 없습니다.');
            return;
        }

        setSaving(true);
        try {
            if (hasPasswordChange) {
                setChangingPassword(true);
                await changePasswordInFirebase();
                setChangingPassword(false);
            }

            if (hasProfileChanges) {
                const updateData = {};
                
                if (nickname !== userData?.nickname) {
                    updateData.nickname = nickname.trim();
                }
                
                if (profileImage !== originalProfileImage) {
                    updateData.profileImg = profileImage || null;
                    
                    if (originalProfileImage && profileImage !== originalProfileImage) {
                        await deleteImageFromS3(originalProfileImage);
                    }
                }

                const response = await fetch(`${API_BASE_URL}/api/members/profile`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || '프로필 수정에 실패했습니다.');
                }

                if (data.isSuccess && data.result) {
                    setUserData(data.result);
                    setNickname(data.result.nickname || '');
                    setProfileImage(data.result.profileImg || '');
                    setOriginalProfileImage(data.result.profileImg || '');
                }
            }

            setCurrentPassword('');
            setNewPassword('');
            setNicknameAvailable(null);
            
            let successMessage = '프로필이 성공적으로 저장되었습니다.';
            if (hasPasswordChange && hasProfileChanges) {
                successMessage = '프로필과 비밀번호가 성공적으로 변경되었습니다.';
            } else if (hasPasswordChange) {
                successMessage = '비밀번호가 성공적으로 변경되었습니다.';
            }
            
            Alert.alert('완료', successMessage);
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            Alert.alert('오류', error.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
            setChangingPassword(false);
        }
    };

    const renderNicknameStatus = () => {
        if (checkingNickname) {
            return (
                <View style={styles.nicknameStatusContainer}>
                    <Text style={styles.checkingText}>확인 중...</Text>
                </View>
            );
        }

        if (nicknameAvailable === true && nickname !== userData?.nickname) {
            return <Text style={styles.successText}>* 사용 가능한 닉네임입니다.</Text>;
        }

        if (nicknameAvailable === false) {
            return <Text style={styles.errorText}>* 이미 존재하는 닉네임입니다.</Text>;
        }

        return null;
    };

    const getInputStyle = (inputName) => {
        if (inputName === 'nickname') {
            if (nicknameAvailable === false) {
                return [styles.input, styles.errorInput];
            }
            if (nicknameAvailable === true) {
                return [styles.input, styles.successInput];
            }
        }

        if (focusedInput === inputName) {
            return [styles.input, styles.focusedInput];
        }

        return styles.input;
    };

    const getPasswordInputStyle = (inputName) => {
        if (focusedInput === inputName) {
            return [styles.passwordInput, styles.focusedPasswordInput];
        }
        return styles.passwordInput;
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
                    <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
                        <Text style={styles.retryButtonText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader title="프로필 관리" onBackPress={handleGoBack} />

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
                    {/* 프로필 이미지 */}
                    <View style={styles.profileImageSection}>
                        <View style={styles.imageRow}>
                            <View style={styles.imageContainer}>
                                {uploadingImage ? (
                                    <ActivityIndicator size="large" color="#90D1BE" />
                                ) : (
                                    <>
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                                        ) : (
                                            <View style={styles.noImageContainer}>
                                                <Ionicons name="person-outline" size={40} color="#999" />
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                            <TouchableOpacity 
                                style={styles.changePhotoButton}
                                onPress={handleImagePicker}
                                disabled={saving || uploadingImage}
                            >
                                <Text style={styles.changePhotoText}>
                                    {uploadingImage ? '업로드 중...' : '사진 변경'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {uploadingImage && (
                            <Text style={styles.uploadingText}>이미지를 업로드하고 있습니다...</Text>
                        )}
                    </View>

                    {/* 이메일 (수정 불가) */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이메일</Text>
                        <View style={styles.disabledInput}>
                            <Text style={styles.disabledText}>{userData.email}</Text>
                        </View>
                    </View>

                    {/* 이름 (수정 불가) */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이름</Text>
                        <View style={styles.disabledInput}>
                            <Text style={styles.disabledText}>{userData.name}</Text>
                        </View>
                    </View>

                    {/* 현재 비밀번호 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>현재 비밀번호</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={getPasswordInputStyle('currentPassword')}
                                placeholder="현재 비밀번호를 입력하세요"
                                placeholderTextColor="#999"
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                onFocus={() => setFocusedInput('currentPassword')}
                                onBlur={() => setFocusedInput(null)}
                                editable={!saving}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                <Ionicons
                                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 새 비밀번호 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={getInputStyle('newPassword')}
                                placeholder="새 비밀번호를 입력하세요"
                                placeholderTextColor="#999"
                                secureTextEntry={!showNewPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                onFocus={() => setFocusedInput('newPassword')}
                                onBlur={() => setFocusedInput(null)}
                                editable={!saving}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Ionicons
                                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 닉네임 */}
                    <View style={styles.inputSection}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>닉네임</Text>
                            {renderNicknameStatus()}
                        </View>
                        <TextInput
                            style={getInputStyle('nickname')}
                            placeholder="닉네임을 입력하세요"
                            placeholderTextColor="#999"
                            value={nickname}
                            onChangeText={handleNicknameChange}
                            onFocus={() => setFocusedInput('nickname')}
                            onBlur={() => setFocusedInput(null)}
                            editable={!saving}
                            maxLength={CONSTANTS.MAX_NICKNAME_LENGTH}
                        />
                    </View>

                    {/* 저장 버튼 */}
                    <View style={styles.saveSection}>
                        <TouchableOpacity 
                            style={[styles.saveButton, (saving || uploadingImage) && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving || uploadingImage}
                        >
                            {saving ? (
                                <View style={styles.savingContainer}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.savingText}>
                                        {changingPassword ? '비밀번호 변경 중...' : '저장 중...'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.saveText}>저장하기</Text>
                            )}
                        </TouchableOpacity>
                        {uploadingImage && (
                            <Text style={styles.uploadWarningText}>
                                이미지 업로드가 완료될 때까지 기다려주세요
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileManagement;