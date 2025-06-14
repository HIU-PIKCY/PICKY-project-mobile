import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';

const MainScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>MainScreen 기본 화면</Text>
      </View>
    </SafeAreaView>
  );
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
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
});

export default MainScreen;
