import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { SpectrometerProvider } from '../context/SpectrometerContext';
import SpectrometerHomeScreen from '../screens/SpectrometerHomeScreen';
import CieAnalysisScreen from '../screens/CieAnalysisScreen';
import SpectrometerHistoryScreen from '../screens/SpectrometerHistoryScreen';
import SpectrometerSettingsScreen from '../screens/SpectrometerSettingsScreen';

const Tab = createBottomTabNavigator();

export default function SpectrometerNavigator() {
  return (
    <SpectrometerProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#0891B2',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: 'wifi-outline',
              SavedMeasurements: 'list-outline',
              Calibration: 'trending-up-outline',
              Settings: 'settings-outline',
            };
            return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={SpectrometerHomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen
          name="SavedMeasurements"
          component={SpectrometerHistoryScreen}
          options={{ tabBarLabel: 'Saved Measur...' }}
        />
        <Tab.Screen
          name="Calibration"
          component={CieAnalysisScreen}
          options={{ tabBarLabel: 'Calibration' }}
        />
        <Tab.Screen name="Settings" component={SpectrometerSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      </Tab.Navigator>
    </SpectrometerProvider>
  );
}
