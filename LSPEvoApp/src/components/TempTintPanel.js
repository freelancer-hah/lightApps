import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { classifyLightSource } from '../engine/lightSource';

const CCT_MIN = 1500, CCT_MAX = 9000;
const CCT_TICKS = [1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500];
const TINT_MIN = -100, TINT_MAX = 100;

export default function TempTintPanel({ cct, tint, onClose }) {
  const source = classifyLightSource(cct);

  const cctClamped = cct != null ? Math.max(CCT_MIN, Math.min(CCT_MAX, cct)) : CCT_MIN;
  const cctPct = ((cctClamped - CCT_MIN) / (CCT_MAX - CCT_MIN)) * 100;

  const tintClamped = tint != null ? Math.max(TINT_MIN, Math.min(TINT_MAX, tint)) : 0;
  const tintPct = ((tintClamped - TINT_MIN) / (TINT_MAX - TINT_MIN)) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>TEMPERATURE & TINT</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.sourceRow}>
        <Ionicons name={source.icon} size={26} color="#F0B27A" />
        <Text style={styles.sourceLabel}>{source.label}</Text>
      </View>

      <View style={styles.barWrap}>
        <LinearGradient
          colors={['#FF4D1A', '#FFAA5C', '#FFE8C8', '#FFFFFF', '#C9E4FF', '#5CB8FF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.bar}
        >
          {cct != null && <View style={[styles.markerRed, { left: `${cctPct}%` }]} />}
        </LinearGradient>
        <View style={styles.tickRow}>
          {CCT_TICKS.map((t) => (
            <Text key={t} style={styles.tickLabel}>{t}</Text>
          ))}
        </View>
      </View>

      <View style={[styles.barWrap, { marginTop: 18 }]}>
        <LinearGradient
          colors={['#B23FE0', '#D9A8EA', '#F0F0F0', '#A8E8B0', '#2FBF4A']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.bar}
        >
          {tint != null && <View style={[styles.markerYellow, { left: `${tintPct}%` }]} />}
        </LinearGradient>
        <View style={styles.tickRowSimple}>
          <Text style={styles.tickLabel}>-100</Text>
          <Text style={styles.tickLabel}>0</Text>
          <Text style={styles.tickLabel}>100</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(20,20,22,0.97)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2C' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sourceLabel: { color: '#F0B27A', fontSize: 15, fontWeight: '700', marginLeft: 8, textTransform: 'uppercase' },
  barWrap: { marginTop: 14 },
  bar: { height: 28, borderRadius: 4, position: 'relative' },
  markerRed: { position: 'absolute', top: -3, width: 3, height: 34, backgroundColor: '#FF3B30', marginLeft: -1.5 },
  markerYellow: { position: 'absolute', top: -3, width: 3, height: 34, backgroundColor: '#FFD400', marginLeft: -1.5 },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tickRowSimple: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tickLabel: { color: '#6E6E73', fontSize: 8 },
});
