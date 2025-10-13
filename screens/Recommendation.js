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
    const skipNextFocus = useRef(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        loadRecommendations(true);
        isInitialMount.current = false;
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (isInitialMount.current) {
                return;
            }

            if (skipNextFocus.current) {
                skipNextFocus.current = false;
                return;
            }
            
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
            
            if (showLoading) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 2000 - elapsedTime);
                
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }
            }
        } catch (error) {
            console.error('추천 데이터 로딩 실패:', error);
            
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

    const loadQuestionBasedRecommendation = async () => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/recommendations/question-based`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setRecommendationData(prev => ({ ...prev, questionBased: 'insufficient' }));
                    return;
                }
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
            setRecommendationData(prev => ({ ...prev, questionBased: 'insufficient' }));
        }
    };

    const loadAnswerBasedRecommendation = async () => {
        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/recommendations/answer-based`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setRecommendationData(prev => ({ ...prev, answerBased: 'insufficient' }));
                    return;
                }
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
            setRecommendationData(prev => ({ ...prev, answerBased: 'insufficient' }));
        }
    };

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
                        id: data.result.id,
                        title: data.result.title,
                        author: data.result.author,
                        coverImage: data.result.coverImage,
                        isbn: data.result.isbn,
                        description: data.result.description
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
        setLoading(true);
        await loadRecommendations(true);
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleBookPress = (book) => {
        if (!book || !book.isbn) {
            console.error('책 정보가 없습니다:', book);
            return;
        }

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

    const truncateText = (text, maxLength = 55) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '···';
    };

    const truncateTitle = (text, maxLength = 15) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '···';
    };

    const renderInsufficientDataCard = (type) => {
        const messages = {
            question: {
                icon: 'bulb-outline',
                title: '질문 기반 추천',
                message: '아직 질문 참여 데이터가 부족해요',
                subMessage: '더 많은 질문에 참여해보세요!'
            },
            answer: {
                icon: 'newspaper-outline',
                title: '답변 기반 추천',
                message: '아직 답변 작성 데이터가 부족해요',
                subMessage: '다양한 답변을 작성해보세요!'
            }
        };

        const content = messages[type];

        return (
            <View style={styles.insufficientCard}>
                <View style={styles.insufficientIconWrapper}>
                    <Ionicons name={content.icon} size={32} color="#90D1BE" />
                </View>
                <Text style={styles.insufficientTitle}>{content.title}</Text>
                <Text style={styles.insufficientMessage}>{content.message}</Text>
                <Text style={styles.insufficientSubMessage}>{content.subMessage}</Text>
            </View>
        );
    };

    const renderBookCard = (bookData) => {
        const book = bookData.book || bookData;
        
        return (
            <TouchableOpacity 
                style={styles.bookCard} 
                onPress={() => handleBookPress(book)}
                activeOpacity={0.7}
            >
                <View style={styles.bookImagePlaceholder}>
                    <Image 
                        source={{ uri: book.coverImage }} 
                        style={styles.bookImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    <Text style={styles.bookDescription}>
                        {truncateText(book.description, 55)}
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

    const AILoadingAnimation = () => {
        const [pulseAnim] = useState(new Animated.Value(1));
        const [sparkles] = useState([
            new Animated.Value(0),
            new Animated.Value(0),
            new Animated.Value(0),
        ]);

        useEffect(() => {
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
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={styles.aiIconCircle}>
                        <Ionicons name="sparkles" size={40} color="#90D1BE" />
                    </View>
                </Animated.View>

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
        (recommendationData.questionBased !== 'insufficient' && !recommendationData.questionBased && 
         recommendationData.answerBased !== 'insufficient' && !recommendationData.answerBased && 
         !recommendationData.pickyPick)) {
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
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <LogoSVG width={29} height={29} />
                    </View>
                    <Text style={styles.infoText}>
                        회원님이 참여한 질문과 답변을 분석하여 관심사에 맞는 도서를 추천해드려요.
                    </Text>
                </View>

                <View style={styles.roundedContainer}>
                    {recommendationData.questionBased && (
                        <View style={styles.section}>
                            {recommendationData.questionBased === 'insufficient' ? (
                                renderInsufficientDataCard('question')
                            ) : (
                                <>
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
                                </>
                            )}
                        </View>
                    )}

                    {recommendationData.answerBased && (
                        <View style={styles.section}>
                            {recommendationData.answerBased === 'insufficient' ? (
                                renderInsufficientDataCard('answer')
                            ) : (
                                <>
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
                                </>
                            )}
                        </View>
                    )}

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