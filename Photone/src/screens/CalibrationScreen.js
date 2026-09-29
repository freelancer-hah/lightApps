import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoneContext } from '../context/PhotoneContext';
import { usePhotoneEngine } from '../engine/usePhotoneEngine';
import { DEFAULT_FRONT_CALIB, DEFAULT_BACK_CALIB, DEFAULT_DIFFUSER_FACTOR } from '../engine/luxMath';

export default function CalibrationScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const {
    facing,
    setFacing,
    frontCalib,
    backCalib,
    frontCctOffset,
    backCctOffset,
    activeCalibrationFactor,
    activeCctOffset,
    diffuserOn,
    toggleDiffuser,
    diffuserMultiplier,
    updateDiffuserMultiplier,
    updateCalibration,
    updateCctOffset,
    resetCalibration,
    lightSourceId,
    photoperiodHours,
  } = usePhotoneContext();

  const reading = usePhotoneEngine(cameraRef, {
    paused: false,
    calibrationFactor: activeCalibrationFactor,
    cctOffsetK: activeCctOffset,
    lightSourceId,
    diffuserOn,
    diffuserMultiplier,
    photoperiodHours,
  });

  const [targetPpfdInput, setTargetPpfdInput] = useState('');
  const [targetLuxInput, setTargetLuxInput] = useState('');
  const [knownCctInput, setKnownCctInput] = useState('');
  const [customDiffuserInput, setCustomDiffuserInput] = useState(diffuserMultiplier.toString());

  const handleCalibratePpfd = () => {
    const target = parseFloat(targetPpfdInput);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid positive PPFD number (e.g. 500 µmol).');
      return;
    }
    if (!reading.ppfd || reading.ppfd <= 0) {
      Alert.alert('No Reading', 'Waiting for camera frame reading before calibrating...');
      return;
    }

    const newFactor = (activeCalibrationFactor * target) / reading.ppfd;
    updateCalibration(facing, Math.round(newFactor * 1000) / 1000);
    Alert.alert(
      'Calibration Saved!',
      `${facing === 'front' ? 'Front' : 'Back'} camera PPFD factor set to ${newFactor.toFixed(3)}x.`
    );
    setTargetPpfdInput('');
  };

  const handleCalibrateLux = () => {
    const target = parseFloat(targetLuxInput);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid positive Lux number (e.g. 25000 lux).');
      return;
    }
    if (!reading.lux || reading.lux <= 0) {
      Alert.alert('No Reading', 'Waiting for camera frame reading before calibrating...');
      return;
    }

    const newFactor = (activeCalibrationFactor * target) / reading.lux;
    updateCalibration(facing, Math.round(newFactor * 1000) / 1000);
    Alert.alert(
      'Calibration Saved!',
      `${facing === 'front' ? 'Front' : 'Back'} camera Lux factor set to ${newFactor.toFixed(3)}x.`
    );
    setTargetLuxInput('');
  };

  const handleCalibrateCct = () => {
    const known = parseFloat(knownCctInput);
    if (isNaN(known) || known < 1000) {
      Alert.alert('Invalid Kelvin', 'Please enter a valid color temperature (e.g. 4000K).');
      return;
    }
    if (!reading.cctRaw) {
      Alert.alert('No Reading', 'Waiting for camera color temperature sampling...');
      return;
    }

    const offset = known - reading.cctRaw;
    updateCctOffset(facing, Math.round(offset));
    Alert.alert(
      'CCT Offset Saved!',
      `${facing === 'front' ? 'Front' : 'Back'} camera CCT offset set to ${Math.round(offset)}K.`
    );
    setKnownCctInput('');
  };

  const handleSetDiffuserMultiplier = () => {
    const val = parseFloat(customDiffuserInput);
    if (isNaN(val) || val < 1.0 || val > 5.0) {
      Alert.alert('Invalid Multiplier', 'Please enter a valid factor between 1.0 and 5.0 (default ~2.25).');
      return;
    }
    updateDiffuserMultiplier(val);
    Alert.alert('Diffuser Factor Updated', `Paper diffuser correction multiplier set to ${val.toFixed(2)}x.`);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Calibration',
      `Are you sure you want to reset ${facing === 'front' ? 'Front' : 'Back'} camera calibration parameters to factory defaults?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetCalibration(facing);
            setCustomDiffuserInput(DEFAULT_DIFFUSER_FACTOR.toString());
          },
        },
      ]
    );
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={40} color="#00E676" />
        <Text style={styles.permissionText}>Calibration requires camera access.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Sensor Calibration</Text>
        <Text style={styles.subtitle}>Calibrate against a reference PAR/Lux meter</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Camera Facing Selector */}
        <View style={styles.cameraToggleContainer}>
          <TouchableOpacity
            style={[styles.cameraToggleBtn, facing === 'front' && styles.cameraToggleBtnActive]}
            onPress={() => setFacing('front')}
          >
            <Ionicons name="person-outline" size={16} color={facing === 'front' ? '#0F172A' : '#94A3B8'} />
            <Text style={[styles.cameraToggleText, facing === 'front' && styles.cameraToggleTextActive]}>
              Front Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraToggleBtn, facing === 'back' && styles.cameraToggleBtnActive]}
            onPress={() => setFacing('back')}
          >
            <Ionicons name="camera-outline" size={16} color={facing === 'back' ? '#0F172A' : '#94A3B8'} />
            <Text style={[styles.cameraToggleText, facing === 'back' && styles.cameraToggleTextActive]}>
              Back Camera
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Preview Window */}
        <View style={styles.previewCard}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} animateShutter={false} />
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>
              ACTIVE: {facing.toUpperCase()} CAMERA
            </Text>
          </View>
        </View>

        {/* Live Raw Readings Panel */}
        <View style={styles.rawCard}>
          <Text style={styles.rawTitle}>Current Live Reading ({facing === 'front' ? 'Front' : 'Back'})</Text>
          <View style={styles.rawMetricsRow}>
            <View style={styles.rawMetricItem}>
              <Text style={styles.rawVal}>{reading.ppfd != null ? Math.round(reading.ppfd) : '—'}</Text>
              <Text style={styles.rawLabel}>PPFD (µmol)</Text>
            </View>
            <View style={styles.rawMetricItem}>
              <Text style={[styles.rawVal, { color: '#F59E0B' }]}>
                {reading.lux != null ? Math.round(reading.lux) : '—'}
              </Text>
              <Text style={styles.rawLabel}>Lux</Text>
            </View>
            <View style={styles.rawMetricItem}>
              <Text style={[styles.rawVal, { color: '#C084FC' }]}>
                {reading.cct != null ? `${Math.round(reading.cct)}K` : '—'}
              </Text>
              <Text style={styles.rawLabel}>CCT (Kelvin)</Text>
            </View>
          </View>
          <Text style={styles.factorSub}>
            Current Factor: {activeCalibrationFactor.toFixed(3)}x | Offset: {activeCctOffset > 0 ? '+' : ''}{activeCctOffset}K
          </Text>
        </View>

        {/* 1. PPFD Target Calibration */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Calibrate Against Reference PAR Meter</Text>
          <Text style={styles.sectionHint}>
            Place a piece of 80g/m² white printer paper over the camera lens. Aim at your grow light alongside a trusted quantum PAR meter and enter the reference PPFD.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={targetPpfdInput}
              onChangeText={setTargetPpfdInput}
              keyboardType="number-pad"
              placeholder="Target PPFD (e.g. 500)"
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleCalibratePpfd}>
              <Text style={styles.applyText}>Calibrate PPFD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Lux Calibration */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Calibrate Against Lux Meter</Text>
          <Text style={styles.sectionHint}>
            Enter the exact illuminance reading from a standard lux meter.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={targetLuxInput}
              onChangeText={setTargetLuxInput}
              keyboardType="number-pad"
              placeholder="Target Lux (e.g. 25000)"
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleCalibrateLux}>
              <Text style={styles.applyText}>Calibrate Lux</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Paper Diffuser Correction Factor */}
        <View style={styles.sectionCard}>
          <View style={styles.diffuserHeader}>
            <Text style={styles.sectionTitle}>3. Paper Diffuser Multiplier</Text>
            <TouchableOpacity style={styles.toggleDiffChip} onPress={toggleDiffuser}>
              <Text style={styles.toggleDiffText}>{diffuserOn ? 'Diffuser: ON' : 'Diffuser: OFF'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHint}>
            Standard 80g/m² white printer paper diffuses direct light to prevent camera sensor saturation (default factor ~2.25x).
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={customDiffuserInput}
              onChangeText={setCustomDiffuserInput}
              keyboardType="decimal-pad"
              placeholder="Diffuser Multiplier (e.g. 2.25)"
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleSetDiffuserMultiplier}>
              <Text style={styles.applyText}>Set Factor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. CCT Kelvin Offset */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Color Temperature (CCT) Calibration</Text>
          <Text style={styles.sectionHint}>
            Aim at a light source of known color temperature (e.g., 4000K grow light) and enter its true Kelvin value.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={knownCctInput}
              onChangeText={setKnownCctInput}
              keyboardType="number-pad"
              placeholder="Known CCT (e.g. 4000)"
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleCalibrateCct}>
              <Text style={styles.applyText}>Set CCT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={18} color="#EF4444" />
          <Text style={styles.resetText}>
            Reset {facing === 'front' ? 'Front' : 'Back'} Camera to Defaults
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionText: { color: '#F8FAFC', fontSize: 16, textAlign: 'center', marginVertical: 16 },
  permissionButton: { backgroundColor: '#00E676', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  permissionButtonText: { color: '#0F172A', fontWeight: '800' },

  topBar: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#00E676', fontSize: 12, fontWeight: '700', marginTop: 2 },

  scrollContent: { paddingBottom: 50 },

  cameraToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
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
  cameraToggleBtnActive: { backgroundColor: '#00E676' },
  cameraToggleText: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  cameraToggleTextActive: { color: '#0F172A' },

  previewCard: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00000088',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewBadgeText: { color: '#00E676', fontSize: 10, fontWeight: '800' },

  rawCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rawTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  rawMetricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  rawMetricItem: { alignItems: 'center' },
  rawVal: { color: '#00E676', fontSize: 20, fontWeight: '900' },
  rawLabel: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 2 },
  factorSub: { color: '#CBD5E1', fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },

  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  diffuserHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleDiffChip: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  toggleDiffText: { color: '#00E676', fontSize: 11, fontWeight: '800' },
  sectionTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  sectionHint: { color: '#94A3B8', fontSize: 12, marginTop: 4, lineHeight: 16 },
  inputRow: { flexDirection: 'row', marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontWeight: '700',
  },
  applyBtn: { backgroundColor: '#00E676', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  applyText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF444466',
    gap: 8,
  },
  resetText: { color: '#EF4444', fontSize: 13, fontWeight: '800' },
});
