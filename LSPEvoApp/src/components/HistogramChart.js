import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const W = 320, H = 130;

export default function HistogramChart({ histogram, size = W }) {
  const scale = size / W;
  const height = (H / W) * size;

  if (!histogram) {
    return (
      <View style={[styles.empty, { width: size, height }]}>
        <Text style={styles.emptyText}>No histogram data yet</Text>
      </View>
    );
  }

  const { bins, r, g, b } = histogram;
  const barW = W / bins;

  const bars = (arr, color, offset) =>
    arr.map((v, i) => (
      <Rect
        key={`${color}-${i}`}
        x={i * barW + offset}
        y={H - v * H}
        width={barW / 3.2}
        height={Math.max(1, v * H)}
        fill={color}
        opacity={0.85}
      />
    ));

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`}>
        {bars(r, '#FF4D4D', 0)}
        {bars(g, '#3DDC5A', barW / 3.2)}
        {bars(b, '#4D8CFF', (barW / 3.2) * 2)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E', borderRadius: 12 },
  emptyText: { color: '#5A5A5C', fontSize: 13 },
});
