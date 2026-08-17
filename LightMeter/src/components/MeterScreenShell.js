import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function MeterScreenShell({
  title,
  navigation,
  cameraRef,
  facing = 'front',
  onToggleCamera,
  torchOn,
  onToggleTorch,
  paused,
  onTogglePause,
  children,
  cameraHeightRatio = 0.42,
}) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{title} needs camera access to take live readings.</Text>
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
        <TouchableOpacity
          onPress={() => {
            if (canGoBack) navigation.goBack();
          }}
          style={[styles.iconBtn, { opacity: canGoBack ? 1 : 0 }]}
          disabled={!canGoBack}
        >
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightIcons}>
          {onToggleCamera && (
            <TouchableOpacity onPress={onToggleCamera} style={styles.iconBtn}>
              <Ionicons name="camera-reverse-outline" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onToggleTorch} style={styles.iconBtn}>
            <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={22} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.cameraArea, { flex: cameraHeightRatio }]}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torchOn} animateShutter={false} />
        <View pointerEvents="none" style={styles.centerBox} />
      </View>

      <View style={[styles.readoutArea, { flex: 1 - cameraHeightRatio }]}>{children}</View>

      <TouchableOpacity style={styles.pauseBtn} onPress={onTogglePause}>
        <Ionicons name={paused ? 'play' : 'pause'} size={22} color="#1C1C1E" />
        <Text style={styles.pauseText}>{paused ? 'Resume' : 'Pause'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  permissionContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#1C1C1E', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#CA8A04', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '600' },

  topBar: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  iconBtn: { padding: 4 },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: '#1C1C1E', fontSize: 18, fontWeight: '700' },

  cameraArea: { position: 'relative' },
  centerBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 6,
  },

  readoutArea: { backgroundColor: '#F2F2F7', padding: 16 },

  pauseBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  pauseText: { color: '#1C1C1E', marginLeft: 8, fontSize: 15, fontWeight: '600' },
});
