import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';
import MintStar from '../assets/icons/MintStar.svg';

const QuestionDetail = ({ navigation, route }) => {
    const [newAnswer, setNewAnswer] = useState('');
    const [selectedSort, setSelectedSort] = useState('latest');
    const [answers, setAnswers] = useState([
        {
            id: 1,
            author: 'AI 답변',
            content: '작가는 <운수 좋은 날>이라는 제목으로 삶의 잔혹한 아이러니를 드러내고자 했습니다. 김첨지에게 경제적으로는 좋은 날이었지만 가장 소중한 것을 잃은 날이기도 했죠. 이를 통해 당시 서민들이 처한 무력한 현실과 그에 대한 체념을 보여주면서도, 동시에 그러한 현실 자체를 비판하고 있다고 봅니다.',
            isAI: true,
        },
        {
            id: 2,
            author: '키티키티',
            content: '김첨지가 마지막에 "운수가 좋다"고 말하는 게... 아내가 더 이상 고생하지 않아도 된다는 안도감도 있는 것 같아요. 제목 자체가 너무 슬픈 아이러니네요😢',
            isAI: false,
        }
    ]);

    // route params에서 질문 데이터와 책 데이터 가져오기
    const { questionData, bookData } = route.params || {};

    // 전달받은 데이터 사용
    const question = {
        id: questionData?.id,
        bookTitle: bookData?.title,
        title: questionData?.content,
        author: questionData?.author,
        views: questionData?.views,
        likes: questionData?.likes,
        pages: questionData?.page,
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleLike = () => {
        console.log('좋아요 클릭');
    };

    const handleSubmitAnswer = () => {
        if (newAnswer.trim()) {
            // 새 답변을 배열에 추가
            const newAnswerData = {
                id: Date.now(), // 임시 ID
                author: '나',
                content: newAnswer.trim(),
                isAI: false,
            };
            
            setAnswers(prev => [...prev, newAnswerData]);
            setNewAnswer(''); // 입력 필드 초기화
            Keyboard.dismiss(); // 키보드 닫기
        }
    };

    const renderAnswer = (answer) => (
        <View key={answer.id} style={styles.answerContainer}>
            <View style={styles.authorIconContainer}>
                {answer.isAI ? (
                    <View style={styles.aiIcon}>
                        <Text style={styles.aiIconText}>AI</Text>
                    </View>
                ) : (
                    <View style={styles.userIcon}>
                        <Ionicons name="person" size={16} color="#666" />
                    </View>
                )}
            </View>
            <View style={styles.answerContentWrapper}>
                <View style={styles.answerHeader}>
                    <Text style={styles.authorName}>{answer.author}</Text>
                </View>
                <Text style={styles.answerText}>{answer.content}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 헤더 컴포넌트 */}
            <CustomHeader
                title="질문답변"
                onBackPress={handleGoBack}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 질문 섹션 */}
                    <View style={styles.questionSection}>
                        <View style={styles.questionHeader}>
                            <View style={styles.iconWrapper}>
                                <View style={styles.aiIcon}>
                                    <Text style={styles.aiIconText}>AI</Text>
                                </View>
                                <Text style={styles.questionAuthor}>AI 질문</Text>
                            </View>
                            <Text style={styles.bookLabel}>{question.bookTitle}</Text>
                        </View>

                        <Text style={styles.questionTitle}>{question.title}</Text>
                        <Text style={styles.questionContent}>
                            김첨지가 아내의 죽음을 알고도 "운수가 좋다"고 중얼거리는 마지막 장면이 인상적입니다.{'\n'}작가는 제목 '운수 좋은 날'에 담긴 아이러니를 통해 무엇을 말하고자 했을까요?{'\n'}여러분은 이 소설의 제목과 결말에 담긴 작가의 진정한 의도가 무엇이라고 생각하시나요?
                        </Text>
                        
                        <View style={styles.questionMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="book-outline" size={16} color="#666" />
                                <Text style={styles.metaText}>페이지 {question.pages || '-'}</Text>
                            </View>
                        </View>

                        <View style={styles.questionFooter}>
                            <View style={styles.statItem}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.dateText}>2025.04.20</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="eye-outline" size={16} color="#666" />
                                <Text style={styles.statText}>조회수 {question.views || 0}</Text>
                            </View>
                            <TouchableOpacity style={styles.statItem} onPress={handleLike}>
                                <Ionicons name="heart-outline" size={16} color="#666" />
                                <Text style={styles.statText}>추천 {question.likes || 0}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 답변 섹션 */}
                    <View style={styles.answersSectionHeader}>
                        <Text style={styles.answersTitle}>답변</Text>
                        <Text style={styles.sortButtonText}>최신순</Text>
                    </View>
                    
                    <View style={styles.answersSection}>
                        {answers.map(renderAnswer)}
                    </View>
                </ScrollView>

                {/* 답변 작성 섹션 */}
                <View style={styles.answerInputContainer}>
                    <View style={styles.inputRow}>
                        <View style={styles.userIconSmall}>
                            <Ionicons name="person" size={16} color="#666" />
                        </View>
                        <TextInput
                            style={styles.answerInput}
                            placeholder="나의 생각을 공유해요!"
                            value={newAnswer}
                            onChangeText={setNewAnswer}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                        />
                    </View>
                    <View style={styles.inputActions}>
                        <TouchableOpacity style={styles.aiAnswerButton}>
                            <MintStar />
                            <Text style={styles.aiAnswerButtonText}>AI 답변 생성</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnswer}>
                            <Text style={styles.submitButtonText}>답변 등록</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    questionSection: {
        backgroundColor: '#fff',
        padding: 20,
    },
    iconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
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
    answersSection: {
        backgroundColor: '#fff',
    },
    answersSectionHeader: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    sortButtonText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.6,
        color: '#0D2525',
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
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    authorIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingRight: 5,
    },
    answerContentWrapper: {
        flex: 1,
        minWidth: 0,
    },
    userIcon: {
        backgroundColor: '#f1f3f4',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    authorName: {
        fontSize: 10,
        fontFamily: 'SUIT-Medium',
        color: '#666',
    },
    answerText: {
        fontSize: 12,
        fontFamily: 'SUIT-Medium',
        letterSpacing: -0.3,
        lineHeight: 16,
        color: '#666',
    },
    answerInputContainer: {
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    userIconSmall: {
        backgroundColor: '#f1f3f4',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: 5,
    },
    answerInput: {
        flex: 1,
        padding: 10,
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#666',
        minHeight: 40,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiAnswerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    aiAnswerButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#4B4B4B',
        marginLeft: 5,
    },
    submitButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    submitButtonText: {
        fontSize: 14,
        fontFamily: 'SUIT-Regular',
        letterSpacing: -0.35,
        color: '#4B4B4B',
    },
});

export default QuestionDetail;