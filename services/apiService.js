import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class ApiService {
    constructor() {
        this.baseURL = 'http://13.124.86.254';
        this.accessToken = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    // 토큰 초기화 (앱 시작 시 호출)
    async initializeTokens() {
        try {
            this.accessToken = await AsyncStorage.getItem('accessToken');
            this.refreshToken = await AsyncStorage.getItem('refreshToken');
        } catch (error) {
            console.error('토큰 초기화 실패:', error);
        }
    }

    // 토큰 저장
    async setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        
        try {
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
        } catch (error) {
            console.error('토큰 저장 실패:', error);
        }
    }

    // 토큰 삭제
    async clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        
        try {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        } catch (error) {
            console.error('토큰 삭제 실패:', error);
        }
    }

    // 토큰 갱신
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('리프레시 토큰이 없습니다.');
        }

        try {
            const response = await fetch(`${this.baseURL}/api/auth/reissue`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.refreshToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`토큰 갱신 실패: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isSuccess && data.result) {
                await this.setTokens(data.result.accessToken, data.result.refreshToken);
                return data.result.accessToken;
            } else {
                throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            // 토큰 갱신 실패 시 로그아웃 처리
            await this.clearTokens();
            throw error;
        }
    }

    // 대기 중인 요청들을 처리하는 함수
    processQueue(error, token = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
        
        this.failedQueue = [];
    }

    // 인증이 필요한 API 호출
    async authenticatedFetch(url, options = {}) {
        // 토큰이 없는 경우 에러
        if (!this.accessToken) {
            throw new Error('액세스 토큰이 없습니다. 로그인이 필요합니다.');
        }

        // 요청 헤더에 토큰 추가
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, requestOptions);

            // 401 에러 (토큰 만료) 처리
            if (response.status === 401) {
                // 이미 토큰 갱신 중인 경우 대기
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then(token => {
                        requestOptions.headers['Authorization'] = `Bearer ${token}`;
                        return fetch(url, requestOptions);
                    });
                }

                this.isRefreshing = true;

                try {
                    const newToken = await this.refreshAccessToken();
                    this.processQueue(null, newToken);
                    
                    // 새 토큰으로 원래 요청 재시도
                    requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
                    return fetch(url, requestOptions);
                } catch (refreshError) {
                    this.processQueue(refreshError, null);
                    throw refreshError;
                } finally {
                    this.isRefreshing = false;
                }
            }

            return response;
        } catch (error) {
            console.error('API 호출 실패:', error);
            throw error;
        }
    }

    // GET 요청
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );

        return this.authenticatedFetch(url.toString(), {
            method: 'GET'
        });
    }

    // POST 요청
    async post(endpoint, data = {}) {
        return this.authenticatedFetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT 요청
    async put(endpoint, data = {}) {
        return this.authenticatedFetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE 요청
    async delete(endpoint) {
        return this.authenticatedFetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE'
        });
    }

    // PATCH 요청
    async patch(endpoint, data = {}) {
        return this.authenticatedFetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // 인증이 불필요한 공개 API 호출 (검색 등)
    async publicFetch(url, options = {}) {
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Accept': 'application/json',
            },
        };

        if (options.body && typeof options.body === 'object') {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(options.body);
        }

        return fetch(url, requestOptions);
    }

    // 공개 GET 요청
    async publicGet(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );

        return this.publicFetch(url.toString(), {
            method: 'GET'
        });
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const apiService = new ApiService();
export default apiService;

// 개별 API 함수들을 별도로 내보내기
export const api = {
    // 인증 관련
    async login(firebaseToken) {
        const response = await fetch(`${apiService.baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${firebaseToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        
        if (data.isSuccess && data.result?.tokenInfo) {
            await apiService.setTokens(
                data.result.tokenInfo.accessToken,
                data.result.tokenInfo.refreshToken
            );
        }
        
        return data;
    },

    async signup(firebaseToken, userData) {
        const response = await fetch(`${apiService.baseURL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${firebaseToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.isSuccess && data.result?.tokenInfo) {
            await apiService.setTokens(
                data.result.tokenInfo.accessToken,
                data.result.tokenInfo.refreshToken
            );
        }
        
        return data;
    },

    async logout() {
        try {
            await apiService.post('/api/auth/logout');
        } catch (error) {
            console.error('로그아웃 API 호출 실패:', error);
        } finally {
            await apiService.clearTokens();
        }
    },

    // 도서 관련
    async searchBooks(params) {
        // publicGet -> get 으로 변경하여 인증이 필요하도록 수정
        const response = await apiService.get('/api/books', params);
        return response.json();
    },

    async getBookDetail(isbn) {
        const response = await apiService.get(`/api/books/${isbn}`);
        return response.json();
    },

    async addBookToLibrary(bookData) {
        const response = await apiService.post('/api/books', bookData);
        return response.json();
    },

    async getBookIdByIsbn(isbn) {
        const response = await apiService.publicGet(`/api/books/isbn/${isbn}`);
        return response.json();
    },

    // 서재 관련
    async getMyLibrary(params = {}) {
        const response = await apiService.get('/api/book-shelf', params);
        return response.json();
    },

    async deleteFromLibrary(bookShelfId) {
        const response = await apiService.delete(`/api/book-shelf/${bookShelfId}`);
        return response.json();
    },

    async updateBookStatus(bookShelfId, status) {
        const response = await apiService.patch(`/api/book-shelf/${bookShelfId}`, { status });
        return response.json();
    },

    // 질문 관련
    async getQuestionsByBook(bookId) {
        const response = await apiService.get(`/api/books/${bookId}/questions`);
        return response.json();
    },

    async getQuestionDetail(questionId, memberId) {
        const response = await apiService.get(`/api/questions/${questionId}/${memberId}`);
        return response.json();
    },

    async createQuestion(bookId, memberId, questionData) {
        const response = await apiService.post(`/api/books/${bookId}/questions/${memberId}`, questionData);
        return response.json();
    },

    async deleteQuestion(questionId, memberId) {
        const response = await apiService.delete(`/api/questions/${questionId}/${memberId}`);
        return response.json();
    },

    async getMyQuestions(memberId) {
        const response = await apiService.get(`/api/members/${memberId}/questions`);
        return response.json();
    },

    // 답변 관련
    async getAnswersByQuestion(questionId, sort = 'oldest') {
        const response = await apiService.get(`/api/questions/${questionId}/answers`, { sort });
        return response.json();
    },

    async createAnswer(questionId, memberId, answerData) {
        const response = await apiService.post(`/api/questions/${questionId}/answers/${memberId}`, answerData);
        return response.json();
    },

    async deleteAnswer(answerId, memberId) {
        const response = await apiService.delete(`/api/answers/${answerId}/${memberId}`);
        return response.json();
    },

    async getMyAnswers(memberId) {
        const response = await apiService.get(`/api/members/${memberId}/answers`);
        return response.json();
    },

    // 좋아요 관련
    async toggleQuestionLike(questionId, memberId) {
        const response = await apiService.post(`/api/question-like/${questionId}/${memberId}`);
        return response.json();
    },

    async getMyLikes(memberId) {
        const response = await apiService.get(`/api/question-like/members/${memberId}`);
        return response.json();
    },

    // 사용자 관련
    async getMyProfile() {
        const response = await apiService.get('/api/members/profile');
        return response.json();
    },

    async updateProfile(profileData) {
        const response = await apiService.patch('/api/members/profile', profileData);
        return response.json();
    },

    async getMyMenu() {
        const response = await apiService.get('/api/members/mymenu');
        return response.json();
    },

    // 홈 화면 관련
    async getHotTopic() {
        const response = await apiService.publicGet('/api/home/hot-topic');
        return response.json();
    },

    async getMostQuestionedBooks() {
        const response = await apiService.publicGet('/api/home/most-questioned-books');
        return response.json();
    },

    // AI 관련
    async generateAIQuestion(questionData) {
        const response = await apiService.post('/api/ai/generate-question', questionData);
        return response.json();
    }
};