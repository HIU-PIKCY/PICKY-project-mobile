import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const AuthGuard = ({ 
  children, 
  fallbackTitle = "로그인이 필요합니다",
  fallbackMessage = "이 기능을 사용하려면 로그인해주세요",
  showLoginButton = false,
  onLoginPress = null
}) => {
  const { user, loading } = useAuth();

  // 로딩 중일 때는 아무것도 보여주지 않음 (AuthContext에서 처리)
  if (loading) {
    return null;
  }

  // 로그인되지 않은 경우 fallback UI 표시
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="lock-closed-outline" size={64} color="#CCCCCC" />
          <Text style={styles.title}>{fallbackTitle}</Text>
          <Text style={styles.message}>{fallbackMessage}</Text>
          
          {showLoginButton && onLoginPress && (
            <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#0D2525',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthGuard;