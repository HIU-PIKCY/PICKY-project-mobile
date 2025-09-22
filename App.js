import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext';

// 인증 관련 화면
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// 메인 앱 화면
import NavTab from './navigation/NavTab';
import BookDetail from './screens/BookDetail';
import QuestionDetail from './screens/QuestionDetail';
import ActivityManagement from './screens/ActivityManagement';
import ProfileManagement from './screens/ProfileManagement';
import NotificationPage from './screens/NotificationPage';

const Stack = createStackNavigator();

// 인증되지 않은 사용자용 네비게이션
const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

// 인증된 사용자용 네비게이션
const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={NavTab} />
            <Stack.Screen name="BookDetail" component={BookDetail} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetail} />
            <Stack.Screen name="ActivityManagement" component={ActivityManagement} />
            <Stack.Screen name="ProfileManagement" component={ProfileManagement} />
            <Stack.Screen name="NotificationPage" component={NotificationPage} />
        </Stack.Navigator>
    );
};

// 로딩 화면
const LoadingScreen = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#90D1BE" />
        </View>
    );
};

// 메인 네비게이션 컴포넌트
const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

// 메인 App 컴포넌트
const App = () => {
    return (
        <AuthProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <AppNavigator />
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default App;