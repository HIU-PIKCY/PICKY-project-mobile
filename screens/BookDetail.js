import { useRef, React } from "react";
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";
import MintStar from "../assets/icons/MintStar.svg";
import { AIQuestionSheet, QuestionWriteSheet } from "./QuestionPost";

const BookDetail = ({ navigation }) => {
  const aiSheetRef = useRef(null);
  const writeSheetRef = useRef(null);
  const screenHeight = Dimensions.get("window").height;

  const handleGoBack = () => navigation.goBack();
  const handleAIQuestion = () => aiSheetRef.current?.open();
  const handleQuestionRegister = () => writeSheetRef.current?.open();
  const handleDelete = () => console.log("내 서재에서 삭제");
  const goToQuestionDetail = () => navigation.navigate("QuestionDetail");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <CustomHeader title="도서 상세" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionSection}>
          <View style={styles.bookSection}>
            <View style={styles.cover} />
            <View style={styles.bookInfo}>
              <Text style={styles.title}>운수 좋은 날</Text>
              <Text style={styles.meta}>작가 현진건</Text>
              <Text style={styles.meta}>출판사 소담</Text>
              <Text style={styles.meta}>페이지 231</Text>
              <Text style={styles.meta}>
                상태 <Text style={styles.readStatus}>• 완독</Text>
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteText}>내 서재에서 삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.answersSectionHeader}>
          <Text style={styles.answersTitle}>독서 질문 리스트</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity>
              <Text
                style={[styles.sortButtonText, styles.sortButtonTextSelected]}
              >
                최신순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.sortButtonText}>추천순</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.answerContainer}
          onPress={goToQuestionDetail}
        >
          <View style={styles.authorIconContainer}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
          </View>
          <View style={styles.answerContentWrapper}>
            <Text style={styles.authorName}>AI 질문</Text>
            <Text style={styles.answerText}>작가의 의도는?</Text>
          </View>
          <View style={styles.answerMetaWrapper}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color="#666" />
              <Text style={styles.statText}>122</Text>
            </View>
            <Text style={styles.statText}>답변 1</Text>
            <Text style={styles.statText}>추천 5</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.answerContainer}>
          <View style={styles.authorIconContainer}>
            <View style={styles.userIcon} />
          </View>
          <View style={styles.answerContentWrapper}>
            <Text style={styles.authorName}>키티키티</Text>
            <Text style={styles.answerText}>이 책 너무 어렵네요..</Text>
          </View>
          <View style={styles.answerMetaWrapper}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color="#666" />
              <Text style={styles.statText}>27</Text>
            </View>
            <Text style={styles.statText}>답변 6</Text>
            <Text style={styles.statText}>추천 11</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.answerInputContainer}>
        <TouchableOpacity
          style={styles.aiAnswerButton}
          onPress={handleAIQuestion}
        >
          <MintStar />
          <Text style={styles.aiAnswerButtonText}>AI 질문 생성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleQuestionRegister}
        >
          <Text style={styles.submitButtonText}>질문 등록</Text>
        </TouchableOpacity>
      </View>

      <AIQuestionSheet ref={aiSheetRef} modalHeight={screenHeight} />
      <QuestionWriteSheet ref={writeSheetRef} modalHeight={screenHeight} />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  questionSection: { backgroundColor: "#fff", padding: 20 },
  bookSection: { flexDirection: "row", marginBottom: 20 },
  cover: {
    width: 115,
    height: 173,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    marginRight: 20,
  },
  bookInfo: { justifyContent: "flex-start", gap: 6 },
  title: {
    fontSize: 18,
    fontFamily: "SUIT-SemiBold",
    color: "#0D2525",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    fontFamily: "SUIT-Medium",
    color: "#666",
  },
  readStatus: { color: "#90D1BE" },
  deleteButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DA1717",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteText: {
    fontSize: 12,
    color: "#DA1717",
    fontFamily: "SUIT-Medium",
  },
  answersSectionHeader: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: "#E8E8E8",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  answersTitle: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    letterSpacing: -0.7,
    color: "#4B4B4B",
  },
  sortButtons: { flexDirection: "row" },
  sortButtonText: {
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    letterSpacing: -0.6,
    color: "#888",
    marginLeft: 12,
  },
  sortButtonTextSelected: { color: "#0D2525" },
  answerContainer: {
    backgroundColor: "#F3FCF9",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  authorIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingRight: 5,
  },
  aiIcon: {
    backgroundColor: "#333",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  aiIconText: {
    color: "#fff",
    fontSize: 10,
  },
  userIcon: {
    backgroundColor: "#f1f3f4",
    borderRadius: 15,
    width: 30,
    height: 30,
    marginRight: 8,
  },
  answerContentWrapper: { flex: 1, minWidth: 0 },
  authorName: {
    fontSize: 10,
    fontFamily: "SUIT-Medium",
    color: "#666",
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    letterSpacing: -0.4,
    color: "#666",
  },
  answerMetaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginLeft: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    color: "#666",
    marginLeft: 4,
  },
  answerInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  aiAnswerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  aiAnswerButtonText: {
    fontSize: 14,
    fontFamily: "SUIT-Regular",
    letterSpacing: -0.35,
    color: "#4B4B4B",
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E8E8E8",
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "SUIT-Regular",
    letterSpacing: -0.35,
    color: "#4B4B4B",
  },
});

export default BookDetail;
