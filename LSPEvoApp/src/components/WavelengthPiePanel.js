import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { computeWavelengthDistribution } from '../engine/wavelengthBands';

const SIZE = 170;
const CX = SIZE / 2, CY = SIZE / 2, R = SIZE / 2 - 4;

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function WavelengthPiePanel({ spectrum, isEstimated, onClose }) {
  const bands = computeWavelengthDistribution(spectrum);

  let angle = -90;
  const slices = bands?.filter((b) => b.percent > 0.4).map((b) => {
    const sweep = (b.percent / 100) * 360;
    const path = arcPath(CX, CY, R, angle, angle + sweep);
    const midAngle = angle + sweep / 2;
    const labelPos = polar(CX, CY, R * 0.62, midAngle);
    angle += sweep;
    return { ...b, path, labelPos };
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>WAVELENGTH DISTRIBUTION</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <G>
            {slices?.map((s) => <Path key={s.key} d={s.path} fill={s.color} />)}
          </G>
          {slices?.map((s) => (
            <SvgText key={`${s.key}-label`} x={s.labelPos.x} y={s.labelPos.y} fontSize="11" fontWeight="bold" fill="#0B0B0C" textAnchor="middle">
              {s.percent.toFixed(0)}%
            </SvgText>
          ))}
        </Svg>

        <View style={styles.legend}>
          {bands?.map((b) => (
            <View key={b.key} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: b.color }]} />
              <Text style={styles.legendText}>{b.label}{'\n'}<Text style={styles.legendWl}>{b.repWl}nm</Text></Text>
            </View>
          ))}
        </View>
      </View>

      {isEstimated && (
        <Text style={styles.note}>
          Estimated from RGB - attach the CD diffuser and calibrate for a real measured distribution.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(20,20,22,0.97)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2C' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  body: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legend: { marginLeft: 14, flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: '#D8D8DC', fontSize: 10, fontWeight: '700' },
  legendWl: { color: '#8E8E93', fontSize: 9, fontWeight: '400' },
  note: { color: '#F0B27A', fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 15 },
});
