import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import { usePhotoFriend } from '../context/PhotoFriendContext';
import { captureFrame } from '../utils/frameSampler';
import { luxToEv } from '../utils/photoFriendMath';

import PhotoFriendRulerDial from '../components/PhotoFriendRulerDial';
import RgbHistogramOverlay from '../components/RgbHistogramOverlay';
import IncidentLightMeterView from '../components/IncidentLightMeterView';
import PhotoFriendSnapshotModal from '../components/PhotoFriendSnapshotModal';

export default function PhotoFriendScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const {
    ev,
    setEv,
    iso,
    evComp,
    shutter,
    aperture,
    focalLength,
    distanceFeet,
    dofResult,
    sceneLabel,
    meterMode,
    setMeterMode,
    saveSnapshot,
    currentLux,
    setCurrentLux,
  } = usePhotoFriend();

  const [torchOn, setTorchOn] = useState(false);
  const [spotTarget, setSpotTarget] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snapshotModalVisible, setSnapshotModalVisible] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const sampleLoop = async () => {
      if (!mounted) return;
      if (isFocused && !isPaused && cameraRef.current && meterMode === 'camera') {
        try {
          const region = spotTarget ? { x: 0.4, y: 0.4, w: 0.2, h: 0.2 } : null;
          const frame = await captureFrame(cameraRef, region);
          if (frame && mounted) {
            const rawLux = frame.rgb ? (0.299 * frame.rgb.r + 0.587 * frame.rgb.g + 0.114 * frame.rgb.b) * 2.5 : 10.0;
            setCurrentLux(rawLux);

            const calculatedEv = luxToEv(rawLux, iso);
            setEv(calculatedEv, true);
          }
        } catch (err) {
          // Camera sampling error ignored
        }
      }

      if (mounted) {
        timer = setTimeout(sampleLoop, (!isFocused || isPaused) ? 1000 : 400);
      }
    };

    if (isFocused && !isPaused && meterMode === 'camera') {
      sampleLoop();
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [isFocused, isPaused, meterMode, spotTarget, iso]);

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

  const handleSaveSnapshot = async (snapshotWithNotes) => {
    await saveSnapshot(snapshotWithNotes);
    setSnapshotModalVisible(false);
    setCapturedPhotoUri(null);
    Alert.alert('Saved', 'Photo Friend exposure reading saved.');
  };

  if (!permission) return <View style={styles.darkBg} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={54} color="#D97706" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Photo Friend uses your device camera for spot/reflected light metering and real-time exposure calculations.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const snapshotData = {
    ev,
    sceneLabel,
    iso,
    shutterLabel: shutter.label,
    aperture,
    evComp,
    focalLength,
    distanceFeet,
    dof: dofResult,
    lux: currentLux,
  };

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      <View style={styles.mainSplitBody}>
        <View style={styles.topSection}>
          <View style={styles.leftToolbar}>
            {canGoBack && (
              <TouchableOpacity style={styles.toolBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={22} color="#1C1C1E" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.toolBtn, meterMode === 'camera' && styles.toolBtnActive]}
              onPress={() => setMeterMode('camera')}
            >
              <Ionicons name="camera-outline" size={20} color={meterMode === 'camera' ? '#FFFFFF' : '#1C1C1E'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolBtn, meterMode === 'incident' && styles.toolBtnActive]}
              onPress={() => setMeterMode('incident')}
            >
              <Ionicons name="sunny-outline" size={20} color={meterMode === 'incident' ? '#FFFFFF' : '#1C1C1E'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolBtn, meterMode === 'histogram' && styles.toolBtnActive]}
              onPress={() => setMeterMode('histogram')}
            >
              <Ionicons name="analytics-outline" size={20} color={meterMode === 'histogram' ? '#FFFFFF' : '#1C1C1E'} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={handleCaptureSnapshot}>
              <Ionicons name="save-outline" size={20} color="#D97706" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerViewfinderBox}>
            {meterMode === 'camera' && (
              <View style={StyleSheet.absoluteFill}>
                {isFocused && (
                  <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    enableTorch={torchOn}
                  />
                )}

                <TouchableOpacity
                  style={[styles.spotBadge, spotTarget && styles.spotBadgeActive]}
                  onPress={() => setSpotTarget(!spotTarget)}
                >
                  <Ionicons name="scan-outline" size={14} color={spotTarget ? '#FFFFFF' : '#1C1C1E'} />
                  <Text style={[styles.spotText, spotTarget && styles.spotTextActive]}>Spot</Text>
                </TouchableOpacity>

                {spotTarget ? (
                  <View style={styles.spotCenterSquare} pointerEvents="none">
                    <View style={styles.spotCrosshairDot} />
                  </View>
                ) : (
                  <View style={styles.viewfinderCenterDot} pointerEvents="none" />
                )}
              </View>
            )}

            {meterMode === 'incident' && (
              <IncidentLightMeterView ev={ev} lux={currentLux} />
            )}

            {meterMode === 'histogram' && (
              <RgbHistogramOverlay
                iso={iso}
                shutterLabel={shutter.label}
                aperture={aperture}
              />
            )}
          </View>

          <View style={styles.rightToolbar}>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setTorchOn(!torchOn)}>
              <Ionicons
                name={torchOn ? 'flashlight' : 'flashlight-outline'}
                size={20}
                color={torchOn ? '#F59E0B' : '#1C1C1E'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={() => setIsPaused(!isPaused)}>
              <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color="#1C1C1E" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={() => navigation.navigate('PhotoFriendSaved')}>
              <Ionicons name="journal-outline" size={20} color="#1C1C1E" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={() => navigation.navigate('PhotoFriendSettings')}>
              <Ionicons name="settings-outline" size={20} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomDialSection}>
          <PhotoFriendRulerDial />
        </View>
      </View>

      <PhotoFriendSnapshotModal
        visible={snapshotModalVisible}
        snapshotData={snapshotData}
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
  permissionButton: { backgroundColor: '#D97706', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  mainSplitBody: {
    flex: 1,
    flexDirection: 'column',
  },
  topSection: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },

  leftToolbar: {
    width: 50,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rightToolbar: {
    width: 50,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  toolBtnActive: {
    backgroundColor: '#D97706',
  },

  centerViewfinderBox: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  spotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    zIndex: 10,
  },
  spotBadgeActive: {
    backgroundColor: '#D97706',
  },
  spotText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontWeight: '700',
  },
  spotTextActive: {
    color: '#FFFFFF',
  },

  viewfinderCenterDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  spotCenterSquare: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  spotCrosshairDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },

  bottomDialSection: {
    height: 360,
  },
});
