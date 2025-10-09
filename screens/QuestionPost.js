import React, { forwardRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { useAuth } from "../AuthContext";
import MintStar from "../assets/icons/MintStar.svg";
import { Ionicons } from '@expo/vector-icons';
import { questionPostStyle } from '../styles/QuestionPostStyle';

const screenHeight = Dimensions.get("window").height;

// AI 로딩 애니메이션 컴포넌트
const AILoadingAnimation = () => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sparkles] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    // 펄스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 반짝이는 효과
    sparkles.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={questionPostStyle.aiLoadingContainer}>
      {/* 중앙 AI 아이콘 */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={questionPostStyle.aiIconCircle}>
          <Ionicons name="sparkles" size={32} color="#90D1BE" />
        </View>
      </Animated.View>

      {/* 주변 반짝이는 별들 */}
      <Animated.View 
        style={[
          questionPostStyle.sparkle, 
          questionPostStyle.sparkle1,
          { opacity: sparkles[0] }
        ]}
      >
        <Ionicons name="star" size={14} color="#90D1BE" />
      </Animated.View>
      <Animated.View 
        style={[
          questionPostStyle.sparkle, 
          questionPostStyle.sparkle2,
          { opacity: sparkles[1] }
        ]}
      >
        <Ionicons name="star" size={10} color="#78C8B0" />
      </Animated.View>
      <Animated.View 
        style={[
          questionPostStyle.sparkle, 
          questionPostStyle.sparkle3,
          { opacity: sparkles[2] }
        ]}
      >
        <Ionicons name="star" size={12} color="#A8DCC8" />
      </Animated.View>
    </View>
  );
};

