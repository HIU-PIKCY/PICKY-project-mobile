import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import MintStar from '../assets/icons/MintStar.svg';

const QuestionDetail = ({ navigation, route }) => {
    const [newAnswer, setNewAnswer] = useState('');
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [generatedAIAnswer, setGeneratedAIAnswer] = useState(null);
    const [submittingAIAnswer, setSubmittingAIAnswer] = useState(false);

    // route params에서 질문 데이터와 책 데이터 가져오기
    const { questionData, bookData, questionId } = route.params || {};

    // 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyQuestion = {
        id: questionData?.id || questionId,
        title: questionData?.content || "작가의 의도는?",
        content: "김첨지가 아내의 죽음을 알고도 \"운수가 좋다\"고 중얼거리는 마지막 장면이 인상적입니다.\n작가는 제목 '운수 좋은 날'에 담긴 아이러니를 통해 무엇을 말하고자 했을까요?\n여러분은 이 소설의 제목과 결말에 담긴 작가의 진정한 의도가 무엇이라고 생각하시나요?",
        author: questionData?.author || "AI",
        isAI: questionData?.isAI !== undefined ? questionData.isAI : true,
        views: questionData?.views || 122,
        likes: questionData?.likes || 5,
        answersCount: 2,
        page: questionData?.page || 220,
        createdAt: "2024-01-15T10:30:00Z",
        book: {
            id: bookData?.id || 1,
            title: bookData?.title || "운수 좋은 날",
            author: bookData?.author || "현진건"
        },
        isLiked: false
    };

    const dummyAnswers = [
        {
            id: 1,
            content: '작가는 <운수 좋은 날>이라는 제목으로 삶의 잔혹한 아이러니를 드러내고자 했습니다. 김첨지에게 경제적으로는 좋은 날이었지만 가장 소중한 것을 잃은 날이기도 했죠. 이를 통해 당시 서민들이 처한 무력한 현실과 그에 대한 체념을 보여주면서도, 동시에 그러한 현실 자체를 비판하고 있다고 봅니다.',
            author: 'AI 답변',
            isAI: true,
            createdAt: "2024-01-15T11:00:00Z"
        },
        {
            id: 2,
            content: '김첨지가 마지막에 "운수가 좋다"고 말하는 게... 아내가 더 이상 고생하지 않아도 된다는 안도감도 있는 것 같아요. 제목 자체가 너무 슬픈 아이러니네요😢',
            author: '키티키티',
            isAI: false,
            createdAt: "2024-01-15T14:30:00Z"
        }
    ];

    useEffect(() => {
        loadQuestionData();
    }, []);

    useEffect(() => {
        if (question) {
            loadAnswers();
        }
    }, [question]);

    // 화면 포커스 시 조회수 업데이트
    useFocusEffect(
        React.useCallback(() => {
            updateViewCount();
        }, [])
    );

    const loadQuestionData = async () => {
        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getQuestionDetail(questionId);
            // setQuestion(response.data);
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setQuestion(dummyQuestion);
                setLoading(false);
            }, 300);
        } catch (error) {
            console.error('질문 정보 로딩 실패:', error);
            setLoading(false);
        }
    };

    const loadAnswers = async () => {
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getQuestionAnswers(question.id);
            // setAnswers(response.data.answers);
            
            // 더미 데이터 시뮬레이션 (오래된순 정렬)
            const sortedAnswers = [...dummyAnswers].sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
            
            setAnswers(sortedAnswers);
        } catch (error) {
            console.error('답변 목록 로딩 실패:', error);
        }
    };

    const updateViewCount = async () => {
        try {
            // 실제 구현 시 API 호출
            // await apiService.updateQuestionViewCount(questionId);
            
            // 더미 조회수 증가
            if (question) {
                setQuestion(prev => ({
                    ...prev,
                    views: prev.views + 1
                }));
            }
        } catch (error) {
            console.error('조회수 업데이트 실패:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadQuestionData()]);
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleLike = async () => {
        if (!question) return;

        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.toggleQuestionLike(question.id);
            // setQuestion(prev => ({
            //     ...prev,
            //     isLiked: response.data.isLiked,
            //     likes: response.data.likesCount
            // }));
            
            // 더미 좋아요 토글
            setQuestion(prev => ({
                ...prev,
                isLiked: !prev.isLiked,
                likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
            }));
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    const handleAnswerLike = async (answerId) => {
        // 답변 좋아요 기능 제거됨
    };

    const handleAIAnswerGenerate = async () => {
        if (!question) return;

        setGeneratingAI(true);
        
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.generateAIAnswer(question.id);
            // setGeneratedAIAnswer(response.data.content);

            // 더미 AI 답변 생성 시뮬레이션
            const dummyAIAnswers = [
                "이 작품에서 작가는 사회적 현실의 아이러니를 통해 인간의 운명에 대한 깊은 성찰을 보여주고 있습니다. 주인공의 상황을 통해 당시 서민층의 삶의 애환과 무력감을 드러내면서도, 동시에 그들의 강인한 생명력을 부각시키고 있다고 생각됩니다.",
                "작품 속 인물들의 행동과 심리를 분석해보면, 작가가 의도한 메시지는 단순한 비극이 아닌 인간 존재의 복합적 의미에 대한 탐구라고 볼 수 있습니다. 특히 제목이 주는 반어적 효과는 독자로 하여금 진정한 행복의 의미에 대해 생각하게 만듭니다.",
                "이 소설의 핵심은 현실과 이상 사이의 괴리, 그리고 그 속에서 살아가는 인간의 모습을 사실적으로 그려낸 것입니다. 작가는 객관적이고 냉정한 시선으로 당시 사회의 모순을 지적하면서도, 인간에 대한 따뜻한 시선을 잃지 않고 있습니다."
            ];
            
            setTimeout(() => {
                const randomAnswer = dummyAIAnswers[Math.floor(Math.random() * dummyAIAnswers.length)];
                setGeneratedAIAnswer(randomAnswer);
                setGeneratingAI(false);
            }, 2000);
        } catch (error) {
            console.error('AI 답변 생성 실패:', error);
            setGeneratingAI(false);
            Alert.alert('오류', 'AI 답변 생성 중 오류가 발생했습니다.');
        }
    };

    const handleSubmitAIAnswer = async () => {
        if (!generatedAIAnswer) return;

        setSubmittingAIAnswer(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.createAnswer(question.id, { 
            //     content: generatedAIAnswer,
            //     isAI: true 
            // });
            
            // 더미 AI 답변 등록
            const newAIAnswerData = {
                id: Date.now(),
                content: generatedAIAnswer,
                author: 'AI 답변',
                isAI: true,
                createdAt: new Date().toISOString()
            };
            
            setAnswers(prev => [...prev, newAIAnswerData]);
            setQuestion(prev => ({
                ...prev,
                answersCount: prev.answersCount + 1
            }));
            
            // AI 답변 상태 초기화
            setGeneratedAIAnswer(null);
            setSubmittingAIAnswer(false);
            
            Alert.alert('등록 완료', 'AI 답변이 등록되었습니다.');
        } catch (error) {
            console.error('AI 답변 등록 실패:', error);
            setSubmittingAIAnswer(false);
            Alert.alert('등록 실패', 'AI 답변 등록 중 오류가 발생했습니다.');
        }
    };

    const handleCancelAIAnswer = () => {
        setGeneratedAIAnswer(null);
    };

    const handleSubmitAnswer = async () => {
        if (!newAnswer.trim()) {
            Alert.alert('알림', '답변 내용을 입력해주세요.');
            return;
        }

        setSubmittingAnswer(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.createAnswer(question.id, { content: newAnswer.trim() });
            
            // 더미 답변 생성
            const newAnswerData = {
                id: Date.now(),
                content: newAnswer.trim(),
                author: '나',
                isAI: false,
                createdAt: new Date().toISOString()
            };
            
            setAnswers(prev => [newAnswerData, ...prev]);
            setQuestion(prev => ({
                ...prev,
                answersCount: prev.answersCount + 1
            }));
            setNewAnswer('');
            Keyboard.dismiss();
            setSubmittingAnswer(false);
            
            Alert.alert('등록 완료', '답변이 등록되었습니다.');
        } catch (error) {
            console.error('답변 등록 실패:', error);
            setSubmittingAnswer(false);
            Alert.alert('등록 실패', '답변 등록 중 오류가 발생했습니다.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').slice(0, -1);
    };

    const renderAnswer = (answer) => (
        <View key={answer.id} style={styles.answerContainer}>
            <View style={styles.authorIconContainer}>
                {answer.isAI ? (
                    <View style={styles.aiIcon}>
                        <Text style={styles.aiIconText}>AI</Text>
                    </View>
                ) : (
                    <View style={styles.userIcon}>
                        <Ionicons name="person" size={16} color="#666" />
                    </View>
                )}
            </View>
            <View style={styles.answerContentWrapper}>
                <View style={styles.answerHeader}>
                    <Text style={styles.authorName}>{answer.author}</Text>
                </View>
                <Text style={styles.answerText}>{answer.content}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="질문답변" onBackPress={handleGoBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                </View>
            </SafeAreaView>
        );
    }

    if (!question) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="질문답변" onBackPress={handleGoBack} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>질문을 불러올 수 없습니다</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="질문답변"
                onBackPress={handleGoBack}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#90D1BE']}
                            tintColor="#90D1BE"
                        />
                    }
                >
                    {/* 질문 섹션 */}
                    <View style={styles.questionSection}>
                        <View style={styles.questionHeader}>
                            <View style={styles.iconWrapper}>
                                <View style={styles.aiIcon}>
                                    <Text style={styles.aiIconText}>AI</Text>
                                </View>
                                <Text style={styles.questionAuthor}>AI 질문</Text>
                            </View>
                            <Text style={styles.bookLabel}>{question.book.title}</Text>
                        </View>

                        <Text style={styles.questionTitle}>{question.title}</Text>
                        <Text style={styles.questionContent}>{question.content}</Text>
                        
                        <View style={styles.questionMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="book-outline" size={16} color="#666" />
                                <Text style={styles.metaText}>페이지 {question.page || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.questionFooter}>
                            <View style={styles.statItem}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.dateText}>{formatDate(question.createdAt)}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="eye-outline" size={16} color="#666" />
                                <Text style={styles.statText}>조회수 {question.views}</Text>
                            </View>
                            <TouchableOpacity style={styles.statItem} onPress={handleLike}>
                                <Ionicons 
                                    name={question.isLiked ? "heart" : "heart-outline"} 
                                    size={16} 
                                    color={question.isLiked ? "#FF6B6B" : "#666"} 
                                />
                                <Text style={[
                                    styles.statText,
                                    question.isLiked && styles.likedText
                                ]}>
                                    추천 {question.likes}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 답변 섹션 */}
                    <View style={styles.answersSectionHeader}>
                        <Text style={styles.answersTitle}>답변  ({question.answersCount})</Text>
                    </View>
                    
                    <View style={styles.answersSection}>
                        {answers.map(renderAnswer)}
                    </View>
                </ScrollView>

                {/* 답변 작성 섹션 */}
                <View style={styles.answerInputContainer}>
                    {generatingAI ? (
                        <View style={styles.aiGeneratingContainer}>
                            <ActivityIndicator size="large" color="#90D1BE" />
                            <Text style={styles.aiGeneratingText}>AI가 답변을 생성하고 있습니다...</Text>
                        </View>
                    ) : generatedAIAnswer ? (
                        <View style={styles.aiAnswerPreviewContainer}>
                            <View style={styles.aiAnswerHeader}>
                                <View style={styles.aiAnswerIconContainer}>
                                    <View style={styles.aiIcon}>
                                        <Text style={styles.aiIconText}>AI</Text>
                                    </View>
                                    <Text style={styles.aiAnswerAuthor}>AI 답변</Text>
                                </View>
                            </View>
                            <Text style={styles.aiAnswerContent}>{generatedAIAnswer}</Text>
                            <View style={styles.aiAnswerActions}>
                                <TouchableOpacity
                                    style={styles.aiCancelButton}
                                    onPress={handleCancelAIAnswer}
                                    disabled={submittingAIAnswer}
                                >
                                    <Text style={styles.aiCancelButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.aiSubmitButton,
                                        submittingAIAnswer && styles.aiSubmitButtonDisabled
                                    ]}
                                    onPress={handleSubmitAIAnswer}
                                    disabled={submittingAIAnswer}
                                >
                                    {submittingAIAnswer ? (
                                        <ActivityIndicator size="small" color="#4B4B4B" />
                                    ) : (
                                        <Text style={styles.aiSubmitButtonText}>답변 등록</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={styles.inputRow}>
                                <View style={styles.userIconSmall}>
                                    <Ionicons name="person" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={styles.answerInput}
                                    placeholder="나의 생각을 공유해요!"
                                    value={newAnswer}
                                    onChangeText={setNewAnswer}
                                    multiline
                                    maxLength={500}
                                    textAlignVertical="top"
                                    editable={!submittingAnswer}
                                />
                            </View>
                            <View style={styles.inputActions}>
                                <TouchableOpacity 
                                    style={styles.aiAnswerButton}
                                    onPress={handleAIAnswerGenerate}
                                    disabled={submittingAnswer}
                                >
                                    <MintStar />
                                    <Text style={styles.aiAnswerButtonText}>AI 답변 생성</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.submitButton,
                                        submittingAnswer && styles.submitButtonDisabled
                                    ]} 
                                    onPress={handleSubmitAnswer}
                                    disabled={submittingAnswer}
                                >
                                    {submittingAnswer ? (
                                        <ActivityIndicator size="small" color="#4B4B4B" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>답변 등록</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        fontFamily: "SUIT-Medium",
        color: "#999999",
    },
    questionSection: {
        backgroundColor: '#fff',
        padding: 20,
    },
    iconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    aiIcon: {
        backgroundColor: '#333',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    aiIconText: {
        color: '#fff',
        fontSize: 10,
    },
    questionAuthor: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginRight: 12,
    },
    bookLabel: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
    },
    questionTitle: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        color: '#666',
        letterSpacing: -0.4,
        marginBottom: 14,
    },
    questionContent: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.35,
        lineHeight: 18.2,
        color: '#666',
        marginBottom: 14,
    },
    questionMeta: {
        marginBottom: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    questionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    likedText: {
        color: '#FF6B6B',
    },
    answersSection: {
        backgroundColor: '#fff',
    },
    answersSectionHeader: {
        backgroundColor: '#fff',
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 0.5,
        borderTopColor: '#E8E8E8',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
    },
    answersTitle: {
        fontSize: 14,
        fontFamily: 'SUIT-SemiBold',
        letterSpacing: -0.7,
        color: '#4B4B4B',
    },
    answerContainer: {
        backgroundColor: '#F3FCF9',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 6,
    },
    authorIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 5,
    },
    answerContentWrapper: {
        flex: 1,
        minWidth: 0,
    },
    userIcon: {
        backgroundColor: '#f1f3f4',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    authorName: {
        fontSize: 10,
        fontFamily: 'SUIT-Medium',
        color: '#666',
    },
    answerText: {
        fontSize: 12.5,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.3,
        lineHeight: 17,
        color: '#666',
    },
    answerInputContainer: {
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    userIconSmall: {
        backgroundColor: '#f1f3f4',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 5,
    },
    answerInput: {
        flex: 1,
        padding: 10,
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#666',
        minHeight: 40,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiAnswerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    aiAnswerButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginLeft: 5,
    },
    submitButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#4B4B4B',
    },
    aiGeneratingContainer: {
        paddingVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiGeneratingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
        fontFamily: 'SUIT-Medium',
    },
    aiAnswerPreviewContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    aiAnswerHeader: {
        marginBottom: 10,
    },
    aiAnswerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiAnswerAuthor: {
        fontSize: 11,
        fontFamily: 'SUIT-Medium',
        color: '#666',
    },
    aiAnswerContent: {
        fontSize: 13,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.3,
        lineHeight: 18,
        color: '#666',
        marginBottom: 15,
    },
    aiAnswerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    aiCancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    aiCancelButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#999999',
    },
    aiSubmitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    aiSubmitButtonDisabled: {
        opacity: 0.6,
    },
    aiSubmitButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#4B4B4B',
    },
});

export default QuestionDetail;