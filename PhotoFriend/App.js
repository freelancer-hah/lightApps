import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import PhotoFriendNavigator from './src/navigation/PhotoFriendNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <PhotoFriendNavigator />
      </NavigationContainer>
    </>
  );
}
