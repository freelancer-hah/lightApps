import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMeasurements } from '../context/MeasurementsContext';

export default function SettingsScreen({ navigation }) {
  const { calibrationOffsetK, flashCct } = useMeasurements();
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Calibration')}>
        <Ionicons name="options-outline" size={20} color="#E64A19" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Calibration & Baseline</Text>
          <Text style={styles.rowSub}>Offset: {Math.round(calibrationOffsetK)}K · Flash: {flashCct}K</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons name="phone-portrait-outline" size={20} color="#E64A19" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Keep Screen On</Text>
          <Text style={styles.rowSub}>Prevent sleep while measuring</Text>
        </View>
        <Switch
          value={keepScreenOn}
          onValueChange={setKeepScreenOn}
          trackColor={{ false: '#E5E5EA', true: '#E64A19' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.row}>
        <Ionicons name="document-text-outline" size={20} color="#E64A19" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>Privacy Policy</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="document-outline" size={20} color="#E64A19" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>End User License Agreement</Text>
      </View>

      <Text style={styles.footer}>Kelvin Meter · v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  topBar: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { color: '#1C1C1E', fontSize: 20, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#1C1C1E', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#6E6E73', fontSize: 12, marginTop: 2 },
  footer: { color: '#8E8E93', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
