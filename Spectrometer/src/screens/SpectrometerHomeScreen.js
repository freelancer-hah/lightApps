import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import { useSpectrometer } from '../context/SpectrometerContext';
import { captureFrame } from '../utils/frameSampler';
import { processSpectrometerReading } from '../utils/spectrometerMath';

import DominantWavelengthArc from '../components/DominantWavelengthArc';
import SnapshotModal from '../components/SnapshotModal';

export default function SpectrometerHomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const {
    currentLiveReading,
    setCurrentLiveReading,
    isPaused,
    setIsPaused,
    whiteRef,
    calibrationGain,
    mode,
    spotSize,
    saveMeasurement,
  } = useSpectrometer();

  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [snapshotModalVisible, setSnapshotModalVisible] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const sampleLoop = async () => {
      if (!mounted) return;
      if (isFocused && !isPaused && cameraRef.current) {
        try {
          let region = null;
          if (spotSize === 'small') {
            region = { x: 0.45, y: 0.45, w: 0.1, h: 0.1 };
          } else if (spotSize === 'medium') {
            region = { x: 0.4, y: 0.4, w: 0.2, h: 0.2 };
          }

          const frame = await captureFrame(cameraRef, region);
          if (frame?.rgb && mounted) {
            const reading = processSpectrometerReading({
              rawR: frame.rgb.r,
              rawG: frame.rgb.g,
              rawB: frame.rgb.b,
              aperture: frame.aperture,
              shutterSpeed: frame.shutterSpeed,
              iso: frame.iso,
              whiteRef,
              calibrationGain,
              mode,
            });
            setCurrentLiveReading(reading);
          }
        } catch (err) {
          // Camera frame error ignored
        }
      }

      if (mounted) {
        timer = setTimeout(sampleLoop, (!isFocused || isPaused) ? 1000 : 350);
      }
    };

    if (isFocused && !isPaused) {
      sampleLoop();
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [isFocused, isPaused, spotSize, whiteRef, calibrationGain, mode]);

  const handleCaptureSnapshot = async () => {
    let uri = null;
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        uri = photo?.uri || null;
      } catch (e) {
        // ignore photo uri if failed
      }
    }
    setCapturedPhotoUri(uri);
    setSnapshotModalVisible(true);
  };

  const handleSaveSnapshot = async (readingWithNotes) => {
    await saveMeasurement(readingWithNotes);
    setSnapshotModalVisible(false);
    setCapturedPhotoUri(null);
    Alert.alert('Saved', 'Spectrometer measurement saved to history.');
  };

  if (!permission) return <View style={styles.darkBg} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={54} color="#F59E0B" />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          The Spectrometer tool needs camera access to analyze light wavelength, color saturation, and spectrum.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reading = currentLiveReading;
  const saturationVal = reading?.hsv?.s ?? 10;
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
              <Ionicons name="chevron-back" size={26} color="#1C1C1E" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.appTitle}>Light Spectrometer</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setTorchOn(!torchOn)}>
            <Ionicons name="ribbon-outline" size={22} color="#0891B2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="information-circle-outline" size={24} color="#0891B2" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Dominant Wavelength Arc Card */}
        <DominantWavelengthArc
          dominantWavelength={reading?.dominantWavelength || 475}
          saturation={saturationVal}
          isCalibrated={!!whiteRef}
        />

        {/* Camera Feed & Guidance Card */}
        <View style={styles.cameraCard}>
          <View style={styles.cameraBox}>
            {isFocused && (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={cameraFacing}
                enableTorch={torchOn}
              />
            )}

            <View style={styles.guidanceBanner} pointerEvents="none">
              <Ionicons name="warning-outline" size={24} color="#EF4444" style={styles.warningIcon} />
              <Text style={styles.guidanceText}>
                Please aim the camera at a white surface (and not directly at a light source for instance)
              </Text>
            </View>

            <View style={styles.targetReticle} pointerEvents="none">
              <View style={styles.targetNotchTL} />
              <View style={styles.targetNotchTR} />
              <View style={styles.targetNotchBL} />
              <View style={styles.targetNotchBR} />
            </View>

            <TouchableOpacity style={styles.cameraSaveBtn} onPress={handleCaptureSnapshot}>
              <Ionicons name="save" size={22} color="#0891B2" />
              <Text style={styles.cameraSaveText}>Save</Text>
            </TouchableOpacity>

            <View style={styles.cameraToolsOverlay}>
              <TouchableOpacity
                style={styles.camToolBtn}
                onPress={() => setCameraFacing((f) => (f === 'back' ? 'front' : 'back'))}
              >
                <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.camToolBtn} onPress={() => setTorchOn(!torchOn)}>
                <Ionicons
                  name={torchOn ? 'flashlight' : 'flashlight-outline'}
                  size={20}
                  color={torchOn ? '#F59E0B' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.camToolBtn} onPress={() => setIsPaused(!isPaused)}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <SnapshotModal
        visible={snapshotModalVisible}
        reading={reading}
        imageUri={capturedPhotoUri}
        onSave={handleSaveSnapshot}
        onClose={() => setSnapshotModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  darkBg: { flex: 1, backgroundColor: '#FFFFFF' },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: { color: '#1C1C1E', fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  permissionText: { color: '#6E6E73', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  permissionButton: { backgroundColor: '#0891B2', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  headerBar: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    zIndex: 20,
  },
  headerBackBtn: { padding: 4 },
  appTitle: {
    color: '#0891B2',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: { padding: 4 },

  scrollBody: {
    padding: 12,
    paddingBottom: 24,
  },

  cameraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginVertical: 6,
  },
  cameraBox: {
    height: 230,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },

  guidanceBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  warningIcon: {
    marginRight: 8,
  },
  guidanceText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    lineHeight: 17,
  },

  targetReticle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  targetNotchTL: { position: 'absolute', top: -2, left: -2, width: 10, height: 10, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#FFFFFF' },
  targetNotchTR: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#FFFFFF' },
  targetNotchBL: { position: 'absolute', bottom: -2, left: -2, width: 10, height: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#FFFFFF' },
  targetNotchBR: { position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#FFFFFF' },

  cameraSaveBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    zIndex: 10,
  },
  cameraSaveText: {
    color: '#0891B2',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  cameraToolsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  camToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
