import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ColorChipsView({
  rgb = { r: 255, g: 255, b: 255 },
  hex = '#FFFFFF',
  hsv = { h: 0, s: 0, v: 100 },
  lab = { L: 100, a: 0, b: 0 },
  dominantWavelength = 550,
  wavelengthLabel = 'Green',
}) {
  const rPct = Math.round((rgb.r / 255) * 100);
  const gPct = Math.round((rgb.g / 255) * 100);
  const bPct = Math.round((rgb.b / 255) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.swatch, { backgroundColor: hex }]} />
        <View style={styles.headerInfo}>
          <Text style={styles.hexText}>{hex}</Text>
          <Text style={styles.wlText}>
            Peak: <Text style={styles.wlVal}>{dominantWavelength ? `${dominantWavelength} nm` : 'Non-spectral'}</Text> ({wavelengthLabel})
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RGB</Text>
          <Text style={styles.cardVal}>{rgb.r}, {rgb.g}, {rgb.b}</Text>
          <Text style={styles.cardSub}>R:{rPct}% G:{gPct}% B:{bPct}%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>HSV</Text>
          <Text style={styles.cardVal}>{hsv.h}°, {hsv.s}%, {hsv.v}%</Text>
          <Text style={styles.cardSub}>Hue / Sat / Val</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>CIE L*a*b*</Text>
          <Text style={styles.cardVal}>L*:{lab.L}</Text>
          <Text style={styles.cardSub}>a*:{lab.a}  b*:{lab.b}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>HEX & Mode</Text>
          <Text style={styles.cardVal}>{hex}</Text>
          <Text style={styles.cardSub}>sRGB 8-bit</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3A3A3C',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  hexText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  wlText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  wlVal: {
    color: '#26C6DA',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48%',
    backgroundColor: '#242426',
    borderRadius: 10,
    padding: 10,
  },
  cardTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  cardSub: {
    color: '#A0A0A5',
    fontSize: 11,
    marginTop: 2,
  },
});
