import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useLiveColorTempMeter } from '../engine/useLiveColorTempMeter';
import { useMeasurements } from '../context/MeasurementsContext';

export default function CalibrationScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const {
    facing,
    setFacing,
    calibrationOffsetK,
    saveCalibrationOffset,
    resetCalibrationOffset,
    flashCct,
    setFlashCct,
  } = useMeasurements();

  const reading = useLiveColorTempMeter(cameraRef, { calibrationOffsetK: 0 });

  const [knownK, setKnownK] = useState('5500');
  const [flashInput, setFlashInput] = useState(String(flashCct));

  const applyCalibration = () => {
    const known = parseFloat(knownK);
    if (isNaN(known) || reading.cctRaw == null) return;
    saveCalibrationOffset(facing, known - reading.cctRaw);
  };

  const applyFlashCct = () => {
    const v = parseFloat(flashInput);
    if (!isNaN(v) && v > 0) setFlashCct(v);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Calibration needs camera access.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Calibration</Text>
        <TouchableOpacity onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}>
          <Ionicons name="camera-reverse-outline" size={22} color="#E64A19" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
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

        <View style={styles.previewCard}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        </View>

        <View style={styles.rawBlock}>
          <Text style={styles.rawLabel}>Current raw reading ({facing === 'front' ? 'Front' : 'Back'})</Text>
          <Text style={styles.rawValue}>
            {reading.cctRaw != null ? `${Math.round(reading.cctRaw)}K` : 'Reading...'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Calibrate Against a Known Source ({facing === 'front' ? 'Front' : 'Back'})</Text>
        <Text style={styles.sectionHint}>
          Aim the selected camera at a white surface lit by a light source of known color temperature, then enter its true Kelvin value.
        </Text>

        <View style={styles.rowInput}>
          <TextInput
            style={styles.input}
            value={knownK}
            onChangeText={setKnownK}
            keyboardType="number-pad"
            placeholder="e.g. 5500"
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={applyCalibration}>
            <Text style={styles.applyText}>Calibrate</Text>
          </TouchableOpacity>
        </View>

        {calibrationOffsetK !== 0 && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => resetCalibrationOffset(facing)}>
            <Text style={styles.resetText}>
              Reset {facing === 'front' ? 'Front' : 'Back'} Camera Offset (currently {calibrationOffsetK > 0 ? '+' : ''}{Math.round(calibrationOffsetK)}K)
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Flash Baseline Color Temperature</Text>
        <Text style={styles.sectionHint}>
          Enter your speedlight or strobe baseline color temperature (default 5600K) to calculate accurate gel recommendations.
        </Text>

        <View style={styles.rowInput}>
          <TextInput
            style={styles.input}
            value={flashInput}
            onChangeText={setFlashInput}
            keyboardType="number-pad"
            placeholder="e.g. 5600"
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={applyFlashCct}>
            <Text style={styles.applyText}>Set Flash K</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  permissionContainer: { flex: 1, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#1C1C1E', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#E64A19', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '700' },

  topBar: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#1C1C1E', fontSize: 20, fontWeight: '800' },

  cameraToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginTop: 16,
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
    backgroundColor: '#E64A19',
  },
  cameraToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cameraToggleTextActive: {
    color: '#FFFFFF',
  },

  previewCard: { marginHorizontal: 16, marginTop: 12, height: 160, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000000' },
  rawBlock: { alignItems: 'center', marginTop: 12 },
  rawLabel: { color: '#8E8E93', fontSize: 12 },
  rawValue: { color: '#1C1C1E', fontSize: 24, fontWeight: '800', marginTop: 2 },

  sectionTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginTop: 20 },
  sectionHint: { color: '#6E6E73', fontSize: 13, marginHorizontal: 16, marginTop: 4, lineHeight: 18 },

  rowInput: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12 },
  input: { flex: 1, backgroundColor: '#FFFFFF', color: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  applyBtn: { backgroundColor: '#E64A19', paddingHorizontal: 18, borderRadius: 10, justifyContent: 'center' },
  applyText: { color: '#FFFFFF', fontWeight: '700' },

  resetBtn: { marginHorizontal: 16, marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  resetText: { color: '#E64A19', fontSize: 13, fontWeight: '600' },
});
