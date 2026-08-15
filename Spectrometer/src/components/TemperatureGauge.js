import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TemperatureGauge({ cct = 5500, duv = 0.0 }) {
  const minK = 1800;
  const maxK = 10000;
  const clampedK = Math.max(minK, Math.min(maxK, cct));
  const kPercent = ((clampedK - minK) / (maxK - minK)) * 100;

  const minDuv = -0.04;
  const maxDuv = 0.04;
  const clampedDuv = Math.max(minDuv, Math.min(maxDuv, duv));
  const duvPercent = ((clampedDuv - minDuv) / (maxDuv - minDuv)) * 100;

  const tintLabel = duv > 0.002 ? 'Green Tint' : duv < -0.002 ? 'Magenta Tint' : 'Neutral Tint';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Color Temperature & Tint</Text>

      <View style={styles.gaugeBlock}>
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Warm (1800K)</Text>
          <Text style={styles.valueText}>{cct} K</Text>
          <Text style={styles.labelText}>Cool (10000K)</Text>
        </View>

        <View style={styles.barContainer}>
          <LinearGradient
            colors={['#FF7E00', '#FFAA00', '#FFF4E5', '#D1E6FF', '#66A3FF', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
          <View style={[styles.pin, { left: `${kPercent}%` }]}>
            <View style={styles.pinHead} />
          </View>
        </View>
      </View>

      <View style={[styles.gaugeBlock, { marginTop: 14 }]}>
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Magenta (-0.04)</Text>
          <Text style={[styles.valueText, { color: duv > 0 ? '#4CAF50' : duv < 0 ? '#E91E63' : '#FFFFFF' }]}>
            {duv > 0 ? `+${duv.toFixed(4)}` : duv.toFixed(4)} ({tintLabel})
          </Text>
          <Text style={styles.labelText}>Green (+0.04)</Text>
        </View>

        <View style={styles.barContainer}>
          <LinearGradient
            colors={['#EC4899', '#F472B6', '#E2E8F0', '#4ADE80', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
          <View style={[styles.pin, { left: `${duvPercent}%` }]}>
            <View style={styles.pinHead} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161618',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sectionTitle: {
    color: '#E5E5EA',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  gaugeBlock: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  barContainer: {
    height: 14,
    justifyContent: 'center',
    position: 'relative',
  },
  gradientBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  pin: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 14,
    marginLeft: -6,
    alignItems: 'center',
  },
  pinHead: {
    width: 10,
    height: 14,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
});