export const AIQuestionSheet = forwardRef((props, ref) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [isSubmittingGenerated, setIsSubmittingGenerated] = useState(false);

  const { authenticatedFetch } = useAuth();
  const API_BASE_URL = 'http://13.124.86.254';

  const tagMapping = {
    "주제": "SUBJECT",
    "인물": "CHARACTER",
    "서사": "STORY",
    "지식": "KNOWLEDGE"
  };

  const tags = ["주제", "인물", "서사", "지식"];

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
        style={[questionPostStyle.tag, isSelected && questionPostStyle.selectedTag]}
        onPress={() => setSelectedTag(label)}
        disabled={isGenerating || generatedQuestion}
      >
        <Text style={isSelected ? questionPostStyle.selectedTagText : questionPostStyle.tagText}>
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
    const startTime = Date.now();
    
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
      let pageNumber = 0;
      if (page && page.trim()) {
        const parsed = parseInt(page.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) {
          pageNumber = parsed;
        }
      }
      
      // 최소 2초 로딩 보장
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // AI 응답을 받아서 generatedQuestion state에 저장
      if (data && data.title && data.content) {
        setGeneratedQuestion({
          title: data.title,
          content: data.content,
          page: pageNumber,
          category: selectedTag,
          isAI: true
        });
      } else {
        throw new Error('AI 질문 생성 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      // 에러가 발생해도 최소 2초는 유지
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
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

      // AI 생성된 질문을 실제로 등록
      const requestBody = {
        title: generatedQuestion.title,
        content: generatedQuestion.content,
        page: generatedQuestion.page,
        isAI: true
      };

      console.log('요청 body:', requestBody);

      const response = await authenticatedFetch(`${API_BASE_URL}/api/books/${props.bookId}/questions`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI 질문 등록 에러:', errorText);
        throw new Error(`AI 질문 등록 실패! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI 질문 등록 응답:', data);
      
      if (data.isSuccess) {
        if (props.onSubmit) {
          props.onSubmit();
        }

        resetAIForm();
        ref.current?.close();
        Alert.alert('완료', 'AI 질문이 등록되었습니다.');
      } else {
        throw new Error(data.message || 'AI 질문 등록에 실패했습니다.');
      }
      
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

  const handleModalClose = () => {
    resetAIForm();
  };

  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={questionPostStyle.handleExpanded}
      modalStyle={questionPostStyle.modal}
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
          <View style={questionPostStyle.handleSpacer12} />
          <View style={questionPostStyle.handle} />
          <View style={questionPostStyle.headerSpacer12} />
          <View style={questionPostStyle.sheetHeaderExpanded}>
            <Text style={questionPostStyle.sheetTitle}>AI 질문 생성</Text>
          </View>

          <View style={questionPostStyle.dividerMoreSpace} />

          {!generatedQuestion && !isGenerating && (
            <>
              <View style={questionPostStyle.tagSectionWrapper}>
                <View style={questionPostStyle.tagRowSpaced}>
                  {renderTag(tags[0])}
                  {renderTag(tags[1])}
                </View>
                <View style={questionPostStyle.tagRowSpaced}>
                  {renderTag(tags[2])}
                  {renderTag(tags[3])}
                </View>
              </View>

              <View style={questionPostStyle.dividerMoreSpaceLoweredExact} />

              <View style={questionPostStyle.bottomRowLiftedFinalAdjustedExact}>
                <View style={questionPostStyle.pageInputGroup}>
                  <Text style={questionPostStyle.pageLabel}>페이지</Text>
                  <TextInput
                    style={[
                      questionPostStyle.pageInputBox,
                      questionPostStyle.pageInputText,
                      { paddingVertical: 2, textAlign: "center" },
                    ]}
                    keyboardType="numeric"
                    value={page}
                    onChangeText={setPage}
                    editable={isExpanded}
                  />
                </View>
                <TouchableOpacity
                  style={[questionPostStyle.aiSubmitButton]}
                  onPress={handleAISubmit}
                  disabled={!selectedTag}
                >
                  <MintStar />
                  <Text style={questionPostStyle.aiSubmitButtonText}>AI 질문 생성</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {isGenerating && (
            <View style={questionPostStyle.loadingContainer}>
              <AILoadingAnimation />
              <Text style={questionPostStyle.loadingText}>AI가 질문을 생성하는 중이에요···</Text>
            </View>
          )}

          {generatedQuestion && !isGenerating && (
            <>
              <View style={questionPostStyle.questionPreviewWrapper}>
                <View style={questionPostStyle.questionPreview}>
                  <View style={questionPostStyle.questionTitleRow}>
                    <Text style={questionPostStyle.previewLabel}>제목</Text>
                    <Text style={[questionPostStyle.previewTitle, { flex: 1 }]}>
                      {generatedQuestion.title}
                    </Text>
                  </View>
                  <Text style={questionPostStyle.previewBody}>
                    {generatedQuestion.content}
                  </Text>
                </View>
              </View>

              <View style={questionPostStyle.dividerMoreSpaceLoweredExact} />

              <View style={questionPostStyle.bottomRowLiftedFinalAdjustedExact}>
                <View style={questionPostStyle.pageInputGroup}>
                  <Text style={questionPostStyle.pageLabel}>페이지</Text>
                  <View style={[questionPostStyle.pageInputBox, { justifyContent: 'center' }]}>
                    <Text style={questionPostStyle.pageInputText}>
                      {generatedQuestion.page || "-"}
                    </Text>
                  </View>
                </View>
                <View style={questionPostStyle.generatedButtonsContainer}>
                  <TouchableOpacity
                    style={questionPostStyle.cancelButton}
                    onPress={handleCancel}
                    disabled={isSubmittingGenerated}
                  >
                    <Text style={questionPostStyle.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      questionPostStyle.submitButton,
                      isSubmittingGenerated && questionPostStyle.submitButtonDisabled
                    ]}
                    onPress={handleGeneratedQuestionSubmit}
                    disabled={isSubmittingGenerated}
                  >
                    {isSubmittingGenerated ? (
                      <ActivityIndicator size="small" color="#4B4B4B" />
                    ) : (
                      <Text style={questionPostStyle.submitButtonText}>질문 등록</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={questionPostStyle.bottomSpacer12} />
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

  const { authenticatedFetch } = useAuth();
  const API_BASE_URL = 'http://13.124.86.254';

  const resetForm = () => {
    setPage("");
    setTitle("");
    setBody("");
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
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

      let pageNumber = 0;
      if (page && page.trim()) {
        const parsed = parseInt(page.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) {
          pageNumber = parsed;
        }
      }

      const requestBody = {
        title: title.trim(),
        content: body.trim(),
        page: pageNumber,
        isAI: false
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
      
      if (data.isSuccess) {
        if (onSubmit) {
          onSubmit();
        }

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

  const handleModalClose = () => {
    resetForm();
  };

  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={questionPostStyle.handleExpanded}
      modalStyle={questionPostStyle.modal}
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
          <View style={questionPostStyle.handleSpacer12} />
          <View style={questionPostStyle.handle} />
          <View style={questionPostStyle.headerSpacer12} />
          <View style={questionPostStyle.sheetHeaderExpanded}>
            <Text style={questionPostStyle.sheetTitle}>질문 작성</Text>
          </View>

          <View style={questionPostStyle.dividerMoreSpace} />

          <View style={questionPostStyle.questionPreviewWrapper}>
            <View style={questionPostStyle.questionPreview}>
              <View style={questionPostStyle.questionTitleRow}>
                <Text style={questionPostStyle.previewLabel}>제목</Text>
                <TextInput
                  style={[questionPostStyle.previewTitle, { flex: 1, padding: 4 }]}
                  value={title}
                  onChangeText={setTitle}
                  editable={isExpanded && !isSubmitting}
                  placeholder="질문 제목을 입력하세요"
                  placeholderTextColor="#CCCCCC"
                />
              </View>
              <TextInput
                style={[
                  questionPostStyle.previewBody,
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

          <View style={questionPostStyle.dividerMoreSpaceLoweredExact} />

          <View style={questionPostStyle.bottomRowLiftedFinalAdjustedExact}>
            <View style={questionPostStyle.pageInputGroup}>
              <Text style={questionPostStyle.pageLabel}>페이지</Text>
              <TextInput
                style={[
                  questionPostStyle.pageInputBox,
                  questionPostStyle.pageInputText,
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
                questionPostStyle.submitButton,
                ((!title.trim() || !body.trim()) || isSubmitting) && questionPostStyle.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={(!title.trim() || !body.trim()) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#4B4B4B" />
              ) : (
                <Text
                  style={[
                    questionPostStyle.submitButtonText,
                    (!title.trim() || !body.trim()) &&
                      questionPostStyle.submitButtonTextDisabled,
                  ]}
                >
                  질문 등록
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={questionPostStyle.bottomSpacer12} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modalize>
  );
});