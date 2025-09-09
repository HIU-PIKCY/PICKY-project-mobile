import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Text
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import QuestionSection from '../components/QuestionSection';
import AnswerSection from '../components/AnswerSection';
import AnswerPost from '../components/AnswerPost';
import { questionDetailStyle } from '../styles/QuestionDetailStyle';

const QuestionDetail = ({ navigation, route }) => {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    
    // 답글 관련 상태
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToAuthor, setReplyingToAuthor] = useState('');
    
    // 조회수 업데이트를 한 번만 실행하기 위한 ref
    const viewCountUpdated = useRef(false);

    // API 베이스 URL
    const API_BASE_URL = 'http://13.124.86.254';

    // 현재 로그인된 사용자 ID (실제로는 로그인 상태에서 가져와야 함)
    const currentUserId = 1; // 임시 값

    // route params에서 질문 데이터와 책 데이터 가져오기
    const { questionData, bookData, questionId } = route.params || {};
    const currentQuestionId = questionData?.id || questionId;

    useEffect(() => {
        if (currentQuestionId) {
            loadQuestionData();
        }
    }, [currentQuestionId]);

    useEffect(() => {
        if (question && !viewCountUpdated.current) {
            loadAnswers();
        }
    }, [question]);

    // 화면 포커스 시 조회수 업데이트 (한 번만)
    useFocusEffect(
        React.useCallback(() => {
            if (question && !viewCountUpdated.current) {
                updateViewCount();
                viewCountUpdated.current = true;
            }
        }, [question])
    );

    const loadQuestionData = async () => {
        if (!currentQuestionId) {
            setError("질문 ID가 없습니다.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('질문 상세 정보 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/${currentUserId}`);
            
            const response = await fetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/${currentUserId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result) {
                setQuestion(data.result);
            } else {
                throw new Error(data.message || '질문 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('질문 정보 로딩 실패:', error);
            setError(error.message);
            
            // 에러 시 기본 데이터라도 표시
            if (questionData) {
                setQuestion({
                    id: questionData.id,
                    title: questionData.content || "질문 제목",
                    content: questionData.body || "",
                    author: questionData.nickname || questionData.author || "사용자",
                    nickname: questionData.nickname || questionData.author || "사용자",
                    profileImg: questionData.profileImg || questionData.profileImage || null,
                    isAI: questionData.isAI || false,
                    views: questionData.views || 0,
                    likes: questionData.likes || 0,
                    answersCount: questionData.answers || 0,
                    page: questionData.page || null,
                    createdAt: questionData.createdAt || new Date().toISOString(),
                    book: {
                        id: bookData?.id || 1,
                        title: bookData?.title || "책 제목",
                        author: bookData?.authors?.[0] || bookData?.author || "작가"
                    },
                    isLiked: false,
                    authorId: questionData.authorId || null // 질문 작성자 ID
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadAnswers = async () => {
        if (!currentQuestionId) {
            setAnswers([]);
            return;
        }

        try {
            setAnswersLoading(true);
            console.log('답변 목록 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/answers`);
            
            const response = await fetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/answers`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setAnswers([]);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result && data.result.answers) {
                // 중첩된 답변 구조를 평면화
                const flattenAnswers = (answersArray) => {
                    const flattened = [];
                    
                    answersArray.forEach(answer => {
                        flattened.push({
                            id: answer.id,
                            content: answer.content,
                            author: answer.nickname || answer.author || "사용자",
                            authorId: answer.authorId || answer.userId || null, // 답변 작성자 ID
                            authorImage: answer.profileImg || answer.profileImage || null,
                            isAI: answer.isAI || false,
                            createdAt: answer.createdAt,
                            level: 0,
                            parentId: null
                        });
                        
                        // 답글이 있으면 추가
                        if (answer.childrenAnswers && answer.childrenAnswers.length > 0) {
                            answer.childrenAnswers.forEach(childAnswer => {
                                flattened.push({
                                    id: childAnswer.id,
                                    content: childAnswer.content,
                                    author: childAnswer.nickname || childAnswer.author || "사용자",
                                    authorId: childAnswer.authorId || childAnswer.userId || null,
                                    authorImage: childAnswer.profileImg || childAnswer.profileImage || null,
                                    isAI: childAnswer.isAI || false,
                                    createdAt: childAnswer.createdAt,
                                    level: 1,
                                    parentId: answer.id
                                });
                            });
                        }
                    });
                    
                    return flattened;
                };

                const flatAnswers = flattenAnswers(data.result.answers);
                setAnswers(flatAnswers);
            } else {
                setAnswers([]);
            }
        } catch (error) {
            console.error('답변 목록 로딩 실패:', error);
            setAnswers([]);
        } finally {
            setAnswersLoading(false);
        }
    };

    const updateViewCount = async () => {
        try {
            console.log('조회수 업데이트 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/view`);
            
            const response = await fetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/view`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                setQuestion(prev => {
                    if (prev) {
                        return {
                            ...prev,
                            views: prev.views + 1
                        };
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('조회수 업데이트 실패:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadQuestionData();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleDeleteQuestion = async () => {
        Alert.alert(
            '질문 삭제',
            '정말로 이 질문을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '삭제', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('질문 삭제 요청:', `${API_BASE_URL}/api/questions/${question.id}`);
                            
                            const response = await fetch(`${API_BASE_URL}/api/questions/${question.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${currentUserId}` // 실제로는 토큰 사용
                                }
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (data.isSuccess) {
                                Alert.alert('삭제 완료', '질문이 삭제되었습니다.', [
                                    { text: '확인', onPress: () => navigation.goBack() }
                                ]);
                            } else {
                                throw new Error(data.message || '질문 삭제에 실패했습니다.');
                            }
                        } catch (error) {
                            console.error('질문 삭제 실패:', error);
                            Alert.alert('삭제 실패', '질문 삭제 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    const handleLike = async () => {
        if (!question) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/questions/${question.id}/like`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${currentUserId}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess) {
                setQuestion(prev => ({
                    ...prev,
                    isLiked: !prev.isLiked,
                    likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
                }));
            }
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    const handleReplyPress = (answerId, authorName) => {
        setReplyingTo(answerId);
        setReplyingToAuthor(authorName);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyingToAuthor('');
    };

    const handleDeleteAnswer = async (answerId) => {
        Alert.alert(
            '답변 삭제',
            '정말로 이 답변을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '삭제', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/answers/${answerId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${currentUserId}`
                                }
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (data.isSuccess) {
                                await loadAnswers();
                                setQuestion(prev => ({
                                    ...prev,
                                    answersCount: Math.max(0, prev.answersCount - 1)
                                }));
                                Alert.alert('삭제 완료', '답변이 삭제되었습니다.');
                            } else {
                                throw new Error(data.message || '답변 삭제에 실패했습니다.');
                            }
                        } catch (error) {
                            console.error('답변 삭제 실패:', error);
                            Alert.alert('삭제 실패', '답변 삭제 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    const handleAnswerSubmit = async (content, isAI = false) => {
        try {
            if (replyingTo) {
                // 답글 등록
                const response = await fetch(`${API_BASE_URL}/api/answers/${replyingTo}/replies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${currentUserId}`
                    },
                    body: JSON.stringify({
                        content: content.trim()
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.isSuccess) {
                    await loadAnswers();
                    setQuestion(prev => ({
                        ...prev,
                        answersCount: prev.answersCount + 1
                    }));
                    
                    setReplyingTo(null);
                    setReplyingToAuthor('');
                    Alert.alert('등록 완료', '답글이 등록되었습니다.');
                    return true;
                } else {
                    throw new Error(data.message || '답글 등록에 실패했습니다.');
                }
            } else {
                // 일반 답변 등록
                const response = await fetch(`${API_BASE_URL}/api/questions/${question.id}/answers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${currentUserId}`
                    },
                    body: JSON.stringify({
                        content: content.trim(),
                        isAI: isAI
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.isSuccess) {
                    await loadAnswers();
                    setQuestion(prev => ({
                        ...prev,
                        answersCount: prev.answersCount + 1
                    }));
                    
                    Alert.alert('등록 완료', '답변이 등록되었습니다.');
                    return true;
                } else {
                    throw new Error(data.message || '답변 등록에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('답변 등록 실패:', error);
            Alert.alert('등록 실패', '답변 등록 중 오류가 발생했습니다.');
            return false;
        }
    };

    const generateAIAnswer = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/questions/${question.id}/ai-answer`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${currentUserId}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                return data.result.content || data.result;
            } else {
                throw new Error(data.message || 'AI 답변 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('AI 답변 생성 실패:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={questionDetailStyle.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="질문답변" onBackPress={handleGoBack} />
                <View style={questionDetailStyle.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                    <Text style={questionDetailStyle.loadingText}>질문을 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!question) {
        return (
            <SafeAreaView style={questionDetailStyle.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="질문답변" onBackPress={handleGoBack} />
                <View style={questionDetailStyle.errorContainer}>
                    <Text style={questionDetailStyle.errorTitle}>질문을 불러올 수 없습니다</Text>
                    <Text style={questionDetailStyle.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={questionDetailStyle.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <CustomHeader title="질문답변" onBackPress={handleGoBack} />

            <KeyboardAvoidingView 
                style={questionDetailStyle.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    style={questionDetailStyle.content} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={questionDetailStyle.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#90D1BE']}
                            tintColor="#90D1BE"
                        />
                    }
                >
                    <QuestionSection
                        question={question}
                        currentUserId={currentUserId}
                        onLike={handleLike}
                        onDelete={handleDeleteQuestion}
                    />

                    <AnswerSection
                        answers={answers}
                        answersLoading={answersLoading}
                        questionAnswersCount={question.answersCount}
                        currentUserId={currentUserId}
                        onReplyPress={handleReplyPress}
                        onDeleteAnswer={handleDeleteAnswer}
                    />
                </ScrollView>

                <AnswerPost
                    replyingTo={replyingTo}
                    replyingToAuthor={replyingToAuthor}
                    onCancelReply={handleCancelReply}
                    onSubmitAnswer={handleAnswerSubmit}
                    onGenerateAI={generateAIAnswer}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default QuestionDetail;