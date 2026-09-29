import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const MEASURE_MODES = [
  { id: 'ppfd', title: 'PPFD (PAR)', unit: 'µmol/m²/s', color: '#00E676' },
  { id: 'dli', title: 'Daily Light (DLI)', unit: 'mol/m²/d', color: '#38BDF8' },
  { id: 'lux', title: 'Illuminance', unit: 'lux', color: '#F59E0B' },
  { id: 'cct', title: 'Color Temp', unit: 'Kelvin', color: '#C084FC' },
];

export default function ReticleOverlay({
  activeModeIndex = 0,
  onSelectMode,
  reading = {},
  unitIsLux = true,
  onInfoPress,
}) {
  const mode = MEASURE_MODES[activeModeIndex] || MEASURE_MODES[0];

  let displayValue = '—';
  let displayUnit = mode.unit;

  if (mode.id === 'ppfd') {
    displayValue = reading.ppfd != null ? Math.round(reading.ppfd) : '—';
  } else if (mode.id === 'dli') {
    displayValue = reading.dli != null ? reading.dli.toFixed(1) : '—';
  } else if (mode.id === 'lux') {
    if (unitIsLux) {
      displayValue = reading.lux != null ? Math.round(reading.lux).toLocaleString() : '—';
      displayUnit = 'lux';
    } else {
      displayValue = reading.fc != null ? Math.round(reading.fc).toLocaleString() : '—';
      displayUnit = 'fc';
    }
  } else if (mode.id === 'cct') {
    displayValue = reading.cct != null ? `${Math.round(reading.cct)}` : '—';
    displayUnit = 'K';
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Large Square Reticle Box */}
      <View style={styles.reticleBox}>
        {/* 4 Corner Brackets [ ] */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Reticle Content */}
        <View style={styles.reticleContent}>
          {/* Orange Mode Pill Badge */}
          <TouchableOpacity style={styles.pillBadge} onPress={onInfoPress}>
            <Text style={styles.pillText}>{mode.title}</Text>
            <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* HUGE Value Readout */}
          <Text style={styles.hugeValue}>{displayValue}</Text>

          {/* Mode Title & Unit */}
          <Text style={styles.unitLabel}>{mode.title}</Text>
          <Text style={styles.unitSub}>{displayUnit}</Text>

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {MEASURE_MODES.map((m, idx) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.dot, idx === activeModeIndex && styles.dotActive]}
                onPress={() => onSelectMode(idx)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  reticleBox: {
    width: 280,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FF9500',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  reticleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  hugeValue: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  unitLabel: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  unitSub: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
