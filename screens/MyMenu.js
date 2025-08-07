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
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const MyMenu = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    // 개선된 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyUserData = {
        nickname: '키피럽',
        email: 'keepitup@example.com',
        profileImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=center',
        stats: {
            totalBooks: 12,
            questions: 8,
            answers: 16
        }
    };

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
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getUserProfile(userId);
            // setUserData(response.data);
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setUserData(dummyUserData);
                setLoading(false);
            }, 300);
        } catch (error) {
            console.error('사용자 프로필 로딩 실패:', error);
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
            // 실제 구현 시 API 호출
            // await apiService.logout(refreshToken);
            
            // 더미 로그아웃 시뮬레이션
            setTimeout(() => {
                setLoggingOut(false);
                // 로그인 화면으로 이동하거나 앱 상태 초기화
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }, 1000);
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
                </View>
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