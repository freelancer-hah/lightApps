import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalibrationModal from '../components/CalibrationModal';
import { useMeasurements } from '../context/MeasurementsContext';

export default function SettingsScreen() {
  const {
    calibrationHz,
    setCalibrationHz,
    facing,
    setFacing,
    frontCalib,
    backCalib,
    resetCalibration,
  } = useMeasurements();
  const [calibOpen, setCalibOpen] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
      >
        <Ionicons name="camera-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Active Camera</Text>
          <Text style={styles.rowSub}>{facing === 'front' ? 'Front Camera' : 'Back Camera'}</Text>
        </View>
        <Ionicons name="swap-horizontal" size={18} color="#8E8E93" />
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons name="options-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Front Camera Calibration</Text>
          <Text style={styles.rowSub}>Gain factor: {frontCalib.toFixed(3)}x</Text>
        </View>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => resetCalibration('front')}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Ionicons name="options-outline" size={20} color="#16A34A" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Back Camera Calibration</Text>
          <Text style={styles.rowSub}>Gain factor: {backCalib.toFixed(3)}x</Text>
        </View>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => resetCalibration('back')}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
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
  resetBtn: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  footer: { color: '#8E8E93', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
