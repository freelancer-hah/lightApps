import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BUTTONS = [
  { key: 'histogram', icon: 'bar-chart-outline' },
  { key: 'wavelengthPie', icon: 'pie-chart-outline' },
  { key: 'wavelengthSpectrum', glyph: '\u03BB' }, // λ
  { key: 'colorSpace', icon: 'color-palette-outline' },
  { key: 'calibration', icon: 'options-outline' },
  { key: 'save', icon: 'download-outline' },
  { key: 'saved', icon: 'archive-outline' },
  { key: 'flipCamera', icon: 'camera-reverse-outline' },
];

export default function IconRail({ activePanel, onPress }) {
  return (
    <View style={styles.rail}>
      {BUTTONS.map((b) => (
        <TouchableOpacity
          key={b.key}
          style={[styles.btn, activePanel === b.key && styles.btnActive]}
          onPress={() => onPress(b.key)}
        >
          {b.glyph ? (
            <Text style={styles.glyph}>{b.glyph}</Text>
          ) : (
            <Ionicons name={b.icon} size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { position: 'absolute', right: 14, top: 68, alignItems: 'center' },
  btn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(20,20,22,0.85)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  btnActive: { backgroundColor: 'rgba(46,79,160,0.9)' },
  glyph: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});
