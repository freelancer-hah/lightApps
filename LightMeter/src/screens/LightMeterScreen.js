import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import MeterScreenShell from '../components/MeterScreenShell';
import { useLightMeterEngine } from '../engine/useLightMeterEngine';
import { DEFAULT_CALIBRATION, luxToFootCandles } from '../engine/luxMath';

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
const ISOS = [100, 200, 400, 800, 1600, 3200];

const DEFAULT_FRONT_CALIB = DEFAULT_CALIBRATION; // 0.757 (185 lux reference)
const DEFAULT_BACK_CALIB = 2.5;

const STORAGE_KEY_FRONT = '@light_meter_calib_front';
const STORAGE_KEY_BACK = '@light_meter_calib_back';

export default function LightMeterScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('front');
  const [torchOn, setTorchOn] = useState(false);
  const [paused, setPaused] = useState(false);

  const [frontCalib, setFrontCalib] = useState(DEFAULT_FRONT_CALIB);
  const [backCalib, setBackCalib] = useState(DEFAULT_BACK_CALIB);
  const [targetLuxInput, setTargetLuxInput] = useState('185');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_FRONT).then((saved) => {
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) setFrontCalib(val);
      }
    });
    AsyncStorage.getItem(STORAGE_KEY_BACK).then((saved) => {
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) setBackCalib(val);
      }
    });
  }, []);

  const calibrationFactor = facing === 'front' ? frontCalib : backCalib;

  const saveCalibration = (val) => {
    if (facing === 'front') {
      setFrontCalib(val);
      AsyncStorage.setItem(STORAGE_KEY_FRONT, val.toString()).catch(() => {});
    } else {
      setBackCalib(val);
      AsyncStorage.setItem(STORAGE_KEY_BACK, val.toString()).catch(() => {});
    }
  };

  const { reading } = useLightMeterEngine(cameraRef, { paused, calibrationFactor });

  const [manualAperture, setManualAperture] = useState('8');
  const [manualIso, setManualIso] = useState('100');

  const ev = reading.ev100;
  const lux = reading.lux;
  const fc = lux != null ? luxToFootCandles(lux) : null;

  let suggestedShutter = null;
  if (ev !== null && ev !== undefined) {
    const a = parseFloat(manualAperture) || 8;
    const iso = parseFloat(manualIso) || 100;
    const evAtIso = ev + Math.log2(iso / 100);
    const t = (a * a) / Math.pow(2, evAtIso);
    suggestedShutter = t;
  }

  function formatShutter(t) {
    if (!t || !isFinite(t)) return '—';
    if (t >= 1) return `${t.toFixed(1)}s`;
    return `1/${Math.round(1 / t)}s`;
  }

  const handleCalibrateToTarget = () => {
    const targetVal = parseFloat(targetLuxInput);
    if (isNaN(targetVal) || targetVal <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid positive number for target lux.');
      return;
    }
    if (!lux || lux <= 0) {
      Alert.alert('No Reading', 'Waiting for camera reading before calibrating...');
      return;
    }
    const newFactor = (calibrationFactor * targetVal) / lux;
    saveCalibration(Math.round(newFactor * 1000) / 1000);
    Alert.alert(
      'Calibrated!',
      `${facing === 'front' ? 'Front' : 'Back'} camera calibration factor set to ${newFactor.toFixed(3)}x.`
    );
  };

  const handleResetCalibration = () => {
    const defaultVal = facing === 'front' ? DEFAULT_FRONT_CALIB : DEFAULT_BACK_CALIB;
    saveCalibration(defaultVal);
  };

  return (
    <MeterScreenShell
      title="Light Meter"
      navigation={navigation}
      cameraRef={cameraRef}
      facing={facing}
      onToggleCamera={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
      torchOn={torchOn}
      onToggleTorch={() => setTorchOn((v) => !v)}
      paused={paused}
      onTogglePause={() => setPaused((v) => !v)}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bigReadout}>
          <Text style={styles.bigValue}>{lux != null ? lux.toFixed(0) : '—'}</Text>
          <Text style={styles.bigUnit}>lux</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>EV (ISO 100)</Text>
            <Text style={styles.statValue}>{ev != null ? ev.toFixed(2) : '—'}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Foot-candles</Text>
            <Text style={styles.statValue}>{fc != null ? fc.toFixed(1) : '—'}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>CAMERA CHOICE</Text>
        <View style={styles.cameraToggleContainer}>
          <TouchableOpacity
            style={[styles.cameraToggleBtn, facing === 'front' && styles.cameraToggleBtnActive]}
            onPress={() => setFacing('front')}
          >
            <Ionicons name="person-outline" size={16} color={facing === 'front' ? '#FFFFFF' : '#1C1C1E'} />
            <Text style={[styles.cameraToggleText, facing === 'front' && styles.cameraToggleTextActive]}>
              Front Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraToggleBtn, facing === 'back' && styles.cameraToggleBtnActive]}
            onPress={() => setFacing('back')}
          >
            <Ionicons name="camera-outline" size={16} color={facing === 'back' ? '#FFFFFF' : '#1C1C1E'} />
            <Text style={[styles.cameraToggleText, facing === 'back' && styles.cameraToggleTextActive]}>
              Back Camera
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>EXPOSURE CALCULATOR</Text>
        <View style={styles.calcRow}>
          <View style={styles.calcField}>
            <Text style={styles.calcLabel}>Aperture (f/)</Text>
            <TextInput
              style={styles.calcInput}
              value={manualAperture}
              onChangeText={setManualAperture}
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.calcField}>
            <Text style={styles.calcLabel}>ISO</Text>
            <TextInput
              style={styles.calcInput}
              value={manualIso}
              onChangeText={setManualIso}
              keyboardType="number-pad"
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.calcField}>
            <Text style={styles.calcLabel}>Shutter</Text>
            <Text style={styles.calcResult}>{formatShutter(suggestedShutter)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>
          LUX CALIBRATION ({facing === 'front' ? 'FRONT' : 'BACK'})
        </Text>
        <View style={styles.calibContainer}>
          <View style={styles.calibRow}>
            <Text style={styles.calibLabel}>Gain Factor:</Text>
            <Text style={styles.calibValue}>{calibrationFactor.toFixed(3)}x</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetCalibration}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calibActionRow}>
            <View style={styles.calibInputWrap}>
              <Text style={styles.calibSubLabel}>Physical Meter Reading (Lux):</Text>
              <TextInput
                style={styles.calibInput}
                value={targetLuxInput}
                onChangeText={setTargetLuxInput}
                keyboardType="numeric"
                placeholder="e.g. 185"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrateToTarget}>
              <Text style={styles.calibrateBtnText}>Calibrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </MeterScreenShell>
  );
}

