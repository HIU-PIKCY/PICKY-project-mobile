// 서버 api url
const API_BASE_URL = 'http://13.124.86.254';

// Firebase 토큰으로 백엔드 로그인
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