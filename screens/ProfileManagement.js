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
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import CustomHeader from '../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 설정
const API_BASE_URL = 'http://13.124.86.254'; // 백엔드 서버 주소

const ProfileManagement = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [nickname, setNickname] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [originalProfileImage, setOriginalProfileImage] = useState(''); // 원본 이미지 URL 저장
    
    // 비밀번호 관련 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [checkingNickname, setCheckingNickname] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    
    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [nicknameCheckTimeout, setNicknameCheckTimeout] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        loadAccessToken();
        requestImagePermissions();
    }, []);

    useEffect(() => {
        if (accessToken) {
            loadUserProfile();
        }
    }, [accessToken]);

    // 화면 포커스 시 프로필 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            if (accessToken) {
                loadUserProfile();
            }
        }, [accessToken])
    );

    // 이미지 권한 요청
    const requestImagePermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '프로필 사진을 변경하려면 사진 라이브러리 접근 권한이 필요합니다.');
            }
        }
    };

    // Access Token 로드
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

    // 프로필 정보 로드
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

    // S3에 이미지 업로드
    const uploadImageToS3 = async (imageUri) => {
        try {
            // 이미지 정보 가져오기
            const fileInfo = await fetch(imageUri);
            const blob = await fileInfo.blob();
            
            console.log('파일 크기:', blob.size, 'bytes (', (blob.size / 1024 / 1024).toFixed(2), 'MB)');
            
            // 5MB 제한 체크
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            if (blob.size > MAX_FILE_SIZE) {
                throw new Error('이미지 크기는 5MB 이하여야 합니다.');
            }

            // FormData 생성
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const fileExtension = match ? match[1].toLowerCase() : 'jpg';
            const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

            // 파일 객체 생성
            const file = {
                uri: imageUri,
                name: filename,
                type: mimeType,
            };

            formData.append('file', file);

            console.log('업로드 시작:', { 
                uri: imageUri, 
                filename, 
                type: mimeType,
                size: blob.size 
            });

            const response = await fetch(`${API_BASE_URL}/test/s3/upload/PROFILE`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // Content-Type을 명시하지 않으면 자동으로 multipart/form-data로 설정됨
                },
                body: formData,
            });

            console.log('응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답 에러:', errorText);
                
                // 상태 코드별 에러 메시지
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

            // 응답은 이미지 URL 문자열
            const imageUrl = await response.text();
            console.log('업로드 성공:', imageUrl);
            return imageUrl.trim(); // 공백 제거
        } catch (error) {
            console.error('S3 업로드 실패 상세:', error);
            throw error;
        }
    };

    // S3에서 이미지 삭제
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

    // 이미지 선택
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7, // 품질 낮춤 (0.8 -> 0.7) - 파일 크기 감소
            });

            console.log('이미지 선택 결과:', result);

            if (!result.canceled && result.assets[0]) {
                const selectedAsset = result.assets[0];
                console.log('선택된 이미지:', {
                    uri: selectedAsset.uri,
                    width: selectedAsset.width,
                    height: selectedAsset.height,
                    fileSize: selectedAsset.fileSize
                });

                setUploadingImage(true);
                try {
                    const imageUrl = await uploadImageToS3(selectedAsset.uri);
                    setProfileImage(imageUrl);
                    Alert.alert('성공', '프로필 사진이 업로드되었습니다. 저장 버튼을 눌러주세요.');
                } catch (uploadError) {
                    console.error('업로드 에러:', uploadError);
                    Alert.alert('오류', uploadError.message || '이미지 업로드 중 오류가 발생했습니다.');
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            setUploadingImage(false);
            console.error('이미지 선택 실패:', error);
            Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
        }
    };

    // 사진 촬영
    const takePhoto = async () => {
        try {
            // 카메라 권한 요청
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '사진을 촬영하려면 카메라 권한이 필요합니다.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], // 수정: 배열 형식으로 변경
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7, // 품질 낮춤 (0.8 -> 0.7) - 파일 크기 감소
            });

            console.log('사진 촬영 결과:', result);

            if (!result.canceled && result.assets[0]) {
                const selectedAsset = result.assets[0];
                console.log('촬영된 사진:', {
                    uri: selectedAsset.uri,
                    width: selectedAsset.width,
                    height: selectedAsset.height,
                    fileSize: selectedAsset.fileSize
                });

                setUploadingImage(true);
                try {
                    const imageUrl = await uploadImageToS3(selectedAsset.uri);
                    setProfileImage(imageUrl);
                    Alert.alert('성공', '프로필 사진이 업로드되었습니다. 저장 버튼을 눌러주세요.');
                } catch (uploadError) {
                    console.error('업로드 에러:', uploadError);
                    Alert.alert('오류', uploadError.message || '이미지 업로드 중 오류가 발생했습니다.');
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            setUploadingImage(false);
            console.error('사진 촬영 실패:', error);
            Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
        }
    };

    // 프로필 사진 삭제
    const deleteProfileImage = () => {
        Alert.alert(
            '프로필 사진 삭제',
            '프로필 사진을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel'
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        setProfileImage('');
                    }
                }
            ]
        );
    };

    // 프로필 사진 변경 옵션
    const handleImagePicker = () => {
        const options = [
            {
                text: '사진 라이브러리에서 선택',
                onPress: pickImage
            },
            {
                text: '사진 촬영',
                onPress: takePhoto
            }
        ];

        // 현재 프로필 사진이 있으면 삭제 옵션 추가
        if (profileImage) {
            options.push({
                text: '프로필 사진 삭제',
                onPress: deleteProfileImage,
                style: 'destructive'
            });
        }

        options.push({
            text: '취소',
            style: 'cancel'
        });

        Alert.alert('프로필 사진 변경', '옵션을 선택해주세요', options);
    };

    // 닉네임 중복 체크 (debounced)
    const handleNicknameChange = (text) => {
        setNickname(text);
        setNicknameAvailable(null);

        // 기존 타이머 클리어
        if (nicknameCheckTimeout) {
            clearTimeout(nicknameCheckTimeout);
        }

        // 원래 닉네임과 같으면 체크 안 함
        if (text === userData?.nickname) {
            setNicknameAvailable(null);
            return;
        }

        if (text.length < 2) {
            setNicknameAvailable(null);
            return;
        }

        // 새 타이머 설정 (디바운스)
        const timeout = setTimeout(() => {
            // 실제로는 백엔드에서 저장 시점에 중복 체크를 하므로
            // 프론트에서는 기본 검증만 수행
            setNicknameAvailable(true);
        }, 500);
        
        setNicknameCheckTimeout(timeout);
    };

    const validateForm = () => {
        if (nickname.length < 2) {
            Alert.alert('오류', '닉네임은 2자 이상이어야 합니다.');
            return false;
        }

        // 비밀번호 변경 시 유효성 검사
        if (currentPassword || newPassword) {
            if (!currentPassword) {
                Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
                return false;
            }
            if (!newPassword) {
                Alert.alert('오류', '새 비밀번호를 입력해주세요.');
                return false;
            }
            if (newPassword.length < 6) {
                Alert.alert('오류', '새 비밀번호는 6자 이상이어야 합니다.');
                return false;
            }
            if (currentPassword === newPassword) {
                Alert.alert('오류', '새 비밀번호는 현재 비밀번호와 달라야 합니다.');
                return false;
            }
        }

        return true;
    };

    // Firebase 비밀번호 변경
    const changePasswordInFirebase = async () => {
        try {
            const user = auth.currentUser;
            
            if (!user || !user.email) {
                throw new Error('로그인 정보를 찾을 수 없습니다.');
            }

            // 현재 비밀번호로 재인증
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await reauthenticateWithCredential(user, credential);
            
            // 비밀번호 변경
            await updatePassword(user, newPassword);
            
            return true;
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            
            // Firebase 에러 메시지 한글화
            let errorMessage = '비밀번호 변경에 실패했습니다.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = '현재 비밀번호가 올바르지 않습니다.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '새 비밀번호가 너무 약합니다.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = '보안을 위해 다시 로그인해주세요.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = '현재 비밀번호가 올바르지 않습니다.';
            }
            
            throw new Error(errorMessage);
        }
    };

    // 프로필 저장
    const handleSave = async () => {
        if (!validateForm()) return;

        // 변경사항 확인
        const hasProfileChanges = nickname !== userData?.nickname || profileImage !== originalProfileImage;
        const hasPasswordChange = currentPassword && newPassword;

        if (!hasProfileChanges && !hasPasswordChange) {
            Alert.alert('알림', '변경된 내용이 없습니다.');
            return;
        }

        setSaving(true);
        try {
            // 1. 비밀번호 변경 (있는 경우)
            if (hasPasswordChange) {
                setChangingPassword(true);
                await changePasswordInFirebase();
                setChangingPassword(false);
            }

            // 2. 프로필 정보 변경 (있는 경우)
            if (hasProfileChanges) {
                const updateData = {};
                
                // 변경된 필드만 포함
                if (nickname !== userData?.nickname) {
                    updateData.nickname = nickname.trim();
                }
                
                // 프로필 이미지가 변경된 경우
                if (profileImage !== originalProfileImage) {
                    // 새 이미지가 있으면 추가, 없으면 null로 설정 (삭제)
                    updateData.profileImg = profileImage || null;
                    
                    // 기존 이미지가 있었고 변경되었다면 S3에서 삭제
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
                    // 닉네임 중복 오류 처리
                    if (data.code === 'MEMBER_400') {
                        throw new Error('이미 사용 중인 닉네임입니다.');
                    }
                    throw new Error(data.message || '프로필 수정에 실패했습니다.');
                }

                if (data.isSuccess && data.result) {
                    setUserData(data.result);
                    setNickname(data.result.nickname || '');
                    setProfileImage(data.result.profileImg || '');
                    setOriginalProfileImage(data.result.profileImg || '');
                }
            }

            // 비밀번호 필드 초기화
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
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={loadUserProfile}
                    >
                        <Text style={styles.retryButtonText}>다시 시도</Text>
                    </TouchableOpacity>
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
                                {uploadingImage ? (
                                    <ActivityIndicator size="large" color="#90D1BE" />
                                ) : (
                                    <>
                                        {profileImage ? (
                                            <Image 
                                                source={{ uri: profileImage }}
                                                style={styles.profileImage}
                                            />
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

                    {/* 이메일 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이메일</Text>
                        <View style={styles.disabledInput}>
                            <Text style={styles.disabledText}>{userData.email}</Text>
                        </View>
                    </View>

                    {/* 이름 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>이름</Text>
                        <View style={styles.disabledInput}>
                            <Text style={styles.disabledText}>{userData.name}</Text>
                        </View>
                    </View>

                    {/* 현재 비밀번호 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>현재 비밀번호</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="현재 비밀번호를 입력하세요"
                                placeholderTextColor="#999"
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                editable={!saving}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 새 비밀번호 섹션 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.coloredInput}
                                placeholder="새 비밀번호를 입력하세요"
                                placeholderTextColor="#999"
                                secureTextEntry={!showNewPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
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
                            placeholder="닉네임을 입력하세요"
                            placeholderTextColor="#999"
                            value={nickname}
                            onChangeText={handleNicknameChange}
                            editable={!saving}
                            maxLength={20}
                        />
                    </View>

                    {/* 저장 버튼 */}
                    <View style={styles.saveSection}>
                        <TouchableOpacity 
                            style={[
                                styles.saveButton,
                                (saving || uploadingImage) && styles.saveButtonDisabled
                            ]}
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
        padding: 20,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#90D1BE',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#FFFFFF',
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
    noImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    uploadingText: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#888',
        textAlign: 'center',
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
        color: '#90D1BE',
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
    passwordInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
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
    eyeIcon: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    coloredInput: {
        flex: 1,
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
        width: '100%',
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
    savingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    savingText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    saveText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
    uploadWarningText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#FF6B6B',
        textAlign: 'center',
    },
});

export default ProfileManagement;