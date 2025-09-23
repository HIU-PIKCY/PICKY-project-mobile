import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { questionSectionStyle } from '../styles/QuestionSectionStyle';

const QuestionSection = ({ question, currentUserId, onLike, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\. /g, '.').slice(0, -1);
        } catch {
            return dateString;
        }
    };

    const renderUserProfile = (user) => {
        if (user.isAI) {
            return (
                <View style={questionSectionStyle.aiIcon}>
                    <Text style={questionSectionStyle.aiIconText}>AI</Text>
                </View>
            );
        }

        return (
            <View style={questionSectionStyle.userIconContainer}>
                {user.authorImage || user.profileImg ? (
                    <Image 
                        source={{ uri: user.authorImage || user.profileImg }} 
                        style={questionSectionStyle.userIconImage}
                        resizeMode="cover"
                        onError={() => {
                            console.log('프로필 이미지 로딩 실패:', user.authorImage || user.profileImg);
                        }}
                    />
                ) : (
                    <View style={questionSectionStyle.userIcon}>
                        <Ionicons name="person-outline" size={16} color="#999" />
                    </View>
                )}
            </View>
        );
    };

    // 질문 작성자가 현재 사용자인지 확인 (닉네임으로 비교)
    const isQuestionOwner = question.authorId === currentUserId;

    const handleMenuPress = () => {
        setShowMenu(true);
    };

    const handleDeletePress = () => {
        setShowMenu(false);
        onDelete();
    };

    return (
        <View style={questionSectionStyle.questionSection}>
            <View style={questionSectionStyle.questionHeader}>
                <View style={questionSectionStyle.iconWrapper}>
                    {renderUserProfile({
                        isAI: question.isAI,
                        authorImage: question.profileImg || question.profileImage,
                        profileImg: question.profileImg
                    })}
                    <Text style={questionSectionStyle.questionAuthor}>
                        {question.nickname || question.author}
                    </Text>
                </View>
                
                <View style={questionSectionStyle.headerRight}>
                    <Text style={questionSectionStyle.bookLabel}>
                        {question.book?.title || "책 제목"}
                    </Text>
                    
                    {/* 질문 작성자에게만 메뉴 버튼 표시 */}
                    {isQuestionOwner && (
                        <TouchableOpacity 
                            style={questionSectionStyle.menuButton}
                            onPress={handleMenuPress}
                        >
                            <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text style={questionSectionStyle.questionTitle}>{question.title}</Text>
            {question.content && (
                <Text style={questionSectionStyle.questionContent}>{question.content}</Text>
            )}
            
            <View style={questionSectionStyle.questionMeta}>
                <View style={questionSectionStyle.metaItem}>
                    <Ionicons name="book-outline" size={16} color="#666" />
                    <Text style={questionSectionStyle.metaText}>페이지 {question.page || '-'}</Text>
                </View>
            </View>

            <View style={questionSectionStyle.questionFooter}>
                <View style={questionSectionStyle.statItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={questionSectionStyle.dateText}>{formatDate(question.createdAt)}</Text>
                </View>
                <View style={questionSectionStyle.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#666" />
                    <Text style={questionSectionStyle.statText}>조회수 {question.views}</Text>
                </View>
                <TouchableOpacity style={questionSectionStyle.statItem} onPress={onLike}>
                    <Ionicons 
                        name={question.isLiked ? "heart" : "heart-outline"} 
                        size={16} 
                        color={question.isLiked ? "#FF6B6B" : "#666"} 
                    />
                    <Text style={[
                        questionSectionStyle.statText,
                        question.isLiked && questionSectionStyle.likedText
                    ]}>
                        추천 {question.likes}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 삭제 메뉴 모달 */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity 
                    style={questionSectionStyle.modalOverlay}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={questionSectionStyle.menuModal}>
                        <TouchableOpacity 
                            style={questionSectionStyle.menuItem}
                            onPress={handleDeletePress}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                            <Text style={questionSectionStyle.deleteMenuText}>질문 삭제</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default QuestionSection;