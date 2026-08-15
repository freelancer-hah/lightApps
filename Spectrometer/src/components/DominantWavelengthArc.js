import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText, G, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function DominantWavelengthArc({
  dominantWavelength = 475,
  saturation = 10,
  isCalibrated = false,
}) {
  const wl = Math.max(380, Math.min(720, dominantWavelength || 550));

  const frequencyTHz = Math.round(299792.458 / wl);
  const periodFs = (wl / 299.792458).toFixed(2);

  let categoryName = 'UV or Blue';
  let rangeStr = '300-475';
  if (wl < 440) {
    categoryName = 'UV or Violet';
    rangeStr = '300-440';
  } else if (wl < 490) {
    categoryName = 'UV or Blue';
    rangeStr = '300-475';
  } else if (wl < 520) {
    categoryName = 'Cyan';
    rangeStr = '475-520';
  } else if (wl < 565) {
    categoryName = 'Green';
    rangeStr = '500-565';
  } else if (wl < 590) {
    categoryName = 'Yellow';
    rangeStr = '565-590';
  } else if (wl < 625) {
    categoryName = 'Orange';
    rangeStr = '590-625';
  } else {
    categoryName = 'Red / Near-IR';
    rangeStr = '625-720';
  }

  const width = 310;
  const height = 180;
  const cx = 155;
  const cy = 135;
  const radius = 95;

  const startAngleDeg = 195;
  const endAngleDeg = -15;
  const totalAngleDeg = startAngleDeg - endAngleDeg;

  const wlToAngle = (w) => {
    const norm = (w - 380) / (720 - 380);
    return startAngleDeg - norm * totalAngleDeg;
  };

  const currentAngleDeg = wlToAngle(wl);
  const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

  const px = cx + radius * Math.cos(currentAngleRad);
  const py = cy - radius * Math.sin(currentAngleRad);

  const aStartRad = (startAngleDeg * Math.PI) / 180;
  const aEndRad = (endAngleDeg * Math.PI) / 180;
  const xStart = cx + radius * Math.cos(aStartRad);
  const yStart = cy - radius * Math.sin(aStartRad);
  const xEnd = cx + radius * Math.cos(aEndRad);
  const yEnd = cy - radius * Math.sin(aEndRad);

  const arcPathD = `M ${xStart} ${yStart} A ${radius} ${radius} 0 1 1 ${xEnd} ${yEnd}`;
  const satPercent = Math.max(0, Math.min(100, saturation));

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Dominant Wavelength</Text>

      <View style={styles.topReadoutRow}>
        <View style={styles.readoutBoxLeft}>
          <Text style={styles.readoutLabel}>Frequency</Text>
          <Text style={styles.readoutVal}>{frequencyTHz}+ THz</Text>
        </View>

        <View style={styles.readoutBoxRight}>
          <Text style={styles.readoutLabel}>Period</Text>
          <Text style={styles.readoutVal}>{periodFs}- fs</Text>
        </View>
      </View>

      <View style={styles.svgWrap}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="rainbowDomeGradient" x1="0" y1="1" x2="1" y2="1">
              <Stop offset="0.0" stopColor="#2563EB" />
              <Stop offset="0.18" stopColor="#0284C7" />
              <Stop offset="0.38" stopColor="#10B981" />
              <Stop offset="0.60" stopColor="#EAB308" />
              <Stop offset="0.80" stopColor="#F97316" />
              <Stop offset="1.0" stopColor="#EF4444" />
            </LinearGradient>
          </Defs>

          <Path
            d={arcPathD}
            fill="none"
            stroke="url(#rainbowDomeGradient)"
            strokeWidth="32"
            strokeLinecap="round"
          />

          {[400, 450, 500, 550, 600, 650, 700].map((tWl) => {
            const angleRad = (wlToAngle(tWl) * Math.PI) / 180;
            const rInner = radius - 14;
            const rOuter = radius + 14;
            const rText = radius - 32;

            const x1 = cx + rInner * Math.cos(angleRad);
            const y1 = cy - rInner * Math.sin(angleRad);
            const x2 = cx + rOuter * Math.cos(angleRad);
            const y2 = cy - rOuter * Math.sin(angleRad);
            const tx = cx + rText * Math.cos(angleRad);
            const ty = cy - rText * Math.sin(angleRad);

            return (
              <G key={`tick-${tWl}`}>
                <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
                <SvgText
                  x={tx}
                  y={ty + 4}
                  fill="#000000"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {tWl}
                </SvgText>
              </G>
            );
          })}

          <G key="active-pin">
            <Circle cx={px} cy={py} r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <Circle cx={px} cy={py} r="4" fill="#F59E0B" />
          </G>
        </Svg>

        <View style={styles.centerInfoBlock}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          <Text style={styles.rangeText}>{rangeStr}</Text>
          <Text style={styles.unitText}>Nanometers (nm)</Text>
          <Text style={styles.statusText}>
            {isCalibrated ? `Calibrated ${wl} nm` : `Uncalibrated ${wl} nm`}
          </Text>
        </View>
      </View>

      <View style={styles.satContainer}>
        <View style={styles.satBarWrap}>
          <View style={styles.satBarBg} />
          <View style={[styles.satPointer, { left: `${satPercent}%` }]}>
            <View style={styles.arrowDown} />
          </View>
        </View>

        <View style={styles.satTicksRow}>
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <Text key={`sat-${val}`} style={styles.satTickText}>
              {val}
            </Text>
          ))}
        </View>

        <Text style={styles.satLabelText}>Color Saturation {satPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginVertical: 6,
  },
  cardTitle: {
    color: '#1C1C1E',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  topReadoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -4,
    zIndex: 10,
    paddingHorizontal: 4,
  },
  readoutBoxLeft: {
    alignItems: 'flex-start',
  },
  readoutBoxRight: {
    alignItems: 'flex-end',
  },
  readoutLabel: {
    color: '#6E6E73',
    fontSize: 12,
    fontWeight: '500',
  },
  readoutVal: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '800',
  },
  svgWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  centerInfoBlock: {
    position: 'absolute',
    top: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    color: '#6E6E73',
    fontSize: 13,
    fontWeight: '700',
  },
  rangeText: {
    color: '#1C1C1E',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  unitText: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  statusText: {
    color: '#6E6E73',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  satContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  satBarWrap: {
    width: '100%',
    height: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  satBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0891B2',
    width: '100%',
  },
  satPointer: {
    position: 'absolute',
    top: -8,
    width: 14,
    height: 14,
    marginLeft: -7,
    alignItems: 'center',
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0891B2',
  },
  satTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  satTickText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
  },
  satLabelText: {
    color: '#555555',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
