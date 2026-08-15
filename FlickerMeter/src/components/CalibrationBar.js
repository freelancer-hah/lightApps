import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CalibrationBar() {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#2E6BFF', '#8FB3FF', '#FFFFFF', '#FFE98A', '#FFD400']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <View key={i} style={[styles.tick, i % 6 === 0 && styles.tickTall]} />
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 4 },
  bar: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tick: { width: 1, height: 14, backgroundColor: 'rgba(0,0,0,0.35)' },
  tickTall: { height: 24 },
});
