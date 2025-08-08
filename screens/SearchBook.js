import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const SearchBookScreen = ({ navigation }) => {
  const [searchType, setSearchType] = useState('통합검색');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // 더미 데이터 - 실제 구현 시 API 호출로 대체
  const dummyBooksData = [
    { 
      id: 1, 
      title: '운수 좋은 날', 
      author: '현진건', 
      publisher: '소담', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788973811755.jpg',
      isbn: '9788973811755',
      publishedYear: 2020
    },
    { 
      id: 2, 
      title: '메밀꽃 필 무렵', 
      author: '이효석', 
      publisher: '블랙독', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/480D240734740.jpg',
      isbn: '9788980734742',
      publishedYear: 2019
    },
    { 
      id: 3, 
      title: '봄봄', 
      author: '김유정', 
      publisher: '희원북스', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/480D250329600.jpg',
      isbn: '9788950329607',
      publishedYear: 2021
    },
    { 
      id: 4, 
      title: '사랑손님과 어머니', 
      author: '주요섭', 
      publisher: '문학과지성사', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788932023267.jpg',
      isbn: '9788932023267',
      publishedYear: 2018
    },
    { 
      id: 5, 
      title: '금따는 콩밭', 
      author: '김유정', 
      publisher: '작가와비평', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/4801155920115.jpg',
      isbn: '9801155920115',
      publishedYear: 2020
    },
    { 
      id: 6, 
      title: '운수 좋은 날', 
      author: '현진건', 
      publisher: '칼로스', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791198761286.jpg',
      isbn: '9791198761286',
      publishedYear: 2023
    },
    { 
      id: 7, 
      title: '태백산맥', 
      author: '조정래', 
      publisher: '해냄', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788965749271.jpg',
      isbn: '9788965749271',
      publishedYear: 2017
    },
    { 
      id: 8, 
      title: '토지 1(1부 1권)', 
      author: '박경리', 
      publisher: '다산책방', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791130699462.jpg',
      isbn: '9791130699462',
      publishedYear: 2022
    },
    { 
      id: 9, 
      title: '토지 2(1부 2권)', 
      author: '박경리', 
      publisher: '다산책방', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791130699479.jpg',
      isbn: '9791130699479',
      publishedYear: 2022
    },
    { 
      id: 10, 
      title: '토지 7(2부 3권)', 
      author: '박경리', 
      publisher: '다산책방', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791130699530.jpg',
      isbn: '9791130699530',
      publishedYear: 2022
    },
    { 
      id: 11, 
      title: '노스텔지어, 어느 위험한 감정의 연대기', 
      author: '애그니스 아널드포스터', 
      publisher: '문학동네', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791167741684.jpg',
      isbn: '9791167741684',
      publishedYear: 2023
    },
    { 
      id: 12, 
      title: '1984', 
      author: '조지 오웰', 
      publisher: '민음사', 
      coverImage: 'https://image.aladin.co.kr/product/41/89/letslook/S062933637_f.jpg',
      isbn: '9788937462337',
      publishedYear: 2016
    },
    { 
      id: 13, 
      title: '해리포터와 마법사의 돌', 
      author: 'J.K. 롤링', 
      publisher: '문학과지성사', 
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToSmMU_mIWeKIo8u84VpMgF7kPMR9SjVN2ug&s',
      isbn: '9788932917245',
      publishedYear: 2019
    },
    { 
      id: 14, 
      title: '어린왕자', 
      author: '생텍쥐페리', 
      publisher: '열린책들', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791191200157.jpg',
      isbn: '9791191200157',
      publishedYear: 2021
    },
    { 
      id: 15, 
      title: '데미안', 
      author: '헤르만 헤세', 
      publisher: '민음사', 
      coverImage: 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/044_%EB%8D%B0%EB%AF%B8%EC%95%88-300x504.jpg',
      isbn: '9788937460449',
      publishedYear: 2015
    },
    { 
      id: 16, 
      title: '미움받을 용기', 
      author: '기시미 이치로', 
      publisher: '인플루엔셜', 
      coverImage: 'https://image.aladin.co.kr/product/4846/30/letslook/S572535350_fl.jpg',
      isbn: '9788960883505',
      publishedYear: 2014
    },
    { 
      id: 17, 
      title: '코스모스', 
      author: '칼 세이건', 
      publisher: '사이언스북스', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788983711892.jpg',
      isbn: '9788983711892',
      publishedYear: 2018
    },
    { 
      id: 18, 
      title: '사피엔스', 
      author: '유발 하라리', 
      publisher: '김영사', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788934992042.jpg',
      isbn: '9788934992042',
      publishedYear: 2015
    },
    { 
      id: 19, 
      title: '백년동안의 고독', 
      author: '가브리엘 가르시아 마르케스', 
      publisher: '문학사상', 
      coverImage: 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788970126937.jpg',
      isbn: '9788970126937',
      publishedYear: 2017
    },
    { 
      id: 20, 
      title: '죄와 벌', 
      author: '표도르 도스토옙스키', 
      publisher: '민음사', 
      coverImage: 'https://image.yes24.com/goods/96668213/XL',
      isbn: '9788937460821',
      publishedYear: 2020
    },
  ];
  
  // 화면에 포커스될 때마다 검색 상태 초기화
  useFocusEffect(
    React.useCallback(() => {
      setSearchType('통합검색');
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setDropdownVisible(false);
      setLoading(false);
    }, [])
  );
  
  // 검색 타입 옵션
  const searchTypes = [
    { value: '통합검색', label: '통합검색' },
    { value: '제목검색', label: '제목검색' },
    { value: '작가검색', label: '작가검색' }
  ];

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setDropdownVisible(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // 검색어가 없으면 검색하지 않음
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      // 실제 구현 시 API 호출
      // const searchTypeMap = {
      //   '통합검색': 'all',
      //   '제목검색': 'title',
      //   '작가검색': 'author'
      // };
      // const response = await apiService.searchBooks(searchQuery, searchTypeMap[searchType]);
      // setSearchResults(response.data.books);
      
      // 더미 데이터 검색 시뮬레이션
      setTimeout(() => {
        const query = searchQuery.toLowerCase().trim();
        let filteredBooks = [];

        switch (searchType) {
          case '제목검색':
            filteredBooks = dummyBooksData.filter(book => 
              book.title.toLowerCase().includes(query)
            );
            break;
          case '작가검색':
            filteredBooks = dummyBooksData.filter(book => 
              book.author.toLowerCase().includes(query)
            );
            break;
          case '통합검색':
          default:
            filteredBooks = dummyBooksData.filter(book => 
              book.title.toLowerCase().includes(query) || 
              book.author.toLowerCase().includes(query)
            );
            break;
        }

        setSearchResults(filteredBooks);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('검색 실패:', error);
      setLoading(false);
      Alert.alert('검색 오류', '검색 중 오류가 발생했습니다.');
    }
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { 
      bookId: book.id,
      bookData: book 
    });
  };

  const renderBook = (book, index) => (
    <TouchableOpacity 
      key={book.id} 
      style={[
        styles.bookCard,
        (index + 1) % 3 === 0 && { marginRight: 0 }
      ]}
      onPress={() => handleBookPress(book)}
      activeOpacity={0.7}
    >
      {book.coverImage ? (
        <Image 
          source={{ uri: book.coverImage }} 
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bookCoverPlaceholder} />
      )}
      <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.bookMeta} numberOfLines={1}>{book.author} | {book.publisher}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>도서를 검색해보세요</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchType === '통합검색' ? '도서명이나 작가명' : 
         searchType === '제목검색' ? '도서명' : '작가명'}을 입력해주세요
      </Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <Ionicons name="sad-outline" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>검색 결과가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>
        다른 검색어로 다시 시도해보세요
      </Text>
    </View>
  );

  const renderDropdown = () => (
    <Modal
      visible={dropdownVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setDropdownVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDropdownVisible(false)}
      >
        <View style={styles.dropdownContainer}>
          {searchTypes.map((type, index) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.dropdownItem,
                index === 0 && styles.dropdownItemFirst,
                index === searchTypes.length - 1 && styles.dropdownItemLast,
                searchType === type.value && styles.dropdownItemSelected
              ]}
              onPress={() => handleSearchTypeSelect(type.value)}
            >
              <Text style={[
                styles.dropdownItemText,
                searchType === type.value && styles.dropdownItemTextSelected
              ]}>
                {type.label}
              </Text>
              {searchType === type.value && (
                <Ionicons name="checkmark" size={16} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomHeader 
        title="도서 검색"
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TouchableOpacity 
            style={styles.searchTypeButton}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down-outline" size={16} color="#666666" />
            <Text style={styles.searchTypeText}>{searchType}</Text>
          </TouchableOpacity>
          
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={`${searchType === '통합검색' ? '도서명, 작가명' : searchType === '제목검색' ? '도서명' : '작가명'}을 입력하세요`}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#666666" />
            ) : (
              <Ionicons name="search" size={20} color="#666666" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        {hasSearched && !loading && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({searchResults.length})
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#90D1BE" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : !hasSearched ? (
            renderEmptyState()
          ) : searchResults.length === 0 ? (
            renderNoResults()
          ) : (
            <View style={styles.booksGrid}>
              {searchResults.map((book, index) => renderBook(book, index))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Dropdown Modal */}
      {renderDropdown()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 90,
  },
  searchTypeText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 6,
    fontWeight: '500',
  },
  searchInputContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    fontSize: 14,
    color: '#333333',
    paddingVertical: 10,
  },
  searchButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 100,
  },
  bookCard: {
    width: '30%',
    marginRight: '5%',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  bookCover: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 8,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#D3D3D3',
    borderRadius: 4,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  bookMeta: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  // 빈 상태 스타일
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // 드롭다운 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 150,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemFirst: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
  },
  dropdownItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SearchBookScreen;