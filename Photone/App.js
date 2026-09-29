import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PhotoneProvider } from './src/context/PhotoneContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PhotoneProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#1E293B" />
          <AppNavigator />
        </NavigationContainer>
      </PhotoneProvider>
    </SafeAreaProvider>
  );
}
