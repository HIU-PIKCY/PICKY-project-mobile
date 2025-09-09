import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MintStar from '../assets/icons/MintStar.svg';
import { answerPostStyle } from '../styles/AnswerPostStyle';

const AnswerPost = ({ 
    replyingTo, 
    replyingToAuthor, 
    onCancelReply, 
    onSubmitAnswer, 
    onGenerateAI 
}) => {
    const [newAnswer, setNewAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [generatedAIAnswer, setGeneratedAIAnswer] = useState(null);
    const [submittingAIAnswer, setSubmittingAIAnswer] = useState(false);

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
        try {
            const aiContent = await onGenerateAI();
            setGeneratedAIAnswer(aiContent);
        } catch (error) {
            Alert.alert('오류', 'AI 답변 생성 중 오류가 발생했습니다.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmitAIAnswer = async () => {
        if (!generatedAIAnswer) return;

        setSubmittingAIAnswer(true);
        try {
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
                    <ActivityIndicator size="large" color="#90D1BE" />
                    <Text style={answerPostStyle.aiGeneratingText}>
                        AI가 답변을 생성하고 있습니다...
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
                            <View style={answerPostStyle.userIconSmall}>
                                <Ionicons name="person-outline" size={16} color="#999" />
                            </View>
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
                    <View style={answerPostStyle.inputActions}>
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