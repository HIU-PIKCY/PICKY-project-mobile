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
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";
import MintStar from "../assets/icons/MintStar.svg";
import { AIQuestionSheet, QuestionWriteSheet } from "./QuestionPost";

const BookDetail = ({ navigation, route }) => {
  const aiSheetRef = useRef(null);
  const writeSheetRef = useRef(null);
  const screenHeight = Dimensions.get("window").height;

  // 서버 API URL
  const API_BASE_URL = 'http://13.124.86.254';

  // route params에서 ISBN과 기본 책 데이터 가져오기
  const { isbn, bookData } = route.params || {};
  
  const [book, setBook] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedSort, setSelectedSort] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookData();
  }, [isbn]);

  useEffect(() => {
    if (book && book.bookId) {
      loadQuestions();
    }
  }, [book?.bookId, selectedSort]);

  const loadBookData = async () => {
    if (!isbn) {
      setError("ISBN 정보가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ISBN으로 데이터베이스 내부 책 ID 조회
      console.log('ISBN으로 책 ID 조회:', `${API_BASE_URL}/api/books/isbn/${isbn}`);
      
      const isbnResponse = await fetch(`${API_BASE_URL}/api/books/isbn/${isbn}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('ISBN 조회 응답 상태:', isbnResponse.status);

      if (!isbnResponse.ok) {
        throw new Error(`HTTP error! status: ${isbnResponse.status}`);
      }

      const isbnData = await isbnResponse.json();
      console.log('ISBN 조회 응답:', isbnData);

      if (!isbnData.isSuccess || !isbnData.result) {
        throw new Error(isbnData.message || 'ISBN으로 책을 찾을 수 없습니다.');
      }

      const bookId = isbnData.result.id;
      
      // 책 상세 정보 조회 (isbn 이용)
      console.log('책 상세 정보 요청:', `${API_BASE_URL}/api/books/${isbn}`);
      
      const detailResponse = await fetch(`${API_BASE_URL}/api/books/${isbn}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('상세 정보 응답 상태:', detailResponse.status);

      if (!detailResponse.ok) {
        throw new Error(`HTTP error! status: ${detailResponse.status}`);
      }

      const detailData = await detailResponse.json();
      console.log('책 상세 응답:', detailData);

      if (detailData.isSuccess && detailData.result) {
        const bookDetail = detailData.result;
        setBook({
          isbn: bookDetail.isbn || isbn,
          bookId: bookId, // ISBN으로 조회한 내부 ID 사용
          title: bookDetail.title || isbnData.result.title || "제목 없음",
          authors: bookDetail.authors || [isbnData.result.author] || ["작가 미상"],
          publisher: bookDetail.publisher || "출판사 미상",
          pageCount: bookDetail.pageCount || 0,
          publishedAt: bookDetail.publishedAt || "",
          coverImage: bookDetail.coverImage || null,
          isInLibrary: bookDetail.isInLibrary || false,
          readingStatus: bookDetail.readingStatus || null,
        });
      } else {
        // 상세 정보 조회 실패 시 ISBN 조회 결과만으로라도 설정
        setBook({
          isbn: isbn,
          bookId: bookId,
          title: isbnData.result.title || "제목 없음",
          authors: [isbnData.result.author] || ["작가 미상"],
          publisher: "출판사 미상",
          pageCount: 0,
          publishedAt: "",
          coverImage: null,
          isInLibrary: false,
          readingStatus: null,
        });
      }
    } catch (error) {
      console.error('책 정보 가져오기 실패:', error);
      setError(error.message);
      
      // 에러 시 기본 데이터라도 표시 (질문 기능은 비활성화)
      if (bookData) {
        setBook({
          isbn: bookData.isbn || isbn,
          bookId: null, // 에러 시에는 내부 ID 없음
          title: bookData.title || "제목 없음",
          authors: bookData.authors || ["작가 미상"],
          publisher: bookData.publisher || "출판사 미상",
          pageCount: bookData.pageCount || 0,
          publishedAt: bookData.publishedAt || "",
          coverImage: bookData.coverImage || null,
          isInLibrary: false,
          readingStatus: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!book || !book.bookId) {
      console.log('bookId가 없어서 질문을 가져올 수 없습니다.');
      setQuestions([]);
      return;
    }

    try {
      setQuestionsLoading(true);
      console.log('질문 목록 요청:', `${API_BASE_URL}/api/books/${book.bookId}/questions`);
      
      const response = await fetch(`${API_BASE_URL}/api/books/${book.bookId}/questions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('질문 목록 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          setQuestions([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('질문 목록 응답:', data);

      if (data.isSuccess && data.result && data.result.questions) {
        const formattedQuestions = data.result.questions.map(q => ({
          id: q.id,
          // 닉네임: 향후 nickname 필드가 추가되면 우선적으로 사용, 없으면 author 필드 사용
          author: q.nickname || q.author || "사용자",
          // 프로필 이미지: 향후 profileImg 필드가 추가되면 자동으로 사용
          authorImage: q.profileImg || q.profileImage || null,
          content: q.title,
          body: q.content || "", // content 필드가 없어서 빈 문자열로 설정
          views: q.views || 0,
          // comments를 answers로 매핑 (API에서 comments로 응답)
          answers: q.comments || q.answersCount || 0,
          likes: q.likes || 0,
          isAI: q.isAI || false,
          isLiked: q.isLiked || false,
          page: q.page || null,
          createdAt: q.createdAt || new Date().toISOString(), // createdAt이 없으면 현재 시간으로 설정
        }));

        const sortedQuestions = [...formattedQuestions].sort((a, b) => {
          if (selectedSort === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } else if (selectedSort === 'recommended') {
            return b.likes - a.likes;
          }
          return 0;
        });

        setQuestions(sortedQuestions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('질문 목록 로딩 실패:', error);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookData();
    setRefreshing(false);
  };

  const handleGoBack = () => navigation.goBack();
  
  const handleAIQuestion = () => aiSheetRef.current?.open();
  
  const handleQuestionRegister = () => {
    if (!book?.bookId) {
      Alert.alert("알림", "질문을 등록하려면 도서가 데이터베이스에 등록되어야 합니다.");
      return;
    }
    writeSheetRef.current?.open();
  };

  const handleAddQuestion = async (questionData) => {
    if (!book?.bookId) {
      Alert.alert("오류", "질문을 등록할 수 없습니다. 도서 정보가 불완전합니다.");
      return;
    }

    try {
      console.log('질문 등록 요청:', `${API_BASE_URL}/api/books/${book.bookId}/questions`);
      
      const response = await fetch(`${API_BASE_URL}/api/books/${book.bookId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: questionData.title,
          content: questionData.body || questionData.title,
          page: questionData.page ? parseInt(questionData.page) : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        await loadQuestions();
        writeSheetRef.current?.close();
        Alert.alert("등록 완료", "질문이 성공적으로 등록되었습니다.");
      } else {
        throw new Error(data.message || '질문 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('질문 등록 실패:', error);
      Alert.alert("등록 실패", "질문 등록 중 오류가 발생했습니다.");
    }
  };

  const formatPublishedDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return dateString;
    }
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return "작가 미상";
    return authors.join(", ");
  };

  const getReadingStatusText = () => {
    if (book.readingStatus) {
      return book.readingStatus;
    }
    return book.isInLibrary ? "내 서재에 있음" : "내 서재에 없음";
  };

  const getReadingStatusColor = () => {
    if (book.readingStatus === "읽는 중") return "#90D1BE";
    if (book.readingStatus === "완독") return "#4CAF50";
    if (book.isInLibrary) return "#90D1BE";
    return "#999";
  };

  const renderEmptyQuestions = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="help-circle-outline" size={48} color="#CCCCCC" />
      <Text style={styles.emptyText}>등록된 질문이 없습니다</Text>
      <Text style={styles.emptySubText}>첫 번째 질문을 등록해보세요!</Text>
    </View>
  );

  const renderQuestionsSection = () => {
    if (!book?.bookId) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>질문 기능을 사용할 수 없습니다</Text>
          <Text style={styles.emptySubText}>도서가 데이터베이스에 등록되지 않았습니다</Text>
        </View>
      );
    }

    if (questionsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#90D1BE" />
          <Text style={styles.loadingText}>질문을 불러오는 중...</Text>
        </View>
      );
    }

    if (questions.length === 0) {
      return renderEmptyQuestions();
    }

    return questions.map((q) => (
      <TouchableOpacity
        key={q.id}
        style={styles.answerContainer}
        activeOpacity={0.7}
      >
        <View style={styles.authorIconContainer}>
          {q.isAI ? (
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
          ) : (
            <View style={styles.userIconContainer}>
              {q.authorImage ? (
                <Image 
                  source={{ uri: q.authorImage }} 
                  style={styles.userIconImage}
                  resizeMode="cover"
                  onError={() => {
                    console.log('프로필 이미지 로딩 실패:', q.authorImage);
                  }}
                />
              ) : (
                <View style={styles.userIcon}>
                  <Ionicons name="person-outline" size={16} color="#999" />
                </View>
              )}
            </View>
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
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <CustomHeader title="도서 상세" onBackPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#90D1BE" />
          <Text style={styles.loadingText}>책 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <CustomHeader title="도서 상세" onBackPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>책 정보를 불러올 수 없습니다</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadBookData}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CustomHeader title="도서 상세" onBackPress={handleGoBack} />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>최신 정보를 불러오지 못했습니다.</Text>
        </View>
      )}

      <ScrollView 
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
                <View style={styles.emptyCover}>
                  <Ionicons name="book-outline" size={24} color="#999" />
                </View>
              )}
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.title}>{book.title}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>작가</Text>
                <Text style={styles.metaValue}>{formatAuthors(book.authors)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>출판사</Text>
                <Text style={styles.metaValue}>{book.publisher}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>출간년도</Text>
                <Text style={styles.metaValue}>{formatPublishedDate(book.publishedAt)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>페이지</Text>
                <Text style={styles.metaValue}>{book.pageCount || "-"}</Text>
              </View>

              {book.isInLibrary && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>상태</Text>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.readDot, { color: getReadingStatusColor() }]}>•</Text>
                    <Text style={styles.metaValue}>{getReadingStatusText()}</Text>
                  </View>
                </View>
              )}

              {book.isInLibrary ? (
                <TouchableOpacity
                  style={[styles.deleteButton, processing && styles.buttonDisabled]}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#F87171" />
                  ) : (
                    <Text style={styles.deleteText}>내 서재에서 삭제</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.addButton, processing && styles.buttonDisabled]}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <Text style={styles.addText}>내 서재에 등록</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.answersSectionHeader}>
          <Text style={styles.answersTitle}>독서 질문 리스트</Text>
          {book?.bookId && (
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
          )}
        </View>

        {renderQuestionsSection()}
      </ScrollView>

      <View style={styles.answerInputContainer}>
        <TouchableOpacity
          style={[styles.aiAnswerButton, !book?.bookId && styles.buttonDisabled]}
          onPress={handleAIQuestion}
          disabled={!book?.bookId}
        >
          <MintStar />
          <Text style={styles.aiAnswerButtonText}>AI 질문 생성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, !book?.bookId && styles.buttonDisabled]}
          onPress={handleQuestionRegister}
          disabled={!book?.bookId}
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
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollContent: { 
    flexGrow: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#90D1BE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "SUIT-Medium",
    color: "#999999",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "SUIT-Regular",
    color: "#CCCCCC",
    marginTop: 8,
  },
  questionSection: { 
    backgroundColor: "#fff", 
    padding: 20 
  },
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
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  metaLabel: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#666",
    marginRight: 10,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#666",
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  readDot: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    marginRight: 4,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#F87171",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    fontSize: 12,
    color: "#F87171",
    fontFamily: "SUIT-Medium",
  },
  addText: {
    fontSize: 12,
    color: "#10B981",
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
  sortButtons: { 
    flexDirection: "row" 
  },
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
  userIconContainer: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  userIconImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userIcon: {
    backgroundColor: "#f1f3f4",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  answerContentWrapper: { 
    flex: 1, 
    minWidth: 0 
  },
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
  answerText: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    letterSpacing: -0.4,
    color: "#666",
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