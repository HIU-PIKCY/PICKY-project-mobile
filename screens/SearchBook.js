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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../AuthContext';

const SearchBookScreen = ({ navigation }) => {
  // 검색 관련 상태
  const [searchType, setSearchType] = useState('통합검색');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // 추가 데이터 로딩 상태
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [hasNext, setHasNext] = useState(false); // 다음 페이지 존재 여부

  // AuthContext에서 authenticatedFetch 가져오기
  const { authenticatedFetch } = useAuth();

  // 서버 API URL
  const API_BASE_URL = 'http://13.124.86.254';

  // 화면에 포커스될 때마다 검색 상태 초기화 - 검색 결과는 유지
  useFocusEffect(
    React.useCallback(() => {
      // 검색 결과와 hasSearched는 유지하고 드롭다운과 로딩만 초기화
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

  // 검색 타입 선택 핸들러
  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setDropdownVisible(false);
  };

  // 검색 타입을 API 파라미터로 변환
  const getSearchTypeParam = (type) => {
    switch (type) {
      case '제목검색':
        return 'title';
      case '작가검색':
        return 'author';
      case '통합검색':
      default:
        return 'all';
    }
  };

  // 검색 함수 - 새로운 검색 시작
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);
    setSearchResults([]); // 기존 결과 초기화

    await fetchBooks(1, true);
  };

  // 더보기 함수 - 다음 페이지 로드
  const handleLoadMore = async () => {
    // 이미 로딩 중이거나 다음 페이지가 없으면 중단
    if (loadingMore || !hasNext) return;

    setLoadingMore(true);
    await fetchBooks(currentPage + 1, false);
  };

  // 실제 API 호출 함수
  const fetchBooks = async (page, isNewSearch) => {
    try {
      const searchTypeParam = getSearchTypeParam(searchType);

      // URL 파라미터 생성
      const params = new URLSearchParams({
        keyword: searchQuery.trim(),
        type: searchTypeParam,
        page: page.toString(),
        size: '20'
      });

      const url = `${API_BASE_URL}/api/books/search?${params.toString()}`;
      console.log('요청 URL:', url);

      // authenticatedFetch 사용
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('에러 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (data.isSuccess) {
        const newBooks = data.result?.items || [];
        const nextPage = data.result?.hasNext || false;

        if (isNewSearch) {
          // 새로운 검색 - 기존 결과를 새 결과로 교체
          setSearchResults(newBooks);
        } else {
          // 추가 로드 - 기존 결과에 새 결과 추가
          setSearchResults(prev => [...prev, ...newBooks]);
        }

        setHasNext(nextPage);
        setCurrentPage(page);
      } else {
        throw new Error(data.message || '검색에 실패했습니다.');
      }

    } catch (error) {
      console.error('검색 실패:', error);

      let errorMessage = '검색 중 오류가 발생했습니다.';

      if (error.message.includes('DataBufferLimitException') || error.message.includes('서버 에러')) {
        errorMessage = '검색 결과가 너무 많습니다. 더 구체적인 검색어를 입력해주세요.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.message.includes('액세스 토큰이 없습니다')) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        navigation.navigate('Login');
        return;
      }

      Alert.alert('검색 오류', errorMessage);
      
      if (isNewSearch) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 스크롤 끝 감지 핸들러
  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    
    // 스크롤이 하단 근처에 도달했는지 확인
    const isCloseToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    // 하단에 도달하고, 다음 페이지가 있으며, 로딩 중이 아니면 더보기 실행
    if (isCloseToBottom && hasNext && !loadingMore) {
      handleLoadMore();
    }
  };

  // 책 선택 핸들러
  const handleBookPress = (book) => {
    // ISBN이 있는 경우에만 상세 페이지로 이동
    if (book.isbn) {
      navigation.navigate('BookDetail', {
        isbn: book.isbn,
        // 기본 정보도 함께 전달
        bookData: book
      });
    } else {
      Alert.alert('알림', '이 도서의 상세 정보를 불러올 수 없습니다.');
    }
  };

  // 책 카드 렌더링
  const renderBook = (book, index) => (
    <TouchableOpacity
      key={book.isbn || `book-${index}`}
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
          onError={() => {
            console.log('이미지 로딩 실패:', book.coverImage);
          }}
        />
      ) : (
        <View style={styles.bookCoverPlaceholder} />
      )}
      <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.bookMeta} numberOfLines={1}>
        {book.authors} | {book.publisher}
      </Text>
    </TouchableOpacity>
  );

  // 검색 전 빈 상태 렌더링
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

  // 검색 결과 없음 렌더링
  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <Ionicons name="sad-outline" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>검색 결과가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>
        다른 검색어로 다시 시도해보세요
      </Text>
    </View>
  );

  // 드롭다운 모달 렌더링
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
          {/* 검색 타입 버튼 */}
          <TouchableOpacity
            style={styles.searchTypeButton}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down-outline" size={16} color="#666666" />
            <Text style={styles.searchTypeText}>{searchType}</Text>
          </TouchableOpacity>

          {/* 검색 입력 필드 */}
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

          {/* 검색 버튼 */}
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
        {/* 검색 결과 헤더 */}
        {hasSearched && !loading && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({searchResults.length}{hasNext ? '+' : ''})
            </Text>
          </View>
        )}

        {/* Content - 무한 스크롤 적용 */}
        <ScrollView 
          style={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400} // 스크롤 이벤트 최적화
        >
          {loading ? (
            // 초기 로딩 상태
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#90D1BE" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : !hasSearched ? (
            // 검색 전 빈 상태
            renderEmptyState()
          ) : searchResults.length === 0 ? (
            // 검색 결과 없음
            renderNoResults()
          ) : (
            <>
              {/* 검색 결과 그리드 */}
              <View style={styles.booksGrid}>
                {searchResults.map((book, index) => renderBook(book, index))}
              </View>
              
              {/* 로딩 더보기 인디케이터 */}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#90D1BE" />
                  <Text style={styles.loadingMoreText}>더 불러오는 중...</Text>
                </View>
              )}

              {/* 끝 표시 */}
              {!hasNext && searchResults.length > 0 && (
                <View style={styles.endIndicator}>
                  <Text style={styles.endText}>모든 검색 결과를 불러왔습니다</Text>
                </View>
              )}
            </>
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
    paddingBottom: 20,
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
  // 로딩 더보기 스타일
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  // 끝 표시 스타일
  endIndicator: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    color: '#999999',
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