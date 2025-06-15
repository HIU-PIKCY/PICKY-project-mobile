import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/BookCardStyle';

const BookCard = ({ book, index, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.bookCard,
        (index + 1) % 3 === 0 && { marginRight: 0 } 
      ]}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      <View style={styles.bookCover} />
      <Text 
        style={styles.bookTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {book.title}
      </Text>
      <Text 
        style={styles.bookAuthor}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {book.author}
      </Text>
      <View 
        style={[
          styles.statusBadge, 
          book.status === '완독' ? styles.completedBadge : styles.readingBadge
        ]}
      >
        <Text style={[
          styles.statusText,
          book.status === '완독' ? styles.completedText : styles.readingText
        ]}>
          {book.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookCard;