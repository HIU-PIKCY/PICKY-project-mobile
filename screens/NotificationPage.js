import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
    TouchableOpacity
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import LogoSVG from "../assets/icons/logoIcon.svg";

const NotificationPage = ({ navigation }) => {
    const handleGoBack = () => {
        navigation.goBack();
    };

    const [readNotifications, setReadNotifications] = useState([]);

    // 더미 알림 데이터
    const notifications = [
        {
            id: 1,
            type: 'answer',
            profileImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=faces&fit=crop&w=200&h=200',
            name: '미역말고 오이냉국',
            time: '5시간 전',
            isNew: true,
        },
        {
            id: 2,
            type: 'like',
            profileImage: 'https://images.unsplash.com/photo-1507149833265-60c372daea22?crop=faces&fit=crop&w=200&h=200',
            name: '첫사랑니',
            time: '5시간 전',
            isNew: true,
        },
        {
            id: 3,
            type: 'like',
            profileImage: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=faces&fit=crop&w=200&h=200',
            name: '야호',
            time: '1일 전',
            isNew: false,
        },
        {
            id: 4,
            type: 'popular',
            profileImage: null,
            name: null,
            time: '3일 전',
            isNew: false,
        },
        {
            id: 5,
            type: 'popular',
            profileImage: null,
            name: null,
            time: '7일 전',
            isNew: false,
        }
    ];

    const handlePressNotification = (id) => {
        setReadNotifications((prev) => [...prev, id]);
        // 추후 게시글 이동 기능 추가 가능
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
                onPress={() => handlePressNotification(item.id)}
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <CustomHeader
                title="알림"
                onBackPress={handleGoBack}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
