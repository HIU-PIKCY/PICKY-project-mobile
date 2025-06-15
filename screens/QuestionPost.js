// QuestionPost.js
import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, TextInput, Keyboard } from 'react-native';
import { Modalize } from 'react-native-modalize';
import MintStar from '../assets/icons/MintStar.svg';

const screenHeight = Dimensions.get('window').height;

export const AIQuestionSheet = forwardRef((props, ref) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [page, setPage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const tags = [
    '작품의 주제와 의미',
    '인물의 성격과 발전',
    '이야기 구조와 기법',
    '작품 배경과 시대적 맥락',
  ];

  const renderTag = (label) => {
    const isSelected = selectedTag === label;
    return (
      <TouchableOpacity
        key={label}
        style={[styles.tag, isSelected && styles.selectedTag]}
        onPress={() => setSelectedTag(label)}
      >
        <Text style={isSelected ? styles.selectedTagText : styles.tagText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const handleAISubmit = () => {
    setIsSubmitted(true);
    Keyboard.dismiss();
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
      onPositionChange={(pos) => setIsExpanded(pos === 'top')}
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ minHeight: screenHeight * 0.9, paddingBottom: 100 }}>
          <View style={styles.handleSpacer12} />
          <View style={styles.handle} />
          <View style={styles.headerSpacer12} />
          <View style={styles.sheetHeaderExpanded}><Text style={styles.sheetTitle}>AI 질문 생성</Text></View>

          <View style={styles.dividerMoreSpace} />

          <View style={styles.tagSectionWrapper}> 
            <View style={styles.tagRowSpaced}>{renderTag(tags[0])}{renderTag(tags[1])}</View>
            <View style={styles.tagRowSpaced}>{renderTag(tags[2])}{renderTag(tags[3])}</View>
          </View>

          <View style={styles.dividerMoreSpaceLoweredExact} />

          <View style={styles.bottomRowLiftedFinalAdjustedExact}>
            <View style={styles.pageInputGroup}>
              <Text style={styles.pageLabel}>페이지</Text>
              <TextInput
                style={[styles.pageInputBox, styles.pageInputText, { paddingVertical: 2, textAlign: 'center' }]}
                keyboardType="numeric"
                value={page}
                onChangeText={setPage}
                editable={isExpanded}
              />
            </View>
            <TouchableOpacity style={[styles.aiSubmitButton]} onPress={handleAISubmit}>
              <MintStar />
              <Text style={styles.aiSubmitButtonText}>AI 질문 생성</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacer12} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modalize>
  );
});

export const QuestionWriteSheet = forwardRef((props, ref) => {
  const [page, setPage] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    Keyboard.dismiss();
  };

  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={styles.handleExpanded}
      modalStyle={styles.modal}
      withHandle
      onPositionChange={(pos) => setIsExpanded(pos === 'top')}
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled', showsVerticalScrollIndicator: false }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ minHeight: screenHeight * 0.9, paddingBottom: 100 }}>
          <View style={styles.handleSpacer12} />
          <View style={styles.handle} />
          <View style={styles.headerSpacer12} />
          <View style={styles.sheetHeaderExpanded}><Text style={styles.sheetTitle}>질문 작성</Text></View>

          <View style={styles.dividerMoreSpace} />

          <View style={styles.questionPreviewWrapper}>
            <View style={styles.questionPreview}>
              <View style={styles.questionTitleRow}>
                <Text style={styles.previewLabel}>제목</Text>
                <TextInput
                  style={[styles.previewTitle, { flex: 1, padding: 4 }]}
                  value={title}
                  onChangeText={setTitle}
                  editable={isExpanded}
                />
              </View>
              <TextInput
                style={[styles.previewBody, { padding: 8, textAlignVertical: 'top', height: 50 }]}
                value={body}
                onChangeText={setBody}
                multiline
                editable={isExpanded}
              />
            </View>
          </View>

          <View style={styles.dividerMoreSpaceLoweredExact} />

          <View style={styles.bottomRowLiftedFinalAdjustedExact}>
            <View style={styles.pageInputGroup}>
              <Text style={styles.pageLabel}>페이지</Text>
              <TextInput
                style={[styles.pageInputBox, styles.pageInputText, { paddingVertical: 2, textAlign: 'center' }]}
                keyboardType="numeric"
                value={page}
                onChangeText={setPage}
                editable={isExpanded}
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>질문 등록</Text>
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  handle: {
    backgroundColor: '#B0B0B0',
    height: 2,
    width: 42,
    alignSelf: 'center',
    borderRadius: 1,
  },
  handleExpanded: {
    backgroundColor: 'transparent',
    height: 0,
  },
  handleSpacer12: { height: 12 },
  headerSpacer12: { height: 12 },
  sheetHeaderExpanded: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: 'SUIT-SemiBold',
    color: '#4B4B4B',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#DBDBDB',
  },
  dividerMoreSpace: {
    height: 0.5,
    backgroundColor: '#DBDBDB',
    marginTop: 4,
    marginBottom: 4,
  },
  dividerMoreSpaceLoweredExact: {
    height: 0.5,
    backgroundColor: '#DBDBDB',
    marginTop: 8,
    marginBottom: 15,
  },
  tagSectionWrapper: {
    paddingTop: 17,
    paddingBottom: 17,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 0,
    gap: 12,
  },
  tagRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 16,
    gap: 16,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#90D1BE',
    borderRadius: 4,
    width: '48%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTag: {
    backgroundColor: '#90D1BE',
  },
  tagText: {
    color: '#4B4B4B',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
  },
  bottomRowLiftedFinalAdjustedExact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 12,
  },
  pageInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  pageInputBox: {
    borderWidth: 0.5,
    borderColor: '#DFDFDF',
    borderRadius: 3,
    width: 42,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageInputText: {
    fontSize: 14,
    color: '#4B4B4B',
  },
  aiSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DFDFDF',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  aiSubmitButtonText: {
    color: '#4B4B4B',
    marginLeft: 5,
    fontSize: 14,
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
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'SUIT-SemiBold',
    color: '#0D2525',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'SUIT-SemiBold',
    color: '#666666',
  },
  previewBody: {
    fontSize: 12,
    fontFamily: 'SUIT-Medium',
    color: '#666',
    lineHeight: 16,
    letterSpacing: -0.25,
  },
  submitButton: {
    borderWidth: 0.5,
    borderColor: '#DFDFDF',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#4B4B4B',
  },
  bottomSpacer15: {
    height: 15,
  },
  bottomSpacer12: {
    height: 12,
  },
});
