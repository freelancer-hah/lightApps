import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function RgbHistogramOverlay({
  iso = 100,
  shutterLabel = '1/60',
  aperture = 2.8,
  height = 200,
}) {
  const width = 280;

  const bins = 32;
  const generateCurve = (peakBin, widthBin, maxH) => {
    let pts = [];
    for (let i = 0; i <= bins; i++) {
      const dist = Math.abs(i - peakBin);
      const intensity = maxH * Math.exp(-Math.pow(dist / widthBin, 2));
      const x = (i / bins) * width;
      const y = height - 24 - intensity;
      pts.push({ x, y });
    }
    return pts;
  };

  const lumPts = generateCurve(14, 6, 130);
  const redPts = generateCurve(18, 5, 110);
  const greenPts = generateCurve(12, 7, 120);
  const bluePts = generateCurve(8, 6, 100);

  const makePathD = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const makeFillD = (pts) =>
    `${makePathD(pts)} L ${width} ${height - 24} L 0 ${height - 24} Z`;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="lumGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {[0.25, 0.5, 0.75].map((g) => (
          <Line
            key={`hgrid-${g}`}
            x1={g * width}
            y1={0}
            x2={g * width}
            y2={height - 24}
            stroke="#E5E5EA"
            strokeWidth="0.8"
          />
        ))}

        <Path d={makeFillD(lumPts)} fill="url(#lumGrad)" />

        <Path d={makePathD(bluePts)} fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.85" />
        <Path d={makePathD(greenPts)} fill="none" stroke="#10B981" strokeWidth="2" opacity="0.85" />
        <Path d={makePathD(redPts)} fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.85" />
        <Path d={makePathD(lumPts)} fill="none" stroke="#D97706" strokeWidth="2.5" />
      </Svg>

      <View style={styles.badgeRow}>
        <Text style={styles.badgeText}>
          ISO {iso}   {shutterLabel}   f/{aperture}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  badgeText: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
