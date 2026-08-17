import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import SevenSegmentText from '../components/SevenSegmentText';
import IconRail from '../components/IconRail';
import ModeSwitch from '../components/ModeSwitch';
import TempTintPanel from '../components/TempTintPanel';
import ColorSpacePanel from '../components/ColorSpacePanel';
import WavelengthPiePanel from '../components/WavelengthPiePanel';
import WavelengthSpectrumPanel from '../components/WavelengthSpectrumPanel';
import HistogramPanel from '../components/HistogramPanel';
import { useLiveMeasurement } from '../engine/useLiveMeasurement';
import { useAppState } from '../context/AppStateContext';
import { luxToPpfd } from '../engine/ppfd';

export default function HomeScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [hold, setHold] = useState(false);
  const [facing, setFacing] = useState('back');
  const [activePanel, setActivePanel] = useState(null);

  const { mode, setMode, bandRegion, calibration, calibrationOffsetK, luxCalibrationFactor, saveMeasurement } = useAppState();

  const reading = useLiveMeasurement(cameraRef, {
    mode, bandRegion, calibration, paused: hold, calibrationOffsetK, luxCalibrationFactor,
  });

  const ppfd = reading.lux != null && reading.parFraction != null
    ? luxToPpfd(reading.lux, reading.parFraction)
    : null;

  const handleRailPress = (key) => {
    if (key === 'save') {
      if (reading.cct == null) return;
      saveMeasurement({
        mode, cct: reading.cct, duv: reading.duv, tint: reading.tint,
        mired: reading.mired, xy: reading.xy, gIndex: reading.gIndex,
        parFraction: reading.parFraction, peakWl: reading.peakWl, lux: reading.lux, ppfd,
      });
      return;
    }
    if (key === 'saved') { navigation.navigate('Saved Measurements'); return; }
    if (key === 'calibration') { navigation.navigate('Calibration'); return; }
    if (key === 'flipCamera') { setFacing((f) => (f === 'back' ? 'front' : 'back')); return; }
    setActivePanel((prev) => (prev === key ? null : key));
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>LSP.evo needs camera access.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cctDisplay = reading.cct != null ? String(Math.round(reading.cct)).padStart(4, '0') : '----';

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} animateShutter={false} />
      <View style={styles.dim} pointerEvents="none" />

      <View style={styles.header}>
        <Text style={styles.logo}>
          light<Text style={styles.logoThin}>Spectrum</Text> <Text style={styles.logoPro}>pro</Text>{'\n'}
          <Text style={styles.logoEvo}>evo</Text>
        </Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setActivePanel(null)}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.cctLabel}>CCT: (KELVIN)</Text>
      <ModeSwitch mode={mode} onChange={setMode} calibrated={calibration.calibrated} />

      <View style={styles.cctRow}>
        <TouchableOpacity style={[styles.holdBtn, hold && styles.holdBtnActive]} onPress={() => setHold((h) => !h)}>
          <Text style={styles.holdText}>HOLD</Text>
        </TouchableOpacity>
        <SevenSegmentText value={cctDisplay} size={44} />
      </View>

      <ScrollView style={styles.readoutList} showsVerticalScrollIndicator={false}>
        <ReadoutRow color="#8E8E93" label="TINT" value={reading.tint != null ? reading.tint.toFixed(3) : '—'} />
        <ReadoutRow color="#2E6BFF" label="G-INDEX" value={reading.gIndex != null ? reading.gIndex.toFixed(2) : '—'} />
        <ReadoutRow icon="bulb" iconColor="#FFD400" label="E (LX)" value={reading.lux != null ? reading.lux.toFixed(0) : '—'} />
        <ReadoutRow icon="leaf" iconColor="#3DDC5A" label="PPFD (UMOL/S/M2)" value={ppfd != null ? ppfd.toFixed(2) : '—'} />
        <ReadoutRow icon="radio-button-on" iconColor="#FF3B30" label="RGB" value={reading.rgb ? `R:${reading.rgb.r} G:${reading.rgb.g} B:${reading.rgb.b}` : '—'} />
      </ScrollView>

      <IconRail activePanel={activePanel} onPress={handleRailPress} />

      {activePanel && (
        <View style={styles.panelWrap}>
          {activePanel === 'histogram' && <HistogramPanel histogram={reading.histogram} onClose={() => setActivePanel(null)} />}
          {activePanel === 'wavelengthPie' && (
            <WavelengthPiePanel spectrum={reading.spectrum} isEstimated={reading.spectrumIsEstimated} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'wavelengthSpectrum' && (
            <WavelengthSpectrumPanel spectrum={reading.spectrum} isEstimated={reading.spectrumIsEstimated} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'colorSpace' && <ColorSpacePanel xy={reading.xy} onClose={() => setActivePanel(null)} />}
        </View>
      )}

      {!activePanel && (
        <View style={styles.tempTintWrap}>
          <TempTintPanel cct={reading.cct} tint={reading.tint} onClose={() => {}} />
        </View>
      )}
    </View>
  );
}

function ReadoutRow({ color, icon, iconColor, label, value }) {
  return (
    <View style={styles.readoutRow}>
      {icon ? (
        <Ionicons name={icon} size={18} color={iconColor} style={styles.readoutIcon} />
      ) : (
        <View style={[styles.readoutDot, { backgroundColor: color }]} />
      )}
      <Text style={styles.readoutLabel}>{label}: </Text>
      <Text style={styles.readoutValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  permissionContainer: { flex: 1, backgroundColor: '#0B0B0C', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#6C86E0', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#0B0B0C', fontWeight: '700' },

  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },

  header: { paddingTop: 44, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', lineHeight: 22 },
  logoThin: { fontWeight: '300' },
  logoPro: { color: '#8E8E93', fontSize: 13 },
  logoEvo: { fontSize: 22, fontWeight: '900', color: '#3DDC5A' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#3A3A3C',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,10,12,0.6)',
  },

  cctLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginLeft: 18, marginTop: 18, letterSpacing: 1 },

  cctRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 18, marginTop: 10 },
  holdBtn: { borderWidth: 1.5, borderColor: '#8E8E93', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginRight: 14 },
  holdBtnActive: { borderColor: '#3DDC5A', backgroundColor: 'rgba(61,220,90,0.15)' },
  holdText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  readoutList: { marginTop: 18, marginLeft: 18, maxHeight: 190 },
  readoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  readoutDot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  readoutIcon: { marginRight: 10, width: 16, textAlign: 'center' },
  readoutLabel: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  readoutValue: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  panelWrap: { position: 'absolute', left: 14, right: 14, bottom: 16 },
  tempTintWrap: { position: 'absolute', left: 14, right: 14, bottom: 16 },
});
