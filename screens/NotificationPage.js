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

const NotificationPage = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [readNotifications, setReadNotifications] = useState([]);

    // 더미 알림 데이터 - 실제 구현 시 API 호출로 대체
    const dummyNotifications = {
        notifications: [
            {
                id: 1,
                type: 'answer',
                profileImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=faces&fit=crop&w=200&h=200',
                name: '미역말고 오이냉국',
                time: '5시간 전',
                isNew: true,
                questionId: 123,
                answerId: null
            },
            {
                id: 2,
                type: 'like',
                profileImage: 'https://images.unsplash.com/photo-1507149833265-60c372daea22?crop=faces&fit=crop&w=200&h=200',
                name: '첫사랑니',
                time: '5시간 전',
                isNew: true,
                questionId: 124,
                answerId: 456
            },
            {
                id: 3,
                type: 'like',
                profileImage: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=faces&fit=crop&w=200&h=200',
                name: '야호',
                time: '1일 전',
                isNew: false,
                questionId: 125,
                answerId: 789
            },
            {
                id: 4,
                type: 'popular',
                profileImage: null,
                name: null,
                time: '3일 전',
                isNew: false,
                questionId: 126,
                answerId: null
            },
            {
                id: 5,
                type: 'popular',
                profileImage: null,
                name: null,
                time: '7일 전',
                isNew: false,
                questionId: 127,
                answerId: null
            }
        ],
        totalCount: 5,
        unreadCount: 2,
        hasMore: false
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    // 화면을 벗어날 때 모든 알림 읽음 처리
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                // 화면을 벗어날 때 실행
                markAllAsRead();
            };
        }, [])
    );

    const loadNotifications = async () => {
        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getNotifications();
            // setNotifications(response.data.notifications);
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setNotifications(dummyNotifications.notifications);
                setLoading(false);
            }, 300);
        } catch (error) {
            console.error('알림 목록 로딩 실패:', error);
            setLoading(false);
            Alert.alert('오류', '알림을 불러올 수 없습니다.');
        }
    };

    const markAllAsRead = async () => {
        try {
            // 실제 구현 시 API 호출
            // await apiService.markAllNotificationsAsRead();
            
            // 더미 모든 알림 읽음 처리
            const newNotificationIds = dummyNotifications.notifications
                .filter(notification => notification.isNew)
                .map(notification => notification.id);
            
            if (newNotificationIds.length > 0) {
                setReadNotifications(prev => [...prev, ...newNotificationIds]);
            }
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
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
            // 관련 페이지로 이동 (읽음 처리는 페이지 진입 시 이미 완료)
            switch (notification.type) {
                case 'answer':
                case 'like':
                case 'popular':
                    navigation.navigate('QuestionDetail', { 
                        questionId: notification.questionId 
                    });
                    break;
            }
        } catch (error) {
            console.error('알림 처리 실패:', error);
            Alert.alert('오류', '알림 처리 중 오류가 발생했습니다.');
        }
    };

    const getMessage = (item) => {
        switch (item.type) {
            case 'answer':
                return (
                    <>
                        <Text style={styles.nameText}>{item.name}</Text>
                        님이 회원님의 질문에 답변을 남겼습니다.
                    </>
                );
            case 'like':
                return (
                    <>
                        <Text style={styles.nameText}>{item.name}</Text>
                        님이 회원님의 답변에 좋아요를 눌렀습니다.
                    </>
                );
            case 'popular':
                return <>회원님이 작성한 게시글이 주목받고 있어요!</>;
            default:
                return null;
        }
    };

    const renderNotificationItem = (item) => {
        const isRead = readNotifications.includes(item.id) || !item.isNew;
        return (
            <TouchableOpacity
                key={item.id}
                onPress={() => handlePressNotification(item)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.notificationItem,
                        { backgroundColor: isRead ? '#FFFFFF' : '#F4FAF8' }
                    ]}
                >
                    <View style={styles.notificationContent}>
                        <View style={styles.iconContainer}>
                            {item.profileImage ? (
                                <Image
                                    source={{ uri: item.profileImage }}
                                    style={styles.profileImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LogoSVG width={35} height={35} />
                            )}
                        </View>
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>
                                {getMessage(item)}
                            </Text>
                            <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.separator} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <CustomHeader title="알림" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

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
                {notifications.map(renderNotificationItem)}
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
        fontWeight: 600,
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