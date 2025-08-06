import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavTab from './navigation/NavTab';
import BookDetail from './screens/BookDetail';
import QuestionDetail from './screens/QuestionDetail';
import ProfileManagement from './screens/ProfileManagement';
import ActivityManagement from './screens/ActivityManagement';
import NotificationPage from './screens/NotificationPage';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="TabNavigator" component={NavTab} />
        <Stack.Screen name="BookDetail" component={BookDetail} />
        <Stack.Screen name="QuestionDetail" component={QuestionDetail} />
        <Stack.Screen name="ProfileManagement" component={ProfileManagement} />
        <Stack.Screen name="ActivityManagement" component={ActivityManagement} />
        <Stack.Screen name="NotificationPage" component={NotificationPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}