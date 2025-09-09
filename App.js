import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext';

// 스크린 imports
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NavTab from './navigation/NavTab';
import BookDetail from './screens/BookDetail';
import QuestionDetail from './screens/QuestionDetail';
import ActivityManagement from './screens/ActivityManagement';
import ProfileManagement from './screens/ProfileManagement';
import NotificationPage from './screens/NotificationPage';

const Stack = createStackNavigator();

// 인증이 필요하지 않은 스크린들 (로그인/회원가입)
const AuthStack = () => (
  <Stack.Navigator 
    initialRouteName="Login"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// 인증이 필요한 메인 스크린들
const MainStack = () => (
  <Stack.Navigator 
    initialRouteName="MainTabs"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="MainTabs" component={NavTab} />
    <Stack.Screen name="BookDetail" component={BookDetail} />
    <Stack.Screen name="QuestionDetail" component={QuestionDetail} />
    <Stack.Screen name="ActivityManagement" component={ActivityManagement} />
    <Stack.Screen name="ProfileManagement" component={ProfileManagement} />
    <Stack.Screen name="NotificationPage" component={NotificationPage} />
  </Stack.Navigator>
);

// 로딩 스크린 컴포넌트
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <ActivityIndicator size="large" color="#90D1BE" />
  </View>
);

// 앱 네비게이션 컴포넌트 (AuthProvider 내부에서 사용)
const AppNavigation = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('AppNavigation - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // 로딩 중일 때
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 인증 상태에 따른 화면 분기
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <>
          {console.log('렌더링: 메인 스택')}
          <MainStack />
        </>
      ) : (
        <>
          {console.log('렌더링: 인증 스택')}
          <AuthStack />
        </>
      )}
    </NavigationContainer>
  );
};

// 메인 App 컴포넌트
const App = () => {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;