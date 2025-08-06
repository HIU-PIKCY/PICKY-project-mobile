import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MainScreen from '../screens/MainScreen';
import SearchBookScreen from '../screens/SearchBook';
import MyMenuScreen from '../screens/MyMenu';
import Recommendation from '../screens/Recommendation';
import MyLibrary from '../screens/MyLibrary';
import NavTabStyle from '../styles/NavTabStyle';

const Tab = createBottomTabNavigator();

const NavTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Recommendation') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'SearchBook') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Main') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyLibrary') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'MyMenu') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#0D2525',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          ...NavTabStyle.tabBarStyle,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',
          paddingTop: 8,
          paddingBottom: 16,
          height: 78,
        },
        tabBarLabelStyle: {
          ...NavTabStyle.tabBarLabelStyle,
          fontFamily: 'SUIT-Medium',
          fontSize: 12,
          fontWeight: '400',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Recommendation" 
        component={Recommendation}
        options={{ tabBarLabel: '추천 도서' }}
      />
      <Tab.Screen 
        name="SearchBook" 
        component={SearchBookScreen}
        options={{ tabBarLabel: '검색' }}
      />
      <Tab.Screen 
        name="Main" 
        component={MainScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen 
        name="MyLibrary" 
        component={MyLibrary}
        options={{ tabBarLabel: '내 서재' }}
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
