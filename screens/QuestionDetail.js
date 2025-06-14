import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestionDetail = ({ navigation, route }) => {
  const [newAnswer, setNewAnswer] = useState('');
  
  // 더미 데이터
  const questionData = {
    id: 1,
    bookTitle: '운수 좋은 날',
    title: '작가의 의도는?',
    content: '이 책에서 보면,\n주인공은 이렇게 생각하잖아요..\n근데 저는 이렇게 생각하거든요..\n그러다가.. 작가는 어떤 의도로 이렇게 글을 쓴걸까.. 하고 의문이 들어서 글을 써봅니다..',
    author: 'AI 질문',
    date: '2025.04.20',
    views: 31,
    likes: 5,
    pages: 122,
    answers: [
      {
        id: 1,
        author: 'AI 답변',
        content: '주인공은 세 단계의 성장 과정을 거치게 돼요.\n그 과정에서 얻은 인사이트들로 주인공은 성장하게 되죠.',
        isAI: true,
      },
      {
        id: 2,
        author: '키티키티',
        content: '이 소설에서 주인공은 시골에서 도시로 이주했는데 마음이 좋지 않았어요. 그 과정에서 주인공의 고난이 시작됐거든요ㅠㅠ',
        isAI: false,
      }
    ]
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLike = () => {
    // 좋아요 기능
    console.log('좋아요 클릭');
  };

  const handleSubmitAnswer = () => {
    if (newAnswer.trim()) {
      // 답변 제출 로직
      console.log('새 답변:', newAnswer);
      setNewAnswer('');
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>질문답변</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 질문 섹션 */}
        <View style={styles.questionSection}>
          <View style={styles.questionHeader}>
            <View style={styles.iconWrapper}>
                <View style={styles.aiIcon}>
                <Text style={styles.aiIconText}>AI</Text>
                </View>
                <Text style={styles.questionAuthor}>AI 질문</Text>
            </View>
            <Text style={styles.todayLabel}>{questionData.bookTitle}</Text>
          </View>

          <Text style={styles.questionTitle}>{questionData.title}</Text>
          <Text style={styles.questionContent}>{questionData.content}</Text>

          <View style={styles.questionMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color="#666" />
              <Text style={styles.metaText}>페이지 {questionData.pages}</Text>
            </View>
          </View>

          <View style={styles.questionFooter}>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>{questionData.date}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={16} color="#666" />
                <Text style={styles.statText}>조회수 {questionData.views}</Text>
              </View>
              <TouchableOpacity style={styles.statItem} onPress={handleLike}>
                <Ionicons name="heart-outline" size={16} color="#666" />
                <Text style={styles.statText}>추천 {questionData.likes}</Text>
              </TouchableOpacity>
          </View>
        </View>

        {/* 답변 섹션 */}
        <View style={styles.answersSectionHeader}>
            <Text style={styles.answersTitle}>댓글</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity style={styles.sortButton}>
                <Text style={styles.sortButtonText}>최신순</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortButton}>
                <Text style={styles.sortButtonText}>추천순</Text>
              </TouchableOpacity>
            </View>
        </View>
        <View style={styles.answersSection}>
          {questionData.answers.map(renderAnswer)}
        </View>
      </ScrollView>

      {/* 답변 input */}
      <View style={styles.answerInputContainer}>
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
          />
        </View>
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.aiAnswerButton}>
            <Text style={styles.aiAnswerButtonText}>🤖 AI 답변 생성</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnswer}>
            <Text style={styles.submitButtonText}>답변 등록</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  questionSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  iconWrapper:{
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
    fontWeight: '500',
  },
  questionAuthor: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  todayLabel: {
    fontSize: 12,
    color: '#666',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 14,
  },
  questionContent: {
    fontSize: 14,
    lineHeight: 18,
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
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  answersSection: {
    backgroundColor: '#fff',
  },
  answersSectionHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    marginLeft: 12,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  answerContainer: {
    backgroundColor: '#F3FCF9',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
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
    color: '#666',
  },
  answerText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666',
  },
  answerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  answerInputContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  userIconSmall: {
    backgroundColor: '#f1f3f4',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 8,
  },
  answerInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiAnswerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  aiAnswerButtonText: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#666',
  },
});

export default QuestionDetail;