import { StyleSheet } from 'react-native';

export const questionSectionStyle = StyleSheet.create({
    questionSection: {
        backgroundColor: '#fff',
        padding: 20,
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    iconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
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
    questionAuthor: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginRight: 12,
    },
    bookLabel: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginRight: 8,
    },
    menuButton: {
        padding: 4,
    },
    questionTitle: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        color: '#666',
        letterSpacing: -0.4,
        marginBottom: 14,
    },
    questionContent: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.35,
        lineHeight: 18.2,
        color: '#666',
        marginBottom: 14,
    },
    questionMeta: {
        marginBottom: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    questionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        color: '#666',
        marginLeft: 4,
    },
    likedText: {
        color: '#FF6B6B',
    },
    // 모달 관련 스타일
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuModal: {
        backgroundColor: '#fff',
        borderRadius: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    deleteMenuText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#FF6B6B',
        marginLeft: 8,
    },
});