import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import RootTabs from './src/navigation/RootTabs';
import ExpiryGuard from './src/components/ExpiryGuard';

export default function App() {
  return (
    <ExpiryGuard>
      <StatusBar style="dark" />
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </ExpiryGuard>
  );
}

