import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const SearchBookScreen = () => {
  const [searchType, setSearchType] = useState('통합검색');
  const [sortType, setSortType] = useState('');

  // 더미 데이터
  const bookData = [
    { id: 1, title: '운수 좋은 날', author: '현진건', genre: '소담' },
    { id: 2, title: '운수 좋은 날', author: '현진건', genre: '소담' },
    { id: 3, title: '운수 좋은 날', author: '현진건', genre: '소담' },
    { id: 4, title: '운수 좋은 날', author: '현진건', genre: '소담' },
    { id: 5, title: '운수 좋은 날', author: '현진건', genre: '소담' },
    { id: 6, title: '운수 좋은 날', author: '현진건', genre: '소담' },
  ];

  const renderBook = (book) => (
    <View key={book.id} style={styles.bookCard}>
      <View style={styles.bookCover} />
      <Text style={styles.bookTitle}>{book.title}</Text>
      <Text style={styles.bookMeta}>{book.author} | {book.genre}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomHeader 
        title="도서 검색"
        onBackPress={() => {
          // 네비게이션 뒤로가기 로직
          console.log('뒤로가기');
        }}
      />

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchTypeButton}>
            <Text style={styles.searchTypeText}>{searchType}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder=""
              placeholderTextColor="#999999"
            />
          </View>
          
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>검색 결과 (3)</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Books Grid */}
        <ScrollView style={styles.booksContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.booksGrid}>
            {bookData.map(renderBook)}
          </View>
        </ScrollView>
      </View>
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
    paddingVertical: 16,
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
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    minWidth: 80,
  },
  searchTypeText: {
    fontSize: 14,
    color: '#333333',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666666',
  },
  searchInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    fontSize: 14,
    color: '#333333',
    paddingVertical: 8,
  },
  searchButton: {
    padding: 8,
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
  filterIcon: {
    fontSize: 18,
    color: '#666666',
  },
  booksContainer: {
    flex: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  bookCard: {
    width: '31%',
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
});

export default SearchBookScreen;