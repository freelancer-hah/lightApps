import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const RISK_COLORS = {
  Low: '#16A34A',
  Moderate: '#D97706',
  High: '#EF4444',
};

export default function WaveExplainer({ message, riskLabel }) {
  const color = RISK_COLORS[riskLabel] || '#16A34A';
  return (
    <View style={styles.card}>
      <Svg width="100%" height={16} viewBox="0 0 400 16" preserveAspectRatio="none">
        <Path
          d="M0,8 C40,0 80,16 120,8 C160,0 200,16 240,8 C280,0 320,16 360,8 C380,4 390,6 400,8 L400,0 L0,0 Z"
          fill={color}
        />
      </Svg>
      <View style={styles.textWrap}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EDEDE3',
  },
  textWrap: { paddingHorizontal: 10, paddingVertical: 6 },
  message: { color: '#1C1C1E', fontSize: 13, fontWeight: '700', lineHeight: 16 },
});
