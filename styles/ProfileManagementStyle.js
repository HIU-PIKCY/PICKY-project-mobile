import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#90D1BE',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#FFFFFF',
    },
    profileImageSection: {
        paddingVertical: 30,
        paddingHorizontal: 24,
    },
    imageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    noImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    uploadingText: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#888',
        textAlign: 'center',
    },
    changePhotoButton: {
        paddingHorizontal: 32,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#4B4B4B',
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    changePhotoText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#4B4B4B',
    },
    inputSection: {
        paddingHorizontal: 24,
        marginBottom: 27,
    },
    label: {
        fontSize: 16,
        fontFamily: 'SUIT-SemiBold',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginBottom: 15,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    nicknameStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    checkingText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#90D1BE',
        marginLeft: 4,
    },
    disabledInput: {
        backgroundColor: '#DFDFDF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    disabledText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#0D2525',
    },
    passwordInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    // 기본 입력 필드 (비활성화 상태)
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#90D1BE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#4B4B4B',
        backgroundColor: '#F3FCF9',
    },
    // 비밀번호 입력 필드 (비활성화 상태)
    passwordInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#90D1BE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingRight: 50,
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#4B4B4B',
        backgroundColor: '#F3FCF9',
    },
    // 포커스 상태 (활성화)
    focusedInput: {
        borderColor: '#666666',
        backgroundColor: '#FFFFFF',
    },
    // 비밀번호 포커스 상태
    focusedPasswordInput: {
        borderColor: '#666666',
        backgroundColor: '#FFFFFF',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    // 에러 상태
    errorInput: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    // 성공 상태
    successInput: {
        borderColor: '#90D1BE',
        backgroundColor: '#F3FCF9',
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#F87171',
        letterSpacing: -0.3,
        marginLeft: 8,
    },
    successText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#10B981',
        marginLeft: 8,
    },
    saveSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    saveButton: {
        width: '100%',
        alignSelf: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#0D2525',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    savingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    savingText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    saveText: {
        fontSize: 16,
        fontFamily: 'SUIT-Medium',
        fontWeight: '500',
        letterSpacing: -0.35,
        color: '#FFFFFF',
    },
    uploadWarningText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        color: '#FF6B6B',
        textAlign: 'center',
    },
});