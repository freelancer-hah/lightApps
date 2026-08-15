import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import ColorAssistNavigator from './src/ColorAssistNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <ColorAssistNavigator />
      </NavigationContainer>
    </>
  );
}
