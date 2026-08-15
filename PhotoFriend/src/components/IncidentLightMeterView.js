import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

export default function IncidentLightMeterView({ ev = 0.3, lux = 3.0 }) {
  const clampedEv = Math.max(-10, Math.min(20, ev));
  const evPercent = ((clampedEv - (-10)) / (20 - (-10))) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.meterBarBox}>
        <Svg width="100%" height={36}>
          <Line x1="10" y1="24" x2="95%" y2="24" stroke="#374151" strokeWidth="2" />
          {[-10, 0, 10, 20].map((val) => {
            const xPct = ((val - (-10)) / 30) * 85 + 7;
            return (
              <React.Fragment key={`lcd-tick-${val}`}>
                <Line x1={`${xPct}%`} y1={12} x2={`${xPct}%`} y2={24} stroke="#111827" strokeWidth="2" />
              </React.Fragment>
            );
          })}
        </Svg>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleText}>-10</Text>
          <Text style={styles.scaleText}>0</Text>
          <Text style={styles.scaleText}>10</Text>
          <Text style={styles.scaleText}>20</Text>
        </View>

        <View style={[styles.pointerPin, { left: `${evPercent}%` }]} />
      </View>

      <View style={styles.digitalBody}>
        <View style={styles.lcdRow}>
          <Text style={styles.lcdBigVal}>{ev.toFixed(1)}</Text>
          <Text style={styles.lcdUnit}>EV</Text>
        </View>

        <View style={styles.lcdRow}>
          <Text style={styles.lcdBigVal}>{lux.toFixed(1)}</Text>
          <Text style={styles.lcdUnit}>lux</Text>
        </View>
      </View>

      <View style={styles.conversionBanner}>
        <Text style={styles.conversionText}>
          Converted {lux.toFixed(1)} lux to {ev.toFixed(1)}EV
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#A3B18A',
    padding: 12,
    justifyContent: 'space-between',
  },
  meterBarBox: {
    position: 'relative',
    height: 48,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: -8,
  },
  scaleText: {
    color: '#344E41',
    fontSize: 11,
    fontWeight: '700',
  },
  pointerPin: {
    position: 'absolute',
    top: 4,
    width: 3,
    height: 22,
    backgroundColor: '#111827',
    marginLeft: -1.5,
  },
  digitalBody: {
    alignItems: 'flex-end',
    paddingRight: 24,
    gap: 8,
  },
  lcdRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  lcdBigVal: {
    color: '#111827',
    fontSize: 38,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  lcdUnit: {
    color: '#344E41',
    fontSize: 14,
    fontWeight: '800',
  },
  conversionBanner: {
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  conversionText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
});
