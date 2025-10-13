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

    const { authenticatedFetch, user } = useAuth();

    const API_BASE_URL = 'http://13.124.86.254';

    const { isbn, bookData } = route.params || {};
    
    const [book, setBook] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedSort, setSelectedSort] = useState('latest');
    const [loading, setLoading] = useState(true);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [statusChanging, setStatusChanging] = useState(false);
    const [error, setError] = useState(null);

    // 화면 포커스 시 질문 목록 새로고침
    useFocusEffect(
        React.useCallback(() => {
            if (book?.bookId) {
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

    // 읽기 상태 한국어 변환 함수
    const convertReadingStatus = (status) => {
        switch (status) {
            case 'READING':
                return '읽는 중';
            case 'COMPLETED':
                return '완독';
            default:
                return '읽는 중';
        }
    };

    // 한국어 상태를 영어로 변환하는 함수
    const convertStatusToEnglish = (koreanStatus) => {
        switch (koreanStatus) {
            case '읽는 중':
                return 'READING';
            case '완독':
                return 'COMPLETED';
            default:
                return 'READING';
        }
    };

    // 도서 데이터 로드
    const loadBookData = async () => {
        if (!isbn) {
            setError("ISBN 정보가 없습니다.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let bookId = null;
            let basicBookInfo = null;

            // 1. ISBN으로 데이터베이스 내부 책 ID 조회 시도
            try {
                const isbnResponse = await authenticatedFetch(`${API_BASE_URL}/api/books/isbn/${isbn}`, {
                    method: 'GET',
                });

                if (isbnResponse.ok) {
                    const isbnData = await isbnResponse.json();
                    
                    if (isbnData.isSuccess && isbnData.result) {
                        bookId = isbnData.result.id;
                        basicBookInfo = isbnData.result;
                    }
                }
            } catch (isbnError) {
                console.error('ISBN 조회 중 오류:', isbnError);
            }

            // 2. 책 상세 정보 조회 시도
            let bookDetail = {};
            try {
                const detailResponse = await authenticatedFetch(`${API_BASE_URL}/api/books/${isbn}`, {
                    method: 'GET',
                });

                if (detailResponse.ok) {
                    const detailData = await detailResponse.json();
                    
                    if (detailData.isSuccess && detailData.result) {
                        bookDetail = detailData.result;
                    }
                }
            } catch (detailError) {
                console.error('상세 정보 조회 중 오류:', detailError);
            }

            // 3. 내 서재 목록 조회해서 서재 ID 찾기
            let myLibraryId = null;
            let isInLibrary = false;
            let readingStatus = null;
            
            try {
                const libraryResponse = await authenticatedFetch(`${API_BASE_URL}/api/book-shelf`, {
                    method: 'GET',
                });

                if (libraryResponse.ok) {
                    const libraryData = await libraryResponse.json();
                    
                    if (libraryData.isSuccess && libraryData.result && libraryData.result.items) {
                        const shelfItems = libraryData.result.items;
                        
                        const myShelfItem = shelfItems.find(item => {
                            const book = item.book;
                            return book.isbn === isbn;
                        });
                        
                        if (myShelfItem) {
                            isInLibrary = true;
                            readingStatus = convertReadingStatus(myShelfItem.readingStatus);
                            myLibraryId = myShelfItem.id;
                        }
                    }
                }
            } catch (libraryError) {
                console.error('내 서재 목록 조회 중 오류:', libraryError);
            }

            // 4. 최종 책 데이터 구성
            const finalBook = {
                isbn: bookDetail.isbn || basicBookInfo?.isbn || isbn,
                bookId: bookId,
                libraryId: myLibraryId,
                id: bookId,
                title: bookDetail.title || basicBookInfo?.title || bookData?.title || "제목 없음",
                authors: bookDetail.authors || (basicBookInfo?.author ? [basicBookInfo.author] : bookData?.authors) || ["작가 미상"],
                publisher: bookDetail.publisher || bookData?.publisher || "출판사 미상",
                pageCount: bookDetail.pageCount || bookData?.pageCount || 0,
                publishedAt: bookDetail.publishedAt || bookData?.publishedAt || "",
                coverImage: bookDetail.coverImage || basicBookInfo?.coverImage || bookData?.coverImage || null,
                isInLibrary: isInLibrary,
                readingStatus: readingStatus,
            };
            
            setBook(finalBook);

        } catch (error) {
            console.error('책 정보 가져오기 실패:', error);
            setError(error.message);

            // 인증 에러 처리
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
                    libraryId: null,
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

    // 읽기 상태 변경 함수
    const changeReadingStatus = async () => {
        if (!book?.libraryId || statusChanging) return;

        const currentStatus = book.readingStatus;
        const newStatus = currentStatus === '읽는 중' ? '완독' : '읽는 중';
        const englishStatus = convertStatusToEnglish(newStatus);

        Alert.alert(
            '읽기 상태 변경',
            `이 도서의 상태를 '${newStatus}'으로 변경하시겠습니까?`,
            [
                {
                    text: '취소',
                    style: 'cancel'
                },
                {
                    text: '변경',
                    onPress: async () => {
                        await performStatusChange(englishStatus, newStatus);
                    }
                }
            ]
        );
    };

    // 실제 상태 변경 수행
    const performStatusChange = async (englishStatus, koreanStatus) => {
        try {
            setStatusChanging(true);

            const response = await authenticatedFetch(`${API_BASE_URL}/api/book-shelf/${book.libraryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: englishStatus
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.isSuccess) {
                    Alert.alert('변경 완료', `읽기 상태가 '${koreanStatus}'으로 변경되었습니다.`);
                    
                    // 로컬 상태 즉시 업데이트
                    setBook(prevBook => ({
                        ...prevBook,
                        readingStatus: koreanStatus
                    }));

                    // 서버에서 최신 데이터 다시 로드
                    setTimeout(() => {
                        loadBookData();
                    }, 500);
                } else {
                    throw new Error(data.message || '상태 변경에 실패했습니다.');
                }
            } else {
                const errorText = await response.text();
                console.error('상태 변경 실패 응답:', errorText);
                throw new Error('상태 변경 요청이 실패했습니다.');
            }

        } catch (error) {
            console.error('상태 변경 오류:', error);
            Alert.alert('변경 실패', error.message || '상태 변경 중 오류가 발생했습니다.');
        } finally {
            setStatusChanging(false);
        }
    };

    // 질문 목록 로드
    const loadQuestions = async () => {
        if (!book || !book.bookId) {
            setQuestions([]);
            return;
        }

        try {
            setQuestionsLoading(true);
            const url = `${API_BASE_URL}/api/books/${book.bookId}/questions?sort=${selectedSort === 'recommended' ? 'likes' : 'latest'}`;
            
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

                // 클라이언트에서 정렬 적용
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

    // 서재 등록/삭제 처리
    const handleAddOrDeleteBook = async () => {
        if (processing) return;

        setProcessing(true);
        
        try {
            if (book.isInLibrary) {
                setProcessing(false);
                await removeBookFromLibrary();
            } else {
                await addBookToLibrary();
                setProcessing(false);
            }
        } catch (error) {
            console.error('서재 처리 실패:', error);
            setProcessing(false);
        }
    };

    // 서재에 책 등록
    const addBookToLibrary = async () => {
        try {
            const endpoints = [
                `${API_BASE_URL}/api/book-shelf`,
                `${API_BASE_URL}/api/my-books`,
                `${API_BASE_URL}/api/books`,
            ];

            let success = false;
            let lastError = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await authenticatedFetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            bookId: book.bookId, // null일 수 있음
                            isbn: book.isbn,
                            title: book.title,
                            authors: book.authors,
                            publisher: book.publisher,
                            coverImage: book.coverImage,
                            pageCount: book.pageCount,
                            publishedAt: book.publishedAt
                        })
                    });

                    if (response.ok) {
                        success = true;
                        
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const data = await response.json();
                            if (data && !data.isSuccess) {
                                throw new Error(data.message || '서재 등록에 실패했습니다.');
                            }
                        }
                        break;
                    } else {
                        const errorText = await response.text();
                        lastError = new Error(`등록 실패: ${response.status} - ${errorText}`);
                    }
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }

            if (!success) {
                throw lastError || new Error('모든 등록 엔드포인트 실패');
            }

            Alert.alert('등록 완료', '도서가 내 서재에 성공적으로 등록되었습니다.');
            
            // 로컬 상태 즉시 업데이트
            setBook(prevBook => ({
                ...prevBook,
                isInLibrary: true,
                readingStatus: '읽는 중' // 기본 상태 설정
            }));

            // 서버에서 최신 데이터 다시 로드
            setTimeout(() => {
                loadBookData();
            }, 1000);

        } catch (error) {
            console.error('서재 등록 오류:', error);
            Alert.alert('등록 실패', error.message || '도서 등록 중 오류가 발생했습니다.');
        }
    };

    // 서재에서 책 삭제
    const removeBookFromLibrary = async () => {
        try {
            Alert.alert(
                '서재에서 삭제',
                '정말로 내 서재에서 이 도서를 삭제하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel'
                    },
                    {
                        text: '삭제',
                        style: 'destructive',
                        onPress: async () => {
                            await performDelete();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('서재 삭제 오류:', error);
            Alert.alert('삭제 실패', error.message || '서재 삭제 중 오류가 발생했습니다.');
        }
    };

    // 실제 삭제 수행
    const performDelete = async () => {
        try {
            if (!book.libraryId) {
                Alert.alert('오류', '서재 ID가 설정되지 않았습니다. 화면을 새로고침해주세요.');
                loadBookData();
                return;
            }
            
            const response = await authenticatedFetch(`${API_BASE_URL}/api/book-shelf/${book.libraryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert('삭제 완료', '도서가 내 서재에서 성공적으로 삭제되었습니다.');
                
                setBook(prevBook => ({
                    ...prevBook,
                    isInLibrary: false,
                    readingStatus: null,
                    libraryId: null
                }));

                setTimeout(() => {
                    loadBookData();
                }, 500);
            } else {
                const errorText = await response.text();
                console.error('서재 삭제 실패 응답:', errorText);
                Alert.alert('삭제 실패', '서재에서 도서를 삭제할 수 없습니다. 다시 시도해주세요.');
            }

        } catch (error) {
            console.error('서재 삭제 최종 실패:', error);
            Alert.alert('삭제 실패', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookData();
        setRefreshing(false);
    };

    const handleGoBack = () => navigation.goBack();
    
    const handleAIQuestion = () => {
        if (!book?.isbn) {
            Alert.alert("알림", "AI 질문을 생성할 수 없습니다. 책 정보를 확인해주세요.");
            return;
        }
        aiSheetRef.current?.open();
    };

    const handleQuestionRegister = () => {
        if (!book?.isbn) {
            Alert.alert("알림", "질문을 등록할 수 없습니다. 책 정보를 확인해주세요.");
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
            previousScreen: 'BookDetail'
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
                                <Text style={styles.metaLabel}>페이지</Text>
                                <Text style={styles.metaValue}>{book.pageCount || "-"}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>상태</Text>
                                {book.isInLibrary && book.readingStatus ? (
                                    <TouchableOpacity 
                                        style={styles.statusContainer}
                                        onPress={changeReadingStatus}
                                        disabled={statusChanging}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.readDot, { color: getReadingStatusColor() }]}>•</Text>
                                        <Text style={styles.metaValue}>
                                            {statusChanging ? '변경 중...' : getReadingStatusText()}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.metaValue}>-</Text>
                                )}
                            </View>

                            {book.isInLibrary ? (
                                <TouchableOpacity
                                    style={[styles.deleteButton, processing && styles.buttonDisabled]}
                                    onPress={handleAddOrDeleteBook}
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
                                    onPress={handleAddOrDeleteBook}
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
                    style={[styles.aiAnswerButton, !book?.isbn && styles.buttonDisabled]}
                    onPress={handleAIQuestion}
                    disabled={!book?.isbn}
                >
                    <MintStar />
                    <Text style={styles.aiAnswerButtonText}>AI 질문 생성</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, !book?.isbn && styles.buttonDisabled]}
                    onPress={handleQuestionRegister}
                    disabled={!book?.isbn}
                >
                    <Text style={styles.submitButtonText}>질문 등록</Text>
                </TouchableOpacity>
            </View>

            <AIQuestionSheet 
                ref={aiSheetRef} 
                modalHeight={screenHeight} 
                bookId={book?.bookId}
                onSubmit={() => {
                    loadQuestions();
                }}
            />
            <QuestionWriteSheet
                ref={writeSheetRef}
                modalHeight={screenHeight}
                bookId={book?.bookId}
                onSubmit={() => {
                    loadQuestions();
                }}
            />
        </SafeAreaView>
    );
};

export default BookDetail;