import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bookCard: {
    width: '28%',
    marginRight: '8%',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  bookCover: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    marginBottom: 8,
  },
  bookTitle: {
    fontFamily: 'SUIT-Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
    width: '100%',
  },
  bookAuthor: {
    fontFamily: 'SUIT-Medium',
    fontSize: 10,
    color: '#888888',
    marginBottom: 6,
    width: '100%',
  },
  statusBadge: {
    width: '100%',
    paddingHorizontal: 30.5,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'center',
  },
  readingBadge: {
    borderWidth: 0.5,
    borderColor: '#0D2525',
  },
  completedBadge: {
    backgroundColor: '#0D2525',
  },
  statusText: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 10,
    textAlign: 'center',
  },
  readingText: {
    color: '#0D2525',
  },
  completedText: {
    color: '#FFFFFF',
  },
});