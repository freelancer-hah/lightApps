import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SpectrumGraph from './SpectrumGraph';

export default function WavelengthSpectrumPanel({ spectrum, isEstimated, onClose }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>WAVELENGTH SPECTRUM</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      <SpectrumGraph spectrum={spectrum} size={300} />
      {isEstimated && (
        <Text style={styles.note}>
          Estimated from RGB (smooth 3-hump approximation) - attach the CD diffuser and calibrate for a real sharp-peaked spectrum.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(20,20,22,0.97)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2C', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  note: { color: '#F0B27A', fontSize: 11, textAlign: 'center', marginTop: 10, lineHeight: 15 },
});
