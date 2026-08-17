import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';

export default function SettingsScreen({ navigation }) {
  const { mode, calibration, calibrationOffsetK, setCalibrationOffsetK } = useAppState();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Calibration')}>
        <Ionicons name="options-outline" size={20} color="#6C86E0" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Diffraction Calibration</Text>
          <Text style={styles.rowSub}>{calibration.calibrated ? 'Calibrated' : 'Not calibrated'} · Mode: {mode}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#5A5A5C" />
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons name="pulse-outline" size={20} color="#6C86E0" style={styles.rowIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Kelvin Offset Calibration</Text>
          <Text style={styles.rowSub}>{calibrationOffsetK >= 0 ? '+' : ''}{calibrationOffsetK.toFixed(0)}K</Text>
        </View>
        <TouchableOpacity onPress={() => setCalibrationOffsetK(0)}>
          <Text style={styles.resetLink}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Ionicons name="document-text-outline" size={20} color="#6C86E0" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>Privacy Policy</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="document-outline" size={20} color="#6C86E0" style={styles.rowIcon} />
        <Text style={styles.rowLabel}>End User License Agreement</Text>
      </View>

      <Text style={styles.footer}>LSP.evo Clone · v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0C' },
  topBar: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  resetLink: { color: '#FF6B6B', fontSize: 13, fontWeight: '600' },
  footer: { color: '#5A5A5C', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
