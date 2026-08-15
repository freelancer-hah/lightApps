import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DUV_MIN = -0.03;
const DUV_MAX = 0.03;
const TICKS = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03];

export default function DuvBar({ duv }) {
  const clamped = duv != null ? Math.max(DUV_MIN, Math.min(DUV_MAX, duv)) : 0;
  const markerPct = ((clamped - DUV_MIN) / (DUV_MAX - DUV_MIN)) * 100;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#E040D6', '#F0A8E8', '#FFFFFF', '#A8E8B0', '#3DDC5A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        {duv != null && <View style={[styles.marker, { left: `${markerPct}%` }]} />}
      </LinearGradient>
      <View style={styles.labelRow}>
        {TICKS.map((t) => (
          <Text key={t} style={styles.tickLabel}>{t === 0 ? '0' : t.toFixed(2)}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 6 },
  bar: { height: 28, borderRadius: 6, position: 'relative' },
  marker: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 34,
    backgroundColor: '#F0B27A',
    marginLeft: -1.5,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tickLabel: { color: '#8E8E93', fontSize: 11 },
});
