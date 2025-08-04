import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Recommendation = ({ navigation }) => {
    const bookData = {
        title: '노스텔지어, 어느 위험한 감정의 연대기',
        author: '애그니스 아킬도포스티',
        description: '문학 작품 해석에 관심이 많은 회원님께 추천',
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const renderBookCard = (section) => (
        <TouchableOpacity style={styles.bookCard}>
            <View style={styles.bookImagePlaceholder}>
                {/* 책 이미지 자리 */}
            </View>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{bookData.title}</Text>
                <Text style={styles.bookAuthor}>{bookData.author}</Text>
                <Text style={styles.bookDescription}>{bookData.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>추천 도서</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 상단 안내 메시지 */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="chatbubble-ellipses" size={20} color="#4A90E2" />
                    </View>
                    <Text style={styles.infoText}>
                        회원님이 참여한 질문과 답변을 분석하여 관심사에 맞는 도서를 추천해드려요.
                    </Text>
                </View>

                {/* 질문 내용 기반 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionQuestion}>🤔 "작가의 의도는?" 을 찾고있어요!</Text>
                        <Text style={styles.sectionTitle}>질문 내용 기반</Text>
                    </View>
                    {renderBookCard('question')}
                </View>

                {/* 답변 내용 기반 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionQuestion}>📖 운수 좋은 날 에서 가져왔어요!</Text>
                        <Text style={styles.sectionTitle}>답변 내용 기반</Text>
                    </View>
                    {renderBookCard('answer')}
                </View>

                {/* 자주 언급한 키워드 섹션 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionQuestion}># 성장 # 변화 에서 찾았어요!</Text>
                        <Text style={styles.sectionTitle}>자주 언급한 키워드</Text>
                    </View>
                    {renderBookCard('keyword')}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F6F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
        marginBottom: 24,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    questionBadge: {
        backgroundColor: '#D8F3F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    sectionQuestion: {
        fontSize: 13,
        color: '#4ECDC4',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bookImagePlaceholder: {
        width: 80,
        height: 120,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        marginRight: 16,
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        lineHeight: 22,
    },
    bookAuthor: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    bookDescription: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
});

export default Recommendation;