import React, { useState } from 'react';
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

const ActivityManagement = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('question'); // 'question', 'answer', 'like'

    const handleGoBack = () => {
        navigation.goBack();
    };

    // 더미 데이터
    const questionData = [
        {
            id: 1,
            title: '작가의 의도는?',
            author: '현진건',
            book: '운수 좋은 놈',
            likes: 5,
            comments: 3,
            views: 11
        },
        {
            id: 2,
            title: '작가의 의도는?',
            author: '현진건',
            book: '운수 좋은 놈',
            likes: 5,
            comments: 3,
            views: 11
        }
    ];

    const answerData = [
        {
            id: 1,
            title: '작가는 이런 의미로 표현한 것 같아요.',
            questionTitle: '[작가의 의도는?]',
            likes: 5,
            comments: 3,
            views: 11
        },
        {
            id: 2,
            title: '제 생각에는 주인공의 심리상태를 잘 지켜봐야 한다고 생각해요.',
            questionTitle: '[등장인물 분석 도움]',
            likes: 5,
            comments: 3,
            views: 11
        }
    ];

    const likeData = [
        {
            id: 1,
            title: '캐릭터 디자인할 때 주의점?',
            author: '질문',
            time: '3일 전',
            likes: 5,
            comments: 3,
            views: 11
        },
        {
            id: 2,
            title: '스토리 구조를 탄탄하게 만들려면 이렇게 저렇게 해야 좋은 이야기가 될 것 같아요',
            author: '답변',
            time: '1주 전',
            likes: 5,
            comments: 3,
            views: 11
        }
    ];

    const renderTabButton = (tabKey, title) => (
        <TouchableOpacity
            key={tabKey}
            style={[
                styles.tabButton,
                activeTab === tabKey && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tabKey)}
        >
            <Text style={[
                styles.tabText,
                activeTab === tabKey && styles.activeTabText
            ]}>
                {title}
            </Text>
            {activeTab === tabKey && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
    );

    const renderActivityItem = (item, type) => (
        <View key={item.id} style={styles.activityItemWrapper}>
            <TouchableOpacity style={styles.activityItem}>
                <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                </Text>
                <View style={styles.activityInfoRow}>
                    <Text style={styles.activityMeta}>
                        {type === 'question' ? `${item.book} | ${item.author}` : 
                         type === 'answer' ? item.questionTitle :
                         `${item.author} | ${item.time}`}
                    </Text>
                    <View style={styles.activityStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="heart-outline" size={16} color="#666666" />
                            <Text style={styles.statText}>{item.likes}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                            <Text style={styles.statText}>{item.comments}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={16} color="#666666" />
                            <Text style={styles.statText}>{item.views}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.divider} />
        </View>
    );

    const getCurrentData = () => {
        switch (activeTab) {
            case 'question':
                return questionData;
            case 'answer':
                return answerData;
            case 'like':
                return likeData;
            default:
                return [];
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <CustomHeader
                title="내 활동 관리"
                onBackPress={handleGoBack}
            />

            <View style={styles.content}>
                {/* 탭 헤더 */}
                <View style={styles.tabHeader}>
                    {renderTabButton('question', '질문')}
                    {renderTabButton('answer', '답변')}
                    {renderTabButton('like', '좋아요')}
                </View>

                {/* 활동 목록 */}
                <ScrollView style={styles.activityList} showsVerticalScrollIndicator={false}>
                    {getCurrentData().map((item) => 
                        renderActivityItem(item, activeTab)
                    )}
                </ScrollView>
            </View>
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
    tabHeader: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        position: 'relative',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        position: 'relative',
    },
    activeTabButton: {
        position: 'relative',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: -13,
        left: '20%',
        right: '20%',
        height: 1.5,
        backgroundColor: '#90D1BE',
        borderRadius: 1,
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: 500,
        color: '#888888',
        letterSpacing: -0.35,
    },
    activeTabText: {
        color: '#0D2525',
        fontFamily: 'SUIT-SemiBold',
    },
    activityList: {
        flex: 1,
    },
    activityItemWrapper: {
        width: '100%',
    },
    activityItem: {
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        width: '100%',
    },
    activityContent: {
        marginBottom: 12,
    },
    activityTitle: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: 500,
        color: '#0D2525',
        lineHeight: 24,
        marginBottom: 8,
        letterSpacing: -0.35,
        numberOfLines: 1,
        overflow: 'hidden',
    },
    activityInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityMeta: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
        letterSpacing: -0.3,
    },
    activityStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    statText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
        marginLeft: 4,
    },
});

export default ActivityManagement;