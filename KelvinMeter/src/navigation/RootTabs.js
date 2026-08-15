import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SavedMeasurementsScreen from '../screens/SavedMeasurementsScreen';
import CalibrationScreen from '../screens/CalibrationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MeasurementsProvider } from '../context/MeasurementsContext';

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  return (
    <MeasurementsProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E5EA' },
          tabBarActiveTintColor: '#E64A19',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: 'thermometer-outline',
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
    </MeasurementsProvider>
  );
}
