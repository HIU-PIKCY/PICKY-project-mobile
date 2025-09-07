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
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookData();
  }, [isbn]);

  useEffect(() => {
    if (book) {
      loadQuestions();
    }
  }, [book, selectedSort]);

  const loadBookData = async () => {
    if (!isbn) {
      setError("ISBN 정보가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('책 상세 정보 요청:', `${API_BASE_URL}/api/books/${isbn}`);
      
      const response = await fetch(`${API_BASE_URL}/api/books/${isbn}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('책 상세 응답:', data);

      if (data.isSuccess && data.result) {
        const bookDetail = data.result;
        setBook({
          id: bookDetail.isbn, // ISBN을 ID로 사용
          title: bookDetail.title || "제목 없음",
          authors: bookDetail.authors || ["작가 미상"],
          publisher: bookDetail.publisher || "출판사 미상",
          pageCount: bookDetail.pageCount || 0,
          publishedAt: bookDetail.publishedAt || "",
          coverImage: bookDetail.coverImage || null,
          isInLibrary: bookDetail.isInLibrary || false,
          readingStatus: bookDetail.readingStatus || null,
        });
      } else {
        throw new Error(data.message || '책 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('책 상세 정보 가져오기 실패:', error);
      setError(error.message);
      
      // 에러 시 기본 데이터라도 표시
      if (bookData) {
        setBook({
          id: bookData.isbn || isbn,
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
    try {
      // 실제 구현 시 질문 API 호출
      // const response = await fetch(`${API_BASE_URL}/api/books/${book.id}/questions?sort=${selectedSort}`);
      // const data = await response.json();
      // if (data.isSuccess) {
      //   setQuestions(data.result);
      // }
      
      // 현재는 더미 데이터 사용
      const dummyQuestions = [];
      setQuestions(dummyQuestions);
    } catch (error) {
      console.error('질문 목록 로딩 실패:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookData();
    setRefreshing(false);
  };

  const handleGoBack = () => navigation.goBack();
  
  const handleAIQuestion = () => aiSheetRef.current?.open();
  
  const handleQuestionRegister = () => writeSheetRef.current?.open();
  
  const handleAddToLibrary = () => {
    Alert.alert(
      "내 서재에 등록",
      "이 도서를 내 서재에 등록하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "등록", 
          onPress: confirmAddToLibrary 
        }
      ]
    );
  };

  const confirmAddToLibrary = async () => {
    setProcessing(true);
    try {
      console.log('도서 추가 요청:', `${API_BASE_URL}/api/library/books`);
      
      const response = await fetch(`${API_BASE_URL}/api/library/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          isbn: book.id,
          readingStatus: "읽는 중"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        setBook(prev => ({ 
          ...prev, 
          isInLibrary: true,
          readingStatus: "읽는 중"
        }));
        Alert.alert("등록 완료", "도서가 내 서재에 등록되었습니다.");
      } else {
        throw new Error(data.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('도서 추가 실패:', error);
      Alert.alert("등록 실패", "도서 등록 중 오류가 발생했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveFromLibrary = () => {
    Alert.alert(
      "도서 삭제",
      "정말로 내 서재에서 이 도서를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: confirmRemoveFromLibrary 
        }
      ]
    );
  };

  const confirmRemoveFromLibrary = async () => {
    setProcessing(true);
    try {
      console.log('도서 삭제 요청:', `${API_BASE_URL}/api/library/books/${book.id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/library/books/${book.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        setBook(prev => ({ 
          ...prev, 
          isInLibrary: false,
          readingStatus: null
        }));
        Alert.alert("삭제 완료", "도서가 내 서재에서 삭제되었습니다.");
      } else {
        throw new Error(data.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('도서 삭제 실패:', error);
      Alert.alert("삭제 실패", "도서 삭제 중 오류가 발생했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReadingStatusChange = () => {
    const statusOptions = ["읽는 중", "완독"];
    Alert.alert(
      "읽기 상태 변경",
      "변경할 상태를 선택해주세요",
      [
        { text: "취소", style: "cancel" },
        ...statusOptions.map(status => ({
          text: status,
          onPress: () => changeReadingStatus(status)
        }))
      ]
    );
  };

  const changeReadingStatus = async (newStatus) => {
    try {
      console.log('읽기 상태 변경 요청:', `${API_BASE_URL}/api/library/books/${book.id}/status`);
      
      const response = await fetch(`${API_BASE_URL}/api/library/books/${book.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          readingStatus: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        setBook(prev => ({ ...prev, readingStatus: newStatus }));
        Alert.alert("상태 변경", `읽기 상태가 "${newStatus}"로 변경되었습니다.`);
      } else {
        throw new Error(data.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('읽기 상태 변경 실패:', error);
      Alert.alert("변경 실패", "읽기 상태 변경 중 오류가 발생했습니다.");
    }
  };

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
      id: book.id,
      title: book.title,
      authors: book.authors,
      isInLibrary: book.isInLibrary
    };
    
    navigation.navigate("QuestionDetail", {
      questionData: questionToPass,
      bookData: bookToPass
    });
  };

  const handleAddQuestion = async (questionData) => {
    try {
      console.log('질문 등록 요청:', `${API_BASE_URL}/api/books/${book.id}/questions`);
      
      const response = await fetch(`${API_BASE_URL}/api/books/${book.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: questionData.title,
          content: questionData.body,
          page: questionData.page ? parseInt(questionData.page) : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.isSuccess) {
        // 새 질문을 목록에 추가
        const newQuestion = {
          id: data.result.id,
          author: "나",
          content: questionData.title,
          views: 0,
          answers: 0,
          likes: 0,
          isAI: false,
          page: questionData.page ? parseInt(questionData.page) : null,
          createdAt: new Date().toISOString(),
        };

        setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]);
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

  // 포맷된 출간일 표시
  const formatPublishedDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return dateString;
    }
  };

  // 작가 목록을 문자열로 변환
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return "작가 미상";
    return authors.join(", ");
  };

  // 읽기 상태 표시
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
                <View style={styles.emptyCover} />
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

              {/* 내 서재에 등록된 경우에만 읽기 상태 표시 */}
              {book.isInLibrary && (
                <TouchableOpacity 
                  style={styles.metaRow}
                  onPress={handleReadingStatusChange}
                >
                  <Text style={styles.metaLabel}>상태</Text>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.readDot, { color: getReadingStatusColor() }]}>•</Text>
                    <Text style={styles.metaValue}>{getReadingStatusText()}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" style={styles.statusIcon} />
                  </View>
                </TouchableOpacity>
              )}

              {book.isInLibrary ? (
                // 내 서재에서 삭제 버튼
                <TouchableOpacity
                  style={[styles.deleteButton, processing && styles.buttonDisabled]}
                  onPress={handleRemoveFromLibrary}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#F87171" />
                  ) : (
                    <Text style={styles.deleteText}>내 서재에서 삭제</Text>
                  )}
                </TouchableOpacity>
              ) : (
                // 내 서재에 등록 버튼
                <TouchableOpacity
                  style={[styles.addButton, processing && styles.buttonDisabled]}
                  onPress={handleAddToLibrary}
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

        {questions.length > 0 ? (
          questions.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.answerContainer}
              onPress={() => goToQuestionDetail(q)}
              activeOpacity={0.7}
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
          ))
        ) : (
          renderEmptyQuestions()
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: "SUIT-Medium",
    color: "#999999",
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
    color: "#90D1BE",
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 4,
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