import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { SPECTRAL_LOCUS, WHITE_POINT_D65 } from '../utils/spectralLocus';

const SRGB_GAMUT = [
  { x: 0.64, y: 0.33 },
  { x: 0.30, y: 0.60 },
  { x: 0.15, y: 0.06 },
];

const PLANCKIAN_LOCUS = [
  { k: 1500, x: 0.586, y: 0.393 },
  { k: 2000, x: 0.527, y: 0.413 },
  { k: 2700, x: 0.458, y: 0.410 },
  { k: 3000, x: 0.437, y: 0.404 },
  { k: 4000, x: 0.380, y: 0.380 },
  { k: 5000, x: 0.345, y: 0.355 },
  { k: 6500, x: 0.313, y: 0.329 },
  { k: 8000, x: 0.295, y: 0.310 },
  { k: 10000, x: 0.281, y: 0.288 },
];

export default function CieDiagramSvg({
  x = 0.3127,
  y = 0.3290,
  uPrime = 0.1978,
  vPrime = 0.4683,
  showGamut = true,
  showPlanckian = true,
  showD65 = true,
  height = 260,
}) {
  const width = 280;

  const mapX = (valX) => 30 + valX * 300;
  const mapY = (valY) => height - 30 - valY * 260;

  const locusPoints = SPECTRAL_LOCUS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');
  const locusClosedPath = `${locusPoints} Z`;
  const gamutPoints = SRGB_GAMUT.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(' ');
  const planckianPath = PLANCKIAN_LOCUS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');

  const px = mapX(Math.max(0, Math.min(0.8, x)));
  const py = mapY(Math.max(0, Math.min(0.9, y)));

  const d65Px = mapX(WHITE_POINT_D65.x);
  const d65Py = mapY(WHITE_POINT_D65.y);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((gridX) => (
          <Line
            key={`gx-${gridX}`}
            x1={mapX(gridX)}
            y1={mapY(0)}
            x2={mapX(gridX)}
            y2={mapY(0.9)}
            stroke="#E5E5EA"
            strokeWidth="0.8"
            strokeDasharray="2,3"
          />
        ))}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((gridY) => (
          <Line
            key={`gy-${gridY}`}
            x1={mapX(0)}
            y1={mapY(gridY)}
            x2={mapX(0.8)}
            y2={mapY(gridY)}
            stroke="#E5E5EA"
            strokeWidth="0.8"
            strokeDasharray="2,3"
          />
        ))}

        <Line x1={mapX(0)} y1={mapY(0)} x2={mapX(0.8)} y2={mapY(0)} stroke="#8E8E93" strokeWidth="1.5" />
        <Line x1={mapX(0)} y1={mapY(0)} x2={mapX(0)} y2={mapY(0.9)} stroke="#8E8E93" strokeWidth="1.5" />

        <SvgText x={mapX(0.78)} y={mapY(0) + 18} fill="#555555" fontSize="10" fontWeight="bold">
          x
        </SvgText>
        <SvgText x={mapX(0) - 16} y={mapY(0.86)} fill="#555555" fontSize="10" fontWeight="bold">
          y
        </SvgText>

        <Path d={locusClosedPath} fill="rgba(0, 0, 0, 0.02)" stroke="#555555" strokeWidth="1.5" />

        {[400, 470, 500, 520, 540, 570, 600, 700].map((wl) => {
          const pt = SPECTRAL_LOCUS.find((p) => p.wl === wl);
          if (!pt) return null;
          return (
            <G key={`wl-${wl}`}>
              <Circle cx={mapX(pt.x)} cy={mapY(pt.y)} r="2" fill="#0891B2" />
              <SvgText
                x={mapX(pt.x) + (pt.x > 0.4 ? 6 : -18)}
                y={mapY(pt.y) + (pt.y > 0.5 ? -6 : 10)}
                fill="#555555"
                fontSize="8"
              >
                {wl}
              </SvgText>
            </G>
          );
        })}

        {showGamut && (
          <Polygon points={gamutPoints} fill="rgba(0, 0, 0, 0.04)" stroke="#8E8E93" strokeWidth="1.2" strokeDasharray="4,2" />
        )}

        {showPlanckian && <Path d={planckianPath} fill="none" stroke="#D97706" strokeWidth="1.5" />}

        {showD65 && (
          <G key="d65">
            <Circle cx={d65Px} cy={d65Py} r="3.5" fill="#555555" />
            <SvgText x={d65Px + 5} y={d65Py + 3} fill="#1C1C1E" fontSize="9" fontWeight="600">
              D65
            </SvgText>
          </G>
        )}

        <G key="live-marker">
          <Circle cx={px} cy={py} r="12" fill="none" stroke="#FF5252" strokeWidth="1.2" opacity="0.6" />
          <Circle cx={px} cy={py} r="6" fill="#FF5252" opacity="0.4" />
          <Circle cx={px} cy={py} r="3" fill="#FF5252" />
          <Line x1={px - 14} y1={py} x2={px + 14} y2={py} stroke="#FF5252" strokeWidth="1" />
          <Line x1={px} y1={py - 14} x2={px} y2={py + 14} stroke="#FF5252" strokeWidth="1" />
        </G>
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF5252' }]} />
          <Text style={styles.legendText}>Sample (x:{x.toFixed(4)}, y:{y.toFixed(4)})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <Text style={styles.legendText}>Planckian Locus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#555555' }]} />
          <Text style={styles.legendText}>D65 White Point</Text>
        </View>
      </View>

      <View style={styles.uvReadoutRow}>
        <Text style={styles.uvText}>CIE 1976 Chromaticity: u′ = {uPrime.toFixed(4)}, v′ = {vPrime.toFixed(4)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    color: '#1C1C1E',
    fontSize: 11,
    fontWeight: '600',
  },
  uvReadoutRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    width: '100%',
    alignItems: 'center',
  },
  uvText: {
    color: '#0891B2',
    fontSize: 12,
    fontWeight: '700',
  },
});
