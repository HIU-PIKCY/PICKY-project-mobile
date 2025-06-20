import { useRef, React, useState, useEffect } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";
import MintStar from "../assets/icons/MintStar.svg";
import { AIQuestionSheet, QuestionWriteSheet } from "./QuestionPost";

// 더미 질문 데이터 (책별로 다른 질문들)
const getQuestionsForBook = (bookId) => {
  const questionsByBook = {
    1: [ // 운수 좋은 날
      {
        id: 1,
        author: "AI",
        content: "작가의 의도는?",
        views: 122,
        answers: 2,
        likes: 5,
        isAI: true,
        page: 220,
      },
      {
        id: 2,
        author: "키티키티",
        content: "이 책 너무 어렵네요..",
        views: 27,
        answers: 6,
        likes: 11,
        isAI: false,
        page: 45,
      },
    ],
    2: [ // 노스텔지어
      {
        id: 3,
        author: "AI",
        content: "감정의 변화 과정이 어떻게 그려지나요?",
        views: 89,
        answers: 3,
        likes: 12,
        isAI: true,
        page: 67,
      },
    ],
    3: [ // 1984
      {
        id: 4,
        author: "AI",
        content: "빅브라더의 상징적 의미는?",
        views: 156,
        answers: 8,
        likes: 23,
        isAI: true,
        page: 89,
      },
      {
        id: 5,
        author: "독서왕",
        content: "현실과 너무 비슷해서 무서워요",
        views: 45,
        answers: 12,
        likes: 18,
        isAI: false,
        page: 234,
      },
    ],
    // 다른 책들은 기본 질문들로
  };

  return questionsByBook[bookId] || [
    {
      id: Date.now(),
      author: "AI",
      content: "이 책에 대한 질문을 생성해보세요!",
      views: 0,
      answers: 0,
      likes: 0,
      isAI: true,
      page: null,
    },
  ];
};

