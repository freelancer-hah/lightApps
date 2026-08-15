import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  const { calibrationHz, calibrationRate, calibrateK, saveMeasurement } = useMeasurements();
  const { percent, frequency, risk, rawSamples } = useLiveFlickerMeter(cameraRef, { calibrationHz, calibrationRate });

  const handleSave = () => {
    if (percent == null) return;
    saveMeasurement({ percent, frequency, riskLabel: risk.label, calibrationHz });
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
          <Ionicons name="ribbon-outline" size={22} color="#16A34A" style={{ marginRight: 16 }} />
          <Ionicons name="information-circle-outline" size={24} color="#16A34A" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.gaugeCard}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#16A34A" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <FlickerGauge value={percent ?? 0} size={220} />

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

        <WaveExplainer message={risk.message || 'Point the camera at an evenly-lit surface to begin.'} riskLabel={risk.label} />

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Live Preview</Text>
          <View style={styles.previewBox}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />
          </View>
        </View>
      </View>

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
    paddingBottom: 16,
  },

  gaugeCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  saveBtn: { position: 'absolute', top: 12, right: 18, alignItems: 'center', zIndex: 2 },
  saveText: { color: '#16A34A', fontSize: 11, marginTop: 2, fontWeight: '600' },

  readout: { alignItems: 'center', marginTop: -20 },
  percentValue: { color: '#16A34A', fontSize: 34, fontWeight: '800' },
  percentLabel: { color: '#6E6E73', fontSize: 16, fontWeight: '700', marginTop: -6 },

  calibRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  calibText: { color: '#6E6E73', fontSize: 15, fontWeight: '600' },
  freqValue: { color: '#8E8E93', fontSize: 12, marginTop: 2, marginBottom: 6 },

  previewCard: { marginHorizontal: 14, marginTop: 8, flex: 1 },
  previewLabel: { color: '#6E6E73', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  previewBox: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
});
