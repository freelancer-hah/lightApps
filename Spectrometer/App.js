import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import SpectrometerNavigator from './src/navigation/SpectrometerNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <ColorAssistNavigatorWrap />
      </NavigationContainer>
    </>
  );
}

function ColorAssistNavigatorWrap() {
  return <SpectrometerNavigator />;
}
