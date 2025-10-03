import React, { forwardRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { useAuth } from "../AuthContext";
import MintStar from "../assets/icons/MintStar.svg";

const screenHeight = Dimensions.get("window").height;

export const AIQuestionSheet = forwardRef((props, ref) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [isSubmittingGenerated, setIsSubmittingGenerated] = useState(false);

  // AuthContext에서 authenticatedFetch 가져오기
  const { authenticatedFetch } = useAuth();
  const API_BASE_URL = 'http://13.124.86.254';

  // 태그와 백엔드 QuestionType 매핑
  const tagMapping = {
    "주제": "SUBJECT",
    "인물": "CHARACTER",
    "서사": "STORY",
    "지식": "KNOWLEDGE"
  };

  const tags = [
    "주제",
    "인물",
    "서사",
    "지식",
  ];

  const resetAIForm = () => {
    setSelectedTag(null);
    setPage("");
    setGeneratedQuestion(null);
    setIsGenerating(false);
    setIsSubmittingGenerated(false);
  };

  const renderTag = (label) => {
    const isSelected = selectedTag === label;
    return (
      <TouchableOpacity
        key={label}
        style={[styles.tag, isSelected && styles.selectedTag]}
        onPress={() => setSelectedTag(label)}
        disabled={isGenerating || generatedQuestion}
      >
        <Text style={isSelected ? styles.selectedTagText : styles.tagText}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleAISubmit = async () => {
    if (!selectedTag) {
      Alert.alert("알림", "질문 주제를 선택해주세요.");
      return;
    }

    if (!props.bookId) {
      Alert.alert("오류", "도서 정보가 없습니다.");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('AI 질문 생성 요청:', `${API_BASE_URL}/api/ai/generate-question`);
      
      const questionType = tagMapping[selectedTag];
      
      const response = await authenticatedFetch(`${API_BASE_URL}/api/ai/generate-question`, {
        method: 'POST',
        body: JSON.stringify({
          bookId: props.bookId,
          questionType: questionType
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI 질문 생성 에러:', errorText);
        throw new Error(`AI 질문 생성 실패! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI 질문 생성 응답:', data);
      
      // 페이지 번호 처리
      let pageNumber = null;
      if (page && page.trim()) {
        const parsed = parseInt(page.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) {
          pageNumber = parsed;
        }
      }
      
      // 백엔드가 QuestionPostResponseDTO를 반환
      // { id, title, content, page, isAI, createdAt }
      if (data && data.title && data.content) {
        setGeneratedQuestion({
          id: data.id,
          title: data.title,
          content: data.content,
          page: pageNumber,
          category: selectedTag,
          isAI: data.isAI
        });
      } else {
        throw new Error('AI 질문 생성 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('AI 질문 생성 실패:', error);
      Alert.alert('오류', 'AI 질문 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratedQuestionSubmit = async () => {
    if (!generatedQuestion || !props.bookId) return;

    setIsSubmittingGenerated(true);
    
    try {
      console.log('AI 생성 질문 등록:', `${API_BASE_URL}/api/books/${props.bookId}/questions`);

      // AI가 이미 질문을 생성했으므로 해당 질문을 그대로 사용
      // 백엔드에서 이미 저장되어 id가 있으므로, 별도 등록이 필요없을 수 있음
      // 하지만 사용자가 페이지를 추가했다면 업데이트 필요
      
      // 부모 컴포넌트에 성공 알림
      if (props.onSubmit) {
        props.onSubmit();
      }

      resetAIForm();
      ref.current?.close();
      Alert.alert('완료', 'AI 질문이 등록되었습니다.');
      
    } catch (error) {
      console.error('AI 질문 등록 실패:', error);
      Alert.alert('오류', 'AI 질문 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingGenerated(false);
    }
  };

  const handleCancel = () => {
    resetAIForm();
  };

  // 모달이 닫힐 때 폼 리셋
  const handleModalClose = () => {
    resetAIForm();
  };

  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={styles.handleExpanded}
      modalStyle={styles.modal}
      withHandle
      panGestureEnabled={true}
      onPositionChange={(pos) => setIsExpanded(pos === "top")}
      onClose={handleModalClose}
      scrollViewProps={{
        keyboardShouldPersistTaps: "handled",
        showsVerticalScrollIndicator: false,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            minHeight: screenHeight * 0.9,
            paddingBottom: 100,
          }}
        >
          <View style={styles.handleSpacer12} />
          <View style={styles.handle} />
          <View style={styles.headerSpacer12} />
          <View style={styles.sheetHeaderExpanded}>
            <Text style={styles.sheetTitle}>AI 질문 생성</Text>
          </View>

          <View style={styles.dividerMoreSpace} />

          {!generatedQuestion && !isGenerating && (
            <>
              <View style={styles.tagSectionWrapper}>
                <View style={styles.tagRowSpaced}>
                  {renderTag(tags[0])}
                  {renderTag(tags[1])}
                </View>
                <View style={styles.tagRowSpaced}>
                  {renderTag(tags[2])}
                  {renderTag(tags[3])}
                </View>
              </View>

              <View style={styles.dividerMoreSpaceLoweredExact} />

              <View style={styles.bottomRowLiftedFinalAdjustedExact}>
                <View style={styles.pageInputGroup}>
                  <Text style={styles.pageLabel}>페이지</Text>
                  <TextInput
                    style={[
                      styles.pageInputBox,
                      styles.pageInputText,
                      { paddingVertical: 2, textAlign: "center" },
                    ]}
                    keyboardType="numeric"
                    value={page}
                    onChangeText={setPage}
                    editable={isExpanded}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.aiSubmitButton]}
                  onPress={handleAISubmit}
                  disabled={!selectedTag}
                >
                  <MintStar />
                  <Text style={styles.aiSubmitButtonText}>AI 질문 생성</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#90D1BE" />
              <Text style={styles.loadingText}>AI가 질문을 생성하고 있습니다...</Text>
            </View>
          )}

          {generatedQuestion && !isGenerating && (
            <>
              <View style={styles.questionPreviewWrapper}>
                <View style={styles.questionPreview}>
                  <View style={styles.questionTitleRow}>
                    <Text style={styles.previewLabel}>제목</Text>
                    <Text style={[styles.previewTitle, { flex: 1 }]}>
                      {generatedQuestion.title}
                    </Text>
                  </View>
                  <Text style={styles.previewBody}>
                    {generatedQuestion.content}
                  </Text>
                </View>
              </View>

              <View style={styles.dividerMoreSpaceLoweredExact} />

              <View style={styles.bottomRowLiftedFinalAdjustedExact}>
                <View style={styles.pageInputGroup}>
                  <Text style={styles.pageLabel}>페이지</Text>
                  <View style={[styles.pageInputBox, { justifyContent: 'center' }]}>
                    <Text style={styles.pageInputText}>
                      {generatedQuestion.page || "-"}
                    </Text>
                  </View>
                </View>
                <View style={styles.generatedButtonsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={isSubmittingGenerated}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmittingGenerated && styles.submitButtonDisabled
                    ]}
                    onPress={handleGeneratedQuestionSubmit}
                    disabled={isSubmittingGenerated}
                  >
                    {isSubmittingGenerated ? (
                      <ActivityIndicator size="small" color="#4B4B4B" />
                    ) : (
                      <Text style={styles.submitButtonText}>질문 등록</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={styles.bottomSpacer12} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modalize>
  );
});

export const QuestionWriteSheet = forwardRef(({ onSubmit, bookId }, ref) => {
  const [page, setPage] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AuthContext에서 authenticatedFetch 가져오기
  const { authenticatedFetch } = useAuth();
  const API_BASE_URL = 'http://13.124.86.254';

  const resetForm = () => {
    setPage("");
    setTitle("");
    setBody("");
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    if (!body.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    if (!bookId) {
      Alert.alert("오류", "도서 정보가 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('질문 등록 요청:', `${API_BASE_URL}/api/books/${bookId}/questions`);

      // 페이지 번호 처리: 비어있거나 유효하지 않으면 0 전송
      let pageNumber = 0;
      if (page && page.trim()) {
        const parsed = parseInt(page.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) {
          pageNumber = parsed;
        }
      }

      // 요청 body 생성
      const requestBody = {
        title: title.trim(),
        content: body.trim(),
        page: pageNumber
      };

      console.log('요청 body:', requestBody);

      const response = await authenticatedFetch(`${API_BASE_URL}/api/books/${bookId}/questions`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('질문 등록 에러:', errorText);
        throw new Error(`질문 등록 실패! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('질문 등록 응답:', data);
      
      // ApiResponse 구조: { isSuccess, code, message, result }
      if (data.isSuccess) {
        // 부모 컴포넌트에 성공 알림
        if (onSubmit) {
          onSubmit();
        }

        // 폼 리셋
        resetForm();
        Keyboard.dismiss();
        ref.current?.close();
        Alert.alert('완료', '질문이 등록되었습니다.');
      } else {
        throw new Error(data.message || '질문 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('질문 등록 실패:', error);
      Alert.alert('오류', '질문 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달이 닫힐 때 폼 리셋
  const handleModalClose = () => {
    resetForm();
  };

  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={styles.handleExpanded}
      modalStyle={styles.modal}
      withHandle
      onPositionChange={(pos) => setIsExpanded(pos === "top")}
      onClose={handleModalClose}
      scrollViewProps={{
        keyboardShouldPersistTaps: "handled",
        showsVerticalScrollIndicator: false,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            minHeight: screenHeight * 0.9,
            paddingBottom: 100,
          }}
        >
          <View style={styles.handleSpacer12} />
          <View style={styles.handle} />
          <View style={styles.headerSpacer12} />
          <View style={styles.sheetHeaderExpanded}>
            <Text style={styles.sheetTitle}>질문 작성</Text>
          </View>

          <View style={styles.dividerMoreSpace} />

          <View style={styles.questionPreviewWrapper}>
            <View style={styles.questionPreview}>
              <View style={styles.questionTitleRow}>
                <Text style={styles.previewLabel}>제목</Text>
                <TextInput
                  style={[styles.previewTitle, { flex: 1, padding: 4 }]}
                  value={title}
                  onChangeText={setTitle}
                  editable={isExpanded && !isSubmitting}
                  placeholder="질문 제목을 입력하세요"
                  placeholderTextColor="#CCCCCC"
                />
              </View>
              <TextInput
                style={[
                  styles.previewBody,
                  { textAlignVertical: "top", height: 50 },
                ]}
                value={body}
                onChangeText={setBody}
                multiline
                editable={isExpanded && !isSubmitting}
                placeholder="질문 내용을 입력하세요"
                placeholderTextColor="#CCCCCC"
              />
            </View>
          </View>

          <View style={styles.dividerMoreSpaceLoweredExact} />

          <View style={styles.bottomRowLiftedFinalAdjustedExact}>
            <View style={styles.pageInputGroup}>
              <Text style={styles.pageLabel}>페이지</Text>
              <TextInput
                style={[
                  styles.pageInputBox,
                  styles.pageInputText,
                  { paddingVertical: 2, textAlign: "center" },
                ]}
                keyboardType="numeric"
                value={page}
                onChangeText={setPage}
                editable={isExpanded && !isSubmitting}
                placeholderTextColor="#CCCCCC"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.submitButton,
                ((!title.trim() || !body.trim()) || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={(!title.trim() || !body.trim()) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#4B4B4B" />
              ) : (
                <Text
                  style={[
                    styles.submitButtonText,
                    (!title.trim() || !body.trim()) &&
                      styles.submitButtonTextDisabled,
                  ]}
                >
                  질문 등록
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacer12} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  handle: {
    backgroundColor: "#B0B0B0",
    height: 2,
    width: 42,
    alignSelf: "center",
    borderRadius: 1,
  },
  handleExpanded: {
    backgroundColor: "transparent",
    height: 0,
  },
  handleSpacer12: { height: 12 },
  headerSpacer12: { height: 12 },
  sheetHeaderExpanded: {
    paddingBottom: 12,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    color: "#4B4B4B",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#DBDBDB",
  },
  dividerMoreSpace: {
    height: 0.5,
    backgroundColor: "#DBDBDB",
    marginTop: 4,
    marginBottom: 4,
  },
  dividerMoreSpaceLoweredExact: {
    height: 0.5,
    backgroundColor: "#DBDBDB",
    marginTop: 8,
    marginBottom: 15,
  },
  tagSectionWrapper: {
    paddingTop: 17,
    paddingBottom: 17,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 0,
    gap: 12,
  },
  tagRowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 16,
    gap: 16,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#90D1BE",
    borderRadius: 4,
    width: "48%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTag: {
    backgroundColor: "#90D1BE",
  },
  tagText: {
    color: "#4B4B4B",
    fontSize: 14,
  },
  selectedTagText: {
    color: "#fff",
    fontSize: 14,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'SUIT-Medium',
  },
  bottomRowLiftedFinalAdjustedExact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 12,
  },
  pageInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 6,
  },
  pageInputBox: {
    borderWidth: 0.5,
    borderColor: "#DFDFDF",
    borderRadius: 3,
    width: 42,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pageInputText: {
    fontSize: 14,
    color: "#4B4B4B",
  },
  aiSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#DFDFDF",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  aiSubmitButtonText: {
    color: "#4B4B4B",
    marginLeft: 5,
    fontSize: 14,
  },
  generatedButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    borderWidth: 0.5,
    borderColor: "#DFDFDF",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#999999",
  },
  questionPreviewWrapper: {
    paddingTop: 17,
    paddingBottom: 17,
  },
  questionPreview: {
    paddingHorizontal: 18,
    gap: 17,
  },
  questionTitleRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    color: "#0D2525",
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: "SUIT-SemiBold",
    color: "#666666",
  },
  previewBody: {
    fontSize: 13.5,
    fontFamily: "SUIT-Medium",
    color: "#666",
    lineHeight: 17.5,
    letterSpacing: -0.25,
  },
  submitButton: {
    borderWidth: 0.5,
    borderColor: "#DFDFDF",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
  },
  submitButtonText: {
    fontSize: 14,
    color: "#4B4B4B",
  },
  submitButtonTextDisabled: {
    color: "#CCCCCC",
  },
  bottomSpacer15: {
    height: 15,
  },
  bottomSpacer12: {
    height: 12,
  },
});