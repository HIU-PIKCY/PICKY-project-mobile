import { StyleSheet } from 'react-native';

export const answerSectionStyle = StyleSheet.create({
    answersSection: {
        backgroundColor: '#F3FCF9',
    },
    answersSectionHeader: {
        backgroundColor: '#fff',
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 0.5,
        borderTopColor: '#E8E8E8',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
    },
    answersTitle: {
        fontSize: 14,
        fontFamily: 'SUIT-SemiBold',
        letterSpacing: -0.7,
        color: '#4B4B4B',
    },
    answerContainer: {
        backgroundColor: '#F3FCF9',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
    },
    childAnswerContainer: {
        marginLeft: 0,
        paddingLeft: 50,
        backgroundColor: '#F3FCF9',
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    authorIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 5,
    },
    answerContentWrapper: {
        flex: 1,
        minWidth: 0,
    },
    authorName: {
        fontSize: 10,
        fontFamily: 'SUIT-Medium',
        color: '#666',
    },
    answerDate: {
        fontSize: 10,
        fontFamily: 'SUIT-Medium',
        color: '#999',
    },
    answerText: {
        fontSize: 12.5,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.3,
        lineHeight: 17,
        color: '#666',
        marginBottom: 4,
    },
    answerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    actionButton: {
        paddingVertical: 2,
    },
    actionText: {
        fontSize: 11,
        fontFamily: 'SUIT-Medium',
        color: '#999',
    },
    actionSeparator: {
        fontSize: 11,
        color: '#DDD',
        marginHorizontal: 8,
    },
    // 프로필 아이콘 관련
    aiIcon: {
        backgroundColor: '#333',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    aiIconText: {
        color: '#fff',
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
        backgroundColor: '#f1f3f4',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 빈 답변 상태
    emptyAnswersContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    emptyAnswersText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#999',
        marginBottom: 8,
    },
    emptyAnswersSubText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        color: '#CCC',
    },
    // 로딩 상태
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#F3FCF9',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
});