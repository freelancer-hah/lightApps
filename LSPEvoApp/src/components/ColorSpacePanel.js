import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SPECTRAL_LOCUS } from '../engine/spectralLocus';
import { planckianLocusXy } from '../engine/colorScience';

const W = 320, H = 320;
const PAD_L = 34, PAD_R = 14, PAD_T = 14, PAD_B = 34;
const X_MAX = 0.8, Y_MAX = 0.9;

function toScreen(x, y) {
  const sx = PAD_L + (x / X_MAX) * (W - PAD_L - PAD_R);
  const sy = H - PAD_B - (y / Y_MAX) * (H - PAD_T - PAD_B);
  return { x: sx, y: sy };
}

function xyToDisplayRgb(x, y) {
  const Y = 0.6;
  const X = (Y / y) * x;
  const Z = (Y / y) * (1 - x - y);
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;
  const max = Math.max(r, g, b, 1e-6);
  r = Math.max(0, r / max);
  g = Math.max(0, g / max);
  b = Math.max(0, b / max);
  const gamma = (c) => Math.round(255 * Math.pow(c, 1 / 2.2));
  return `rgb(${gamma(r)},${gamma(g)},${gamma(b)})`;
}

function isInsideLocus(x, y) {
  let inside = false;
  const pts = SPECTRAL_LOCUS;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const PLANCK_LABELS = [1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5500, 6500, 8000, 10000, 15000, 20000, 40000];

export default function ColorSpacePanel({ xy, onClose }) {
  const gridCells = useMemo(() => {
    const cells = [];
    const step = 0.02;
    for (let gx = 0; gx < X_MAX; gx += step) {
      for (let gy = 0; gy < Y_MAX; gy += step) {
        if (gx + gy > 1) continue;
        if (!isInsideLocus(gx + step / 2, gy + step / 2)) continue;
        const p1 = toScreen(gx, gy);
        const p2 = toScreen(gx + step, gy + step);
        cells.push({ x: p1.x, y: p2.y, w: p2.x - p1.x, h: p1.y - p2.y, color: xyToDisplayRgb(gx + step / 2, gy + step / 2) });
      }
    }
    return cells;
  }, []);

  const locusPts = SPECTRAL_LOCUS.map((p) => toScreen(p.x, p.y));
  const locusPath = locusPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const planckPts = [];
  for (let T = 1000; T <= 40000; T += 100) {
    const { x, y } = planckianLocusXy(T);
    planckPts.push(toScreen(x, y));
  }
  const planckPath = planckPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const measuredPt = xy ? toScreen(xy.x, xy.y) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>COLOR SPACE</Text>
        <View style={styles.xyText}>
          <Text style={styles.xyLine}>X: {xy ? xy.x.toFixed(6) : '—'}</Text>
          <Text style={styles.xyLine}>Y: {xy ? xy.y.toFixed(6) : '—'}</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Rect x={0} y={0} width={W} height={H} fill="#000000" />
        {gridCells.map((c, i) => (
          <Rect key={i} x={c.x} y={c.y} width={c.w + 0.5} height={c.h + 0.5} fill={c.color} />
        ))}
        <Path d={locusPath} stroke="#666" strokeWidth={1} fill="none" />
        <Path d={planckPath} stroke="#000000" strokeWidth={1.2} fill="none" strokeDasharray="2,2" />

        {PLANCK_LABELS.map((T) => {
          const { x, y } = planckianLocusXy(T);
          const pos = toScreen(x, y);
          return (
            <SvgText key={T} x={pos.x} y={pos.y - 4} fontSize="7" fill="#CCCCCC" textAnchor="middle">
              {T >= 1000 ? `${T / 1000}${T >= 10000 ? '000' : '0'}K` : `${T}K`}
            </SvgText>
          );
        })}

        {measuredPt && <Circle cx={measuredPt.x} cy={measuredPt.y} r={5} fill="#FF3B30" stroke="#FFFFFF" strokeWidth={1} />}
      </Svg>

      <Text style={styles.caption}>CIE 1931</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(20,20,22,0.97)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#2A2A2C', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', paddingHorizontal: 4 },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  xyText: { alignItems: 'flex-end' },
  xyLine: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  caption: { color: '#8E8E93', fontSize: 12, fontWeight: '700', marginTop: 4 },
});
