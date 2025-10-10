import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    RefreshControl,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import LogoSVG from "../assets/icons/logoIcon.svg";
import CustomHeader from '../components/CustomHeader';
import { useAuth } from "../AuthContext";
import { styles } from '../styles/RecommendationStyle';

// 백엔드 서버 url
const API_BASE_URL = "http://13.124.86.254";

const Recommendation = ({ navigation }) => {
    const { authenticatedFetch } = useAuth();
    
    const [recommendationData, setRecommendationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const skipNextFocus = useRef(false); // 다음 포커스를 스킵할지 여부
    const isInitialMount = useRef(true); // 초기 마운트 여부

    useEffect(() => {
        // 초기 마운트 시 데이터 로드
        loadRecommendations(true);
        isInitialMount.current = false;
    }, []);

    // 화면 포커스 시 API 호출
    useFocusEffect(
        React.useCallback(() => {
            // 초기 마운트는 useEffect에서 처리하므로 스킵
            if (isInitialMount.current) {
                return;
            }

            // skipNextFocus가 true면 이번 포커스는 스킵 (북카드에서 돌아온 경우)
            if (skipNextFocus.current) {
                skipNextFocus.current = false;
                return;
            }
            
            // 네비게이션으로 재진입한 경우 API 호출
            loadRecommendations(true);
        }, [])
    );

    const loadRecommendations = async (showLoading = false) => {
        if (showLoading) {
            setLoading(true);
        }
        
        const startTime = Date.now();
        
        try {
            await Promise.all([
                loadQuestionBasedRecommendation(),
                loadAnswerBasedRecommendation(),
                loadPickyPickRecommendation()
            ]);
            
            // 로딩을 표시하는 경우에만 최소 2초 보장
            if (showLoading) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 2000 - elapsedTime);
                
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }
            }
        } catch (error) {
            console.error('추천 데이터 로딩 실패:', error);
            
            // 에러가 발생해도 로딩 표시 중이면 최소 2초는 유지
            if (showLoading) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 2000 - elapsedTime);
                
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // 질문 기반 추천 로드
    const loadQuestionBasedRecommendation = async () => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/recommendations/question-based`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error(`질문 기반 추천 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                setRecommendationData(prev => ({
                    ...prev,
                    questionBased: {
                        book: {
                            id: data.result.book.id,
                            title: data.result.book.title,
                            author: data.result.book.author,
                            coverImage: data.result.book.coverImage,
                            isbn: data.result.book.isbn,
                            description: data.result.book.description
                        },
                        relatedQuestionId: data.result.relatedQuestionId,
                        relatedQuestionTitle: data.result.relatedQuestionTitle
                    }
                }));
            }
        } catch (error) {
            console.error('질문 기반 추천 로딩 실패:', error);
            setRecommendationData(prev => ({ ...prev, questionBased: null }));
        }
    };

    // 답변 기반 추천 로드
    const loadAnswerBasedRecommendation = async () => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/recommendations/answer-based`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error(`답변 기반 추천 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                setRecommendationData(prev => ({
                    ...prev,
                    answerBased: {
                        book: {
                            id: data.result.book.id,
                            title: data.result.book.title,
                            author: data.result.book.author,
                            coverImage: data.result.book.coverImage,
                            isbn: data.result.book.isbn,
                            description: data.result.book.description
                        },
                        relatedAnswerId: data.result.relatedAnswerId,
                        relatedAnswerBookTitle: data.result.relatedAnswerBookTitle
                    }
                }));
            }
        } catch (error) {
            console.error('답변 기반 추천 로딩 실패:', error);
            setRecommendationData(prev => ({ ...prev, answerBased: null }));
        }
    };

    // 피키 유저 추천 로드
    const loadPickyPickRecommendation = async () => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/recommendations/picky-pick`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error(`피키 유저 추천 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                setRecommendationData(prev => ({
                    ...prev,
                    pickyPick: {
                        book: {
                            id: data.result.id,
                            title: data.result.title,
                            author: data.result.author,
                            coverImage: data.result.coverImage,
                            isbn: data.result.isbn,
                            description: data.result.description
                        }
                    }
                }));
            }
        } catch (error) {
            console.error('피키 유저 추천 로딩 실패:', error);
            setRecommendationData(prev => ({ ...prev, pickyPick: null }));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setLoading(true); // 새로고침 시에도 로딩 애니메이션 표시
        await loadRecommendations(true); // 로딩 표시하며 데이터 갱신
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    // 책 상세 페이지로 이동
    const handleBookPress = (book) => {
        if (!book || !book.isbn) {
            console.error('책 정보가 없습니다:', book);
            return;
        }

        // 북카드 클릭 시 다음 포커스를 스킵하도록 설정
        skipNextFocus.current = true;

        navigation.navigate("BookDetail", {
            isbn: book.isbn,
            bookData: {
                isbn: book.isbn,
                title: book.title,
                authors: book.author ? [book.author] : [],
                author: book.author,
                coverImage: book.coverImage,
                description: book.description
            }
        });
    };

    // 요약 텍스트를 55자로 제한하고 생략 처리
    const truncateText = (text, maxLength = 55) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '···';
    };

    // 질문 제목이나 책 제목을 15자로 제한
    const truncateTitle = (text, maxLength = 15) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '···';
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
                    <Text style={styles.bookDescription}>
                        {truncateText(bookData.book.description, 55)}
                    </Text>
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

    // AI 생성 중 애니메이션 컴포넌트
    const AILoadingAnimation = () => {
        const [pulseAnim] = useState(new Animated.Value(1));
        const [sparkles] = useState([
            new Animated.Value(0),
            new Animated.Value(0),
            new Animated.Value(0),
        ]);

        useEffect(() => {
            // 펄스 애니메이션
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // 반짝이는 효과
            sparkles.forEach((anim, index) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(index * 300),
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            });
        }, []);

        return (
            <View style={styles.aiLoadingContainer}>
                {/* 중앙 AI 아이콘 */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={styles.aiIconCircle}>
                        <Ionicons name="sparkles" size={40} color="#90D1BE" />
                    </View>
                </Animated.View>

                {/* 주변 반짝이는 별들 */}
                <Animated.View 
                    style={[
                        styles.sparkle, 
                        styles.sparkle1,
                        { opacity: sparkles[0] }
                    ]}
                >
                    <Ionicons name="star" size={16} color="#90D1BE" />
                </Animated.View>
                <Animated.View 
                    style={[
                        styles.sparkle, 
                        styles.sparkle2,
                        { opacity: sparkles[1] }
                    ]}
                >
                    <Ionicons name="star" size={12} color="#78C8B0" />
                </Animated.View>
                <Animated.View 
                    style={[
                        styles.sparkle, 
                        styles.sparkle3,
                        { opacity: sparkles[2] }
                    ]}
                >
                    <Ionicons name="star" size={14} color="#A8DCC8" />
                </Animated.View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="추천 도서" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <AILoadingAnimation />
                    <Text style={styles.loadingText}>회원님에게 딱 맞는 추천 도서를 찾고 있어요!</Text>
                    <Text style={styles.loadingSubText}>피키가 취향을 분석하는 중이에요</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!recommendationData || 
        (!recommendationData.questionBased && !recommendationData.answerBased && !recommendationData.pickyPick)) {
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
                                        <Text style={styles.highlightText}>
                                            "{truncateTitle(recommendationData.questionBased.relatedQuestionTitle)}"
                                        </Text>
                                    </View>
                                    <Text style={styles.normalText}>을 참고했어요!</Text>
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
                                        <Text style={styles.highlightText}>
                                            {truncateTitle(recommendationData.answerBased.relatedAnswerBookTitle)}
                                        </Text>
                                    </View>
                                    <Text style={styles.normalText}>에서 가져왔어요!</Text>
                                </View>
                                <Text style={styles.sectionTitle}>답변 내용 기반</Text>
                            </View>
                            {renderBookCard(recommendationData.answerBased)}
                        </View>
                    )}

                    {/* 피키 유저들이 선택한 책 섹션 */}
                    {recommendationData.pickyPick && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionQuestionContainer}>
                                    <View style={styles.highlightTag}>
                                        <Ionicons name="people-outline" size={16} color="#666666" style={{marginRight: 4}} />
                                        <Text style={styles.highlightText}>피키 유저들</Text>
                                    </View>
                                    <Text style={styles.normalText}>이 선택한 책이에요!</Text>
                                </View>
                                <Text style={styles.sectionTitle}>피키 pick!</Text>
                            </View>
                            {renderBookCard(recommendationData.pickyPick)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Recommendation;