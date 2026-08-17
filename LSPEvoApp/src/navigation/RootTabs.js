import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SavedMeasurementsScreen from '../screens/SavedMeasurementsScreen';
import CalibrationScreen from '../screens/CalibrationScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0B0B0C', borderTopColor: '#1C1C1E' },
        tabBarActiveTintColor: '#6C86E0',
        tabBarInactiveTintColor: '#5A5A5C',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'analytics-outline',
            'Saved Measurements': 'list-outline',
            Calibration: 'options-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Saved Measurements" component={SavedMeasurementsScreen} options={{ tabBarLabel: 'Saved' }} />
      <Tab.Screen name="Calibration" component={CalibrationScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
