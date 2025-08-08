import React, { forwardRef, useState } from "react";
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
import MintStar from "../assets/icons/MintStar.svg";

const screenHeight = Dimensions.get("window").height;

export const AIQuestionSheet = forwardRef((props, ref) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [isSubmittingGenerated, setIsSubmittingGenerated] = useState(false);

  const tags = [
    "작품의 주제와 의미",
    "인물의 성격과 발전",
    "이야기 구조와 기법",
    "작품 배경과 시대적 맥락",
  ];

  // 더미 AI 생성 질문들
  const dummyQuestions = {
    "작품의 주제와 의미": {
      title: "작가가 전달하고자 한 메시지는?",
      content: "이 작품을 통해 작가가 독자에게 전달하고자 한 핵심 메시지나 주제는 무엇인지 생각해보세요. 작품 속 인물들의 행동과 갈등을 통해 어떤 삶의 교훈이나 사회적 문제를 제시하고 있나요?"
    },
    "인물의 성격과 발전": {
      title: "주인공의 성격 변화 과정은?",
      content: "작품을 통해 주인공이 어떻게 변화하고 성장하는지 분석해보세요. 어떤 사건들이 주인공의 내면 변화에 영향을 미쳤으며, 이러한 변화가 작품의 주제와 어떻게 연결되나요?"
    },
    "이야기 구조와 기법": {
      title: "작가의 서술 기법이 미치는 효과는?",
      content: "작가가 사용한 특별한 서술 기법이나 문체적 특징을 찾아보세요. 이러한 기법들이 독자에게 어떤 느낌을 주며, 작품의 분위기나 주제 전달에 어떤 역할을 하나요?"
    },
    "작품 배경과 시대적 맥락": {
      title: "시대적 배경이 작품에 미친 영향은?",
      content: "작품이 쓰여진 시대적 배경과 사회적 상황이 작품 내용에 어떻게 반영되었는지 살펴보세요. 당시의 사회 문제나 가치관이 작품 속 인물들의 삶에 어떤 영향을 미쳤나요?"
    }
  };

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

    setIsGenerating(true);
    
    try {
      // 실제 구현 시 API 호출
      // const response = await apiService.generateAIQuestion({
      //   bookId: props.bookId,
      //   category: selectedTag,
      //   page: page ? parseInt(page) : null
      // });
      // setGeneratedQuestion(response.data);

      // 더미 AI 질문 생성 시뮬레이션
      setTimeout(() => {
        const dummyQuestion = dummyQuestions[selectedTag];
        setGeneratedQuestion({
          title: dummyQuestion.title,
          content: dummyQuestion.content,
          page: page ? parseInt(page) : null,
          category: selectedTag
        });
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('AI 질문 생성 실패:', error);
      setIsGenerating(false);
      Alert.alert('오류', 'AI 질문 생성 중 오류가 발생했습니다.');
    }
  };

  const handleGeneratedQuestionSubmit = async () => {
    if (!generatedQuestion) return;

    setIsSubmittingGenerated(true);
    
    try {
      // 실제 구현 시 API 호출
      // await apiService.createQuestion(props.bookId, {
      //   title: generatedQuestion.title,
      //   content: generatedQuestion.content,
      //   page: generatedQuestion.page,
      //   isAI: true
      // });

      // 부모 컴포넌트에 데이터 전달
      if (props.onSubmit) {
        props.onSubmit({
          title: generatedQuestion.title,
          body: generatedQuestion.content,
          page: generatedQuestion.page?.toString() || "",
          isAI: true
        });
      }

      resetAIForm();
      ref.current?.close();
      setIsSubmittingGenerated(false);
      Alert.alert('완료', 'AI 질문이 등록되었습니다.');
    } catch (error) {
      console.error('AI 질문 등록 실패:', error);
      setIsSubmittingGenerated(false);
      Alert.alert('오류', 'AI 질문 등록 중 오류가 발생했습니다.');
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

export const QuestionWriteSheet = forwardRef(({ onSubmit }, ref) => {
  const [page, setPage] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      // 질문 데이터 생성
      const questionData = {
        title: title.trim(),
        body: body.trim(),
        page: page.trim(),
        isAI: false
      };

      // 부모 컴포넌트에 데이터 전달
      if (onSubmit) {
        onSubmit(questionData);
      }

      // 폼 리셋
      resetForm();
      Keyboard.dismiss();
      ref.current?.close();
      Alert.alert('완료', '질문이 등록되었습니다.');
    } catch (error) {
      console.error('질문 등록 실패:', error);
      setIsSubmitting(false);
      Alert.alert('오류', '질문 등록 중 오류가 발생했습니다.');
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
    fontSize: 12,
    fontFamily: "SUIT-Medium",
    color: "#666",
    lineHeight: 16,
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