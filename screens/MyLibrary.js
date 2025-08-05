import React, { useState } from "react";
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    Text,
    ScrollView,
    StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TitleSVG from "../assets/icons/Title.svg";
import AlarmSVG from "../assets/icons/Alarm.svg";
import BookCard from "../components/BookCard";
import { styles } from "../styles/MainScreenStyle";
import CustomHeader from '../components/CustomHeader';

const MyLibrary = () => {
    const navigation = useNavigation();
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("전체");

    const bookData = [
        {
            id: 1,
            title: "운수 좋은 날",
            author: "현진건",
            status: "읽는 중",
            publisher: "소담출판사",
            pages: 231,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg",
        },
        {
            id: 2,
            title: "노스텔지어, 어느 위험한 감정의 연대기",
            author: "애그니스 아널드포스터",
            status: "읽는 중",
            publisher: "어크로스",
            pages: 320,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg",
        },
        {
            id: 3,
            title: "1984",
            author: "조지 오웰",
            status: "완독",
            publisher: "민음사",
            pages: 400,
            coverImage:
                "https://image.aladin.co.kr/product/41/89/letslook/S062933637_f.jpg",
        },
        {
            id: 4,
            title: "해리포터와 마법사의 돌",
            author: "J.K. 롤링",
            status: "읽는 중",
            publisher: "문학수첩",
            pages: 348,
            coverImage:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToSmMU_mIWeKIo8u84VpMgF7kPMR9SjVN2ug&s",
        },
        {
            id: 5,
            title: "어린왕자",
            author: "생텍쥐페리",
            status: "완독",
            publisher: "열린책들",
            pages: 128,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791191200157.jpg",
        },
        {
            id: 6,
            title: "데미안",
            author: "헤르만 헤세",
            status: "읽는 중",
            publisher: "민음사",
            pages: 288,
            coverImage:
                "https://minumsa.minumsa.com/wp-content/uploads/bookcover/044_%EB%8D%B0%EB%AF%B8%EC%95%88-300x504.jpg",
        },
        {
            id: 7,
            title: "미움받을 용기",
            author: "기시미 이치로",
            status: "완독",
            publisher: "인플루엔셜",
            pages: 350,
            coverImage:
                "https://image.aladin.co.kr/product/4846/30/letslook/S572535350_fl.jpg",
        },
        {
            id: 8,
            title: "코스모스",
            author: "칼 세이건",
            status: "읽는 중",
            publisher: "사이언스북스",
            pages: 456,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788983711892.jpg",
        },
        {
            id: 9,
            title: "사피엔스",
            author: "유발 하라리",
            status: "완독",
            publisher: "김영사",
            pages: 512,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788934992042.jpg",
        },
        {
            id: 10,
            title: "백년동안의 고독",
            author: "가브리엘 가르시아 마르케스",
            status: "읽는 중",
            publisher: "민음사",
            pages: 416,
            coverImage:
                "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788970126937.jpg",
        },
        {
            id: 11,
            title: "죄와 벌",
            author: "표도르 도스토옙스키",
            status: "읽는 중",
            publisher: "열린책들",
            pages: 672,
            coverImage: "https://image.yes24.com/goods/96668213/XL",
        },
    ];

    const filteredBooks = bookData.filter((book) => {
        if (selectedFilter === "전체") return true;
        return book.status === selectedFilter;
    });

    const handleBookPress = (book) => {
        navigation.navigate("BookDetail", {
            bookId: book.id,
            bookData: book,
        });
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

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
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter && styles.activeFilterText,
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* 책 그리드 */}
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
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyLibrary;