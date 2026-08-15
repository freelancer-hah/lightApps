import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Circle, Polygon } from 'react-native-svg';
import { WB_PRESETS } from '../engine/whiteBalance';

const SIZE_W = 320;
const SIZE_H = 200;
const CX = 160;
const CY = 176;
const R_OUTER = 140;
const R_TICK_INNER_MAJOR = 118;
const R_TICK_INNER_MINOR = 130;
const R_LABEL = 98;
const R_PRESET_ICON = 140;
const R_NEEDLE = 116;

const GAUGE_MIN = 2000;
const GAUGE_MAX = 8000;
const LABELS = [3000, 4000, 5000, 6000, 7000];

const PRESET_GLYPHS = {
  tungsten: '\u{1F4A1}',
  fluorescent: '\u25AC',
  daylight: '\u2600',
  cloudy: '\u2601',
  shade: '\u{1F3E0}',
};

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function valueToAngle(v) {
  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, v));
  const t = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  return 180 - t * 180;
}

export default function KelvinGauge({ cct, size = SIZE_W }) {
  const height = (SIZE_H / SIZE_W) * size;
  const hasReading = cct != null;
  const angle = valueToAngle(cct ?? GAUGE_MIN);

  const needleTip = polar(CX, CY, R_NEEDLE, angle);
  const needleBaseL = polar(CX, CY, 9, angle + 90);
  const needleBaseR = polar(CX, CY, 9, angle - 90);

  const arcStart = polar(CX, CY, R_OUTER, 180);
  const arcEnd = polar(CX, CY, R_OUTER, 0);
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${R_OUTER} ${R_OUTER} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  const ticks = [];
  for (let v = GAUGE_MIN; v <= GAUGE_MAX; v += 100) {
    const isMajor = v % 1000 === 0;
    const a = valueToAngle(v);
    const outer = polar(CX, CY, R_OUTER, a);
    const inner = polar(CX, CY, isMajor ? R_TICK_INNER_MAJOR : R_TICK_INNER_MINOR, a);
    ticks.push(
      <Line key={v} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#FFFFFF" strokeWidth={isMajor ? 2 : 1} />
    );
  }

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`0 0 ${SIZE_W} ${SIZE_H}`}>
        <Defs>
          <LinearGradient id="kelvinGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#F5A05A" />
            <Stop offset="0.5" stopColor="#F2EDE6" />
            <Stop offset="1" stopColor="#6C86E0" />
          </LinearGradient>
        </Defs>

        <Path d={arcPath} stroke="url(#kelvinGradient)" strokeWidth={26} fill="none" />

        {ticks}

        {LABELS.map((v) => {
          const a = valueToAngle(v);
          const pos = polar(CX, CY, R_LABEL, a);
          return (
            <SvgText key={v} x={pos.x} y={pos.y + 5} fontSize="15" fontWeight="700" fill="#555555" textAnchor="middle">
              {v}
            </SvgText>
          );
        })}

        {WB_PRESETS.map((p) => {
          const a = valueToAngle(p.cct);
          const pos = polar(CX, CY, R_PRESET_ICON, a);
          return (
            <SvgText key={p.key} x={pos.x} y={pos.y + 5} fontSize="13" textAnchor="middle">
              {PRESET_GLYPHS[p.key]}
            </SvgText>
          );
        })}

        <SvgText x={16} y={SIZE_H - 30} fontSize="14" fontWeight="800" fill="#F5A05A" textAnchor="start">
          Warm White
        </SvgText>
        <SvgText x={SIZE_W - 16} y={SIZE_H - 30} fontSize="14" fontWeight="800" fill="#6C86E0" textAnchor="end">
          Cold White
        </SvgText>

        {hasReading && (
          <>
            <Polygon
              points={`${needleTip.x},${needleTip.y} ${needleBaseL.x},${needleBaseL.y} ${needleBaseR.x},${needleBaseR.y}`}
              fill="#F0B27A"
            />
            <Circle cx={CX} cy={CY} r={8} fill="#F0B27A" />
          </>
        )}
      </Svg>
    </View>
  );
}
