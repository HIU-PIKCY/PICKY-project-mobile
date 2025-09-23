import React, { useRef, useState, useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
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
import { useAuth } from "../AuthContext";
import styles from '../styles/BookDetailStyle';

const BookDetail = ({ navigation, route }) => {
    const aiSheetRef = useRef(null);
    const writeSheetRef = useRef(null);
    const screenHeight = Dimensions.get("window").height;

    // AuthContext에서 authenticatedFetch와 사용자 정보 가져오기
    const { authenticatedFetch, user } = useAuth();

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

    // 화면 포커스 시 질문 목록 새로고침
    useFocusEffect(
        React.useCallback(() => {
            // QuestionDetail에서 돌아올 때마다 질문 목록 새로고침
            if (book?.bookId) {
                console.log('화면 포커스 - 질문 목록 새로고침');
                loadQuestions();
            }
        }, [book?.bookId])
    );

    useEffect(() => {
        loadBookData();
    }, [isbn]);

    useEffect(() => {
        if (book && book.bookId) {
            loadQuestions();
        }
    }, [book?.bookId, selectedSort]);

    // ===============================================
    // 💡 인증된 API 호출 함수: 도서 데이터 로드
    // ===============================================
    const loadBookData = async () => {
        if (!isbn) {
            setError("ISBN 정보가 없습니다.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. ISBN으로 데이터베이스 내부 책 ID 조회 (인증된 요청)
            const isbnResponse = await authenticatedFetch(`${API_BASE_URL}/api/books/isbn/${isbn}`, {
                method: 'GET',
            });

            if (!isbnResponse.ok) {
                throw new Error(`ISBN 조회 실패! status: ${isbnResponse.status}`);
            }

            const isbnData = await isbnResponse.json();
            if (!isbnData.isSuccess || !isbnData.result) {
                throw new Error(isbnData.message || 'ISBN으로 책을 찾을 수 없습니다.');
            }
            const bookId = isbnData.result.id;

            // 2. 책 상세 정보 조회 (인증된 요청)
            const detailResponse = await authenticatedFetch(`${API_BASE_URL}/api/books/${isbn}`, {
                method: 'GET',
            });

            let bookDetail = {};
            if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                if (detailData.isSuccess && detailData.result) {
                    bookDetail = detailData.result;
                }
            } else {
                console.log("상세 정보 조회는 실패했지만, ISBN으로 기본 정보는 사용합니다.");
            }

            // 책 상태 설정
            setBook({
                isbn: bookDetail.isbn || isbn,
                bookId: bookId,
                title: bookDetail.title || isbnData.result.title || "제목 없음",
                authors: bookDetail.authors || [isbnData.result.author] || ["작가 미상"],
                publisher: bookDetail.publisher || "출판사 미상",
                pageCount: bookDetail.pageCount || 0,
                publishedAt: bookDetail.publishedAt || "",
                coverImage: bookDetail.coverImage || isbnData.result.coverImage || null,
                isInLibrary: bookDetail.isInLibrary || false,
                readingStatus: bookDetail.readingStatus || null,
            });

        } catch (error) {
            console.error('책 정보 가져오기 실패:', error);
            setError(error.message);

            // 인증 에러 처리 (authenticatedFetch에서 401 재시도 실패 시 최종적으로 던지는 에러)
            if (error.message.includes('액세스 토큰이 없습니다') || error.message.includes('토큰 갱신 실패')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.');
                navigation.navigate('Login');
                return;
            }

            // 에러 시 기본 데이터로 fallback
            if (bookData) {
                setBook({
                    isbn: bookData.isbn || isbn,
                    bookId: null,
                    title: bookData.title || "제목 없음",
                    authors: bookData.authors || ["작가 미상"],
                    publisher: bookData.publisher || "출판사 미상",
                    pageCount: bookData.pageCount || 0,
                    publishedAt: bookData.publishedAt || "",
                    coverImage: bookData.coverImage || null,
                    isInLibrary: false,
                    readingStatus: null,
                });
            } else {
                setBook(null);
            }

        } finally {
            setLoading(false);
        }
    };

    // ===============================================
    // 💡 인증된 API 호출 함수: 질문 목록 로드
    // ===============================================
    const loadQuestions = async () => {
        if (!book || !book.bookId) {
            setQuestions([]);
            return;
        }

        try {
            setQuestionsLoading(true);
            const url = `${API_BASE_URL}/api/books/${book.bookId}/questions?sort=${selectedSort === 'recommended' ? 'likes' : 'latest'}`;
            
            // authenticatedFetch 사용
            const response = await authenticatedFetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setQuestions([]);
                    return;
                }
                throw new Error(`질문 목록 조회 실패! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result && data.result.questions) {
                const formattedQuestions = data.result.questions.map(q => ({
                    id: q.id,
                    author: q.nickname || q.author || "사용자",
                    authorImage: q.profileImg || q.profileImage || null,
                    authorId: q.authorId || q.userId || null, 
                    content: q.title,
                    body: q.content || "",
                    views: q.views || 0,
                    answers: q.comments || q.answersCount || 0,
                    likes: q.likes || 0,
                    isAI: q.isAI || false,
                    isLiked: q.isLiked || false,
                    page: q.page || null,
                    createdAt: q.createdAt || new Date().toISOString(),
                }));

                // API에서 정렬을 지원하더라도, 클라이언트에서 한 번 더 적용
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

    // ===============================================
    // 💡 인증된 API 호출 함수: 서재 관리
    // ===============================================
    const handleAddOrDeleteBook = async () => {
        if (!book?.bookId || processing) return;

        setProcessing(true);
        const action = book.isInLibrary ? '삭제' : '등록';
        const method = book.isInLibrary ? 'DELETE' : 'POST';
        const url = `${API_BASE_URL}/api/my-books${book.isInLibrary ? `/${book.bookId}` : ''}`;

        try {
            console.log(`내 서재 ${action} 요청:`, url, method);

            // authenticatedFetch 사용
            const response = await authenticatedFetch(url, {
                method: method,
                // POST 요청일 경우 body에 bookId를 포함하여 전송
                body: method === 'POST' ? JSON.stringify({ bookId: book.bookId }) : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // DELETE는 body가 없을 수 있으므로 status만 확인
            if (method === 'DELETE') {
                Alert.alert(`${action} 완료`, `도서가 내 서재에서 성공적으로 ${action}되었습니다.`);
            } else {
                const data = await response.json();
                if (data.isSuccess) {
                    Alert.alert(`${action} 완료`, `도서가 내 서재에 성공적으로 ${action}되었습니다.`);
                } else {
                    throw new Error(data.message || `${action}에 실패했습니다.`);
                }
            }
            
            // 성공 후 데이터 다시 로드
            await loadBookData(); 

        } catch (error) {
            console.error(`내 서재 ${action} 실패:`, error);
            Alert.alert(`${action} 실패`, `도서 ${action} 중 오류가 발생했습니다.`);
        } finally {
            setProcessing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookData();
        setRefreshing(false);
    };

    const handleGoBack = () => navigation.goBack();
    const handleAIQuestion = () => {
        if (!book?.bookId) {
            Alert.alert("알림", "AI 질문을 생성하려면 도서가 데이터베이스에 등록되어야 합니다.");
            return;
        }
        aiSheetRef.current?.open();
    };

    const handleQuestionRegister = () => {
        if (!book?.bookId) {
            Alert.alert("알림", "질문을 등록하려면 도서가 데이터베이스에 등록되어야 합니다.");
            return;
        }
        writeSheetRef.current?.open();
    };
    
    // 사용자가 작성한 질문인지 확인하는 함수
    const isMyQuestion = (question) => {
        return user && question.authorId && question.authorId === user.uid;
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
                onPress={() => handleQuestionPress(q)}
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

    // 질문 클릭 시 질문 상세 화면으로 이동하는 함수
    const handleQuestionPress = (question) => {
        if (!question || !book) return;
    
        navigation.navigate('QuestionDetail', {
            questionData: {
                id: question.id,
                content: question.content,
                body: question.body,
                author: question.author,
                nickname: question.author,
                profileImg: question.authorImage,
                profileImage: question.authorImage,
                authorId: question.authorId,
                isAI: question.isAI,
                views: question.views,
                likes: question.likes,
                answers: question.answers,
                page: question.page,
                createdAt: question.createdAt,
                isLiked: question.isLiked
            },
            bookData: {
                id: book.bookId,
                title: book.title,
                authors: book.authors,
                author: book.authors[0]
            },
            questionId: question.id,
            previousScreen: 'BookDetail' // 이전 화면 정보 추가
        });
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
                    <Text style={styles.errorText}>{error || "알 수 없는 오류가 발생했습니다."}</Text>
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
                    <Text style={styles.errorBannerText}>최신 정보를 불러오지 못했습니다. 새로고침해보세요.</Text>
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
                                    style={[styles.deleteButton, (processing || !book.bookId) && styles.buttonDisabled]}
                                    onPress={handleAddOrDeleteBook}
                                    disabled={processing || !book.bookId}
                                >
                                    {processing ? (
                                        <ActivityIndicator size="small" color="#F87171" />
                                    ) : (
                                        <Text style={styles.deleteText}>내 서재에서 삭제</Text>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.addButton, (processing || !book.bookId) && styles.buttonDisabled]}
                                    onPress={handleAddOrDeleteBook}
                                    disabled={processing || !book.bookId}
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

            {/* bookId 전달 및 성공 콜백 */}
            <AIQuestionSheet 
                ref={aiSheetRef} 
                modalHeight={screenHeight} 
                bookId={book?.bookId}
                onSubmit={() => {
                    // 질문 등록 성공 시 질문 목록 새로고침
                    loadQuestions();
                }}
            />
            <QuestionWriteSheet
                ref={writeSheetRef}
                modalHeight={screenHeight}
                bookId={book?.bookId}
                onSubmit={() => {
                    // 질문 등록 성공 시 질문 목록 새로고침
                    loadQuestions();
                }}
            />
        </SafeAreaView>
    );
};

export default BookDetail;