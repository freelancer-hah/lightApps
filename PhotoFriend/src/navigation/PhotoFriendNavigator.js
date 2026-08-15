import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PhotoFriendProvider } from '../context/PhotoFriendContext';

import PhotoFriendScreen from '../screens/PhotoFriendScreen';
import PhotoFriendSavedScreen from '../screens/PhotoFriendSavedScreen';
import PhotoFriendSettingsScreen from '../screens/PhotoFriendSettingsScreen';

const Stack = createNativeStackNavigator();

export default function PhotoFriendNavigator() {
  return (
    <PhotoFriendProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PhotoFriendHome" component={PhotoFriendScreen} />
        <Stack.Screen name="PhotoFriendSaved" component={PhotoFriendSavedScreen} />
        <Stack.Screen name="PhotoFriendSettings" component={PhotoFriendSettingsScreen} />
      </Stack.Navigator>
    </PhotoFriendProvider>
  );
}
