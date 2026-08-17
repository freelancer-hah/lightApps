import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Approximates the blocky LCD digit look from the screenshots using a
// bold monospace font on individual dark tiles per character, rather than
// a custom font asset.
export default function SevenSegmentText({ value, size = 52 }) {
  const chars = String(value).split('');
  return (
    <View style={styles.row}>
      {chars.map((c, i) => (
        <View key={i} style={[styles.tile, { width: size * 0.62, height: size * 1.15 }]}>
          <Text style={[styles.char, { fontSize: size }]}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  tile: { alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  char: {
    color: '#FFFFFF',
    fontFamily: 'Courier',
    fontWeight: '900',
    letterSpacing: 0,
  },
});
