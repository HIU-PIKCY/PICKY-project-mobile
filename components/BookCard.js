import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import { styles } from '../styles/BookCardStyle';

const fallbackImage = require('../assets/default_cover.png'); // 기본 이미지

const BookCard = ({ book, index, onPress }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity 
      style={[
        styles.bookCard,
        (index + 1) % 3 === 0 && { marginRight: 0 } 
      ]}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      <View style={styles.coverWrapper}>
        {!imageLoaded && !imageError && (
          <ActivityIndicator 
            style={styles.spinner}
            size="small"
            color="#888"
          />
        )}
        <Image
          source={
            imageError || !book.coverImage 
              ? fallbackImage 
              : { uri: book.coverImage }
          }
          style={styles.bookCover}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </View>

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