import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TitleSVG from '../assets/icons/Title.svg';
import AlarmSVG from '../assets/icons/Alarm.svg';
import BookCard from '../components/BookCard';
import { styles } from '../styles/MainScreenStyle';

const MainScreen = () => {
  const navigation = useNavigation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');

  const bookData = [
    { id: 1, title: '운수 좋은 날', author: '현진건', status: '읽는 중', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg'},
    { id: 2, title: '노스텔지어, 어느 위험한 감정의 연대기', author: '애그니스 아널드포스터', status: '읽는 중', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg'},
    { id: 3, title: '1984', author: '조지 오웰', status: '완독', coverImage: 'https://image.aladin.co.kr/product/41/89/letslook/S062933637_f.jpg'},
    { id: 4, title: '해리포터와 마법사의 돌', author: 'J.K. 롤링', status: '읽는 중', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToSmMU_mIWeKIo8u84VpMgF7kPMR9SjVN2ug&s' },
    { id: 5, title: '어린왕자', author: '생텍쥐페리', status: '완독', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791191200157.jpg' },
    { id: 6, title: '데미안', author: '헤르만 헤세', status: '읽는 중', coverImage: 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/044_%EB%8D%B0%EB%AF%B8%EC%95%88-300x504.jpg' },
    { id: 7, title: '미움받을 용기', author: '기시미 이치로', status: '완독', coverImage: 'https://image.aladin.co.kr/product/4846/30/letslook/S572535350_fl.jpg?MW=750&WG=3&WS=100&&WO=30&WF=-15x15&WU=https://image.aladin.co.kr/img/common/openmarket_ci.png' },
    { id: 8, title: '코스모스', author: '칼 세이건', status: '읽는 중', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788983711892.jpg' },
    { id: 9, title: '사피엔스', author: '유발 하라리', status: '완독', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788934992042.jpg' },
    { id: 10, title: '백년동안의 고독', author: '가브리엘 가르시아 마르케스', status: '읽는 중', coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788970126937.jpg' },
    { id: 11, title: '죄와 벌', author: '표도르 도스토옙스키', status: '읽는 중', coverImage: 'https://image.yes24.com/goods/96668213/XL' },
  ];

  const filteredBooks = bookData.filter(book => {
    if (selectedFilter === '전체') return true;
    return book.status === selectedFilter;
  });

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { 
      bookId: book.id,
      bookData: book 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TitleSVG width={62} height={27} />
        </View>
        <TouchableOpacity style={styles.rightSection}>
          <AlarmSVG width={24} height={24} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 추천 카드 */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationText}>
            키피럽님! 오늘도 <Text style={styles.highlightText}>피키</Text>와 함께 의견을 나눠봐요
          </Text>
          <TouchableOpacity 
            style={styles.statsContainer}
            onPress={() => setShowTooltip(!showTooltip)}
          >
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 독서량</Text>
              <Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>권</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>질문/답변</Text>
              <Text style={styles.statValue}>24</Text><Text style={styles.statLabel}>개</Text>
            </View>
          </TouchableOpacity>
          {showTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>놀러서 내 질문과 답변을 확인해보세요!</Text>
            </View>
          )}
        </View>

        {/* 내 서재 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 서재</Text>
          <View style={styles.filterContainer}>
            {['전체', '읽는 중', '완독'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={styles.filterButton}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

export default MainScreen;