import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavTab from './navigation/NavTab';
import BookDetail from './screens/BookDetail'; // 추가
import QuestionDetail from './screens/QuestionDetail'; // 추가

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}