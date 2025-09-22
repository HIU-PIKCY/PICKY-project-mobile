import AsyncStorage from '@react-native-async-storage/async-storage';

// 서버 api url
const API_BASE_URL = 'http://13.124.86.254';

// Firebase 토큰으로 백엔드 로그인 (인증 불필요)
export const loginWithFirebase = async (firebaseIdToken) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firebaseIdToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '로그인 실패');
  }
  
  return data;
};

// 토큰 갱신 함수
export const refreshAccessToken = async () => {
  try {
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!storedRefreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${storedRefreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`토큰 갱신 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.isSuccess && data.result) {
      await AsyncStorage.setItem('accessToken', data.result.accessToken);
      await AsyncStorage.setItem('refreshToken', data.result.refreshToken);
      return data.result.accessToken;
    } else {
      throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
};

// 인증이 필요한 API 호출을 위한 공통 함수
export const authenticatedApiCall = async (url, options = {}) => {
  try {
    let accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('액세스 토큰이 없습니다.');
    }

    // 첫 번째 요청
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 토큰 만료 시 갱신 후 재시도
    if (response.status === 401) {
      console.log('토큰 만료, 갱신 후 재시도');
      accessToken = await refreshAccessToken();
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  } catch (error) {
    console.error('인증된 API 요청 실패:', error);
    throw error;
  }
};

// 도서 검색 API
export const searchBooks = async (keyword, type = 'all', page = 1, size = 20) => {
  const params = new URLSearchParams({
    keyword: keyword.trim(),
    type,
    page: page.toString(),
    size: size.toString()
  });

  const url = `${API_BASE_URL}/api/books/search?${params.toString()}`;
  const response = await authenticatedApiCall(url, { method: 'GET' });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`검색 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

// 도서 상세 정보 API
export const getBookDetail = async (isbn) => {
  const url = `${API_BASE_URL}/api/books/${isbn}`;
  const response = await authenticatedApiCall(url, { method: 'GET' });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`도서 상세 정보 조회 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

// 사용자 프로필 API
export const getUserProfile = async () => {
  const url = `${API_BASE_URL}/api/user/profile`;
  const response = await authenticatedApiCall(url, { method: 'GET' });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`프로필 조회 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

// 독서 기록 관련 API들
export const getReadingRecords = async (page = 1, size = 20) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  const url = `${API_BASE_URL}/api/reading/records?${params.toString()}`;
  const response = await authenticatedApiCall(url, { method: 'GET' });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`독서 기록 조회 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

export const addReadingRecord = async (recordData) => {
  const url = `${API_BASE_URL}/api/reading/records`;
  const response = await authenticatedApiCall(url, {
    method: 'POST',
    body: JSON.stringify(recordData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`독서 기록 추가 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

export const updateReadingRecord = async (recordId, recordData) => {
  const url = `${API_BASE_URL}/api/reading/records/${recordId}`;
  const response = await authenticatedApiCall(url, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`독서 기록 수정 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};

export const deleteReadingRecord = async (recordId) => {
  const url = `${API_BASE_URL}/api/reading/records/${recordId}`;
  const response = await authenticatedApiCall(url, { method: 'DELETE' });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`독서 기록 삭제 실패: ${response.status}, ${errorText}`);
  }
  
  return response.json();
};