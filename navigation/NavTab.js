import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MainScreen from '../screens/MainScreen';
import SearchBookScreen from '../screens/SearchBook';
import MyMenuScreen from '../screens/MyMenu';
import NavTabStyle from '../styles/NavTabStyle';

const Tab = createBottomTabNavigator();

const NavTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Main') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'SearchBook') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyMenu') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#90D1BE',
        tabBarInactiveTintColor: '#DBDBDB',
        tabBarStyle: NavTabStyle.tabBarStyle,
        tabBarLabelStyle: NavTabStyle.tabBarLabelStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Main" 
        component={MainScreen}
        options={{ tabBarLabel: '서재' }}
      />
      <Tab.Screen 
        name="SearchBook" 
        component={SearchBookScreen}
        options={{ tabBarLabel: '검색' }}
      />
      <Tab.Screen 
        name="MyMenu" 
        component={MyMenuScreen}
        options={{ tabBarLabel: '마이' }}
      />
    </Tab.Navigator>
  );
};

export default NavTab;