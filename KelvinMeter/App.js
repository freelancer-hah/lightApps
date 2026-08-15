import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import RootTabs from './src/navigation/RootTabs';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </>
  );
}
