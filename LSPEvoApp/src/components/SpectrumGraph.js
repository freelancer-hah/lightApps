import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { wavelengthToHex } from '../engine/wavelengthColor';

const W = 320, H = 170;
const PAD_L = 30, PAD_R = 10, PAD_T = 10, PAD_B = 22;
const WL_MIN = 360, WL_MAX = 800;

function xFor(wl) {
  const t = (wl - WL_MIN) / (WL_MAX - WL_MIN);
  return PAD_L + t * (W - PAD_L - PAD_R);
}
function yFor(intensityNorm) {
  return H - PAD_B - intensityNorm * (H - PAD_T - PAD_B);
}

export default function SpectrumGraph({ spectrum, size = W }) {
  const scale = size / W;
  const height = (H / W) * size;

  if (!spectrum?.length) {
    return (
      <View style={[styles.empty, { width: size, height }]}>
        <Text style={styles.emptyText}>No spectrum data yet</Text>
      </View>
    );
  }

  const maxIntensity = Math.max(...spectrum.map((p) => p.intensity), 1);
  const points = spectrum.map((p) => ({
    x: xFor(p.wl),
    y: yFor(p.intensity / maxIntensity),
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD_B} L ${points[0].x} ${H - PAD_B} Z`;

  // Rainbow strip along the wavelength axis, one thin rect per 10nm.
  const rainbowRects = [];
  for (let wl = 380; wl < 780; wl += 10) {
    rainbowRects.push(
      <Rect
        key={wl}
        x={xFor(wl)}
        y={H - PAD_B}
        width={xFor(wl + 10) - xFor(wl)}
        height={6}
        fill={wavelengthToHex(wl + 5)}
      />
    );
  }

  const axisLabels = [360, 510, 650, 800];

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`}>
        {rainbowRects}
        {axisLabels.map((wl) => (
          <SvgText key={wl} x={xFor(wl)} y={H - 2} fontSize="9" fill="#8E8E93" textAnchor="middle">
            {wl}
          </SvgText>
        ))}
        <Line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#3A3A3C" strokeWidth={1} />
        <Path d={areaPath} fill="rgba(255,255,255,0.08)" />
        <Path d={linePath} stroke="#FFFFFF" strokeWidth={1.6} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E', borderRadius: 12 },
  emptyText: { color: '#5A5A5C', fontSize: 13 },
});
