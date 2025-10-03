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
import { useAuth } from "../AuthContext";
import { questionDetailStyle } from '../styles/QuestionDetailStyle';

const QuestionDetail = ({ navigation, route }) => {
    // 상태 선언
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToAuthor, setReplyingToAuthor] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    
    const viewCountUpdated = useRef(false);

    // AuthContext
    const { authenticatedFetch } = useAuth();
    const API_BASE_URL = 'http://13.124.86.254';

    // route params
    const { questionData, bookData, questionId } = route.params || {};
    const currentQuestionId = questionData?.id || questionId;

    // 초기 로드
    useEffect(() => {
        loadUserProfile();
    }, []);

    useEffect(() => {
        if (currentQuestionId && userProfile) {
            loadQuestionData();
        }
    }, [currentQuestionId, userProfile]);

    useEffect(() => {
        if (question && !viewCountUpdated.current) {
            loadAnswers();
        }
    }, [question]);

    useFocusEffect(
        React.useCallback(() => {
            if (question && !viewCountUpdated.current) {
                updateViewCount();
                viewCountUpdated.current = true;
            }
        }, [question])
    );

    // 사용자 프로필 로드
    const loadUserProfile = async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/members/profile`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`프로필 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.isSuccess && data.result) {
                setUserProfile(data.result);
                console.log('사용자 프로필 로드 성공:', data.result);
            }
        } catch (error) {
            console.error('사용자 프로필 로딩 실패:', error);
            if (error.message.includes('액세스 토큰이 없습니다') || error.message.includes('토큰 갱신 실패')) {
                Alert.alert('인증 오류', '로그인이 필요합니다.');
                navigation.navigate('Login');
            }
        }
    };

    // 질문 데이터 로드
    const loadQuestionData = async () => {
        if (!currentQuestionId) {
            setError("질문 ID가 없습니다.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${currentQuestionId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('질문 조회 에러:', errorText);
                throw new Error(`질문 조회 실패! status: ${response.status}`);
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
            
            if (error.message.includes('액세스 토큰이 없습니다') || error.message.includes('토큰 갱신 실패')) {
                Alert.alert('인증 오류', '로그인이 필요합니다.');
                navigation.navigate('Login');
            }
        } finally {
            setLoading(false);
        }
    };

    // 답변 목록 로드
    const loadAnswers = async () => {
        if (!currentQuestionId) {
            setAnswers([]);
            return;
        }

        try {
            setAnswersLoading(true);
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/answers`, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setAnswers([]);
                    return;
                }
                throw new Error(`답변 목록 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result && data.result.answers) {
                const flattenAnswers = (answersArray) => {
                    const flattened = [];
                    
                    answersArray.forEach(answer => {
                        flattened.push({
                            id: answer.id,
                            content: answer.content,
                            author: answer.author || "사용자",
                            authorId: answer.authorId,
                            authorImage: answer.profileImg || null,
                            isAI: answer.isAI || false,
                            createdAt: answer.createdAt,
                            level: 0,
                            parentId: null,
                            isAuthor: answer.isAuthor || false
                        });
                        
                        if (answer.childrenAnswers && answer.childrenAnswers.length > 0) {
                            answer.childrenAnswers.forEach(childAnswer => {
                                flattened.push({
                                    id: childAnswer.id,
                                    content: childAnswer.content,
                                    author: childAnswer.author || "사용자",
                                    authorId: childAnswer.authorId,
                                    authorImage: childAnswer.profileImg || null,
                                    isAI: childAnswer.isAI || false,
                                    createdAt: childAnswer.createdAt,
                                    level: 1,
                                    parentId: answer.id,
                                    isAuthor: childAnswer.isAuthor || false
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

    // 조회수 업데이트
    const updateViewCount = async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/view`, {
                method: 'POST',
            });

            if (response.ok) {
                setQuestion(prev => prev ? { ...prev, views: prev.views + 1 } : prev);
            }
        } catch (error) {
            console.error('조회수 업데이트 실패:', error);
        }
    };

    // 새로고침
    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserProfile();
        await loadQuestionData();
        setRefreshing(false);
    };

    // 뒤로가기
    const handleGoBack = () => {
        navigation.goBack();
    };

    // 질문 삭제
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
                            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                throw new Error(`질문 삭제 실패! status: ${response.status}`);
                            }

                            Alert.alert('삭제 완료', '질문이 삭제되었습니다.', [
                                { text: '확인', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('질문 삭제 실패:', error);
                            Alert.alert('삭제 실패', '질문 삭제 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 좋아요 처리
    const handleLike = async () => {
        if (!question) return;

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/question-like/${question.id}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`좋아요 처리 실패! status: ${response.status}`);
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

    // 답글 작성
    const handleReplyPress = (answerId, authorName) => {
        setReplyingTo(answerId);
        setReplyingToAuthor(authorName);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyingToAuthor('');
    };

    // 답변 삭제
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
                            const response = await authenticatedFetch(`${API_BASE_URL}/api/answers/${answerId}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                throw new Error(`답변 삭제 실패! status: ${response.status}`);
                            }

                            await loadAnswers();
                            setQuestion(prev => ({
                                ...prev,
                                answersCount: Math.max(0, prev.answersCount - 1)
                            }));
                            Alert.alert('삭제 완료', '답변이 삭제되었습니다.');
                        } catch (error) {
                            console.error('답변 삭제 실패:', error);
                            Alert.alert('삭제 실패', '답변 삭제 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 답변 등록
    const handleAnswerSubmit = async (content, isAI = false) => {
        try {
            if (replyingTo) {
                // 답글(대댓글) 등록 - parentAnswerId 포함
                const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}/answers`, {
                    method: 'POST',
                    body: JSON.stringify({ 
                        content: content.trim(),
                        isAI: false,
                        parentAnswerId: replyingTo  // 부모 답변 ID 추가
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('답글 등록 에러:', errorText);
                    throw new Error(`답글 등록 실패! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.isSuccess) {
                    await loadAnswers();
                    setQuestion(prev => ({ ...prev, answersCount: prev.answersCount + 1 }));
                    setReplyingTo(null);
                    setReplyingToAuthor('');
                    Alert.alert('등록 완료', '답글이 등록되었습니다.');
                    return true;
                }
            } else {
                // 일반 답변 등록
                const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}/answers`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: content.trim(),
                        isAI: isAI,
                        parentAnswerId: null  // 일반 답변은 null
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('답변 등록 에러:', errorText);
                    throw new Error(`답변 등록 실패! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.isSuccess) {
                    await loadAnswers();
                    setQuestion(prev => ({ ...prev, answersCount: prev.answersCount + 1 }));
                    Alert.alert('등록 완료', '답변이 등록되었습니다.');
                    return true;
                }
            }
        } catch (error) {
            console.error('답변 등록 실패:', error);
            Alert.alert('등록 실패', '답변 등록 중 오류가 발생했습니다.');
            return false;
        }
    };

    // AI 답변 생성
    const generateAIAnswer = async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/ai/generate-answer/${question.id}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`AI 답변 생성 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.content) {
                return data.content;
            } else {
                throw new Error('AI 답변 내용을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('AI 답변 생성 실패:', error);
            Alert.alert('오류', 'AI 답변 생성 중 오류가 발생했습니다.');
            throw error;
        }
    };

    // 로딩 중
    if (loading || !userProfile) {
        return (
            <SafeAreaView style={questionDetailStyle.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader title="질문답변" onBackPress={handleGoBack} />
                <View style={questionDetailStyle.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                    <Text style={questionDetailStyle.loadingText}>
                        {!userProfile ? '사용자 정보를 불러오는 중...' : '질문을 불러오는 중...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러 발생
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

    // 정상 렌더링
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
                        currentUserId={userProfile?.id}
                        onLike={handleLike}
                        onDelete={handleDeleteQuestion}
                    />

                    <AnswerSection
                        answers={answers}
                        answersLoading={answersLoading}
                        questionAnswersCount={question.answersCount}
                        currentUserId={userProfile?.id}
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