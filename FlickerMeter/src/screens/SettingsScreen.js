import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalibrationModal from '../components/CalibrationModal';
import { useMeasurements } from '../context/MeasurementsContext';

export default function SettingsScreen() {
  const { calibrationHz, setCalibrationHz } = useMeasurements();
  const [calibOpen, setCalibOpen] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity style={styles.row} onPress={() => setCalibOpen(true)}>
        <Ionicons name="pulse-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Calibrate Frequency</Text>
          <Text style={styles.rowSub}>Currently {calibrationHz} Hz</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons name="phone-portrait-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Keep Screen On</Text>
          <Text style={styles.rowSub}>Prevent sleep while measuring</Text>
        </View>
        <Switch
          value={keepScreenOn}
          onValueChange={setKeepScreenOn}
          trackColor={{ false: '#E5E5EA', true: '#16A34A' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.row}>
        <Ionicons name="document-text-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>Privacy Policy</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="document-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>End User License Agreement</Text>
      </View>

      <Text style={styles.footer}>Flicker Meter · v1.0.0</Text>

      <CalibrationModal
        visible={calibOpen}
        currentHz={calibrationHz}
        onClose={() => setCalibOpen(false)}
        onSave={(hz) => {
          setCalibrationHz(hz);
          setCalibOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  topBar: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20 },
  title: { color: '#1C1C1E', fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
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
