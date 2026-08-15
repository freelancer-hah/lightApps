import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SpotTargetOverlay({
  spotSize = 'medium',
  onToggleSpotSize,
  mode = 'direct',
  onToggleMode,
  liveReading,
  torchOn,
  onToggleTorch,
}) {
  const spotBoxStyle =
    spotSize === 'small'
      ? styles.spotSmall
      : spotSize === 'medium'
      ? styles.spotMedium
      : styles.spotFull;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <View style={styles.topRow} pointerEvents="box-none">
        <TouchableOpacity style={styles.modeBadge} onPress={onToggleMode}>
          <Ionicons
            name={mode === 'direct' ? 'bulb-outline' : 'reflect-horizontal'}
            size={14}
            color="#26C6DA"
          />
          <Text style={styles.modeText}>{mode === 'direct' ? 'Direct Emission' : 'Reflected Mode'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.spotBadge} onPress={onToggleSpotSize}>
          <Ionicons name="scan-outline" size={14} color="#FFC107" />
          <Text style={styles.spotText}>
            Spot: {spotSize === 'small' ? '20px' : spotSize === 'medium' ? '60px' : 'Full'}
          </Text>
        </TouchableOpacity>
      </View>

      {spotSize !== 'full' && (
        <View pointerEvents="none" style={styles.centerWrap}>
          <View style={[styles.spotBox, spotBoxStyle]}>
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={[styles.centerDot, { backgroundColor: liveReading?.hex || '#FFFFFF' }]} />
          </View>
        </View>
      )}

      {liveReading && (
        <View style={styles.bottomPillRow} pointerEvents="none">
          <View style={styles.livePill}>
            <View style={[styles.liveColorDot, { backgroundColor: liveReading.hex }]} />
            <Text style={styles.liveMetricsText}>
              {liveReading.dominantWavelength ? `${liveReading.dominantWavelength} nm` : liveReading.hex} | {liveReading.cct} K | {liveReading.lux} lx
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26C6DA44',
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  spotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFC10744',
  },
  spotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotBox: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  spotSmall: {
    width: 32,
    height: 32,
  },
  spotMedium: {
    width: 70,
    height: 70,
  },
  spotFull: {
    ...StyleSheet.absoluteFillObject,
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000000',
  },
  corner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: '#26C6DA',
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  bottomPillRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 11, 12, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  liveColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  liveMetricsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
