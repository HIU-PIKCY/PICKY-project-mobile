import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const MyMenu = ({ navigation }) => {
    // 더미 유저 데이터
    const userData = {
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
        { id: 1, title: '프로필 관리', icon: 'person-outline' },
        { id: 2, title: '내 활동 관리', icon: 'stats-chart-outline' },
    ];

    const handleGoBack = () => {
        navigation.goBack();
    };

    const renderMenuItem = (item) => (
        <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#666666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4B4B4B" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="마이"
                onBackPress={handleGoBack}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 섹션 */}
                <View style={styles.profileSection}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Image 
                                source={{ uri: userData.profileImage }}
                                style={styles.profileImage}
                            />
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
                    <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
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
        fontWeight: 500,
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
        fontWeight: 500,
        color: '#0D2525',
        letterSpacing: -0.45,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'SUIT-SemiBold',
        fontWeight: 400,
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
        fontWeight: 500,
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
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: 500,
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
});

export default MyMenu;