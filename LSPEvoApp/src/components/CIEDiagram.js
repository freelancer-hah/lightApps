import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { SPECTRAL_LOCUS, WHITE_POINT_D65 } from '../engine/spectralLocus';
import { planckianLocusXy } from '../engine/colorScience';

const W = 260, H = 260;
const PAD = 14;

function toScreen(x, y) {
  const sx = PAD + (x / 0.8) * (W - 2 * PAD);
  const sy = H - PAD - (y / 0.9) * (H - 2 * PAD);
  return { x: sx, y: sy };
}

export default function CIEDiagram({ xy, size = W }) {
  const height = (H / W) * size;

  const locusPts = SPECTRAL_LOCUS.map((p) => toScreen(p.x, p.y));
  const locusPath = locusPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const planckPts = [];
  for (let T = 1500; T <= 15000; T += 250) {
    const { x, y } = planckianLocusXy(T);
    planckPts.push(toScreen(x, y));
  }
  const planckPath = planckPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const whitePt = toScreen(WHITE_POINT_D65.x, WHITE_POINT_D65.y);
  const measuredPt = xy ? toScreen(xy.x, xy.y) : null;

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`}>
        <Path d={locusPath} fill="#1C1C1E" stroke="#3A3A3C" strokeWidth={1} />
        <Path d={planckPath} stroke="#F0B27A" strokeWidth={1.4} fill="none" strokeDasharray="3,2" />
        <Circle cx={whitePt.x} cy={whitePt.y} r={3} fill="#8E8E93" />
        {measuredPt && (
          <>
            <Line x1={whitePt.x} y1={whitePt.y} x2={measuredPt.x} y2={measuredPt.y} stroke="#6C86E0" strokeWidth={1} strokeDasharray="2,2" />
            <Circle cx={measuredPt.x} cy={measuredPt.y} r={5} fill="#6C86E0" stroke="#FFFFFF" strokeWidth={1.5} />
          </>
        )}
      </Svg>
      <Text style={styles.caption}>CIE 1931 xy — white point vs. Planckian locus</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { color: '#5A5A5C', fontSize: 10, textAlign: 'center', marginTop: 4 },
});
