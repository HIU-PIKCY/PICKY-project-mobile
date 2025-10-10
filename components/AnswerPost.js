import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    Keyboard,
    Animated,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MintStar from '../assets/icons/MintStar.svg';
import { answerPostStyle } from '../styles/AnswerPostStyle';
import { useAuth } from '../AuthContext';

const API_BASE_URL = "http://13.124.86.254";

const AnswerPost = ({ 
    replyingTo, 
    replyingToAuthor, 
    onCancelReply, 
    onSubmitAnswer, 
    onGenerateAI 
}) => {
    const { authenticatedFetch } = useAuth();
    const [newAnswer, setNewAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [generatedAIAnswer, setGeneratedAIAnswer] = useState(null);
    const [submittingAIAnswer, setSubmittingAIAnswer] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // 컴포넌트 마운트 시 사용자 프로필 로드
    useEffect(() => {
        loadUserProfile();
    }, []);

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
                setUserProfile({
                    id: data.result.id,
                    name: data.result.name,
                    nickname: data.result.nickname,
                    profileImg: data.result.profileImg
                });
            }
        } catch (error) {
            console.error('사용자 프로필 로딩 실패:', error);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!newAnswer.trim()) {
            Alert.alert('알림', '답변 내용을 입력해주세요.');
            return;
        }

        setSubmittingAnswer(true);
        try {
            const success = await onSubmitAnswer(newAnswer.trim(), false);
            if (success) {
                setNewAnswer('');
                Keyboard.dismiss();
            }
        } catch (error) {
            console.error('답변 등록 실패:', error);
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleAIAnswerGenerate = async () => {
        setGeneratingAI(true);
        const startTime = Date.now();
        
        try {
            const aiContent = await onGenerateAI();
            
            // 최소 2초 로딩 보장
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            setGeneratedAIAnswer(aiContent);
        } catch (error) {
            // 에러가 발생해도 최소 2초는 유지
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            Alert.alert('오류', 'AI 답변 생성 중 오류가 발생했습니다.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmitAIAnswer = async () => {
        if (!generatedAIAnswer) return;

        setSubmittingAIAnswer(true);
        try {
            // AI 답변을 실제로 등록
            const success = await onSubmitAnswer(generatedAIAnswer, true);
            if (success) {
                setGeneratedAIAnswer(null);
            }
        } catch (error) {
            console.error('AI 답변 등록 실패:', error);
        } finally {
            setSubmittingAIAnswer(false);
        }
    };

    const handleCancelAIAnswer = () => {
        setGeneratedAIAnswer(null);
    };

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
            <View style={answerPostStyle.aiLoadingContainer}>
                {/* 중앙 AI 아이콘 */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={answerPostStyle.aiIconCircle}>
                        <Ionicons name="sparkles" size={32} color="#90D1BE" />
                    </View>
                </Animated.View>

                {/* 주변 반짝이는 별들 */}
                <Animated.View 
                    style={[
                        answerPostStyle.sparkle, 
                        answerPostStyle.sparkle1,
                        { opacity: sparkles[0] }
                    ]}
                >
                    <Ionicons name="star" size={14} color="#90D1BE" />
                </Animated.View>
                <Animated.View 
                    style={[
                        answerPostStyle.sparkle, 
                        answerPostStyle.sparkle2,
                        { opacity: sparkles[1] }
                    ]}
                >
                    <Ionicons name="star" size={10} color="#78C8B0" />
                </Animated.View>
                <Animated.View 
                    style={[
                        answerPostStyle.sparkle, 
                        answerPostStyle.sparkle3,
                        { opacity: sparkles[2] }
                    ]}
                >
                    <Ionicons name="star" size={12} color="#A8DCC8" />
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={answerPostStyle.answerInputContainer}>
            {/* 답글 작성 모드 표시 */}
            {replyingTo && (
                <View style={answerPostStyle.replyModeContainer}>
                    <Text style={answerPostStyle.replyModeText}>
                        {replyingToAuthor}님께 답글 작성
                    </Text>
                    <TouchableOpacity onPress={onCancelReply}>
                        <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                </View>
            )}
            
            {generatingAI ? (
                <View style={answerPostStyle.aiGeneratingContainer}>
                    <AILoadingAnimation />
                    <Text style={answerPostStyle.aiGeneratingText}>
                        AI가 답변을 생성하는 중이에요···
                    </Text>
                </View>
            ) : generatedAIAnswer ? (
                <View style={answerPostStyle.aiAnswerPreviewContainer}>
                    <View style={answerPostStyle.aiAnswerHeader}>
                        <View style={answerPostStyle.aiAnswerIconContainer}>
                            <View style={answerPostStyle.aiIcon}>
                                <Text style={answerPostStyle.aiIconText}>AI</Text>
                            </View>
                            <Text style={answerPostStyle.aiAnswerAuthor}>AI 답변</Text>
                        </View>
                    </View>
                    <Text style={answerPostStyle.aiAnswerContent}>{generatedAIAnswer}</Text>
                    <View style={answerPostStyle.aiAnswerActions}>
                        <TouchableOpacity
                            style={answerPostStyle.aiCancelButton}
                            onPress={handleCancelAIAnswer}
                            disabled={submittingAIAnswer}
                        >
                            <Text style={answerPostStyle.aiCancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                answerPostStyle.aiSubmitButton,
                                submittingAIAnswer && answerPostStyle.aiSubmitButtonDisabled
                            ]}
                            onPress={handleSubmitAIAnswer}
                            disabled={submittingAIAnswer}
                        >
                            {submittingAIAnswer ? (
                                <ActivityIndicator size="small" color="#4B4B4B" />
                            ) : (
                                <Text style={answerPostStyle.aiSubmitButtonText}>답변 등록</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <View style={answerPostStyle.inputRow}>
                        {/* 현재 사용자의 프로필 */}
                        <View style={answerPostStyle.userIconContainer}>
                            {userProfile?.profileImg ? (
                                <Image 
                                    source={{ uri: userProfile.profileImg }}
                                    style={answerPostStyle.userProfileImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={answerPostStyle.userIconSmall}>
                                    <Ionicons name="person-outline" size={16} color="#999" />
                                </View>
                            )}
                        </View>
                        <TextInput
                            style={answerPostStyle.answerInput}
                            placeholder={replyingTo ? "답글을 입력해주세요." : "나의 생각을 공유해요!"}
                            value={newAnswer}
                            onChangeText={setNewAnswer}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                            editable={!submittingAnswer}
                        />
                    </View>
                    {/* 답글 모드일 때와 일반 답변 모드일 때 다른 레이아웃 */}
                    <View style={replyingTo ? answerPostStyle.inputActionsReply : answerPostStyle.inputActions}>
                        {/* 답글 모드가 아닐 때만 AI 답변 생성 버튼 표시 */}
                        {!replyingTo && (
                            <TouchableOpacity 
                                style={answerPostStyle.aiAnswerButton}
                                onPress={handleAIAnswerGenerate}
                                disabled={submittingAnswer}
                            >
                                <MintStar />
                                <Text style={answerPostStyle.aiAnswerButtonText}>AI 답변 생성</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[
                                answerPostStyle.submitButton,
                                submittingAnswer && answerPostStyle.submitButtonDisabled
                            ]} 
                            onPress={handleSubmitAnswer}
                            disabled={submittingAnswer}
                        >
                            {submittingAnswer ? (
                                <ActivityIndicator size="small" color="#4B4B4B" />
                            ) : (
                                <Text style={answerPostStyle.submitButtonText}>
                                    {replyingTo ? "답글 등록" : "답변 등록"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

export default AnswerPost;