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
    RefreshControl,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../AuthContext';

const ActivityManagement = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('question');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    
    const [data, setData] = useState({
        questions: [],
        answers: [],
        likes: []
    });

    const { authenticatedFetch } = useAuth();
    const API_BASE_URL = 'http://13.124.86.254';

    const getEndpoint = (tab) => {
        switch (tab) {
            case 'question':
                return '/api/members/questions';
            case 'answer':
                return '/api/members/answers';
            case 'like':
                return '/api/members/question-likes';
            default:
                return '/api/members/questions';
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const endpoint = getEndpoint(activeTab);
            const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('인증이 필요합니다');
                }
                throw new Error(`활동 데이터 조회 실패: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData.isSuccess && responseData.result) {
                let formattedData = [];

                if (activeTab === 'question' && responseData.result.questions) {
                    formattedData = responseData.result.questions.map(item => ({
                        id: item.id,
                        title: item.title,
                        author: item.author,
                        book: item.book,
                        likes: item.likes || 0,
                        comments: item.comments || 0,
                        views: item.views || 0,
                        createdAt: item.createdAt || new Date().toISOString()
                    }));
                } else if (activeTab === 'answer' && responseData.result.answers) {
                    formattedData = responseData.result.answers.map(item => ({
                        id: item.id,
                        title: item.title,
                        questionTitle: item.questionTitle,
                        questionId: item.questionId,
                        createdAt: item.createdAt || new Date().toISOString()
                    }));
                } else if (activeTab === 'like' && responseData.result.likes) {
                    formattedData = responseData.result.likes.map(item => ({
                        id: item.id,
                        title: item.title,
                        author: item.author,
                        time: item.time,
                        likes: item.likes || 0,
                        comments: item.comments || 0,
                        views: item.views || 0,
                        type: item.type,
                        originalId: item.originalId,
                        likedAt: item.likedAt || new Date().toISOString()
                    }));
                }

                const stateKey = activeTab === 'question' ? 'questions' : 
                               activeTab === 'answer' ? 'answers' : 'likes';
                
                setData(prev => ({ ...prev, [stateKey]: formattedData }));
            } else {
                const stateKey = activeTab === 'question' ? 'questions' : 
                               activeTab === 'answer' ? 'answers' : 'likes';
                setData(prev => ({ ...prev, [stateKey]: [] }));
            }

        } catch (error) {
            console.error('활동 데이터 로딩 실패:', error);
            setError(error.message);
            
            if (error.message.includes('인증') || error.message.includes('401')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login')
                    }
                ]);
            } else {
                Alert.alert('오류', '활동 데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
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
                    <Text style={styles.activityMeta} numberOfLines={1} ellipsizeMode="tail">
                        {type === 'question' ? `${item.book} | ${item.author}` : 
                         type === 'answer' ? item.questionTitle :
                         `${item.author} | ${item.time}`}
                    </Text>
                    {/* 답변 탭이 아닐 때만 통계 표시 */}
                    {type !== 'answer' && (
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
                    )}
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

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>데이터를 불러오지 못했습니다. 새로고침해보세요.</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.tabHeader}>
                    {renderTabButton('question', '질문')}
                    {renderTabButton('answer', '답변')}
                    {renderTabButton('like', '좋아요')}
                </View>

                {loading && getCurrentData().length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#90D1BE" />
                        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
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
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
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
    activityTitle: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: 500,
        color: '#0D2525',
        lineHeight: 24,
        marginBottom: 8,
        letterSpacing: -0.35,
    },
    activityInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activityMeta: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#666666',
        letterSpacing: -0.3,
        flex: 1,
        marginRight: 16,
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