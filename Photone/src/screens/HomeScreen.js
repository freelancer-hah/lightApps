import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoneContext } from '../context/PhotoneContext';
import { usePhotoneEngine } from '../engine/usePhotoneEngine';
import { evaluateDliStatus } from '../engine/luxMath';
import ReticleOverlay, { MEASURE_MODES } from '../components/ReticleOverlay';
import SpectrumBar from '../components/SpectrumBar';
import LightSourceModal from '../components/LightSourceModal';
import PlantTargetModal from '../components/PlantTargetModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const {
    facing,
    setFacing,
    frontCalib,
    backCalib,
    activeCalibrationFactor,
    activeCctOffset,
    diffuserOn,
    toggleDiffuser,
    diffuserMultiplier,
    lightSourceId,
    activeLightSource,
    updateLightSource,
    plantTargetId,
    activePlantTarget,
    updatePlantTarget,
    photoperiodHours,
    updatePhotoperiod,
    unitIsLux,
    toggleUnit,
    updateCalibration,
    updateCctOffset,
    saveMeasurementRecord,
  } = usePhotoneContext();

  const [activeModeIndex, setActiveModeIndex] = useState(2); // Default to Lux/Fc mode like screenshot
  const [paused, setPaused] = useState(false);
  const [showLightModal, setShowLightModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  const [showQuickCalibModal, setShowQuickCalibModal] = useState(false);
  const [quickCalibInput, setQuickCalibInput] = useState('');

  const reading = usePhotoneEngine(cameraRef, {
    paused,
    calibrationFactor: activeCalibrationFactor,
    cctOffsetK: activeCctOffset,
    lightSourceId,
    diffuserOn,
    diffuserMultiplier,
    photoperiodHours,
  });

  const currentDli = reading.dli;
  const dliStatus = evaluateDliStatus(
    currentDli,
    activePlantTarget.targetDliMin,
    activePlantTarget.targetDliMax
  );

  const handleSavePress = () => {
    setSaveModalVisible(true);
  };

  const confirmSave = async () => {
    await saveMeasurementRecord({
      ppfd: reading.ppfd,
      dli: reading.dli,
      lux: reading.lux,
      fc: reading.fc,
      cct: reading.cct,
      notes: notesInput,
    });
    setSaveModalVisible(false);
    setNotesInput('');
    Alert.alert('Saved!', 'Measurement snapshot saved to history.');
  };

  const applyQuickCalib = () => {
    const target = parseFloat(quickCalibInput);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid target value (e.g. 49).');
      return;
    }

    if (activeModeIndex === 2) {
      // Lux Mode Calibration
      if (!reading.lux || reading.lux <= 0) return;
      const currentLux = reading.lux;
      const newFactor = (activeCalibrationFactor * target) / currentLux;
      updateCalibration(facing, Math.round(newFactor * 1000) / 1000);
      Alert.alert('Lux Calibrated!', `${facing === 'front' ? 'Front' : 'Back'} camera calibrated to ${target} Lux.`);
    } else if (activeModeIndex === 0) {
      // PPFD Calibration
      if (!reading.ppfd || reading.ppfd <= 0) return;
      const newFactor = (activeCalibrationFactor * target) / reading.ppfd;
      updateCalibration(facing, Math.round(newFactor * 1000) / 1000);
      Alert.alert('PPFD Calibrated!', `${facing === 'front' ? 'Front' : 'Back'} camera calibrated to ${target} µmol.`);
    } else if (activeModeIndex === 3) {
      // CCT Calibration
      if (!reading.cctRaw) return;
      const offset = target - reading.cctRaw;
      updateCctOffset(facing, Math.round(offset));
      Alert.alert('CCT Calibrated!', `${facing === 'front' ? 'Front' : 'Back'} CCT offset set to ${Math.round(offset)}K.`);
    }

    setShowQuickCalibModal(false);
    setQuickCalibInput('');
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={48} color="#00E676" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          Photone requires camera access to measure PAR / PPFD light intensity and color temperature.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-Screen Camera Background */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        animateShutter={false}
      />

      {/* Dark Vignette Overlay */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* Floating Top Bar (Matching Screenshot UI) */}
      <View style={styles.floatingTopBar}>
        <TouchableOpacity
          style={styles.roundIconBtn}
          onPress={() =>
            Alert.alert(
              'Photone Info',
              `Light Source: ${activeLightSource.name}\nTarget Stage: ${activePlantTarget.name}\nCalibration Factor: ${activeCalibrationFactor.toFixed(3)}x`
            )
          }
        >
          <Ionicons name="information" size={20} color="#FFFFFF" />
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>1</Text>
          </View>
        </TouchableOpacity>

        {/* Center Mode Controls */}
        <View style={styles.topControlChips}>
          <TouchableOpacity style={[styles.chipBtn, diffuserOn && styles.chipActive]} onPress={toggleDiffuser}>
            <Ionicons name={diffuserOn ? 'document-text' : 'document-text-outline'} size={14} color={diffuserOn ? '#00E676' : '#FFFFFF'} />
            <Text style={[styles.chipText, diffuserOn && styles.chipTextActive]}>
              {diffuserOn ? 'Diffuser ON' : 'Raw Lens'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chipBtn} onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}>
            <Ionicons name="camera-reverse-outline" size={14} color="#FFFFFF" />
            <Text style={styles.chipText}>{facing === 'front' ? 'Front' : 'Back'}</Text>
          </TouchableOpacity>
        </View>

        {/* Top Right Floating Actions */}
        <View style={styles.rightActionsRow}>
          <TouchableOpacity style={styles.roundIconBtn} onPress={() => setShowLightModal(true)}>
            <Ionicons name="briefcase-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Quick Calibrate Button ⚙ */}
          <TouchableOpacity style={[styles.roundIconBtn, styles.calibBtnActive]} onPress={() => setShowQuickCalibModal(true)}>
            <Ionicons name="options-outline" size={18} color="#00E676" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LARGE RETICLE OVERLAY matching screenshot [ ] */}
      <ReticleOverlay
        activeModeIndex={activeModeIndex}
        onSelectMode={(idx) => setActiveModeIndex(idx)}
        reading={reading}
        unitIsLux={unitIsLux}
        onInfoPress={() => setShowQuickCalibModal(true)}
      />

      {/* Bottom Floating Control Bar with Big Measure Sun Button */}
      <View style={styles.bottomFloatingBar}>
        <TouchableOpacity style={styles.drawerToggleBtn} onPress={() => setDrawerExpanded(!drawerExpanded)}>
          <Ionicons name={drawerExpanded ? 'chevron-down' : 'chevron-up'} size={20} color="#FFFFFF" />
          <Text style={styles.drawerToggleText}>{drawerExpanded ? 'Hide Details' : 'Show Details'}</Text>
        </TouchableOpacity>

        {/* BIG FLOATING CAPTURE BUTTON (Matching Sun Icon in White Ring) */}
        <TouchableOpacity style={styles.sunCaptureBtn} onPress={handleSavePress}>
          <View style={styles.sunOuterRing}>
            <Ionicons name="sunny" size={26} color="#FFD700" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.unitChipBtn} onPress={toggleUnit}>
          <Text style={styles.unitChipText}>{unitIsLux ? 'LUX' : 'FC'}</Text>
        </TouchableOpacity>
      </View>

      {/* Expandable Bottom Metrics Sheet */}
      {drawerExpanded && (
        <View style={styles.drawerSheet}>
          <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.45 }} showsVerticalScrollIndicator={false}>
            {/* Quick Profile Selection Chips */}
            <View style={styles.profileChipRow}>
              <TouchableOpacity style={styles.profChip} onPress={() => setShowLightModal(true)}>
                <Ionicons name={activeLightSource.icon} size={14} color="#00E676" />
                <Text style={styles.profChipText} numberOfLines={1}>{activeLightSource.name}</Text>
                <Ionicons name="chevron-down" size={12} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.profChip} onPress={() => setShowTargetModal(true)}>
                <Ionicons name={activePlantTarget.icon} size={14} color="#38BDF8" />
                <Text style={styles.profChipText} numberOfLines={1}>{activePlantTarget.name}</Text>
                <Ionicons name="chevron-down" size={12} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* 4 Readout Grid */}
            <View style={styles.gridRow}>
              <TouchableOpacity style={[styles.gridItem, activeModeIndex === 0 && styles.gridItemActive]} onPress={() => setActiveModeIndex(0)}>
                <Text style={styles.gridLabel}>PPFD (PAR)</Text>
                <Text style={styles.gridVal}>{reading.ppfd != null ? Math.round(reading.ppfd) : '—'}</Text>
                <Text style={styles.gridSub}>µmol/m²/s</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, activeModeIndex === 1 && styles.gridItemActive]} onPress={() => setActiveModeIndex(1)}>
                <Text style={styles.gridLabel}>DLI ({photoperiodHours}h)</Text>
                <Text style={[styles.gridVal, { color: '#38BDF8' }]}>{reading.dli != null ? reading.dli.toFixed(1) : '—'}</Text>
                <Text style={styles.gridSub}>mol/m²/d</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, activeModeIndex === 2 && styles.gridItemActive]} onPress={() => setActiveModeIndex(2)}>
                <Text style={styles.gridLabel}>LUX / FC</Text>
                <Text style={[styles.gridVal, { color: '#F59E0B' }]}>
                  {unitIsLux ? (reading.lux != null ? Math.round(reading.lux).toLocaleString() : '—') : (reading.fc != null ? Math.round(reading.fc).toLocaleString() : '—')}
                </Text>
                <Text style={styles.gridSub}>{unitIsLux ? 'Lux' : 'Fc'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, activeModeIndex === 3 && styles.gridItemActive]} onPress={() => setActiveModeIndex(3)}>
                <Text style={styles.gridLabel}>COLOR TEMP</Text>
                <Text style={[styles.gridVal, { color: '#C084FC' }]}>{reading.cct != null ? `${Math.round(reading.cct)}K` : '—'}</Text>
                <Text style={styles.gridSub}>Kelvin</Text>
              </TouchableOpacity>
            </View>

            {/* Photoperiod Selector */}
            <View style={styles.photoBox}>
              <Text style={styles.photoBoxLabel}>Photoperiod: {photoperiodHours} Hours Daily</Text>
              <View style={styles.hoursRow}>
                {[12, 16, 18, 20, 24].map((hrs) => (
                  <TouchableOpacity key={hrs} style={[styles.hrBtn, photoperiodHours === hrs && styles.hrBtnActive]} onPress={() => updatePhotoperiod(hrs)}>
                    <Text style={[styles.hrBtnText, photoperiodHours === hrs && styles.hrBtnTextActive]}>{hrs}h</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PAR Spectrum Bar */}
            <SpectrumBar rgb={reading.rgb} cct={reading.cct} tintHint={reading.tintHint} />
          </ScrollView>
        </View>
      )}

      {/* Quick Calibration Modal */}
      <Modal visible={showQuickCalibModal} transparent animationType="fade">
        <View style={styles.saveOverlay}>
          <View style={styles.saveModalCard}>
            <View style={styles.modalHeaderRow}>
              <Ionicons name="options-outline" size={22} color="#00E676" />
              <Text style={styles.saveModalTitle}>Quick Calibrate Reading</Text>
            </View>

            <Text style={styles.saveModalSub}>
              Current {MEASURE_MODES[activeModeIndex].title}: {activeModeIndex === 2 ? Math.round(reading.lux || 0) : activeModeIndex === 0 ? Math.round(reading.ppfd || 0) : Math.round(reading.cct || 0)}
            </Text>

            <Text style={styles.calibInstruction}>
              Enter the true value from your reference meter or real Photone app (e.g. 49):
            </Text>

            <TextInput
              style={styles.calibInput}
              placeholder="e.g. 49"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={quickCalibInput}
              onChangeText={setQuickCalibInput}
            />

            <View style={styles.saveBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowQuickCalibModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={applyQuickCalib}>
                <Text style={styles.confirmBtnText}>Apply Calibration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Light Source Spectrum Modal */}
      <LightSourceModal
        visible={showLightModal}
        activeId={lightSourceId}
        onClose={() => setShowLightModal(false)}
        onSelect={updateLightSource}
      />

      {/* Plant Target Preset Modal */}
      <PlantTargetModal
        visible={showTargetModal}
        activeId={plantTargetId}
        onClose={() => setShowTargetModal(false)}
        onSelect={updatePlantTarget}
      />

      {/* Save Record Modal */}
      <Modal visible={saveModalVisible} transparent animationType="fade">
        <View style={styles.saveOverlay}>
          <View style={styles.saveModalCard}>
            <Text style={styles.saveModalTitle}>Save Measurement Snapshot</Text>
            <Text style={styles.saveModalSub}>
              PPFD: {Math.round(reading.ppfd || 0)} µmol | DLI: {(reading.dli || 0).toFixed(1)} mol | Lux: {Math.round(reading.lux || 0).toLocaleString()}
            </Text>

            <TextInput
              style={styles.saveInput}
              placeholder="Add optional notes (e.g. Canopy height 40cm, 75% Dimming)"
              placeholderTextColor="#64748B"
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
            />

            <View style={styles.saveBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSaveModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmSave}>
                <Text style={styles.confirmBtnText}>Save Snapshot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginTop: 12 },
  permissionSubtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginVertical: 8 },
  permissionBtn: { backgroundColor: '#00E676', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 12 },
  permissionBtnText: { color: '#0F172A', fontWeight: '800' },

  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  floatingTopBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  roundIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calibBtnActive: {
    borderWidth: 1,
    borderColor: '#00E676',
  },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  topControlChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.9)',
    borderWidth: 1,
    borderColor: '#00E676',
  },
  chipText: { color: '#F8FAFC', fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#00E676' },

  rightActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  bottomFloatingBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  drawerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  drawerToggleText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },

  sunCaptureBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunOuterRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },

  unitChipBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unitChipText: { color: '#00E676', fontSize: 12, fontWeight: '800' },

  drawerSheet: {
    position: 'absolute',
    bottom: 100,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 12,
  },
  profileChipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  profChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profChipText: { flex: 1, color: '#F8FAFC', fontSize: 11, fontWeight: '700' },

  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  gridItem: {
    width: '48%',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridItemActive: { borderColor: '#00E676', backgroundColor: '#064E3B44' },
  gridLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800' },
  gridVal: { color: '#00E676', fontSize: 20, fontWeight: '900', marginTop: 2 },
  gridSub: { color: '#64748B', fontSize: 10, marginTop: 1 },

  photoBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  photoBoxLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  hoursRow: { flexDirection: 'row', gap: 6 },
  hrBtn: { flex: 1, backgroundColor: '#0F172A', paddingVertical: 6, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  hrBtnActive: { backgroundColor: '#00E676', borderColor: '#00E676' },
  hrBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  hrBtnTextActive: { color: '#0F172A' },

  saveOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', padding: 20 },
  saveModalCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveModalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  saveModalSub: { color: '#00E676', fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 10 },
  calibInstruction: { color: '#94A3B8', fontSize: 12, marginBottom: 10 },
  calibInput: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#334155', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  saveInput: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 12, padding: 12, minHeight: 70, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', marginBottom: 14 },
  saveBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  cancelBtnText: { color: '#F8FAFC', fontWeight: '700' },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#00E676', alignItems: 'center' },
  confirmBtnText: { color: '#0F172A', fontWeight: '800' },
});