const styles = StyleSheet.create({
  bigReadout: { alignItems: 'center', paddingVertical: 8 },
  bigValue: { color: '#1C1C1E', fontSize: 56, fontWeight: '200' },
  bigUnit: { color: '#8E8E93', fontSize: 16, marginTop: -4 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  statBlock: { alignItems: 'center' },
  statLabel: { color: '#8E8E93', fontSize: 12 },
  statValue: { color: '#1C1C1E', fontSize: 22, fontWeight: '600', marginTop: 2 },
  sectionHeader: { color: '#8E8E93', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  
  cameraToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 3,
    marginBottom: 4,
  },
  cameraToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  cameraToggleBtnActive: {
    backgroundColor: '#CA8A04',
  },
  cameraToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cameraToggleTextActive: {
    color: '#FFFFFF',
  },

  calcRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calcField: { flex: 1, marginHorizontal: 4 },
  calcLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  calcInput: {
    backgroundColor: '#FFFFFF',
    color: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calcResult: {
    backgroundColor: '#FFFFFF',
    color: '#CA8A04',
    borderRadius: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calibContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 20,
  },
  calibRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calibLabel: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  calibValue: { fontSize: 16, color: '#CA8A04', fontWeight: '700' },
  resetBtn: { backgroundColor: '#E5E5EA', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  resetBtnText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  calibActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  calibInputWrap: { flex: 1 },
  calibSubLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 4 },
  calibInput: {
    backgroundColor: '#F9F9FB',
    color: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calibrateBtn: {
    backgroundColor: '#CA8A04',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  calibrateBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
