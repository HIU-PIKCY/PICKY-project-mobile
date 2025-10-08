import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import TitleSVG from "../assets/icons/PICKY.svg";
import AlarmSVG from "../assets/icons/Alarm.svg";
import styles from "../styles/MainScreenStyle";
import { useAuth } from "../AuthContext";

const API_BASE_URL = "http://13.124.86.254";

const MainScreen = () => {
  const navigation = useNavigation();
  const { authenticatedFetch } = useAuth();

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hotTopic, setHotTopic] = useState(null);
  const [weeklyKeywords, setWeeklyKeywords] = useState([]);
  const [weekInfo, setWeekInfo] = useState("");
  const [mostQuestionedBooks, setMostQuestionedBooks] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 화면 포커스 시 알림 확인
  useFocusEffect(
    React.useCallback(() => {
      checkNotifications();
    }, [])
  );

  // 모든 초기 데이터 로드 (순차 실행으로 토큰 갱신 충돌 방지)
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await loadUserData();
      await loadHotTopic();
      await loadWeeklyKeywords();
      await loadMostQuestionedBooks();
      await checkNotifications();
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 데이터 로드 (API 연동)
  const loadUserData = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/members/mymenu`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess && data.result) {
        const { user, stats } = data.result;

        setUserData({
          name: user.nickname || user.name || "사용자",
          totalBooks: stats.totalBooks || 0,
          totalQA: (stats.questions || 0) + (stats.answers || 0)
        });
      }
    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error);
      setUserData({
        name: "사용자",
        totalBooks: 0,
        totalQA: 0
      });
    }
  };

  // 이번 주 핫 토픽 로드
  const loadHotTopic = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/home/hot-topic`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`핫 토픽 조회 실패! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess && data.result) {
        const result = data.result;
        setHotTopic({
          questionId: result.questionId,
          title: result.questionTitle,
          description: result.aiSummary,
          tags: result.hashtags.map(tag => tag.replace('#', '')),
          likes: result.likes,
          comments: result.comments,
          views: result.views,
          book: {
            id: result.questionId,
            title: result.bookTitle,
            author: result.bookAuthor,
            coverImage: result.bookCover
          }
        });

        if (result.weekInfo) {
          setWeekInfo(result.weekInfo);
        }
      }
    } catch (error) {
      console.error('핫 토픽 로딩 실패:', error);
    }
  };

  // 이번 주 키워드 로드
  const loadWeeklyKeywords = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/home/weekly-keywords`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`주간 키워드 조회 실패! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess && data.result && data.result.keywords) {
        setWeeklyKeywords(data.result.keywords.map(item => ({
          text: item.keyword,
          rank: item.rank
        })));
      }
    } catch (error) {
      console.error('주간 키워드 로딩 실패:', error);
    }
  };

  // 이번 주 최다 질문 도서 로드
  const loadMostQuestionedBooks = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/home/most-questioned-books`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 403) {
          setMostQuestionedBooks([]);
          return;
        }
        throw new Error(`최다 질문 도서 조회 실패! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess && data.result && data.result.books) {
        const books = data.result.books.slice(0, 5).map(book => ({
          id: book.bookId,
          isbn: book.isbn,
          title: book.bookTitle,
          author: book.bookAuthor,
          coverImage: book.bookCover
        }));

        setMostQuestionedBooks(books);

        if (!weekInfo && data.result.weekInfo) {
          setWeekInfo(data.result.weekInfo);
        }
      }
    } catch (error) {
      console.error('최다 질문 도서 로딩 실패:', error);
      setMostQuestionedBooks([]);
    }
  };

  // 알림 확인
  const checkNotifications = async () => {
    try {
      // TODO: 실제 알림 API 연동 필요
      setHasNewNotifications(false);
    } catch (error) {
      console.error('알림 확인 실패:', error);
    }
  };

  // 새로고침 핸들러
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // 알림 페이지로 이동
  const handleNotificationPress = () => {
    navigation.navigate("NotificationPage");
  };

  // 핫 토픽 클릭 시 질문 상세로 이동
  const handleHotTopicPress = () => {
    if (hotTopic) {
      navigation.navigate("QuestionDetail", {
        questionId: hotTopic.questionId,
        questionData: {
          id: hotTopic.questionId,
          title: hotTopic.title,
          description: hotTopic.description,
          likes: hotTopic.likes,
          comments: hotTopic.comments,
          views: hotTopic.views,
        },
        bookData: {
          id: hotTopic.book.id,
          title: hotTopic.book.title,
          author: hotTopic.book.author,
          coverImage: hotTopic.book.coverImage,
        }
      });
    }
  };

  // 최다 질문 도서 클릭 시 책 상세로 이동
  const handleMostQuestionedBookPress = (book) => {
    if (!book) {
      console.error('책 정보가 없습니다');
      return;
    }

    const identifier = book.isbn || book.id;

    if (!identifier) {
      console.error('책 식별자(ISBN 또는 ID)가 없습니다:', book);
      return;
    }

    navigation.navigate("BookDetail", {
      isbn: book.isbn || book.id,
      bookData: {
        isbn: book.isbn,
        title: book.title,
        authors: book.author ? [book.author] : [],
        author: book.author,
        coverImage: book.coverImage
      }
    });
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TitleSVG width={80} height={18} />
          </View>
          <TouchableOpacity style={styles.headerRight} onPress={handleNotificationPress}>
            <AlarmSVG width={24} height={24} />
            {hasNewNotifications && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#90D1BE" />
        </View>
      </SafeAreaView>
    );
  }

  // 메인 화면
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#90D1BE']}
            tintColor="#90D1BE"
          />
        }
      >
        {/* 상단 인사 및 통계 카드 */}
        {userData && (
          <View style={styles.combinedCard}>
            <Text
              style={styles.infoText}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              minimumFontScale={0.7}
            >
              {userData.name} 님! 오늘도 <Text style={styles.highlightText}>피키</Text>와 함께 의견을 나눠봐요.
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statsText}>
                  총 독서량 <Text style={styles.statNumber}>   {userData.totalBooks}   </Text> 권
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statsText}>
                  질문/답변 <Text style={styles.statNumber}>   {userData.totalQA}   </Text> 개
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 민트색 배경 컨테이너 */}
        <View style={styles.roundedContainer}>
          {/* 이번 주 핫 토픽 섹션 */}
          {hotTopic && (
            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>의견 공유가 활발했던 질문이에요!</Text>
              <Text style={styles.sectionTitle}>이번 주 핫 토픽</Text>

              <TouchableOpacity style={styles.bookCard} onPress={handleHotTopicPress}>
                <View style={styles.leftSection}>
                  <View style={styles.bookImageContainer}>
                    <Image
                      source={{ uri: hotTopic.book.coverImage }}
                      style={styles.bookImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.bookInfoUnderImage}>
                    <Text style={styles.bookTitleUnderImage}>{hotTopic.book.title}</Text>
                    <Text style={styles.bookAuthorUnderImage}>{hotTopic.book.author}</Text>
                  </View>
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{hotTopic.title}</Text>

                  <View style={styles.aiSummaryTag}>
                    <Text style={styles.aiSummaryText}>AI 요약</Text>
                  </View>

                  <Text style={styles.topicSummary}>
                    {hotTopic.description}
                  </Text>

                  <View style={styles.tagsContainer}>
                    {hotTopic.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.engagement}>
                    <View style={styles.engagementItem}>
                      <Ionicons name="heart-outline" size={16} color="#666666" />
                      <Text style={styles.engagementText}>{hotTopic.likes}</Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                      <Text style={styles.engagementText}>{hotTopic.comments}</Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <Ionicons name="eye-outline" size={16} color="#666666" />
                      <Text style={styles.engagementText}>{hotTopic.views}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* 이번 주 키워드 섹션 */}
          {weeklyKeywords.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>가장 많이 나온 키워드를 모았어요!</Text>
              <Text style={styles.sectionTitle}>이번 주 키워드</Text>
              <View style={{ position: 'relative' }}>
                {/* SVG Radial Gradient 배경 */}
                <Svg
                  height="180"
                  width="100%"
                  style={{ position: 'absolute', top: -20, left: 0, right: 0 }}
                >
                  <Defs>
                    <RadialGradient id="grad" cx="50%" cy="40%">
                      <Stop offset="0%" stopColor="rgb(120, 200, 176)" stopOpacity="0.25" />
                      <Stop offset="30%" stopColor="rgb(120, 200, 176)" stopOpacity="0.15" />
                      <Stop offset="60%" stopColor="rgb(120, 200, 176)" stopOpacity="0.01" />
                      <Stop offset="85%" stopColor="rgb(120, 200, 176)" stopOpacity="0" />
                      <Stop offset="100%" stopColor="rgb(120, 200, 176)" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Ellipse cx="50%" cy="60%" rx="75%" ry="70%" fill="url(#grad)" />
                </Svg>
                <View style={styles.keywordsContainer}>
                  {/* 키워드 텍스트들 */}
                  <View style={styles.keywordBubble}>
                    <Text style={styles.mainKeywordText}># {weeklyKeywords[0]?.text}</Text>
                  </View>
                  {weeklyKeywords[1] && (
                    <View style={[styles.keywordBubble, styles.secondKeyword]}>
                      <Text style={styles.secondKeywordText}># {weeklyKeywords[1].text}</Text>
                    </View>
                  )}
                  {weeklyKeywords[2] && (
                    <View style={[styles.keywordBubble, styles.thirdKeyword]}>
                      <Text style={styles.keywordText}># {weeklyKeywords[2].text}</Text>
                    </View>
                  )}
                  <Text style={styles.keywordStats}>* {weekInfo} 기준</Text>
                </View>
              </View>
            </View>
          )}

          {/* 이번 주 최다 질문 섹션 */}
          {mostQuestionedBooks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>질문이 많은 책을 소개해요!</Text>
              <Text style={styles.sectionTitle}>이번 주 최다 질문</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksScroll}>
                {mostQuestionedBooks.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.smallBookCard}
                    onPress={() => handleMostQuestionedBookPress(book)}
                    activeOpacity={0.7}
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
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;