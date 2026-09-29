import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function CameraPreviewCard({
  cameraRef,
  facing,
  onToggleFacing,
  diffuserOn,
  onToggleDiffuser,
  paused,
  onTogglePause,
}) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View style={styles.placeholderCard} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionCard}>
        <Ionicons name="camera-outline" size={32} color="#00E676" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          Photone requires camera access to measure PAR / PPFD light intensity and color temperature.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          animateShutter={false}
        />

        {/* Reticle / Lens Crosshair Overlay */}
        <View style={styles.crosshairContainer}>
          <View style={styles.targetRing} />
          <Text style={styles.sampleTag}>SAMPLING LENS AREA</Text>
        </View>

        {/* Controls Overlay */}
        <View style={styles.topControlRow}>
          <TouchableOpacity style={styles.iconChip} onPress={onToggleFacing}>
            <Ionicons name="camera-reverse-outline" size={18} color="#F8FAFC" />
            <Text style={styles.chipText}>{facing === 'front' ? 'Front' : 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconChip, diffuserOn && styles.diffuserChipActive]}
            onPress={onToggleDiffuser}
          >
            <Ionicons
              name={diffuserOn ? 'document-text' : 'document-text-outline'}
              size={18}
              color={diffuserOn ? '#00E676' : '#94A3B8'}
            />
            <Text style={[styles.chipText, diffuserOn && styles.chipTextActive]}>
              {diffuserOn ? 'Paper Diffuser ON' : 'Raw Lens'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconChip} onPress={onTogglePause}>
            <Ionicons name={paused ? 'play' : 'pause'} size={18} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        {diffuserOn && (
          <View style={styles.diffuserNotice}>
            <Ionicons name="information-circle" size={14} color="#00E676" />
            <Text style={styles.noticeText}>Paper Diffuser attached over camera lens</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cameraWrapper: {
    height: 160,
    justifyContent: 'space-between',
    padding: 10,
  },
  placeholderCard: {
    height: 160,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  permissionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  permissionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  permissionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  grantBtn: {
    backgroundColor: '#00E676',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  grantBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
  },
  crosshairContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  targetRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#00E676AA',
    borderStyle: 'dashed',
  },
  sampleTag: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 6,
    backgroundColor: '#00000088',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  diffuserChipActive: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
  },
  chipText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#00E676',
  },
  diffuserNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  noticeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
});
