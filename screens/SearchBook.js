import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const SearchBookScreen = ({ navigation }) => {
  const [searchType, setSearchType] = useState('통합검색');
  const [sortType, setSortType] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 검색 타입 옵션
  const searchTypes = [
    { value: '통합검색', label: '통합검색' },
    { value: '제목검색', label: '제목검색' },
    { value: '작가검색', label: '작가검색' }
  ];
  
  // 더미 데이터
  const bookData = [
    { id: 1, title: '운수 좋은 날', author: '현진건', publisher: '소담' },
    { id: 2, title: '운수 좋은 날', author: '현진건', publisher: '소담' },
    { id: 3, title: '운수 좋은 날', author: '현진건', publisher: '소담' },
    { id: 4, title: '운수 좋은 날', author: '현진건', publisher: '소담' },
    { id: 5, title: '운수 좋은 날', author: '현진건', publisher: '소담' },
  ];

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setDropdownVisible(false);
  };

  const handleSearch = () => {
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { 
      bookId: book.id,
      book: book 
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
      <View style={styles.bookCover} />
      <Text style={styles.bookTitle}>{book.title}</Text>
      <Text style={styles.bookMeta}>{book.author} | {book.publisher}</Text>
    </TouchableOpacity>
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
        onBackPress={() => {
          // 네비게이션 뒤로가기 로직
          navigation.goBack();
        }}
      />

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TouchableOpacity 
            style={styles.searchTypeButton}
            onPress={() => setDropdownVisible(true)}
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
            />
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>검색 결과 ({bookData.length})</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={18} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Books Grid */}
        <ScrollView style={styles.booksContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.booksGrid}>
            {bookData.map((book, index) => renderBook(book, index))}
          </View>
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
    paddingVertical: 6,
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
  filterButton: {
    padding: 4,
  },
  booksContainer: {
    flex: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 100,
  },
  bookCard: {
    width: '30%',
    marginRight: '5%', // 카드 간 간격 설정
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  bookCover: {
    width: '100%',
    height: 100,
    backgroundColor: '#D3D3D3',
    borderRadius: 6,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  bookMeta: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
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