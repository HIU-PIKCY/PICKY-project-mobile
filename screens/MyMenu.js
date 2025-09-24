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
    ActivityIndicator,
    RefreshControl,
    Alert,
    BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../AuthContext';

const MyMenu = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState(null);

    const { authenticatedFetch, logout } = useAuth();
    
    // 서버 API URL
    const API_BASE_URL = 'http://13.124.86.254';

    const menuItems = [
        {
            id: 1,
            title: '프로필 관리',
            icon: 'person-outline',
            route: 'ProfileManagement'
        },
        {
            id: 2,
            title: '내 활동 관리',
            icon: 'stats-chart-outline',
            route: 'ActivityManagement'
        },
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
        setError(null);
        
        try {
            console.log('프로필 API 호출 시작:', `${API_BASE_URL}/api/members/mymenu`);
            
            const response = await authenticatedFetch(`${API_BASE_URL}/api/members/mymenu`, {
                method: 'GET',
            });

            console.log('프로필 API 응답 상태:', response.status);

            if (!response.ok) {
                // 에러 응답 내용 확인
                const errorText = await response.text();
                console.log('프로필 API 에러 응답:', errorText);
                
                if (response.status === 401) {
                    throw new Error('인증이 필요합니다');
                }
                throw new Error(`프로필 조회 실패: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('프로필 API 성공 응답:', data);

            if (data.isSuccess && data.result) {
                const { user, stats } = data.result;
                
                // 받아온 데이터를 UI에 맞는 형태로 변환
                const formattedUserData = {
                    id: user.id,
                    nickname: user.nickname || user.name || '사용자',
                    email: user.email,
                    profileImage: user.profileImg,
                    stats: {
                        totalBooks: stats.totalBooks || 0,
                        questions: stats.questions || 0,
                        answers: stats.answers || 0
                    }
                };

                console.log('변환된 사용자 데이터:', formattedUserData);
                setUserData(formattedUserData);
            } else {
                throw new Error(data.message || '프로필 정보를 불러올 수 없습니다.');
            }

        } catch (error) {
            console.error('사용자 프로필 로딩 실패:', error);
            setError(error.message);
            
            // 인증 에러 처리
            if (error.message.includes('인증') || error.message.includes('401')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login')
                    }
                ]);
            } else {
                Alert.alert('오류', '프로필을 불러오는 중 오류가 발생했습니다.');
            }
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

    const handleMenuPress = (item) => {
        if (item.route) {
            navigation.navigate(item.route);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "로그아웃",
            "정말로 로그아웃 하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "로그아웃",
                    style: "destructive",
                    onPress: confirmLogout
                }
            ]
        );
    };

    const confirmLogout = async () => {
        setLoggingOut(true);
        try {
            console.log('로그아웃 시작...');
            
            // AuthContext의 logout 함수 사용
            const success = await logout();
            
            setLoggingOut(false);
            
            if (success) {
                console.log('로그아웃 완료');
                Alert.alert('로그아웃 완료', '로그아웃되었습니다.');
            } else {
                Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.");
            }
            
        } catch (error) {
            console.error('로그아웃 실패:', error);
            setLoggingOut(false);
            Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.");
        }
    };

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#666666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4B4B4B" />
        </TouchableOpacity>
    );

    const renderProfileImage = () => {
        if (userData?.profileImage) {
            return (
                <Image
                    source={{ uri: userData.profileImage }}
                    style={styles.profileImage}
                    onError={() => {
                        console.log('프로필 이미지 로딩 실패:', userData.profileImage);
                        // 이미지 로딩 실패 시 기본 아바타로 대체
                        setUserData(prev => ({
                            ...prev,
                            profileImage: null
                        }));
                    }}
                />
            );
        } else {
            return (
                <Ionicons name="person" size={30} color="#90D1BE" />
            );
        }
    };

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>프로필을 불러올 수 없습니다</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
                style={styles.retryButton} 
                onPress={loadUserProfile}
            >
                <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !userData) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <CustomHeader
                    title="마이"
                    onBackPress={handleGoBack}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                    <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !userData) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <CustomHeader
                    title="마이"
                    onBackPress={handleGoBack}
                />
                {renderError()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="마이"
                onBackPress={handleGoBack}
            />

            {/* 에러 배너 */}
            {error && userData && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>최신 정보를 불러오지 못했습니다. 새로고침해보세요.</Text>
                </View>
            )}

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
                {userData && (
                    <>
                        {/* 프로필 섹션 */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileInfo}>
                                <View style={styles.avatar}>
                                    {renderProfileImage()}
                                </View>
                                <View style={styles.profileText}>
                                    <Text style={styles.userName}>{userData.nickname}</Text>
                                    <Text style={styles.userEmail}>{userData.email}</Text>
                                </View>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userData.stats.totalBooks}</Text>
                                    <Text style={styles.statLabel}>총 독서량</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userData.stats.questions}</Text>
                                    <Text style={styles.statLabel}>질문</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userData.stats.answers}</Text>
                                    <Text style={styles.statLabel}>답변</Text>
                                </View>
                            </View>
                        </View>

                        {/* 메뉴 섹션 */}
                        <View style={styles.menuSection}>
                            {menuItems.map(renderMenuItem)}
                        </View>

                        {/* 로그아웃 버튼 */}
                        <View style={styles.logoutSection}>
                            <TouchableOpacity
                                style={[
                                    styles.logoutButton,
                                    loggingOut && styles.logoutButtonDisabled
                                ]}
                                onPress={handleLogout}
                                disabled={loggingOut}
                                activeOpacity={0.8}
                            >
                                {loggingOut ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.logoutText}>로그아웃</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#90D1BE',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: '#FFF3CD',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#FFEAA7',
    },
    errorBannerText: {
        fontSize: 12,
        color: '#856404',
        textAlign: 'center',
    },
    profileSection: {
        padding: 24,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileText: {
        flex: 1,
    },
    userName: {
        fontSize: 19,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '500',
        letterSpacing: -0.4,
        color: '#0D2525',
        marginBottom: 6,
    },
    userEmail: {
        fontSize: 15,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.3,
        color: '#666666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3FCF9',
        borderRadius: 12,
        paddingVertical: 20,
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '500',
        color: '#0D2525',
        letterSpacing: -0.45,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '400',
        fontSize: 15,
        letterSpacing: -0.35,
        color: '#666666',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E8E8E8',
    },
    menuSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 15,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        color: '#0D2525',
        letterSpacing: -0.3,
        marginLeft: 12,
    },
    logoutSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    logoutButton: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#0D2525',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
});

export default MyMenu;