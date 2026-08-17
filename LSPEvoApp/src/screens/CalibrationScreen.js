import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import BandGuideOverlay from '../components/BandGuideOverlay';
import { sampleBandStrip } from '../engine/frameSampler';
import { calibrateFromTwoPoints } from '../engine/spectrumAnalysis';
import { useAppState } from '../context/AppStateContext';
const REFERENCE_PRESETS = [
  { label: 'Fluorescent green (Hg 546nm)', wl: 546 },
  { label: 'Fluorescent violet (Hg 436nm)', wl: 436 },
  { label: 'Fluorescent blue-violet (Hg 405nm)', wl: 405 },
  { label: 'Red laser pointer (~650nm)', wl: 650 },
  { label: 'Green laser pointer (~532nm)', wl: 532 },
];

async function findPeakPixelIndex(cameraRef, bandRegion) {
  const pixels = await sampleBandStrip(cameraRef, bandRegion, 120);
  if (!pixels) return null;
  let bestIdx = 0, bestLum = -1;
  pixels.forEach((p, i) => {
    const lum = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
    if (lum > bestLum) { bestLum = lum; bestIdx = i; }
  });
  return bestIdx;
}

export default function CalibrationScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { bandRegion, setBandRegion, calibration, setCalibration, luxCalibrationFactor, setLuxCalibrationFactor } = useAppState();

  const [ref1, setRef1] = useState(null); // { pixelIndex, wl }
  const [ref2, setRef2] = useState(null);
  const [wl1Input, setWl1Input] = useState('546');
  const [wl2Input, setWl2Input] = useState('436');
  const [busy, setBusy] = useState(false);

  const captureRef = async (which) => {
    setBusy(true);
    try {
      const idx = await findPeakPixelIndex(cameraRef, bandRegion);
      if (idx == null) return;
      const wl = parseFloat(which === 1 ? wl1Input : wl2Input);
      if (isNaN(wl)) return;
      if (which === 1) setRef1({ pixelIndex: idx, wl });
      else setRef2({ pixelIndex: idx, wl });
    } finally {
      setBusy(false);
    }
  };

  const computeCalibration = () => {
    if (!ref1 || !ref2) return;
    const cal = calibrateFromTwoPoints(ref1.pixelIndex, ref1.wl, ref2.pixelIndex, ref2.wl);
    if (cal) setCalibration(cal);
  };

  const resetCalibration = () => {
    setCalibration({ a: null, b: 380, calibrated: false });
    setRef1(null);
    setRef2(null);
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
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.previewCard}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} animateShutter={false} />
          <BandGuideOverlay bandRegion={bandRegion} calibrated={calibration.calibrated} />
        </View>

        <Text style={styles.sectionTitle}>1. Position the Band Guide</Text>
        <Text style={styles.sectionHint}>
          Attach your CD grating over the lens (or use a slit + CD reflection
          setup) and adjust these sliders until the diffracted rainbow band
          sits inside the guide box above.
        </Text>
        {[
          { key: 'x', label: 'Horizontal position', min: 0, max: 0.8 },
          { key: 'y', label: 'Vertical position', min: 0, max: 0.85 },
          { key: 'w', label: 'Width', min: 0.2, max: 1 },
          { key: 'h', label: 'Height', min: 0.03, max: 0.3 },
        ].map((s) => (
          <View key={s.key} style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{s.label}: {bandRegion[s.key].toFixed(2)}</Text>
            <Slider
              minimumValue={s.min}
              maximumValue={s.max}
              value={bandRegion[s.key]}
              onValueChange={(v) => setBandRegion({ ...bandRegion, [s.key]: v })}
              minimumTrackTintColor="#6C86E0"
              maximumTrackTintColor="#3A3A3C"
              thumbTintColor="#FFFFFF"
            />
          </View>
        ))}

        <Text style={styles.sectionTitle}>2. Calibrate Against Known Wavelengths</Text>
        <Text style={styles.sectionHint}>
          Point the setup at a reference light with a known emission line
          (a fluorescent/CFL tube's mercury lines work well - pick a preset
          or enter a custom value), then capture it. Repeat with a second,
          different-wavelength reference. Two points are enough to
          calibrate the full band linearly - this is the diffuser
          attachment doing real work, not a cosmetic toggle.
        </Text>

        <View style={styles.presetRow}>
          {REFERENCE_PRESETS.map((p) => (
            <TouchableOpacity key={p.label} style={styles.presetChip} onPress={() => { setWl1Input(String(p.wl)); }}>
              <Text style={styles.presetChipText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.refBlock}>
          <View style={styles.refRow}>
            <TextInput style={styles.input} value={wl1Input} onChangeText={setWl1Input} keyboardType="decimal-pad" placeholderTextColor="#6E6E73" />
            <TouchableOpacity style={styles.captureBtn} onPress={() => captureRef(1)} disabled={busy}>
              <Text style={styles.captureBtnText}>Capture Ref 1</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.refStatus}>
            {ref1 ? `Captured: pixel ${ref1.pixelIndex} = ${ref1.wl}nm` : 'Not captured yet'}
          </Text>
        </View>

        <View style={styles.refBlock}>
          <View style={styles.refRow}>
            <TextInput style={styles.input} value={wl2Input} onChangeText={setWl2Input} keyboardType="decimal-pad" placeholderTextColor="#6E6E73" />
            <TouchableOpacity style={styles.captureBtn} onPress={() => captureRef(2)} disabled={busy}>
              <Text style={styles.captureBtnText}>Capture Ref 2</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.refStatus}>
            {ref2 ? `Captured: pixel ${ref2.pixelIndex} = ${ref2.wl}nm` : 'Not captured yet'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.applyBtn, (!ref1 || !ref2) && styles.applyBtnDisabled]}
          onPress={computeCalibration}
          disabled={!ref1 || !ref2}
        >
          <Text style={styles.applyBtnText}>Compute & Apply Calibration</Text>
        </TouchableOpacity>

        {calibration.calibrated && (
          <View style={styles.calibratedBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#3DDC5A" />
            <Text style={styles.calibratedText}>
              {'  '}Calibrated: {calibration.a.toFixed(2)}nm/px, offset {calibration.b.toFixed(0)}nm
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>3. Calibrate E (Lux) Reading</Text>
        <Text style={styles.sectionHint}>
          If you have a reference lux meter (or a known-output light), adjust
          this constant until the E reading on Home matches it. This is the
          same "calibration factor" any reflected-light meter needs tuned
          per-device.
        </Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Lux calibration factor: {luxCalibrationFactor.toFixed(2)}</Text>
          <Slider
            minimumValue={0.5}
            maximumValue={10}
            value={luxCalibrationFactor}
            onValueChange={setLuxCalibrationFactor}
            minimumTrackTintColor="#6C86E0"
            maximumTrackTintColor="#3A3A3C"
            thumbTintColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={resetCalibration}>
          <Ionicons name="refresh-outline" size={16} color="#FF6B6B" />
          <Text style={styles.resetText}>Reset Calibration</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0C' },
  permissionContainer: { flex: 1, backgroundColor: '#0B0B0C', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#6C86E0', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#0B0B0C', fontWeight: '700' },

  topBar: { paddingTop: 54, paddingBottom: 12, paddingHorizontal: 20 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },

  previewCard: { marginHorizontal: 20, height: 180, borderRadius: 14, overflow: 'hidden', backgroundColor: '#000' },

  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 22, marginHorizontal: 20 },
  sectionHint: { color: '#8E8E93', fontSize: 12, marginTop: 6, marginHorizontal: 20, lineHeight: 17 },

  sliderRow: { marginHorizontal: 20, marginTop: 10 },
  sliderLabel: { color: '#B0B0B0', fontSize: 12, marginBottom: 2 },

  presetRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 12 },
  presetChip: { backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 10, margin: 4 },
  presetChipText: { color: '#B0B0B0', fontSize: 11 },

  refBlock: { marginHorizontal: 20, marginTop: 16 },
  refRow: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10 },
  captureBtn: { backgroundColor: '#2E4FA0', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10, justifyContent: 'center' },
  captureBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  refStatus: { color: '#6E6E73', fontSize: 11, marginTop: 6 },

  applyBtn: { backgroundColor: '#3DDC5A', marginHorizontal: 20, marginTop: 20, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  applyBtnDisabled: { backgroundColor: '#2C2C2E' },
  applyBtnText: { color: '#0B0B0C', fontWeight: '800' },

  calibratedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  calibratedText: { color: '#3DDC5A', fontSize: 12, fontWeight: '600' },

  resetBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 16 },
  resetText: { color: '#FF6B6B', fontSize: 13, marginLeft: 6, fontWeight: '600' },
});
