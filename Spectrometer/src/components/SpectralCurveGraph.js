import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function SpectralCurveGraph({ spectrum = [], dominantWavelength = null, height = 150 }) {
  const width = 300;

  if (!spectrum || spectrum.length === 0) {
    return null;
  }

  const minWl = 380;
  const maxWl = 750;

  const mapX = (wl) => 30 + ((wl - minWl) / (maxWl - minWl)) * 250;
  const mapY = (val) => height - 30 - val * (height - 45);

  const pathD = spectrum
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${mapX(pt.wl)} ${mapY(pt.intensity)}`)
    .join(' ');

  const fillD = `${pathD} L ${mapX(spectrum[spectrum.length - 1].wl)} ${mapY(0)} L ${mapX(spectrum[0].wl)} ${mapY(0)} Z`;

  let maxPt = spectrum[0];
  spectrum.forEach((pt) => {
    if (pt.intensity > maxPt.intensity) maxPt = pt;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estimated Spectral Distribution</Text>

      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="spectrumGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0.0" stopColor="#7F00FF" stopOpacity="0.8" />
            <Stop offset="0.15" stopColor="#0000FF" stopOpacity="0.8" />
            <Stop offset="0.35" stopColor="#00FFFF" stopOpacity="0.8" />
            <Stop offset="0.5" stopColor="#00FF00" stopOpacity="0.8" />
            <Stop offset="0.65" stopColor="#FFFF00" stopOpacity="0.8" />
            <Stop offset="0.8" stopColor="#FF7F00" stopOpacity="0.8" />
            <Stop offset="1.0" stopColor="#FF0000" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0891B2" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#0891B2" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        <Rect x={mapX(380)} y={height - 24} width={250} height={10} fill="url(#spectrumGradient)" rx="4" />

        {[0.25, 0.5, 0.75, 1.0].map((level) => (
          <Line
            key={`grid-${level}`}
            x1={mapX(380)}
            y1={mapY(level)}
            x2={mapX(750)}
            y2={mapY(level)}
            stroke="#E5E5EA"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        ))}

        <Path d={fillD} fill="url(#curveFill)" />
        <Path d={pathD} fill="none" stroke="#0891B2" strokeWidth="2.5" />

        {dominantWavelength && (
          <Circle
            cx={mapX(dominantWavelength)}
            cy={mapY(maxPt.intensity)}
            r="4"
            fill="#FF5252"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        )}

        {[380, 450, 520, 590, 660, 750].map((wl) => (
          <SvgText key={`tick-${wl}`} x={mapX(wl) - 10} y={height - 4} fill="#555555" fontSize="9">
            {wl}
          </SvgText>
        ))}

        <SvgText x={2} y={mapY(1.0) + 4} fill="#555555" fontSize="8">
          1.0
        </SvgText>
        <SvgText x={2} y={mapY(0.5) + 4} fill="#555555" fontSize="8">
          0.5
        </SvgText>
        <SvgText x={2} y={mapY(0.0) + 4} fill="#555555" fontSize="8">
          0.0
        </SvgText>
      </Svg>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Estimated Peak: <Text style={styles.highlightText}>{dominantWavelength ? `${dominantWavelength} nm` : 'Broad spectrum'}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  title: {
    color: '#1C1C1E',
    fontSize: 13,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  infoRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
  },
  infoText: {
    color: '#6E6E73',
    fontSize: 12,
  },
  highlightText: {
    color: '#0891B2',
    fontWeight: '700',
  },
});
