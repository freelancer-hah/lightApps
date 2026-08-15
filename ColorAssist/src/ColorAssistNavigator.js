import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsProvider } from './context/SettingsContext';
import LiveScreen from './screens/LiveScreen';
import OptionsScreen from './screens/OptionsScreen';
import SavedScreen from './screens/SavedScreen';

const Stack = createNativeStackNavigator();

export default function ColorAssistNavigator() {
  return (
    <SettingsProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Live" component={LiveScreen} />
        <Stack.Screen name="Options" component={OptionsScreen} />
        <Stack.Screen name="Saved" component={SavedScreen} />
      </Stack.Navigator>
    </SettingsProvider>
  );
}