const BookDetail = ({ navigation, route }) => {
  const aiSheetRef = useRef(null);
  const writeSheetRef = useRef(null);
  const screenHeight = Dimensions.get("window").height;

  // route params에서 책 데이터 가져오기
  const { bookData } = route.params || {};
  
  const [book, setBook] = useState({
    title: bookData?.title || "제목 없음",
    author: bookData?.author || "작가 미상",
    publisher: "소담", // 더미 데이터
    pages: 231, // 더미 데이터
    status: bookData?.status || "읽는 중",
    coverImage: bookData?.coverImage || null,
  });
  
  const [questions, setQuestions] = useState([]);
  const [selectedSort, setSelectedSort] = useState('latest');

  // 컴포넌트 마운트 시 해당 책의 질문들 로드
  useEffect(() => {
    if (bookData?.id) {
      const bookQuestions = getQuestionsForBook(bookData.id);
      setQuestions(bookQuestions);
    }
  }, [bookData]);

  const handleGoBack = () => navigation.goBack();
  const handleAIQuestion = () => aiSheetRef.current?.open();
  const handleQuestionRegister = () => writeSheetRef.current?.open();
  const handleDelete = () => console.log("내 서재에서 삭제");
  const goToQuestionDetail = (question) => {
    const questionToPass = {
      id: question.id,
      author: question.author,
      content: question.content,
      views: question.views,
      answers: question.answers,
      likes: question.likes,
      isAI: question.isAI,
      page: question.page
    };
    
    const bookToPass = {
      id: bookData?.id,
      title: bookData?.title,
      author: bookData?.author,
      status: bookData?.status
    };
    
    navigation.navigate("QuestionDetail", {
      questionData: questionToPass,
      bookData: bookToPass
    });
  };

  const handleAddQuestion = (questionData) => {
    const newQuestion = {
      id: Date.now(),
      author: "나",
      content: questionData.title,
      views: 0,
      answers: 0,
      likes: 0,
      isAI: false,
      page: questionData.page ? parseInt(questionData.page) : null,
      body: questionData.body,
      createdAt: new Date(),
    };

    setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]);
    writeSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CustomHeader title="도서 상세" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionSection}>
          <View style={styles.bookSection}>
            <View style={styles.cover}>
              {book.coverImage ? (
                <Image 
                  source={{ uri: book.coverImage }} 
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.emptyCover} />
              )}
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.title}>{book.title}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>작가</Text>
                <Text style={styles.metaValue}>{book.author}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>출판사</Text>
                <Text style={styles.metaValue}>{book.publisher}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>페이지</Text>
                <Text style={styles.metaValue}>{book.pages}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>상태</Text>
                <Text style={styles.metaValue}>
                  <Text style={styles.readDot}>•</Text> {book.status}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteText}>내 서재에서 삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.answersSectionHeader}>
          <Text style={styles.answersTitle}>독서 질문 리스트</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSelectedSort('latest')}
            >
              <Text style={[
                styles.sortButtonText,
                selectedSort === 'latest' && styles.sortButtonTextSelected
              ]}>
                최신순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSelectedSort('recommended')}
            >
              <Text style={[
                styles.sortButtonText,
                selectedSort === 'recommended' && styles.sortButtonTextSelected
              ]}>
                추천순
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {questions.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={styles.answerContainer}
            onPress={() => goToQuestionDetail(q)}
          >
            <View style={styles.authorIconContainer}>
              {q.isAI ? (
                <View style={styles.aiIcon}>
                  <Text style={styles.aiIconText}>AI</Text>
                </View>
              ) : (
                <View style={styles.userIcon} />
              )}
            </View>
            <View style={styles.answerContentWrapper}>
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{q.author}</Text>
              </View>
              <Text style={styles.answerText}>{q.content}</Text>
            </View>
            <View style={styles.answerMetaWrapper}>
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  {q.page !== null ? q.page : "-"}
                </Text>
              </View>
              <Text style={styles.statText}>답변 {q.answers}</Text>
              <Text style={styles.statText}>추천 {q.likes}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.answerInputContainer}>
        <TouchableOpacity
          style={styles.aiAnswerButton}
          onPress={handleAIQuestion}
        >
          <MintStar />
          <Text style={styles.aiAnswerButtonText}>AI 질문 생성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleQuestionRegister}
        >
          <Text style={styles.submitButtonText}>질문 등록</Text>
        </TouchableOpacity>
      </View>

      <AIQuestionSheet ref={aiSheetRef} modalHeight={screenHeight} />
      <QuestionWriteSheet
        ref={writeSheetRef}
        modalHeight={screenHeight}
        onSubmit={handleAddQuestion}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  questionSection: { backgroundColor: "#fff", padding: 20 },
  bookSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  cover: {
    width: 115,
    height: 173,
    borderRadius: 4,
    marginRight: 20,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  emptyCover: {
    width: '100%',
    height: '100%',
    backgroundColor: "#E8E8E8",
  },
  bookInfo: {
    flex: 1,
    justifyContent: "space-between",
    height: 173,
  },
  title: {
    fontSize: 18,
    fontFamily: "SUIT-SemiBold",
    color: "#0D2525",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    width: 90,
  },
  metaLabel: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#666",
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#666",
    textAlign: "right",
  },
  readDot: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#90D1BE",
    marginRight: 4,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#DA1717",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteText: {
    fontSize: 12,
    color: "#DA1717",
    fontFamily: "SUIT-Medium",
  },
  answersSectionHeader: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: "#E8E8E8",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  answersTitle: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    letterSpacing: -0.7,
    color: "#4B4B4B",
  },
  sortButtons: { flexDirection: "row" },
  sortButton: {
    marginLeft: 12,
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    letterSpacing: -0.6,
    color: "#888",
  },
  sortButtonTextSelected: { 
    color: "#0D2525" 
  },
  answerContainer: {
    backgroundColor: "#F3FCF9",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  authorIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 5,
  },
  aiIcon: {
    backgroundColor: "#333",
    borderRadius: 16,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  aiIconText: {
    color: "#fff",
    fontSize: 10,
  },
  userIcon: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    width: 30,
    height: 30,
    marginRight: 8,
  },
  answerContentWrapper: { flex: 1, minWidth: 0 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  authorName: {
    fontSize: 10,
    fontFamily: "SUIT-Medium",
    color: "#666",
  },
  pageInfo: {
    fontSize: 10,
    fontFamily: "SUIT-Medium",
    color: "#90D1BE",
    marginLeft: 8,
  },
  answerText: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    letterSpacing: -0.4,
    color: "#666",
  },
  answerBody: {
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    color: "#999",
    marginTop: 4,
    lineHeight: 16,
  },
  answerMetaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginLeft: 8,
    marginTop: 3,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    color: "#666",
    marginLeft: 4,
  },
  answerInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  aiAnswerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  aiAnswerButtonText: {
    fontSize: 14,
    fontFamily: "SUIT-Regular",
    letterSpacing: -0.35,
    color: "#4B4B4B",
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "SUIT-Regular",
    letterSpacing: -0.35,
    color: "#4B4B4B",
  },
});

export default BookDetail;