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
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BookCard from "../components/BookCard";
import { styles } from "../styles/MainScreenStyle";
import CustomHeader from '../components/CustomHeader';

const MyLibrary = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("전체");
    const [books, setBooks] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        "읽는 중": 0,
        "완독": 0,
        "읽기 예정": 0
    });

    // 더미 데이터 - 실제 구현 시 API 호출로 대체
    const dummyLibraryData = {
        books: [
            {
                id: 1,
                title: "운수 좋은 날",
                author: "현진건",
                status: "읽는 중",
                publisher: "소담출판사",
                pages: 231,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg",
                addedAt: "2024-01-15T10:30:00Z"
            },
            {
                id: 2,
                title: "노스텔지어, 어느 위험한 감정의 연대기",
                author: "애그니스 아널드포스터",
                status: "읽는 중",
                publisher: "어크로스",
                pages: 320,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg",
                addedAt: "2024-01-14T15:20:00Z"
            },
            {
                id: 3,
                title: "1984",
                author: "조지 오웰",
                status: "완독",
                publisher: "민음사",
                pages: 400,
                coverImage: "https://image.aladin.co.kr/product/41/89/letslook/S062933637_f.jpg",
                addedAt: "2024-01-10T09:15:00Z"
            },
            {
                id: 4,
                title: "해리포터와 마법사의 돌",
                author: "J.K. 롤링",
                status: "읽는 중",
                publisher: "문학수첩",
                pages: 348,
                coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToSmMU_mIWeKIo8u84VpMgF7kPMR9SjVN2ug&s",
                addedAt: "2024-01-08T14:25:00Z"
            },
            {
                id: 5,
                title: "어린왕자",
                author: "생텍쥐페리",
                status: "완독",
                publisher: "열린책들",
                pages: 128,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791191200157.jpg",
                addedAt: "2024-01-05T11:40:00Z"
            },
            {
                id: 6,
                title: "데미안",
                author: "헤르만 헤세",
                status: "읽는 중",
                publisher: "민음사",
                pages: 288,
                coverImage: "https://minumsa.minumsa.com/wp-content/uploads/bookcover/044_%EB%8D%B0%EB%AF%B8%EC%95%88-300x504.jpg",
                addedAt: "2024-01-03T16:55:00Z"
            },
            {
                id: 7,
                title: "미움받을 용기",
                author: "기시미 이치로",
                status: "완독",
                publisher: "인플루엔셜",
                pages: 350,
                coverImage: "https://image.aladin.co.kr/product/4846/30/letslook/S572535350_fl.jpg",
                addedAt: "2023-12-28T13:20:00Z"
            },
            {
                id: 8,
                title: "코스모스",
                author: "칼 세이건",
                status: "읽는 중",
                publisher: "사이언스북스",
                pages: 456,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788983711892.jpg",
                addedAt: "2023-12-25T08:30:00Z"
            },
            {
                id: 9,
                title: "사피엔스",
                author: "유발 하라리",
                status: "완독",
                publisher: "김영사",
                pages: 512,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788934992042.jpg",
                addedAt: "2023-12-20T17:10:00Z"
            },
            {
                id: 10,
                title: "백년동안의 고독",
                author: "가브리엘 가르시아 마르케스",
                status: "읽는 중",
                publisher: "민음사",
                pages: 416,
                coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788970126937.jpg",
                addedAt: "2023-12-15T12:45:00Z"
            },
            {
                id: 11,
                title: "죄와 벌",
                author: "표도르 도스토옙스키",
                status: "읽는 중",
                publisher: "열린책들",
                pages: 672,
                coverImage: "https://image.yes24.com/goods/96668213/XL",
                addedAt: "2023-12-10T14:30:00Z"
            },
        ],
        statusCounts: {
            "읽는 중": 6,
            "완독": 4,
            "읽기 예정": 1
        }
    };

    useEffect(() => {
        loadLibraryData();
    }, []);

    // 화면 포커스 시 데이터 새로고침 (다른 화면에서 책 추가/삭제 시 반영)
    useFocusEffect(
        React.useCallback(() => {
            loadLibraryData();
        }, [])
    );

    const loadLibraryData = async () => {
        setLoading(true);
        try {
            // 실제 구현 시 API 호출
            // const response = await apiService.getUserLibrary(userId, selectedFilter);
            // setBooks(response.data.books);
            // setStatusCounts(response.data.statusCounts);
            
            // 더미 데이터 시뮬레이션
            setTimeout(() => {
                setBooks(dummyLibraryData.books);
                setStatusCounts(dummyLibraryData.statusCounts);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('서재 데이터 로딩 실패:', error);
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

    // 필터 버튼 텍스트에 개수 포함 - ex: 전체 11
    const getFilterText = (filter) => {
        if (filter === "전체") {
            const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
            return `전체 (${totalCount})`;
        }
        return `${filter} (${statusCounts[filter] || 0})`;
    };

    const handleBookPress = (book) => {
        navigation.navigate("BookDetail", {
            bookId: book.id,
            bookData: book,
        });
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
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
                        {filteredBooks.map((book, index) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                index={index}
                                onPress={handleBookPress}
                            />
                        ))}
                    </View>
                ) : (
                    renderEmptyState()
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// 추가 스타일 (기존 스타일에 병합)
const additionalStyles = {
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "SUIT-Medium",
        color: "#999999",
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: "SUIT-Regular",
        color: "#CCCCCC",
        marginTop: 8,
        textAlign: 'center',
    },
};

export default MyLibrary;