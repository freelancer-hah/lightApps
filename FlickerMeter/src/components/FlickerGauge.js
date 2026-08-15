import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Circle, Polygon } from 'react-native-svg';

const SIZE_W = 320;
const SIZE_H = 190;
const CX = 160;
const CY = 168;
const R_OUTER = 138;
const R_TICK_OUTER = 138;
const R_TICK_INNER_MAJOR = 118;
const R_TICK_INNER_MINOR = 128;
const R_LABEL = 100;
const R_NEEDLE = 112;

function polar(cx, cy, r, valueDeg) {
  const rad = (valueDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function valueToAngle(value) {
  return 180 - (value / 100) * 180;
}

export default function FlickerGauge({ value = 0, size = SIZE_W }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const needleAngle = valueToAngle(clamped);
  const needleTip = polar(CX, CY, R_NEEDLE, needleAngle);
  const needleBaseL = polar(CX, CY, 10, needleAngle + 90);
  const needleBaseR = polar(CX, CY, 10, needleAngle - 90);

  const arcStart = polar(CX, CY, R_OUTER, 180);
  const arcEnd = polar(CX, CY, R_OUTER, 0);
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${R_OUTER} ${R_OUTER} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  const ticks = [];
  for (let v = 0; v <= 100; v += 2) {
    const isMajor = v % 10 === 0;
    const angle = valueToAngle(v);
    const outer = polar(CX, CY, R_TICK_OUTER, angle);
    const inner = polar(CX, CY, isMajor ? R_TICK_INNER_MAJOR : R_TICK_INNER_MINOR, angle);
    ticks.push(
      <Line
        key={v}
        x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
        stroke="#FFFFFF"
        strokeWidth={isMajor ? 2 : 1}
      />
    );
  }

  const labels = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  return (
    <View style={{ width: size, height: (SIZE_H / SIZE_W) * size }}>
      <Svg width={size} height={(SIZE_H / SIZE_W) * size} viewBox={`0 0 ${SIZE_W} ${SIZE_H}`}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#16A34A" />
            <Stop offset="0.35" stopColor="#B8E23A" />
            <Stop offset="0.55" stopColor="#F4E13A" />
            <Stop offset="0.75" stopColor="#F5A33A" />
            <Stop offset="1" stopColor="#F0473C" />
          </LinearGradient>
        </Defs>

        <Path d={arcPath} stroke="url(#gaugeGradient)" strokeWidth={26} fill="none" strokeLinecap="butt" />

        {ticks}

        {labels.map((v) => {
          const angle = valueToAngle(v);
          const pos = polar(CX, CY, R_LABEL, angle);
          return (
            <SvgText
              key={v}
              x={pos.x}
              y={pos.y + 5}
              fontSize="15"
              fontWeight="700"
              fill="#555555"
              textAnchor="middle"
            >
              {v}
            </SvgText>
          );
        })}

        <SvgText x={polar(CX, CY, R_LABEL + 6, 178).x} y={polar(CX, CY, R_LABEL + 6, 178).y + 6} fontSize="13" fontWeight="800" fill="#16A34A" textAnchor="start">
          LOW
        </SvgText>
        <SvgText x={polar(CX, CY, R_LABEL + 6, 2).x} y={polar(CX, CY, R_LABEL + 6, 2).y + 6} fontSize="13" fontWeight="800" fill="#F0473C" textAnchor="end">
          HIGH
        </SvgText>

        <Polygon
          points={`${needleTip.x},${needleTip.y} ${needleBaseL.x},${needleBaseL.y} ${needleBaseR.x},${needleBaseR.y}`}
          fill="#1C1C1E"
        />
        <Circle cx={CX} cy={CY} r={9} fill="#1C1C1E" />
      </Svg>
    </View>
  );
}
