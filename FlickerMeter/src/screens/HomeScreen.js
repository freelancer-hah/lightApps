import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FlickerGauge from '../components/FlickerGauge';
import CalibrationBar from '../components/CalibrationBar';
import WaveExplainer from '../components/WaveExplainer';
import CalibrationModal from '../components/CalibrationModal';
import { useLiveFlickerMeter } from '../engine/useLiveFlickerMeter';
import { useMeasurements } from '../context/MeasurementsContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [calibOpen, setCalibOpen] = useState(false);
  const [targetPercentInput, setTargetPercentInput] = useState('25');

  const {
    calibrationHz,
    calibrationRate,
    calibrateK,
    saveMeasurement,
    facing,
    setFacing,
    calibrationFactor,
    saveCalibration,
    resetCalibration,
  } = useMeasurements();

  const { percent, frequency, risk, rawSamples } = useLiveFlickerMeter(cameraRef, {
    calibrationHz,
    calibrationRate,
    calibrationFactor,
  });

  const handleSave = () => {
    if (percent == null) return;
    saveMeasurement({ percent, frequency, riskLabel: risk.label, calibrationHz });
  };

  const handleCalibrateToTarget = () => {
    const targetVal = parseFloat(targetPercentInput);
    if (isNaN(targetVal) || targetVal <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid positive number for target flicker percentage.');
      return;
    }
    if (!percent || percent <= 0) {
      Alert.alert('No Reading', 'Waiting for camera reading before calibrating...');
      return;
    }
    const newFactor = (calibrationFactor * targetVal) / percent;
    saveCalibration(facing, newFactor);
    Alert.alert(
      'Calibrated!',
      `${facing === 'front' ? 'Front' : 'Back'} camera calibration factor set to ${(Math.round(newFactor * 1000) / 1000).toFixed(3)}x.`
    );
  };

  const handleResetCalibration = () => {
    resetCalibration(facing);
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Flicker Meter needs camera access to measure light.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
              <Ionicons name="arrow-back" size={26} color="#16A34A" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Flicker Meter</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} style={{ marginRight: 14 }}>
            <Ionicons name="camera-reverse-outline" size={24} color="#16A34A" />
          </TouchableOpacity>
          <Ionicons name="ribbon-outline" size={22} color="#16A34A" style={{ marginRight: 14 }} />
          <Ionicons name="information-circle-outline" size={24} color="#16A34A" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Main Showcase Card: Camera View + Gauge Together in Middle */}
        <View style={styles.mainShowcaseCard}>
          <View style={styles.showcaseHeaderRow}>
            <Text style={styles.showcaseTitle}>LIVE CAMERA & FLICKER GAUGE</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="save-outline" size={18} color="#16A34A" />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Integrated Live Camera View */}
          <View style={styles.cameraBox}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} animateShutter={false} />
            <View style={styles.centerTarget} />
            <View style={styles.cameraBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.cameraBadgeText}>{facing === 'front' ? 'FRONT CAMERA' : 'BACK CAMERA'}</Text>
            </View>
          </View>

          {/* Integrated Flicker Gauge */}
          <View style={styles.gaugeContainer}>
            <FlickerGauge value={percent ?? 0} size={250} />
          </View>

          <View style={styles.readout}>
            <Text style={styles.percentValue}>{percent != null ? `${percent.toFixed(0)}%` : '—'}</Text>
            <Text style={styles.percentLabel}>Flickering</Text>
          </View>

          <TouchableOpacity style={styles.calibRow} onPress={() => setCalibOpen(true)}>
            <Text style={styles.calibText}>Calibrate Frequency</Text>
            <Ionicons name="settings-outline" size={16} color="#8E8E93" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          <Text style={styles.freqValue}>
            {frequency != null ? `${frequency.toFixed(0)} Hz (near ${calibrationHz}Hz mains)` : `Calibrated to ${calibrationHz}Hz`}
          </Text>

          <CalibrationBar />
        </View>

        {/* All Remaining Sections Underneath */}
        <WaveExplainer message={risk.message || 'Point the camera at an evenly-lit surface to begin.'} riskLabel={risk.label} />

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
            FLICKER CALIBRATION ({facing === 'front' ? 'FRONT' : 'BACK'})
          </Text>
        </View>
        <View style={styles.calibCard}>
          <View style={styles.calibHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.calibLabel}>Gain Factor: </Text>
              <Text style={styles.calibValue}>{calibrationFactor.toFixed(3)}x</Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetCalibration}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calibActionRow}>
            <View style={styles.calibInputWrap}>
              <Text style={styles.calibSubLabel}>Physical Meter Reading (%):</Text>
              <TextInput
                style={styles.calibInput}
                value={targetPercentInput}
                onChangeText={setTargetPercentInput}
                keyboardType="numeric"
                placeholder="e.g. 25"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrateToTarget}>
              <Text style={styles.calibrateBtnText}>Calibrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CalibrationModal
        visible={calibOpen}
        currentHz={calibrationHz}
        onClose={() => setCalibOpen(false)}
        onSave={(hz) => {
          calibrateK(hz, rawSamples);
          setCalibOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  permissionContainer: { flex: 1, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#1C1C1E', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#16A34A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '700' },

  topBar: {
    paddingTop: 46,
    paddingBottom: 6,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#16A34A', fontSize: 26, fontWeight: '800' },
  topIcons: { flexDirection: 'row', alignItems: 'center' },

  content: {
    flex: 1,
  },

  mainShowcaseCard: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  showcaseHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  showcaseTitle: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#DCFCE7', borderRadius: 12 },
  saveText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },

  cameraBox: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
    marginBottom: 8,
  },
  centerTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: 8,
  },
  cameraBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  cameraBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
  },

  readout: { alignItems: 'center', marginTop: -14 },
  percentValue: { color: '#16A34A', fontSize: 34, fontWeight: '800' },
  percentLabel: { color: '#6E6E73', fontSize: 16, fontWeight: '700', marginTop: -6 },

  calibRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  calibText: { color: '#6E6E73', fontSize: 15, fontWeight: '600' },
  freqValue: { color: '#8E8E93', fontSize: 12, marginTop: 2, marginBottom: 6 },

  sectionHeaderWrap: { marginHorizontal: 16, marginTop: 18, marginBottom: 6 },
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
    backgroundColor: '#16A34A',
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
  calibValue: { color: '#16A34A', fontSize: 16, fontWeight: '800' },
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
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  calibrateBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
