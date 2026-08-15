import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import KelvinGauge from '../components/KelvinGauge';
import DuvBar from '../components/DuvBar';
import { useLiveColorTempMeter } from '../engine/useLiveColorTempMeter';
import { useMeasurements } from '../context/MeasurementsContext';
import { suggestWhiteBalance } from '../engine/whiteBalance';
import { recommendFlashGel } from '../engine/flashGel';
import { cctToMired } from '../engine/colorScience';

export default function HomeScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [knownKInput, setKnownKInput] = useState('5500');

  const {
    facing,
    setFacing,
    calibrationOffsetK,
    saveCalibrationOffset,
    resetCalibrationOffset,
    flashCct,
    saveMeasurement,
  } = useMeasurements();

  const reading = useLiveColorTempMeter(cameraRef, { paused, calibrationOffsetK });

  const cct = reading.cct;
  const mired = cctToMired(cct);
  const wb = suggestWhiteBalance(cct);
  const gel = recommendFlashGel(cct, flashCct);

  const handleSave = () => {
    if (cct == null) return;
    saveMeasurement({
      cctRaw: reading.cctRaw,
      cct,
      duv: reading.duv,
      xy: reading.xy,
      mired,
      wbLabel: wb?.label,
      gelLabel: gel.label,
    });
  };

  const handleCalibrateToTarget = () => {
    const known = parseFloat(knownKInput);
    if (isNaN(known) || known <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid positive number for reference Kelvin value.');
      return;
    }
    if (reading.cctRaw == null) {
      Alert.alert('No Reading', 'Waiting for camera reading before calibrating...');
      return;
    }
    const newOffset = known - reading.cctRaw;
    saveCalibrationOffset(facing, newOffset);
    Alert.alert(
      'Calibrated!',
      `${facing === 'front' ? 'Front' : 'Back'} camera calibration offset set to ${newOffset > 0 ? '+' : ''}${Math.round(newOffset)}K.`
    );
  };

  const handleResetCalibration = () => {
    resetCalibrationOffset(facing);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Color Temperature Meter needs camera access.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canGoBack = navigation?.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#E64A19" />
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>Color Temperature Meter</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} style={{ marginRight: 14 }}>
            <Ionicons name="camera-reverse-outline" size={22} color="#E64A19" />
          </TouchableOpacity>
          <Ionicons name="ribbon-outline" size={20} color="#E64A19" style={{ marginRight: 14 }} />
          <Ionicons name="information-circle-outline" size={22} color="#E64A19" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.gaugeCard}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save-outline" size={18} color="#E64A19" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <KelvinGauge cct={cct} size={300} />

          <View style={styles.readout}>
            <Text style={styles.cctValue}>{cct != null ? `${cct} K` : '—'}</Text>
            <Text style={styles.miredValue}>
              {mired != null ? `${mired.toFixed(0)} Mired` : '—'}
              {calibrationOffsetK !== 0 ? ` (${calibrationOffsetK > 0 ? '+' : ''}${Math.round(calibrationOffsetK)}K cal)` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Green / Magenta Tint (Duv)</Text>
          <DuvBar duv={reading.duv} />
          <Text style={styles.duvValue}>
            {reading.duv != null ? `${reading.duv > 0 ? '+' : ''}${reading.duv.toFixed(4)} Duv` : '—'}
          </Text>
        </View>

        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>CAMERA CHOICE</Text>
        </View>
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

        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>
            KELVIN CALIBRATION ({facing === 'front' ? 'FRONT' : 'BACK'})
          </Text>
        </View>
        <View style={styles.calibCard}>
          <View style={styles.calibHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.calibLabel}>Offset: </Text>
              <Text style={styles.calibValue}>
                {calibrationOffsetK > 0 ? '+' : ''}{Math.round(calibrationOffsetK)}K
              </Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetCalibration}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calibActionRow}>
            <View style={styles.calibInputWrap}>
              <Text style={styles.calibSubLabel}>Known Light Temp (K):</Text>
              <TextInput
                style={styles.calibInput}
                value={knownKInput}
                onChangeText={setKnownKInput}
                keyboardType="numeric"
                placeholder="e.g. 5500"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrateToTarget}>
              <Text style={styles.calibrateBtnText}>Calibrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Camera White Balance Preset</Text>
          <Text style={styles.recValue}>{wb ? wb.label : '—'}</Text>
          <Text style={styles.recSub}>
            Set your camera WB to this preset to capture natural neutral colors.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Flash Gel Recommendation ({flashCct}K Flash)</Text>
          <Text style={styles.recValue}>{gel.label}</Text>
          <Text style={styles.recSub}>{gel.description}</Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Live Camera Preview ({facing === 'front' ? 'Front' : 'Back'})</Text>
          <View style={styles.previewBox}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
            <View style={styles.centerTarget} />
          </View>
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
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: { color: '#E64A19', fontSize: 20, fontWeight: '800' },
  topIcons: { flexDirection: 'row', alignItems: 'center' },

  gaugeCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  saveBtn: { position: 'absolute', top: 12, right: 16, alignItems: 'center', zIndex: 2 },
  saveText: { color: '#E64A19', fontSize: 11, marginTop: 2, fontWeight: '600' },

  readout: { alignItems: 'center', marginTop: -10 },
  cctValue: { color: '#1C1C1E', fontSize: 36, fontWeight: '800' },
  miredValue: { color: '#8E8E93', fontSize: 13, marginTop: -2 },

  card: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardHeader: { color: '#8E8E93', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  duvValue: { color: '#1C1C1E', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4 },

  sectionHeaderWrap: { marginHorizontal: 16, marginTop: 14, marginBottom: 4 },
  sectionHeader: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  cameraToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 14,
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

  calibCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calibHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calibLabel: { color: '#1C1C1E', fontSize: 14, fontWeight: '600' },
  calibValue: { color: '#E64A19', fontSize: 16, fontWeight: '800' },
  resetBtn: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resetBtnText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },

  calibActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  calibInputWrap: { flex: 1 },
  calibSubLabel: { color: '#6E6E73', fontSize: 12, marginBottom: 4 },
  calibInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1C1C1E',
  },
  calibrateBtn: {
    backgroundColor: '#E64A19',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  calibrateBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  recValue: { color: '#E64A19', fontSize: 18, fontWeight: '800', marginTop: 6 },
  recSub: { color: '#6E6E73', fontSize: 12, marginTop: 2, lineHeight: 16 },

  previewCard: { marginHorizontal: 14, marginTop: 10, height: 160 },
  previewLabel: { color: '#8E8E93', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  previewBox: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000000', position: 'relative' },
  centerTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
  },
});
