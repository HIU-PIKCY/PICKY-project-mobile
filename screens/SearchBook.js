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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../AuthContext'; // AuthContext 추가

const SearchBookScreen = ({ navigation }) => {
  const [searchType, setSearchType] = useState('통합검색');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchTypeParam = getSearchTypeParam(searchType);

      // URL 파라미터로 변경
      const params = new URLSearchParams({
        keyword: searchQuery.trim(),
        type: searchTypeParam,
        page: '1',
        size: '20'
      });

      const url = `${API_BASE_URL}/api/books/search?${params.toString()}`;
      console.log('요청 URL:', url);

      // authenticatedFetch 사용으로 변경
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('에러 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (data.isSuccess) {
        setSearchResults(data.result?.items || []);
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
        // 로그인 화면으로 이동하거나 로그아웃 처리할 수 있음
        navigation.navigate('Login');
        return;
      }

      Alert.alert('검색 오류', errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

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