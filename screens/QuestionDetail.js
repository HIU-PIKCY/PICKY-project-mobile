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

    // 사용자 프로필 정보 상태 추가
    const [userProfile, setUserProfile] = useState(null);

    // AuthContext에서 authenticatedFetch와 사용자 정보 가져오기
    const { authenticatedFetch, user } = useAuth();

    // API 베이스 URL
    const API_BASE_URL = 'http://13.124.86.254';

    // route params에서 질문 데이터와 책 데이터 가져오기
    const { questionData, bookData, questionId } = route.params || {};
    const currentQuestionId = questionData?.id || questionId;

    // 현재 사용자의 닉네임과 숫자 ID 가져오기
    const currentUserNickname = userProfile?.nickname || user?.displayName || user?.nickname || user?.name;
    const currentUserMemberId = userProfile?.id;

    useEffect(() => {
        // 사용자 프로필 먼저 로드
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

    // 화면 포커스 시 조회수 업데이트 (한 번만)
    useFocusEffect(
        React.useCallback(() => {
            if (question && !viewCountUpdated.current) {
                updateViewCount();
                viewCountUpdated.current = true;
            }
        }, [question])
    );

    // ===============================================
    // 💡 사용자 프로필 정보 로드
    // ===============================================
    const loadUserProfile = async () => {
        try {
            console.log('사용자 프로필 요청:', `${API_BASE_URL}/api/members/profile`);
            
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
            } else {
                throw new Error(data.message || '프로필 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('사용자 프로필 로딩 실패:', error);
            
            // 인증 에러 처리
            if (error.message.includes('액세스 토큰이 없습니다') || error.message.includes('토큰 갱신 실패')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.');
                navigation.navigate('Login');
                return;
            }
        }
    };

    // ===============================================
    // 💡 인증된 API 호출 함수: 질문 데이터 로드
    // ===============================================
    const loadQuestionData = async () => {
        if (!currentQuestionId) {
            setError("질문 ID가 없습니다.");
            setLoading(false);
            return;
        }

        if (!currentUserMemberId) {
            setError("사용자 정보를 불러오는 중입니다.");
            return;
        }

        setLoading(true);
        try {
            console.log('질문 상세 정보 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/${currentUserMemberId}`);
            console.log('사용할 memberId:', currentUserMemberId);
            
            // authenticatedFetch 사용 - 숫자 memberId 포함
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/${currentUserMemberId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                // 에러 응답 내용 확인
                const errorText = await response.text();
                console.error('질문 조회 에러 응답:', errorText);
                console.error('요청 URL:', `${API_BASE_URL}/api/questions/${currentQuestionId}/${currentUserMemberId}`);
                throw new Error(`질문 조회 실패! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result) {
                // 질문 데이터에서 authorId를 작성자 닉네임으로 설정
                const questionData = {
                    ...data.result,
                    authorId: data.result.author || null // 닉네임을 authorId로 사용
                };
                
                setQuestion(questionData);
            } else {
                throw new Error(data.message || '질문 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('질문 정보 로딩 실패:', error);
            setError(error.message);
            
            // 인증 에러 처리
            if (error.message.includes('액세스 토큰이 없습니다') || error.message.includes('토큰 갱신 실패')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.');
                navigation.navigate('Login');
                return;
            }
            
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
                    authorId: questionData.nickname || questionData.author || null
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // ===============================================
    // 💡 인증된 API 호출 함수: 답변 목록 로드
    // ===============================================
    const loadAnswers = async () => {
        if (!currentQuestionId) {
            setAnswers([]);
            return;
        }

        try {
            setAnswersLoading(true);
            console.log('답변 목록 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/answers`);
            
            // authenticatedFetch 사용
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
                // 중첩된 답변 구조를 평면화
                const flattenAnswers = (answersArray) => {
                    const flattened = [];
                    
                    answersArray.forEach(answer => {
                        flattened.push({
                            id: answer.id,
                            content: answer.content,
                            author: answer.author || "사용자",
                            authorId: answer.author || null, // 닉네임을 authorId로 사용
                            authorImage: answer.profileImg || null,
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
                                    author: childAnswer.author || "사용자",
                                    authorId: childAnswer.author || null, // 닉네임을 authorId로 사용
                                    authorImage: childAnswer.profileImg || null,
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

    // ===============================================
    // 💡 인증된 API 호출 함수: 조회수 업데이트
    // ===============================================
    const updateViewCount = async () => {
        try {
            console.log('조회수 업데이트 요청:', `${API_BASE_URL}/api/questions/${currentQuestionId}/view`);
            
            // authenticatedFetch 사용
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${currentQuestionId}/view`, {
                method: 'POST',
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
        await loadUserProfile(); // 프로필 정보도 새로고침
        await loadQuestionData();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    // ===============================================
    // 💡 인증된 API 호출 함수: 질문 삭제
    // ===============================================
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
                            console.log('질문 삭제 요청:', `${API_BASE_URL}/api/questions/${question.id}/${currentUserMemberId}`);
                            
                            // authenticatedFetch 사용 - memberId 포함
                            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}/${currentUserMemberId}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('질문 삭제 에러:', errorText);
                                throw new Error(`질문 삭제 실패! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (data.isSuccess || response.status === 204) {
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

    // ===============================================
    // 💡 인증된 API 호출 함수: 좋아요 처리
    // ===============================================
    const handleLike = async () => {
        if (!question) return;

        try {
            console.log('좋아요 처리 요청:', `${API_BASE_URL}/api/question-like/${question.id}/${currentUserMemberId}`);
            
            // authenticatedFetch 사용 - memberId 포함
            const response = await authenticatedFetch(`${API_BASE_URL}/api/question-like/${question.id}/${currentUserMemberId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('좋아요 처리 에러:', errorText);
                throw new Error(`좋아요 처리 실패! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess) {
                setQuestion(prev => ({
                    ...prev,
                    isLiked: !prev.isLiked,
                    likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
                }));
            } else {
                throw new Error(data.message || '좋아요 처리에 실패했습니다.');
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

    // ===============================================
    // 💡 인증된 API 호출 함수: 답변 삭제
    // ===============================================
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
                            console.log('답변 삭제 요청:', `${API_BASE_URL}/api/answers/${answerId}/${currentUserMemberId}`);
                            
                            // authenticatedFetch 사용 - memberId 포함
                            const response = await authenticatedFetch(`${API_BASE_URL}/api/answers/${answerId}/${currentUserMemberId}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('답변 삭제 에러:', errorText);
                                throw new Error(`답변 삭제 실패! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (data.isSuccess || response.status === 204) {
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

    // ===============================================
    // 💡 인증된 API 호출 함수: 답변 등록
    // ===============================================
    const handleAnswerSubmit = async (content, isAI = false) => {
        try {
            if (replyingTo) {
                // 답글 등록
                const response = await authenticatedFetch(`${API_BASE_URL}/api/answers/${replyingTo}/replies`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: content.trim()
                    })
                });

                if (!response.ok) {
                    throw new Error(`답글 등록 실패! status: ${response.status}`);
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
                const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}/answers`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: content.trim(),
                        isAI: isAI
                    })
                });

                if (!response.ok) {
                    throw new Error(`답변 등록 실패! status: ${response.status}`);
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

    // ===============================================
    // 💡 인증된 API 호출 함수: AI 답변 생성
    // ===============================================
    const generateAIAnswer = async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/${question.id}/ai-answer`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`AI 답변 생성 실패! status: ${response.status}`);
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
                        currentUserId={currentUserNickname}
                        onLike={handleLike}
                        onDelete={handleDeleteQuestion}
                    />

                    <AnswerSection
                        answers={answers}
                        answersLoading={answersLoading}
                        questionAnswersCount={question.answersCount}
                        currentUserId={currentUserNickname}
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