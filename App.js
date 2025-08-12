import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './AuthContext';
import NavTab from './navigation/NavTab';
import BookDetail from './screens/BookDetail';
import QuestionDetail from './screens/QuestionDetail';
import ProfileManagement from './screens/ProfileManagement';
import ActivityManagement from './screens/ActivityManagement';
import NotificationPage from './screens/NotificationPage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createStackNavigator();

// 로딩 스크린 컴포넌트
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#90D1BE" />
    </View>
  );
};

// 네비게이션 컴포넌트
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // 로그인된 상태의 스크린들
          <>
            <Stack.Screen name="TabNavigator" component={NavTab} />
            <Stack.Screen name="BookDetail" component={BookDetail} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetail} />
            <Stack.Screen name="ProfileManagement" component={ProfileManagement} />
            <Stack.Screen name="ActivityManagement" component={ActivityManagement} />
            <Stack.Screen name="NotificationPage" component={NotificationPage} />
          </>
        ) : (
          // 로그인되지 않은 상태의 스크린들
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});