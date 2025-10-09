import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import LogoSVG from "../assets/icons/logoIcon.svg";
import { useAuth } from "../AuthContext";

const API_BASE_URL = "http://13.124.86.254";

const NotificationPage = ({ navigation }) => {
    const { authenticatedFetch } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    // 화면 포커스 시 알림 목록 새로고침
    useFocusEffect(
        React.useCallback(() => {
            loadNotifications();
        }, [])
    );

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/notifications`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error(`알림 목록 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                setNotifications(data.result);
            }
        } catch (error) {
            console.error('알림 목록 로딩 실패:', error);
            Alert.alert('오류', '알림을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handlePressNotification = async (notification) => {
        try {
            // 읽지 않은 알림인 경우 읽음 처리
            if (!notification.isRead) {
                await markNotificationAsRead(notification.id);
            }

            // 관련 페이지로 이동
            navigation.navigate('QuestionDetail', { 
                questionId: notification.questionId 
            });
        } catch (error) {
            console.error('알림 처리 실패:', error);
            Alert.alert('오류', '알림 처리 중 오류가 발생했습니다.');
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/notifications/${notificationId}/read`,
                {
                    method: 'PATCH',
                }
            );

            if (!response.ok) {
                throw new Error(`알림 읽음 처리 실패! status: ${response.status}`);
            }

            // 로컬 상태 업데이트
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMinutes < 1) {
                return '방금 전';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}분 전`;
            } else if (diffHours < 24) {
                return `${diffHours}시간 전`;
            } else if (diffDays < 7) {
                return `${diffDays}일 전`;
            } else {
                return date.toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric'
                }).replace(/\. /g, '/').slice(0, -1);
            }
        } catch {
            return dateString;
        }
    };

    const getNotificationMessage = (notification) => {
        const { notificationType, content } = notification;
        
        switch (notificationType) {
            case 'NEW_ANSWER':
                return content || '회원님의 질문에 답변이 달렸습니다.';
            case 'NEW_REPLY':
                return content || '회원님의 답변에 대댓글이 달렸습니다.';
            case 'QUESTION_LIKE':
                return content || '회원님의 질문에 좋아요가 눌렸습니다.';
            case 'VIEW_COUNT':
                return content || '회원님이 작성한 게시글이 주목받고 있어요!';
            default:
                return content || '새로운 알림이 있습니다.';
        }
    };

    const getProfileImage = (notification) => {
        // NEW_ANSWER, NEW_REPLY, QUESTION_LIKE는 프로필 이미지가 있을 수 있음
        // VIEW_COUNT는 로고 표시
        if (notification.notificationType === 'VIEW_COUNT') {
            return null;
        }
        
        // 백엔드에서 프로필 이미지를 제공하지 않으므로 기본 처리
        // 추후 백엔드에서 프로필 이미지를 포함하도록 수정 필요
        return null;
    };

    const renderNotificationItem = (item) => {
        const profileImage = getProfileImage(item);
        
        return (
            <TouchableOpacity
                key={item.id}
                onPress={() => handlePressNotification(item)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.notificationItem,
                        { backgroundColor: item.isRead ? '#FFFFFF' : '#F4FAF8' }
                    ]}
                >
                    <View style={styles.notificationContent}>
                        <View style={styles.iconContainer}>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.profileImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LogoSVG width={35} height={35} />
                            )}
                        </View>
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>
                                {getNotificationMessage(item)}
                            </Text>
                            <Text style={styles.timeText}>
                                {formatTimeAgo(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.separator} />
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>알림이 없습니다</Text>
            <Text style={styles.emptySubText}>새로운 알림이 오면 여기에 표시됩니다.</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="알림" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                    <Text style={styles.loadingText}>알림을 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <CustomHeader
                title="알림"
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
                {notifications.length > 0 ? (
                    notifications.map(renderNotificationItem)
                ) : (
                    renderEmptyState()
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
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'SUIT-SemiBold',
        color: '#999999',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        color: '#CCCCCC',
        marginTop: 8,
        textAlign: 'center',
    },
    notificationItem: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    messageContainer: {
        flex: 1,
        paddingTop: 2,
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#0D2525',
        lineHeight: 22,
        letterSpacing: -0.35,
        marginBottom: 6,
    },
    nameText: {
        fontFamily: 'SUIT-Bold',
        fontWeight: '600',
        color: '#0D2525',
    },
    timeText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        letterSpacing: -0.3,
    },
    separator: {
        height: 1,
        backgroundColor: '#E8E8E8',
    },
});

export default NotificationPage;