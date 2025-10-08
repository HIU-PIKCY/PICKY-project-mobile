import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    position: 'absolute',
    right: 20,
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 3.5,
    width: 7,
    height: 7,
    backgroundColor: '#90D1BE',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  combinedCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: '#90D1BE',
    marginTop: 25,
    marginBottom: 30,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#666',
    letterSpacing: -0.4,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  highlightText: {
    color: '#0D2525',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    marginHorizontal: 20
  },
  statsText: {
    fontSize: 16,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#666',
    letterSpacing: -0.4,
    lineHeight: 20,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontFamily: 'SUIT-Medium',
    fontWeight: '500',
    color: '#4B4B4B',
    letterSpacing: -0.4,
  },
  roundedContainer: {
    backgroundColor: '#F3FCF9',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    marginHorizontal: -20,
  },
  section: {
    marginBottom: 30
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  sectionTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.45,
    color: '#0D2525',
    marginBottom: 25,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#90D1BE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 18,
    justifyContent: 'center',
  },
  bookImageContainer: {
    width: 93,
    height: 124,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bookImage: {
    width: '100%',
    height: '100%'
  },
  bookInfoUnderImage: {
    alignItems: 'center',
    width: 90
  },
  bookTitleUnderImage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
    lineHeight: 18,
  },
  bookAuthorUnderImage: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
  topicInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  topicTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: '#0D2525',
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 22,
  },
  aiSummaryTag: {
    backgroundColor: '#BDBDBD',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiSummaryText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500'
  },
  topicSummary: {
    fontFamily: 'SUIT-Medium',
    fontSize: 15,
    textAlign: 'justify',
    color: '#666',
    fontWeight: '400',
    letterSpacing: -0.35,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#90D1BE40',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400'
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  engagementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  keywordsContainer: {
    position: 'relative',
    height: 120,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  keywordBubble: {
    position: 'absolute',
    backgroundColor: 'transparent',
    left: '40%',
    top: '30%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  secondKeyword: {
    left: '80%',
    top: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  thirdKeyword: {
    left: '55%',
    top: '80%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  keywordText: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#48A7A7',
  },
  secondKeywordText: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 26,
    fontWeight: '700',
    color: '#3F8C8C',
  },
  mainKeywordText: {
    fontFamily: 'SUIT-SemiBold',
    color: '#0D2525',
    fontSize: 32,
    fontWeight: '700',
  },
  keywordStats: {
    fontFamily: 'SUIT-SemiBold',
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 14,
    color: '#666',
  },
  booksScroll: {
    paddingVertical: 8,
  },
  smallBookCard: {
    width: 120,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#90D1BE',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  smallBookImageContainer: {
    width: 90,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  smallBookImage: {
    width: '100%',
    height: '100%',
  },
  smallBookTitle: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
    lineHeight: 18,
  },
  smallBookAuthor: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    textAlign: 'left',
    width: '100%',
    marginBottom: 2,
  },
  questionCount: {
    fontSize: 11,
    color: '#90D1BE',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default styles;