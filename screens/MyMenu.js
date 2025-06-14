import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const MyMenu = ({ navigation }) => {
    // 더미 유저 데이터
    const userData = {
        nickname: '키피럽',
        email: 'keepitup@example.com',
        stats: {
            totalBooks: 12,
            questions: 8,
            answers: 16
        }
    };

    const menuItems = [
        { id: 1, title: '내 프로필', icon: 'person-outline' },
        { id: 2, title: '내 서재 관리', icon: 'library-outline' },
        { id: 3, title: '질문/답변 관리', icon: 'chatbubble-outline' },
    ];

    const renderMenuItem = (item) => (
        <TouchableOpacity key={item.id} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#666666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#DBDBDB" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="마이"
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 섹션 */}
                <View style={styles.profileSection}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="#666" />
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
        padding: 20,
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
    },
    profileText: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontFamily: 'SUIT-SemiBold',
        letterSpacing: -0.4,
        color: '#0D2525',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: 500,
        color: '#0D2525',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#DBDBDB',
    },
    menuSection: {
        paddingHorizontal: 20,
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
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 12,
    },
    logoutSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        width: 150,
        margin: 20,
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#0D2525',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#FFFFFF',
    },
});

export default MyMenu;