import React, { useState, useEffect } from "react";
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    Text,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { styles } from "../styles/MyLibraryStyle";
import CustomHeader from '../components/CustomHeader';
import { useAuth } from "../AuthContext";
import { Ionicons } from '@expo/vector-icons';

const MyLibrary = () => {
    const navigation = useNavigation();
    const { authenticatedFetch } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("전체");
    const [books, setBooks] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        "읽는 중": 0,
        "완독": 0
    });
    const [error, setError] = useState(null);

    // 서버 API URL
    const API_BASE_URL = 'http://13.124.86.254';

    useEffect(() => {
        loadLibraryData();
    }, []);

    // 화면 포커스 시 데이터 새로고침
    useFocusEffect(
        React.useCallback(() => {
            loadLibraryData();
        }, [])
    );

    // 서재 데이터 로드
    const loadLibraryData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/book-shelf`, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('인증이 필요합니다');
                }
                throw new Error(`서재 조회 실패: ${response.status}`);
            }

            const data = await response.json();

            if (data.isSuccess && data.result && data.result.items) {
                const shelfItems = data.result.items;
                
                // 읽기 상태를 한국어로 변환하는 함수
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

                // 서재 데이터 변환
                const formattedBooks = shelfItems.map(item => {
                    const koreanStatus = convertReadingStatus(item.readingStatus);
                    
                    // authors가 문자열인 경우 배열로 변환
                    const authorsArray = typeof item.book.authors === 'string' 
                        ? [item.book.authors] 
                        : (item.book.authors || ["작가 미상"]);
                    
                    return {
                        id: item.id,
                        bookId: item.book.id || null,
                        isbn: item.book.isbn,
                        title: item.book.title,
                        author: authorsArray[0] || "작가 미상",
                        authors: authorsArray,
                        status: koreanStatus,
                        publisher: item.book.publisher || "출판사 미상",
                        pages: item.book.pageCount || 0,
                        pageCount: item.book.pageCount || 0,
                        publishedAt: item.book.publishedAt,
                        coverImage: item.book.coverImage,
                        addedAt: item.createdAt || new Date().toISOString(),
                        readingStatus: koreanStatus
                    };
                });

                // 상태별 개수 계산
                const counts = {
                    "읽는 중": 0,
                    "완독": 0
                };

                formattedBooks.forEach(book => {
                    const status = book.status || "읽는 중";
                    if (counts.hasOwnProperty(status)) {
                        counts[status]++;
                    }
                });

                setBooks(formattedBooks);
                setStatusCounts(counts);
            } else {
                // 빈 서재인 경우
                setBooks([]);
                setStatusCounts({
                    "읽는 중": 0,
                    "완독": 0
                });
            }

        } catch (error) {
            console.error('서재 데이터 로딩 실패:', error);
            setError(error.message);
            
            // 인증 에러 처리
            if (error.message.includes('인증') || error.message.includes('401')) {
                Alert.alert('인증 오류', '로그인이 필요합니다. 다시 로그인해주세요.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login')
                    }
                ]);
            } else {
                Alert.alert('오류', '서재를 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLibraryData();
        setRefreshing(false);
    };

    // 필터에 따른 도서 목록 필터링
    const filteredBooks = books.filter((book) => {
        if (selectedFilter === "전체") return true;
        return book.status === selectedFilter;
    });

    // 필터 버튼 텍스트에 개수 포함
    const getFilterText = (filter) => {
        if (filter === "전체") {
            const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
            return `전체 (${totalCount})`;
        }
        return `${filter} (${statusCounts[filter] || 0})`;
    };

    const handleBookPress = (book) => {
        navigation.navigate("BookDetail", {
            isbn: book.isbn,
            bookData: {
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                publisher: book.publisher,
                pageCount: book.pageCount,
                publishedAt: book.publishedAt,
                coverImage: book.coverImage,
            }
        });
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    // 책 카드 렌더링 (인라인 스타일 적용)
    const renderBook = (book, index) => (
        <TouchableOpacity
            key={book.id}
            style={[
                bookCardStyles.bookCard,
                (index + 1) % 3 === 0 && { marginRight: 0 }
            ]}
            onPress={() => handleBookPress(book)}
            activeOpacity={0.7}
        >
            <View style={bookCardStyles.coverWrapper}>
                {book.coverImage ? (
                    <Image
                        source={{ uri: book.coverImage }}
                        style={bookCardStyles.bookCover}
                        resizeMode="cover"
                        onError={() => {
                            console.log('이미지 로딩 실패:', book.coverImage);
                        }}
                    />
                ) : (
                    <View style={bookCardStyles.bookCoverPlaceholder} />
                )}
            </View>

            <Text 
                style={bookCardStyles.bookTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {book.title}
            </Text>
            <Text 
                style={bookCardStyles.bookAuthor}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {book.author}
            </Text>
            <View 
                style={[
                    bookCardStyles.statusBadge, 
                    book.status === '완독' ? bookCardStyles.completedBadge : bookCardStyles.readingBadge
                ]}
            >
                <Text style={[
                    bookCardStyles.statusText,
                    book.status === '완독' ? bookCardStyles.completedText : bookCardStyles.readingText
                ]}>
                    {book.status}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#CCC" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>
                {selectedFilter === "전체" 
                    ? "아직 등록된 책이 없습니다" 
                    : `${selectedFilter} 상태의 책이 없습니다`}
            </Text>
            <Text style={styles.emptySubText}>새로운 책을 추가해보세요!</Text>
        </View>
    );

    if (loading && books.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <CustomHeader
                    title="내 서재"
                    onBackPress={handleGoBack}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#90D1BE" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="내 서재"
                onBackPress={handleGoBack}
            />

            {/* 에러 배너 */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>서재를 불러오지 못했습니다. 새로고침해보세요.</Text>
                </View>
            )}

            {/* 내 서재 */}
            <View style={{ paddingHorizontal: 16 }}>
                <View style={[styles.sectionHeader, { borderTopWidth: 0 }]}>
                    <Text style={styles.sectionTitle}>내 서재</Text>
                    <View style={styles.filterContainer}>
                        {["전체", "읽는 중", "완독"].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setSelectedFilter(filter)}
                                style={styles.filterButton}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter && styles.activeFilterText,
                                    ]}
                                >
                                    {getFilterText(filter)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#90D1BE']}
                        tintColor="#90D1BE"
                    />
                }
            >
                {/* 책 그리드 */}
                {filteredBooks.length > 0 ? (
                    <View style={styles.booksGrid}>
                        {filteredBooks.map((book, index) => renderBook(book, index))}
                    </View>
                ) : (
                    renderEmptyState()
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const bookCardStyles = {
    bookCard: {
        width: '28%',
        marginRight: '8%',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    coverWrapper: {
        width: '100%',
        aspectRatio: 0.7,
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookCover: {
        width: '100%',
        height: '100%',
    },
    bookCoverPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#D3D3D3',
    },
    bookTitle: {
        fontFamily: 'SUIT-Medium',
        fontSize: 12,
        fontWeight: '500',
        color: '#666666',
        marginBottom: 2,
        width: '100%',
        lineHeight: 16,
    },
    bookAuthor: {
        fontFamily: 'SUIT-Medium',
        fontSize: 10,
        color: '#888888',
        marginBottom: 6,
        width: '100%',
        lineHeight: 14,
    },
    statusBadge: {
        width: '100%',
        paddingVertical: 3,
        borderRadius: 4,
        alignSelf: 'center',
        minHeight: 18,
        justifyContent: 'center',
        marginTop: 4,
    },
    readingBadge: {
        borderWidth: 0.5,
        borderColor: '#0D2525',
    },
    completedBadge: {
        backgroundColor: '#0D2525',
    },
    statusText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 12,
    },
    readingText: {
        color: '#0D2525',
    },
    completedText: {
        color: '#FFFFFF',
    },
};

export default MyLibrary;