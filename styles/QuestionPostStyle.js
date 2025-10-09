import { StyleSheet } from 'react-native';

export const questionPostStyle = StyleSheet.create({
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
  handleSpacer12: { 
    height: 12 
  },
  headerSpacer12: { 
    height: 12 
  },
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
  // AI 로딩 애니메이션
  aiLoadingContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    alignSelf: 'center',
  },
  aiIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3FCF9',
    borderWidth: 2,
    borderColor: '#90D1BE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 8,
    right: 12,
  },
  sparkle2: {
    bottom: 12,
    left: 8,
  },
  sparkle3: {
    top: 16,
    left: 4,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    fontFamily: 'SUIT-SemiBold',
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