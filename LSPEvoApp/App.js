import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppStateProvider } from './src/context/AppStateContext';
import RootTabs from './src/navigation/RootTabs';

export default function App() {
  return (
    <AppStateProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </AppStateProvider>
  );
}
