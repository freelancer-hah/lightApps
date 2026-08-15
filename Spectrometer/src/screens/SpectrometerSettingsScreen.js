import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSpectrometer } from '../context/SpectrometerContext';
import { exportToCsv } from '../utils/spectrometerMath';

export default function SpectrometerSettingsScreen() {
  const {
    whiteRef,
    resetWhiteReference,
    calibrationGain,
    setCalibrationGain,
    mode,
    setMode,
    spotSize,
    setSpotSize,
    units,
    setUnits,
    whiteBalancePreset,
    setWhiteBalancePreset,
    displayPrefs,
    setDisplayPrefs,
    measurements,
  } = useSpectrometer();

  const handleGainChange = (delta) => {
    const nextGain = Math.max(0.1, Math.min(10.0, Math.round((calibrationGain + delta) * 10) / 10));
    setCalibrationGain(nextGain);
  };

  const handleExportCsv = async () => {
    if (measurements.length === 0) {
      Alert.alert('No History', 'There are no saved measurements to export.');
      return;
    }
    const csvData = exportToCsv(measurements);
    try {
      await Share.share({
        message: csvData,
        title: 'Spectrometer_Export.csv',
      });
    } catch (err) {
      console.warn('CSV export error:', err);
    }
  };

  const handleConfirmResetCalibration = () => {
    Alert.alert(
      'Reset Calibration',
      'Are you sure you want to reset white reference and gain factor back to factory default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Defaults',
          style: 'destructive',
          onPress: () => {
            resetWhiteReference();
            setCalibrationGain(1.0);
            setWhiteBalancePreset('auto');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Spectrometer Settings</Text>
        <Text style={styles.headerSub}>Calibration & Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>White Balance & Calibration</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-filter-outline" size={20} color="#0891B2" />
              <View>
                <Text style={styles.itemTitle}>White Reference</Text>
                <Text style={styles.itemSub}>
                  {whiteRef
                    ? `Calibrated (R:${whiteRef.r}, G:${whiteRef.g}, B:${whiteRef.b})`
                    : 'Uncalibrated (Factory D65)'}
                </Text>
              </View>
            </View>
            {whiteRef ? (
              <TouchableOpacity style={styles.smallResetBtn} onPress={resetWhiteReference}>
                <Text style={styles.smallResetText}>Reset</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.activeTag}>Auto D65</Text>
            )}
          </View>

          <View style={[styles.rowBetween, styles.borderTop]}>
            <View style={styles.rowLeft}>
              <Ionicons name="options-outline" size={20} color="#D97706" />
              <View>
                <Text style={styles.itemTitle}>Sensor Lux Gain Multiplier</Text>
                <Text style={styles.itemSub}>Calibrate luminance scaling factor</Text>
              </View>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => handleGainChange(-0.1)}>
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperVal}>{calibrationGain.toFixed(1)}x</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => handleGainChange(0.1)}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.columnBox, styles.borderTop]}>
            <Text style={styles.itemTitle}>White Balance Reference Mode</Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'auto', label: 'Auto (D65)' },
                { id: 'tungsten', label: 'Tungsten (3200K)' },
                { id: 'daylight', label: 'Daylight (5500K)' },
                { id: 'cloudy', label: 'Cloudy (6500K)' },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetChip, whiteBalancePreset === preset.id && styles.presetChipActive]}
                  onPress={() => setWhiteBalancePreset(preset.id)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      whiteBalancePreset === preset.id && styles.presetChipTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Measurement Configuration</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemTitle}>Light Level Unit</Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, units.light === 'lux' && styles.toggleBtnActive]}
                onPress={() => setUnits({ light: 'lux' })}
              >
                <Text style={[styles.toggleText, units.light === 'lux' && styles.toggleTextActive]}>
                  Lux (lx)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, units.light === 'fc' && styles.toggleBtnActive]}
                onPress={() => setUnits({ light: 'fc' })}
              >
                <Text style={[styles.toggleText, units.light === 'fc' && styles.toggleTextActive]}>
                  Foot-candles
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.rowBetween, styles.borderTop]}>
            <Text style={styles.itemTitle}>Measurement Target Mode</Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'direct' && styles.toggleBtnActive]}
                onPress={() => setMode('direct')}
              >
                <Text style={[styles.toggleText, mode === 'direct' && styles.toggleTextActive]}>
                  Direct Source
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'reflected' && styles.toggleBtnActive]}
                onPress={() => setMode('reflected')}
              >
                <Text style={[styles.toggleText, mode === 'reflected' && styles.toggleTextActive]}>
                  Reflected Surface
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.rowBetween, styles.borderTop]}>
            <Text style={styles.itemTitle}>Target Spot Size</Text>
            <View style={styles.toggleGroup}>
              {['small', 'medium', 'full'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.toggleBtn, spotSize === s && styles.toggleBtnActive]}
                  onPress={() => setSpotSize(s)}
                >
                  <Text style={[styles.toggleText, spotSize === s && styles.toggleTextActive]}>
                    {s === 'small' ? '20px' : s === 'medium' ? '60px' : 'Full'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Display & CIE Overlays</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemTitle}>Show sRGB Gamut Triangle</Text>
            <Switch
              value={displayPrefs.showGamut}
              onValueChange={(val) => setDisplayPrefs({ showGamut: val })}
              trackColor={{ false: '#E5E5EA', true: '#0891B2' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowBetween, styles.borderTop]}>
            <Text style={styles.itemTitle}>Show Planckian Blackbody Curve</Text>
            <Switch
              value={displayPrefs.showPlanckian}
              onValueChange={(val) => setDisplayPrefs({ showPlanckian: val })}
              trackColor={{ false: '#E5E5EA', true: '#0891B2' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowBetween, styles.borderTop]}>
            <Text style={styles.itemTitle}>Show D65 Reference Point</Text>
            <Switch
              value={displayPrefs.showD65}
              onValueChange={(val) => setDisplayPrefs({ showD65: val })}
              trackColor={{ false: '#E5E5EA', true: '#0891B2' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Data & Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRowBtn} onPress={handleExportCsv}>
            <Ionicons name="download-outline" size={20} color="#0891B2" />
            <Text style={styles.actionRowText}>Export All Measurements to CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRowBtn, styles.borderTop]} onPress={handleConfirmResetCalibration}>
            <Ionicons name="refresh-outline" size={20} color="#FF9800" />
            <Text style={[styles.actionRowText, { color: '#FF9800' }]}>Reset All Calibration Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guideCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0891B2" />
          <Text style={styles.guideText}>
            Tip for best accuracy: To calibrate white balance in Reflected Mode, point the target reticle at a clean white sheet of paper or 18% neutral gray card under your test light and tap "Calibrate White".
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  topHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#6E6E73', fontSize: 11 },
  scrollContent: { padding: 12, paddingBottom: 30 },

  sectionHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemTitle: { color: '#1C1C1E', fontSize: 14, fontWeight: '700' },
  itemSub: { color: '#6E6E73', fontSize: 11, marginTop: 2 },
  activeTag: { color: '#0891B2', fontSize: 12, fontWeight: '700' },
  smallResetBtn: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  smallResetText: { color: '#FF453A', fontSize: 12, fontWeight: '700' },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#1C1C1E', fontSize: 18, fontWeight: '700' },
  stepperVal: { color: '#1C1C1E', fontSize: 14, fontWeight: '800', minWidth: 36, textAlign: 'center' },

  columnBox: { paddingVertical: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  presetChip: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: { backgroundColor: '#0891B2' },
  presetChipText: { color: '#555555', fontSize: 12, fontWeight: '600' },
  presetChipTextActive: { color: '#FFFFFF', fontWeight: '800' },

  toggleGroup: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#0891B2' },
  toggleText: { color: '#555555', fontSize: 11, fontWeight: '600' },
  toggleTextActive: { color: '#FFFFFF', fontWeight: '800' },

  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  actionRowText: { color: '#1C1C1E', fontSize: 14, fontWeight: '700' },

  guideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  guideText: { color: '#6E6E73', fontSize: 12, flex: 1, lineHeight: 16 },
});
