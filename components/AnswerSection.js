import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { answerSectionStyle } from '../styles/AnswerSectionStyle';

const AnswerSection = ({ 
    answers, 
    answersLoading, 
    questionAnswersCount, 
    currentUserId, 
    onReplyPress, 
    onDeleteAnswer 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${month}/${day} ${hours}:${minutes}`;
        } catch {
            return dateString;
        }
    };

    const renderUserProfile = (user) => {
        if (user.isAI) {
            return (
                <View style={answerSectionStyle.aiIcon}>
                    <Text style={answerSectionStyle.aiIconText}>AI</Text>
                </View>
            );
        }

        return (
            <View style={answerSectionStyle.userIconContainer}>
                {user.authorImage || user.profileImg ? (
                    <Image 
                        source={{ uri: user.authorImage || user.profileImg }} 
                        style={answerSectionStyle.userIconImage}
                        resizeMode="cover"
                        onError={() => {
                            console.log('프로필 이미지 로딩 실패:', user.authorImage || user.profileImg);
                        }}
                    />
                ) : (
                    <View style={answerSectionStyle.userIcon}>
                        <Ionicons name="person-outline" size={16} color="#999" />
                    </View>
                )}
            </View>
        );
    };

    const renderAnswer = (answer) => {
        // 답변 작성자가 현재 사용자인지 확인 (닉네임으로 비교)
        const isAnswerOwner = answer.authorId === currentUserId;
        
        // AI 답변인 경우 닉네임을 "AI 답변"으로 표시
        const displayName = answer.isAI ? "AI 답변" : (answer.author || "사용자");

        return (
            <View key={answer.id} style={[
                answerSectionStyle.answerContainer,
                answer.level > 0 && answerSectionStyle.childAnswerContainer
            ]}>
                <View style={answerSectionStyle.authorIconContainer}>
                    {renderUserProfile(answer)}
                </View>
                <View style={answerSectionStyle.answerContentWrapper}>
                    <View style={answerSectionStyle.answerHeader}>
                        <Text style={answerSectionStyle.authorName}>{displayName}</Text>
                        <Text style={answerSectionStyle.answerDate}>{formatDate(answer.createdAt)}</Text>
                    </View>
                    <Text style={answerSectionStyle.answerText}>{answer.content}</Text>
                    
                    {/* 답변 액션 버튼들 */}
                    <View style={answerSectionStyle.answerActions}>
                        {/* 최상위 답변(level 0)에만 답글 작성 버튼 표시 */}
                        {answer.level === 0 && (
                            <TouchableOpacity 
                                style={answerSectionStyle.actionButton} 
                                onPress={() => onReplyPress(answer.id, displayName)}
                            >
                                <Text style={answerSectionStyle.actionText}>답글 작성</Text>
                            </TouchableOpacity>
                        )}
                        
                        {/* 자신이 작성한 답변에만 삭제 버튼 표시 */}
                        {isAnswerOwner && (
                            <>
                                {answer.level === 0 && (
                                    <Text style={answerSectionStyle.actionSeparator}>|</Text>
                                )}
                                <TouchableOpacity 
                                    style={answerSectionStyle.actionButton}
                                    onPress={() => onDeleteAnswer(answer.id)}
                                >
                                    <Text style={answerSectionStyle.actionText}>삭제</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyAnswers = () => (
        <View style={answerSectionStyle.emptyAnswersContainer}>
            <Text style={answerSectionStyle.emptyAnswersText}>아직 답변이 없습니다</Text>
            <Text style={answerSectionStyle.emptyAnswersSubText}>첫 번째 답변을 남겨보세요!</Text>
        </View>
    );

    return (
        <>
            {/* 답변 섹션 헤더 */}
            <View style={answerSectionStyle.answersSectionHeader}>
                <Text style={answerSectionStyle.answersTitle}>답변 ({questionAnswersCount})</Text>
            </View>
            
            {/* 답변 목록 */}
            <View style={answerSectionStyle.answersSection}>
                {answersLoading ? (
                    <View style={answerSectionStyle.loadingContainer}>
                        <ActivityIndicator size="small" color="#90D1BE" />
                        <Text style={answerSectionStyle.loadingText}>답변을 불러오는 중...</Text>
                    </View>
                ) : answers.length > 0 ? (
                    answers.map(renderAnswer)
                ) : (
                    renderEmptyAnswers()
                )}
            </View>
        </>
    );
};

export default AnswerSection;