import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const ActivityManagement = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('question'); // 'question', 'answer', 'like'
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [data, setData] = useState({
        questions: [],
        answers: [],
        likes: []
    });

    // 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyData = {
        questions: [
            {
                id: 1,
                title: '작가의 의도는?',
                author: '현진건',
                book: '운수 좋은 놈',
                likes: 5,
                comments: 3,
                views: 11,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                title: '주인공의 심리 변화 과정은?',
                author: '현진건',
                book: '운수 좋은 놈',
                likes: 8,
                comments: 5,
                views: 23,
                createdAt: '2024-01-14T15:20:00Z'
            }
        ],
        answers: [
            {
                id: 1,
                title: '작가는 이런 의미로 표현한 것 같아요.',
                questionTitle: '[작가의 의도는?]',
                questionId: 1,
                likes: 5,
                comments: 3,
                views: 11,
                createdAt: '2024-01-15T11:30:00Z'
            },
            {
                id: 2,
                title: '제 생각에는 주인공의 심리상태를 잘 지켜봐야 한다고 생각해요.',
                questionTitle: '[등장인물 분석 도움]',
                questionId: 3,
                likes: 12,
                comments: 7,
                views: 45,
                createdAt: '2024-01-14T16:45:00Z'
            }
        ],
        likes: [
            {
                id: 1,
                title: '캐릭터 디자인할 때 주의점?',
                author: '질문',
                time: '3일 전',
                likes: 15,
                comments: 8,
                views: 32,
                type: 'question',
                originalId: 5,
                likedAt: '2024-01-12T14:20:00Z'
            },
            {
                id: 2,
                title: '스토리 구조를 탄탄하게 만들려면 이렇게 저렇게 해야 좋은 이야기가 될 것 같아요',
                author: '답변',
                time: '1주 전',
                likes: 23,
                comments: 12,
                views: 67,
                type: 'answer',
                originalId: 8,
                likedAt: '2024-01-08T09:15:00Z'
            }
        ]
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // const response = await apiService.getUserActivity(userId, activeTab);
            // setData(prev => ({ ...prev, [activeTab]: response.data }));
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setData(dummyData);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleItemPress = (item, type) => {
        // 타입별로 다른 화면으로 네비게이션
        switch (type) {
            case 'question':
                navigation.navigate('QuestionDetail', { questionId: item.id });
                break;
            case 'answer':
                navigation.navigate('QuestionDetail', { 
                    questionId: item.questionId, 
                    highlightAnswerId: item.id 
                });
                break;
            case 'like':
                const targetScreen = 'QuestionDetail';
                const params = item.type === 'question' 
                    ? { questionId: item.originalId }
                    : { questionId: item.originalId, highlightAnswerId: item.id };
                navigation.navigate(targetScreen, params);
                break;
        }
    };

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
        <View key={`${type}-${item.id}`} style={styles.activityItemWrapper}>
            <TouchableOpacity 
                style={styles.activityItem}
                onPress={() => handleItemPress(item, type)}
                activeOpacity={0.7}
            >
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
                return data.questions || [];
            case 'answer':
                return data.answers || [];
            case 'like':
                return data.likes || [];
            default:
                return [];
        }
    };

    // 빈 아이템 시 화면
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons 
                name={
                    activeTab === 'question' ? 'help-circle-outline' :
                    activeTab === 'answer' ? 'chatbubble-outline' :
                    'heart-outline'
                } 
                size={48} 
                color="#CCCCCC" 
            />
            <Text style={styles.emptyText}>
                {activeTab === 'question' ? '작성한 질문이 없습니다' :
                 activeTab === 'answer' ? '작성한 답변이 없습니다' :
                 '좋아요한 게시물이 없습니다'}
            </Text>
        </View>
    );

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
                {loading && getCurrentData().length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#90D1BE" />
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.activityList} 
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
                        {getCurrentData().length > 0 ? (
                            getCurrentData().map((item) => 
                                renderActivityItem(item, activeTab)
                            )
                        ) : (
                            renderEmptyState()
                        )}
                    </ScrollView>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#999999',
        marginTop: 16,
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