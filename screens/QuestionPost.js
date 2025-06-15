// QuestionPost.js
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import MintStar from '../assets/icons/MintStar.svg';

const screenHeight = Dimensions.get('window').height;

export const AIQuestionSheet = forwardRef((props, ref) => {
  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9} // 수정됨
      handleStyle={styles.handleExpanded}
      modalStyle={styles.modal}
      withHandle
      panGestureEnabled={false}
    >
      <View style={styles.handleSpacer12} />
      <View style={styles.handle} />
      <View style={styles.headerSpacer12} />
      <View style={styles.sheetHeaderExpanded}><Text style={styles.sheetTitle}>AI 질문 생성</Text></View>

      <View style={styles.dividerMoreSpace} />

      <View style={styles.tagSectionWrapper}> 
        <View style={styles.tagRowSpaced}><TouchableOpacity style={styles.tag}><Text style={styles.tagText}>작품의 주제와 의미</Text></TouchableOpacity><TouchableOpacity style={[styles.tag, styles.selectedTag]}><Text style={styles.selectedTagText}>인물의 성격과 발전</Text></TouchableOpacity></View>
        <View style={styles.tagRowSpaced}><TouchableOpacity style={styles.tag}><Text style={styles.tagText}>이야기 구조와 기법</Text></TouchableOpacity><TouchableOpacity style={styles.tag}><Text style={styles.tagText}>작품 배경과 시대적 맥락</Text></TouchableOpacity></View>
      </View>

      <View style={styles.dividerMoreSpaceLoweredExact} />

      <View style={styles.bottomRowLiftedFinalAdjustedExact}>
        <View style={styles.pageInputGroup}>
          <Text style={styles.pageLabel}>페이지</Text>
          <View style={styles.pageInputBox}><Text style={styles.pageInputText}>231</Text></View>
        </View>
        <TouchableOpacity style={styles.aiSubmitButton}>
          <MintStar />
          <Text style={styles.aiSubmitButtonText}>AI 질문 생성</Text></TouchableOpacity>
      </View>
      <View style={styles.bottomSpacer12} />
    </Modalize>
  );
});

export const QuestionWriteSheet = forwardRef((props, ref) => {
  return (
    <Modalize
      ref={ref}
      snapPoint={screenHeight * 0.33}
      modalHeight={screenHeight * 0.9}
      handleStyle={styles.handleExpanded}
      modalStyle={styles.modal}
      withHandle
    >
      <View style={styles.handleSpacer12} />
      <View style={styles.handle} />
      <View style={styles.headerSpacer12} />
      <View style={styles.sheetHeaderExpanded}><Text style={styles.sheetTitle}>질문 작성</Text></View>

      <View style={styles.dividerMoreSpace} />

      <View style={styles.questionPreviewWrapper}>
        <View style={styles.questionPreview}>
          <View style={styles.questionTitleRow}>
            <Text style={styles.previewLabel}>제목</Text>
            <Text style={styles.previewTitle}>작가의 의도는?</Text>
          </View>
          <Text style={styles.previewBody}>
            이 책에서 보면.. 주인공은 이렇게 생각하잖아요..
            근데 저는 이렇게 생각하거든요..
            그러다가.. 작가는 어떤 의도로 이렇게 글을 쓴걸까..
            하고 의문이 들어서 글을 써봅니다..
          </Text>
        </View>
      </View>

      <View style={styles.dividerMoreSpaceLoweredExact} />

      <View style={styles.bottomRowLiftedFinalAdjustedExact}>
        <View style={styles.pageInputGroup}>
          <Text style={styles.pageLabel}>페이지</Text>
          <View style={styles.pageInputBox}><Text style={styles.pageInputText}>231</Text></View>
        </View>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>질문 등록</Text></TouchableOpacity>
      </View>
      <View style={styles.bottomSpacer12} />
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
