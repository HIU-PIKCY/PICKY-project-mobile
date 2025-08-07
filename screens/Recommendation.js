import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import LogoSVG from "../assets/icons/logoIcon.svg";
import CustomHeader from '../components/CustomHeader';

const Recommendation = ({ navigation }) => {
    const [recommendationData, setRecommendationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 개선된 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyRecommendationData = {
        questionBased: {
            book: {
                id: 1,
                title: '노스텔지어, 어느 위험한 감정의 연대기',
                author: '애그니스 아널드포스터',
                publisher: '어크로스',
                pages: 320,
                coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg',
                description: '문학 작품 해석에 관심이 많은 회원님께 추천'
            },
            reason: '작가의 의도는?'
        },
        answerBased: {
            book: {
                id: 2,
                title: '운수 좋은 날',
                author: '현진건',
                publisher: '소담출판사',
                pages: 231,
                coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg',
                description: '한국 근대문학의 대표작으로 섬세한 묘사를 좋아하는 회원님께 추천'
            },
            reason: '어린 왕자'
        },
        keywordBased: {
            book: {
                id: 3,
                title: '데미안',
                author: '헤르만 헤세',
                publisher: '민음사',
                pages: 288,
                coverImage: 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/044_%EB%8D%B0%EB%AF%B8%EC%95%88-300x504.jpg',
                description: '성장과 변화를 다루는 성장 소설에 관심이 많은 회원님께 추천'
            },
            keywords: ['성장', '변화']
        }
    };

    useEffect(() => {
        loadRecommendations();
    }, []);

    // 화면 포커스 시 추천 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            loadRecommendations();
        }, [])
    );

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getUserRecommendations(userId);
            // setRecommendationData(response.data);
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setRecommendationData(dummyRecommendationData);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('추천 데이터 로딩 실패:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRecommendations();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleBookPress = (book) => {
        navigation.navigate("BookDetail", {
            bookId: book.id,
            bookData: book,
        });
    };

    const renderBookCard = (bookData) => {
        return (
            <TouchableOpacity 
                style={styles.bookCard} 
                onPress={() => handleBookPress(bookData.book)}
                activeOpacity={0.7}
            >
                <View style={styles.bookImagePlaceholder}>
                    <Image 
                        source={{ uri: bookData.book.coverImage }} 
                        style={styles.bookImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{bookData.book.title}</Text>
                    <Text style={styles.bookAuthor}>{bookData.book.author}</Text>
                    <Text style={styles.bookDescription}>{bookData.book.description}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>추천할 도서가 없습니다</Text>
            <Text style={styles.emptySubText}>더 많은 질문과 답변에 참여해보세요!</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="추천 도서" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                </View>
            </SafeAreaView>
        );
    }

    if (!recommendationData) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="추천 도서" onBackPress={handleGoBack} />
                {renderEmptyState()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="추천 도서"
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
                {/* 상단 안내 메시지 */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <LogoSVG width={29} height={29} />
                    </View>
                    <Text style={styles.infoText}>
                        회원님이 참여한 질문과 답변을 분석하여 관심사에 맞는 도서를 추천해드려요.
                    </Text>
                </View>

                {/* 민트색 배경 컨테이너 */}
                <View style={styles.roundedContainer}>
                    {/* 질문 내용 기반 섹션 */}
                    {recommendationData.questionBased && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionQuestionContainer}>
                                    <View style={styles.highlightTag}>
                                        <Ionicons name="bulb-outline" size={16} color="#666666" style={{marginRight: 4}} />
                                        <Text style={styles.highlightText}>"{recommendationData.questionBased.reason}"</Text>
                                    </View>
                                    <Text style={styles.normalText}> 을 참고했어요!</Text>
                                </View>
                                <Text style={styles.sectionTitle}>질문 내용 기반</Text>
                            </View>
                            {renderBookCard(recommendationData.questionBased)}
                        </View>
                    )}

                    {/* 답변 내용 기반 섹션 */}
                    {recommendationData.answerBased && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionQuestionContainer}>
                                    <View style={styles.highlightTag}>
                                        <Ionicons name="newspaper-outline" size={16} color="#666666" style={{marginRight: 4}} />
                                        <Text style={styles.highlightText}>{recommendationData.answerBased.reason}</Text>
                                    </View>
                                    <Text style={styles.normalText}> 에서 가져왔어요!</Text>
                                </View>
                                <Text style={styles.sectionTitle}>답변 내용 기반</Text>
                            </View>
                            {renderBookCard(recommendationData.answerBased)}
                        </View>
                    )}

                    {/* 자주 언급한 키워드 섹션 */}
                    {recommendationData.keywordBased && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionQuestionContainer}>
                                    {recommendationData.keywordBased.keywords.map((keyword, index) => (
                                        <View key={index} style={styles.highlightTag}>
                                            <Text style={styles.highlightText}># {keyword}</Text>
                                        </View>
                                    ))}
                                    <Text style={styles.normalText}> 에 주목했어요!</Text>
                                </View>
                                <Text style={styles.sectionTitle}>자주 언급한 키워드</Text>
                            </View>
                            {renderBookCard(recommendationData.keywordBased)}
                        </View>
                    )}
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
        paddingHorizontal: 20,
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
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: 90,
        paddingHorizontal: 30,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: '#F3FCF9',
        marginTop: 25,
        marginBottom: 30,
        shadowColor: '#90D1BE',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    infoIcon: {
        marginRight: 15,
    },
    infoText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        color: '#666',
        letterSpacing: -0.4,
        lineHeight: 20,
    },
    roundedContainer: {
        backgroundColor: '#F3FCF9',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        marginHorizontal: -20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    questionBadge: {
        backgroundColor: '#D8F3F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    sectionQuestionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionQuestion: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666666',
    },
    highlightTag: {
        backgroundColor: '#90D1BE40',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 4,
        marginBottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    highlightText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.4,
        color: '#666666',
    },
    normalText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.4,
        color: '#666666',
    },
    sectionTitle: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.45,
        color: '#0D2525',
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#90D1BE',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    bookImagePlaceholder: {
        width: 90,
        height: 120,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        marginRight: 18,
        overflow: 'hidden',
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookTitle: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 17,
        fontWeight: '600',
        color: '#0D2525',
        letterSpacing: -0.4,
        marginBottom: 8,
        lineHeight: 22,
    },
    bookAuthor: {
        fontFamily: 'SUIT-Medeum',
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
        letterSpacing: -0.35,
        marginBottom: 8,
    },
    bookDescription: {
        fontFamily: 'SUIT-Medeum',
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
        letterSpacing: -0.35,
        lineHeight: 20,
    },
});

export default Recommendation;