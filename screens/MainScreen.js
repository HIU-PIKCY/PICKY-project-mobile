import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import TitleSVG from "../assets/icons/PICKY.svg";
import AlarmSVG from "../assets/icons/Alarm.svg";

const MainScreen = () => {
  const navigation = useNavigation();

  // 현재 날짜 기반으로 몇월 몇주차인지 계산
  const getCurrentWeekInfo = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstWeekStart = new Date(firstDayOfMonth);
    firstWeekStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    const diffTime = now.getTime() - firstWeekStart.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
    return `${month}월 ${diffWeeks}주차`;
  };

  // 사용자 정보 데이터
  const userData = {
    name: "키피럽",
    totalBooks: 12,
    totalQA: 24
  };

  // 추천 도서 데이터
  const recommendedBook = {
    id: 1,
    title: "이거 저만 불편한가요",
    description: "김첨지의 상황에 깊이 공감한 작성자와 몇몇 작성자들이 현재 시대라면 어땠을까 하고 공유한다.",
    tags: ["토픽", "서사불쌍", "무한공감"],
    likes: 12,
    comments: 23,
    views: 51,
    coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg",
    bookTitle: "운수 좋은 날",
    author: "현진건"
  };

  // 이번 주 키워드 데이터
  const weeklyKeywords = [
    { text: "대입", size: "large", rank: 1 },
    { text: "금전", size: "medium", rank: 2 },
    { text: "환경", size: "small", rank: 3 }
  ];

  // 최다 질문 도서 데이터
  const mostQuestionedBooks = [
    {
      id: 1,
      title: "노스텔지어, 어느 위험한 감정의 연대기",
      author: "애그니스 아널드포스터",
      coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg",
      questionCount: 45
    },
    {
      id: 2,
      title: "운수 좋은 날",
      author: "현진건",
      coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg",
      questionCount: 38
    },
    {
      id: 3,
      title: "코스모스",
      author: "칼 세이건",
      coverImage: "https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788983711892.jpg",
      questionCount: 32
    },
    {
      id: 4,
      title: "1984",
      author: "조지 오웰",
      coverImage: "https://image.aladin.co.kr/product/41/89/letslook/S062933637_f.jpg",
      questionCount: 28
    },
    {
      id: 5,
      title: "해리 포터와 마법사의 돌",
      author: "J.K. 롤링",
      coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToSmMU_mIWeKIo8u84VpMgF7kPMR9SjVN2ug&s",
      questionCount: 25
    }
  ];

  // 알림 정보 데이터
  const hasNewNotifications = true;

  const handleBookPress = (book) => {
    navigation.navigate("BookDetail", {
      bookId: book.id,
      bookData: book,
    });
  };

  const handleNotificationPress = () => {
    navigation.navigate("NotificationPage");
  };

  const handleHotTopicPress = () => {
    navigation.navigate("BookDetail", {
      bookId: recommendedBook.id,
      bookData: recommendedBook,
    });
  };

  const handleMostQuestionedBookPress = (book) => {
    navigation.navigate("BookDetail", {
      bookId: book.id,
      bookData: book,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TitleSVG width={80} height={18} />
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={handleNotificationPress}>
          <AlarmSVG width={24} height={24} />
          {hasNewNotifications && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 상단 메시지 및 통계 카드 */}
        <TouchableOpacity
          style={styles.combinedCard}
        >
          <Text style={styles.infoText}>
            {userData.name}님! 오늘도 <Text style={styles.highlightText}>피키</Text>와 함께 의견을 나눠봐요.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statsText}>
                총 독서량 <Text style={styles.statNumber}>  {userData.totalBooks}  </Text> 권
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statsText}>
                질문/답변 <Text style={styles.statNumber}>  {userData.totalQA}  </Text> 개
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 민트색 배경 컨테이너 */}
        <View style={styles.roundedContainer}>
          {/* 핫 토픽 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>의견 공유가 활발했던 질문이에요!</Text>
            <Text style={styles.sectionTitle}>이번 주 핫 토픽</Text>

            <TouchableOpacity style={styles.bookCard} onPress={handleHotTopicPress}>
              <View style={styles.leftSection}>
                <View style={styles.bookImageContainer}>
                  <Image
                    source={{ uri: recommendedBook.coverImage }}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.bookInfoUnderImage}>
                  <Text style={styles.bookTitleUnderImage}>{recommendedBook.bookTitle}</Text>
                  <Text style={styles.bookAuthorUnderImage}>{recommendedBook.author}</Text>
                </View>
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{recommendedBook.title}</Text>

                <View style={styles.aiSummaryTag}>
                  <Text style={styles.aiSummaryText}>AI 요약</Text>
                </View>

                <Text style={styles.topicSummary}>
                  {recommendedBook.description}
                </Text>

                <View style={styles.tagsContainer}>
                  {recommendedBook.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.engagement}>
                  <View style={styles.engagementItem}>
                    <Ionicons name="heart-outline" size={16} color="#666666" />
                    <Text style={styles.engagementText}>{recommendedBook.likes}</Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                    <Text style={styles.engagementText}>{recommendedBook.comments}</Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Ionicons name="eye-outline" size={16} color="#666666" />
                    <Text style={styles.engagementText}>{recommendedBook.views}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 키워드 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>가장 많이 나온 키워드들 모았어요!</Text>
            <Text style={styles.sectionTitle}>이번 주 키워드</Text>

            <View style={styles.keywordsContainer}>
              <View style={styles.keywordBubble}>
                <Text style={styles.mainKeywordText}># {weeklyKeywords[0].text}</Text>
              </View>
              <View style={[styles.keywordBubble, styles.secondKeyword]}>
                <Text style={styles.secondKeywordText}># {weeklyKeywords[1].text}</Text>
              </View>
              <View style={[styles.keywordBubble, styles.thirdKeyword]}>
                <Text style={styles.keywordText}># {weeklyKeywords[2].text}</Text>
              </View>
              <Text style={styles.keywordStats}>* {getCurrentWeekInfo()} 기준</Text>
            </View>
          </View>

          {/* 최다 질문 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>질문이 많은 책을 소개해요!</Text>
            <Text style={styles.sectionTitle}>이번 주 최다 질문</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksScroll}>
              {mostQuestionedBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.smallBookCard}
                  onPress={() => handleMostQuestionedBookPress(book)}
                >
                  <View style={styles.smallBookImageContainer}>
                    <Image
                      source={{ uri: book.coverImage }}
                      style={styles.smallBookImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.smallBookTitle} numberOfLines={2}>{book.title}</Text>
                  <Text style={styles.smallBookAuthor} numberOfLines={1}>{book.author}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    position: 'absolute',
    right: 20,
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 3.5,
    width: 7,
    height: 7,
    backgroundColor: '#90D1BE',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  combinedCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 20,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#F3FCF9',
    marginTop: 25,
    marginBottom: 30,
    shadowColor: '#90D1BE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#666',
    letterSpacing: -0.4,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  highlightText: {
    color: '#0D2525',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: { marginHorizontal: 20 },
  statsText: {
    fontSize: 17,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#666',
    letterSpacing: -0.4,
    lineHeight: 20,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#4B4B4B',
    letterSpacing: -0.4,
  },
  roundedContainer: {
    backgroundColor: '#F3FCF9',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    marginHorizontal: -20,
  },
  section: { marginBottom: 30 },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  sectionTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.45,
    color: '#0D2525',
    marginBottom: 25,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#90D1BE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 18,
    justifyContent: 'center',
  },
  bookImageContainer: {
    width: 93,
    height: 124,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bookImage: { width: '100%', height: '100%' },
  bookInfoUnderImage: { alignItems: 'center', width: 90 },
  bookTitleUnderImage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
    lineHeight: 18,
  },
  bookAuthorUnderImage: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
  topicInfo: { flex: 1, justifyContent: 'center' },
  topicTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: '#0D2525',
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 22,
  },
  aiSummaryTag: {
    backgroundColor: '#BDBDBD',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiSummaryText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
  topicSummary: {
    fontFamily: 'SUIT-Medium',
    fontSize: 15,
    textAlign: 'justify',
    color: '#666',
    fontWeight: '400',
    letterSpacing: -0.35,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#90D1BE40',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: { fontSize: 13, color: '#666666', fontWeight: '400' },
  engagement: { flexDirection: 'row', alignItems: 'center' },
  engagementItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  engagementText: { fontSize: 14, color: '#666', marginLeft: 4 },
  keywordsContainer: {
    position: 'relative',
    height: 120,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  keywordBubble: {
    position: 'absolute',
    backgroundColor: 'transparent',
    left: '40%',
    top: '30%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  secondKeyword: {
    left: '75%',
    top: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  thirdKeyword: {
    left: '55%',
    top: '75%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  keywordText: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#48A7A7',
  },
  secondKeywordText: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 26,
    fontWeight: '700',
    color: '#3F8C8C',
  },
  mainKeywordText: {
    fontFamily: 'SUIT-SemiBold',
    color: '#0D2525',
    fontSize: 32,
    fontWeight: '700',
  },
  keywordStats: {
    fontFamily: 'SUIT-SemiBold',
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 14,
    color: '#666',
  },
  booksScroll: {
    paddingVertical: 8,
  },
  smallBookCard: {
    width: 120,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#90D1BE',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  smallBookImageContainer: {
    width: 90,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  smallBookImage: {
    width: '100%',
    height: '100%',
  },
  smallBookTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
    lineHeight: 18,
  },
  smallBookAuthor: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    textAlign: 'left',
    width: '100%',
    marginBottom: 2,
  },
  questionCount: {
    fontSize: 11,
    color: '#90D1BE',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MainScreen;