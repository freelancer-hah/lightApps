import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SpectrumBar({ rgb, cct, tintHint }) {
  const r = rgb?.r || 120;
  const g = rgb?.g || 120;
  const b = rgb?.b || 120;
  const total = Math.max(1, r + g + b);

  const pctBlue = Math.round((b / total) * 100);
  const pctGreen = Math.round((g / total) * 100);
  const pctRed = Math.round((r / total) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>PAR Spectrum & CCT</Text>
        <Text style={styles.cctText}>{cct ? `${cct} K` : '— K'}</Text>
      </View>

      {/* Visual Spectrum Bar */}
      <View style={styles.spectrumWrapper}>
        <LinearGradient
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
      </View>

      <View style={styles.wavelengthLabels}>
        <Text style={styles.waveText}>400nm (UV/Blue)</Text>
        <Text style={styles.waveText}>550nm (Green)</Text>
        <Text style={styles.waveText}>700nm (Red/IR)</Text>
      </View>

      <View style={styles.ratioRow}>
        <View style={styles.ratioItem}>
          <Text style={[styles.ratioVal, { color: '#60A5FA' }]}>{pctBlue}%</Text>
          <Text style={styles.ratioLabel}>Blue (400-500nm)</Text>
        </View>

        <View style={styles.ratioItem}>
          <Text style={[styles.ratioVal, { color: '#34D399' }]}>{pctGreen}%</Text>
          <Text style={styles.ratioLabel}>Green (500-600nm)</Text>
        </View>

        <View style={styles.ratioItem}>
          <Text style={[styles.ratioVal, { color: '#F87171' }]}>{pctRed}%</Text>
          <Text style={styles.ratioLabel}>Red (600-700nm)</Text>
        </View>
      </View>

      {tintHint && (
        <View style={styles.tintFooter}>
          <Text style={styles.tintText}>Tint Balance: {tintHint}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cctText: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '800',
  },
  spectrumWrapper: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  gradientBar: {
    flex: 1,
  },
  wavelengthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  waveText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  ratioItem: {
    alignItems: 'center',
  },
  ratioVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  ratioLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tintFooter: {
    marginTop: 8,
    alignItems: 'center',
  },
  tintText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
