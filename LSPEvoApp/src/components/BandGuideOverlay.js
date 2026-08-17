import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Draws a translucent horizontal guide box where the diffracted rainbow
// band should fall, matching bandRegion (0..1 normalized), so the user can
// physically align their CD grating attachment against it.
export default function BandGuideOverlay({ bandRegion, calibrated }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.box,
        {
          left: `${bandRegion.x * 100}%`,
          top: `${bandRegion.y * 100}%`,
          width: `${bandRegion.w * 100}%`,
          height: `${bandRegion.h * 100}%`,
        },
        calibrated ? styles.boxCalibrated : styles.boxUncalibrated,
      ]}
    >
      <Text style={styles.label}>{calibrated ? 'Band aligned + calibrated' : 'Align rainbow band here'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', borderWidth: 1.5, borderRadius: 4, justifyContent: 'flex-start' },
  boxUncalibrated: { borderColor: 'rgba(255,180,0,0.8)' },
  boxCalibrated: { borderColor: 'rgba(61,220,90,0.85)' },
  label: { color: '#FFFFFF', fontSize: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start', paddingHorizontal: 4, marginTop: -16 },
});
