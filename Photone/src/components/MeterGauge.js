import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function MeterGauge({
  ppfd = 0,
  targetMin = 300,
  targetMax = 600,
  statusObj = { status: 'Optimal', color: '#10B981', label: 'Optimal DLI Target' },
}) {
  const displayPpfd = Math.round(ppfd || 0);
  const maxScale = Math.max(1200, targetMax * 1.5);
  const percentage = Math.min(0.99, Math.max(0.001, displayPpfd / maxScale));

  // Gauge Arc parameters
  const radius = 100;
  const strokeWidth = 14;
  const cx = 130;
  const cy = 130;
  const startAngle = -210; // degrees
  const endAngle = 30; // degrees
  const angleRange = endAngle - startAngle;

  const currentAngle = startAngle + percentage * angleRange;

  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, r, startA, endA) => {
    const safeEndA = Math.abs(endA - startA) < 0.2 ? startA + 0.2 : endA;
    const start = polarToCartesian(x, y, r, safeEndA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = safeEndA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const backgroundArc = describeArc(cx, cy, radius, startAngle, endAngle);
  const progressArc = describeArc(cx, cy, radius, startAngle, currentAngle);

  // Target Zone Arc
  const targetMinPct = Math.min(0.99, Math.max(0.001, targetMin / maxScale));
  const targetMaxPct = Math.min(0.99, Math.max(0.001, targetMax / maxScale));
  const targetStartAngle = startAngle + targetMinPct * angleRange;
  const targetEndAngle = startAngle + targetMaxPct * angleRange;
  const targetArc = describeArc(cx, cy, radius, targetStartAngle, targetEndAngle);

  return (
    <View style={styles.container}>
      <Svg width={260} height={210} viewBox="0 0 260 210">
        {/* Background Track */}
        <Path
          d={backgroundArc}
          fill="none"
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Target Zone Arc */}
        <Path
          d={targetArc}
          fill="none"
          stroke="#10B98133"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
        />

        {/* Dynamic Progress Arc */}
        {displayPpfd > 0 && (
          <Path
            d={progressArc}
            fill="none"
            stroke={statusObj.color || '#10B981'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </Svg>

      <View style={styles.centerOverlay}>
        <Text style={styles.ppfdValue}>{displayPpfd}</Text>
        <Text style={styles.ppfdUnit}>µmol/m²/s</Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusObj.color || '#10B981') + '22', borderColor: statusObj.color || '#10B981' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusObj.color || '#10B981' }]} />
          <Text style={[styles.statusText, { color: statusObj.color || '#10B981' }]}>{statusObj.status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 210,
    marginVertical: 4,
  },
  centerOverlay: {
    position: 'absolute',
    top: 55,
    alignItems: 'center',
  },
  ppfdValue: {
    color: '#F8FAFC',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  ppfdUnit: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '700',
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
