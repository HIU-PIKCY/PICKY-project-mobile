import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    scrollContent: { 
        flexGrow: 1 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#90D1BE',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: '#FFF3CD',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#FFEAA7',
    },
    errorBannerText: {
        fontSize: 12,
        color: '#856404',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 50,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "SUIT-Medium",
        color: "#999999",
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: "SUIT-Regular",
        color: "#CCCCCC",
        marginTop: 8,
    },
    questionSection: { 
        backgroundColor: "#fff", 
        padding: 20 
    },
    bookSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 5,
        minHeight: 173, // 최소 높이 보장
    },
    cover: {
        width: 115,
        height: 173,
        borderRadius: 4,
        marginRight: 20,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    emptyCover: {
        width: '100%',
        height: '100%',
        backgroundColor: "#E8E8E8",
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookInfo: {
        flex: 1,
        justifyContent: "flex-start",
        minHeight: 173,
        paddingVertical: 2,
    },
    title: {
        fontSize: 18,
        fontFamily: "SUIT-SemiBold",
        color: "#0D2525",
        marginBottom: 12,
        lineHeight: 22, // 줄간격 추가
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 7,
        flexWrap: "wrap",
    },
    metaLabel: {
        fontSize: 14,
        fontFamily: "SUIT-Medium",
        color: "#666",
        marginRight: 10,
        minWidth: 60, // 라벨 최소 너비 설정
    },
    metaValue: {
        fontSize: 14,
        fontFamily: "SUIT-Medium",
        color: "#666",
        flex: 1,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    readDot: {
        fontSize: 14,
        fontFamily: "SUIT-Medium",
        marginRight: 4,
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: "#F87171",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 4,
        alignSelf: "flex-start",
        marginTop: 5, // 메타 정보와 버튼 사이 간격
    },
    addButton: {
        borderWidth: 1,
        borderColor: "#10B981",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 4,
        alignSelf: "flex-start",
        marginTop: 5, // 메타 정보와 버튼 사이 간격
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    deleteText: {
        fontSize: 13,
        color: "#F87171",
        fontFamily: "SUIT-Medium",
    },
    addText: {
        fontSize: 13,
        color: "#10B981",
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
    sortButtons: { 
        flexDirection: "row" 
    },
    sortButton: {
        marginLeft: 12,
    },
    sortButtonText: {
        fontSize: 12,
        fontFamily: "SUIT-Medium",
        letterSpacing: -0.6,
        color: "#888",
    },
    sortButtonTextSelected: { 
        color: "#0D2525",
        fontFamily: "SUIT-SemiBold",
    },
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
        paddingRight: 5,
    },
    aiIcon: {
        backgroundColor: "#333",
        borderRadius: 16,
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
    userIconContainer: {
        width: 30,
        height: 30,
        marginRight: 8,
        borderRadius: 15,
        overflow: 'hidden',
    },
    userIconImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    userIcon: {
        backgroundColor: "#f1f3f4",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    answerContentWrapper: { 
        flex: 1, 
        minWidth: 0 
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    authorName: {
        fontSize: 10,
        fontFamily: "SUIT-Medium",
        color: "#666",
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
        marginTop: 3,
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
    deleteQuestionButton: {
        marginLeft: 8,
        padding: 4,
    }
});

export default styles;