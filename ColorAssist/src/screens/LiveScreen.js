import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { sampleFramePixel, TemporalBuffer } from '../utils/pixelSampler';
import { saveSample } from '../utils/savedSamples';
import ColorInfoPanel from '../components/ColorInfoPanel';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MODES = ['auto', 'lock', 'target'];

export default function LiveScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const { settings } = useSettings();
  const cameraRef = useRef(null);
  const bufferRef = useRef(new TemporalBuffer(settings.temporalFrames));
  const intervalRef = useRef(null);
  const samplingRef = useRef(false);

  const [mode, setMode] = useState('auto');
  const [paused, setPaused] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [rgb, setRgb] = useState(null);
  const [targetPos, setTargetPos] = useState({ x: 0.5, y: 0.5 });
  const [cameraSize, setCameraSize] = useState({ width: SCREEN_W, height: SCREEN_H - 160 });
  const cameraSizeRef = useRef({ width: SCREEN_W, height: SCREEN_H - 160 });
  const [zoomValue, setZoomValue] = useState(0);

  const onCameraLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    cameraSizeRef.current = { width, height };
    setCameraSize({ width, height });
  }, []);

  useEffect(() => {
    bufferRef.current.setMaxFrames(settings.temporalFrames);
  }, [settings.temporalFrames]);

  const runSample = useCallback(async () => {
    if (samplingRef.current || paused || !cameraRef.current) return;
    samplingRef.current = true;
    try {
      const sample = await sampleFramePixel(cameraRef, settings.spatialAperture, targetPos, cameraSize);
      const avg = bufferRef.current.push(sample);
      if (avg) setRgb(avg);
    } catch (e) {
      // camera not ready yet / transient capture error - ignore and retry next tick
    } finally {
      samplingRef.current = false;
    }
  }, [paused, settings.spatialAperture, targetPos, cameraSize]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mode !== 'lock' && !paused) {
      intervalRef.current = setInterval(runSample, 180);
    }
    return () => clearInterval(intervalRef.current);
  }, [mode, paused, runSample]);

  // "Target" mode: drag or tap the crosshair anywhere on screen to reposition the sample point.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'target',
      onMoveShouldSetPanResponder: () => mode === 'target',
      onPanResponderGrant: (evt, gesture) => {
        const { width, height } = cameraSizeRef.current;
        const x = Math.min(1, Math.max(0, evt.nativeEvent.pageX / width));
        const y = Math.min(1, Math.max(0, (evt.nativeEvent.pageY - 90) / height));
        setTargetPos({ x, y });
      },
      onPanResponderMove: (evt, gesture) => {
        const { width, height } = cameraSizeRef.current;
        const x = Math.min(1, Math.max(0, evt.nativeEvent.pageX / width));
        const y = Math.min(1, Math.max(0, (evt.nativeEvent.pageY - 90) / height));
        setTargetPos({ x, y });
      },
    })
  ).current;

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    const canAsk = permission.canAskAgain;
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#555555" style={{ marginBottom: 20 }} />
        <Text style={styles.permissionText}>ColorAssist needs camera access to sample colors.</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={canAsk ? requestPermission : () => Linking.openSettings()}
        >
          <Text style={styles.permissionButtonText}>
            {canAsk ? 'Grant Camera Access' : 'Open App Settings'}
          </Text>
        </TouchableOpacity>
        {!canAsk && (
          <Text style={styles.permissionSubText}>
            Camera access is denied. Please enable camera permission in your system settings to continue.
          </Text>
        )}
      </View>
    );
  }

  const reticleSize = settings.spatialAperture * 6;
  const cornerSize = Math.max(4, Math.floor(reticleSize / 3));
  const crosshairLeft = targetPos.x * cameraSize.width - reticleSize / 2;
  const crosshairTop = targetPos.y * cameraSize.height - reticleSize / 2;

  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 60, alignItems: 'flex-start' }}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.modeSwitch}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ width: 60 }} />
      </View>

      {/* Camera + crosshair */}
      <View style={styles.cameraArea} {...panResponder.panHandlers} onLayout={onCameraLayout}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          enableTorch={torchOn}
          facing="back"
          zoom={zoomValue}
          animateShutter={false}
        />
        <View pointerEvents="none" style={[styles.crosshair, { left: crosshairLeft, top: crosshairTop, width: reticleSize, height: reticleSize }]}>
          <View style={[styles.crosshairCornerTL, { width: cornerSize, height: cornerSize }]} />
          <View style={[styles.crosshairCornerTR, { width: cornerSize, height: cornerSize }]} />
          <View style={[styles.crosshairCornerBL, { width: cornerSize, height: cornerSize }]} />
          <View style={[styles.crosshairCornerBR, { width: cornerSize, height: cornerSize }]} />
        </View>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => {
            setZoomValue((z) => {
              if (z === 0) return 0.12;
              if (z === 0.12) return 0.25;
              return 0;
            });
          }}
        >
          <Text style={styles.zoomText}>
            {zoomValue === 0 ? '0.5x' : zoomValue === 0.12 ? '1.0x' : '2.0x'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Color info overlay */}
      <ColorInfoPanel rgb={rgb} outputs={settings.outputs} />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setPaused((p) => !p)} style={styles.bottomBtn}>
          <Ionicons name={paused ? 'play' : 'pause'} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTorchOn((t) => !t)} style={styles.bottomBtn}>
          <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => rgb && saveSample({ ...rgb, savedAt: Date.now() })}
          disabled={!rgb}
          style={styles.bottomBtn}
        >
          <Ionicons name="add" size={30} color={rgb ? '#FFFFFF' : '#555555'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Saved')} style={styles.bottomBtn}>
          <Ionicons name="bookmarks-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Options')} style={styles.bottomBtn}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  permissionContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  permissionButton: { backgroundColor: '#2E8B57', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '600' },
  permissionSubText: { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginTop: 16, lineHeight: 20 },

  topBar: {
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 50 : 90,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
  },
  editText: { color: '#FFFFFF', fontSize: 17 },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modeBtn: { paddingVertical: 6, paddingHorizontal: 14 },
  modeBtnActive: { backgroundColor: '#5A5A5C' },
  modeText: { color: '#B0B0B0', fontSize: 14, fontWeight: '600' },
  modeTextActive: { color: '#FFFFFF' },

  cameraArea: { flex: 1 },
  crosshair: { position: 'absolute', width: 40, height: 40 },
  zoomBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  crosshairCornerTL: { position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#FFFFFF' },
  crosshairCornerTR: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#FFFFFF' },
  crosshairCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 12, height: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#FFFFFF' },
  crosshairCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#FFFFFF' },

  bottomBar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#000000',
  },
  bottomBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
