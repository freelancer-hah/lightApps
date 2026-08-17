import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HistogramChart from './HistogramChart';

export default function HistogramPanel({ histogram, onClose }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>RGB HISTOGRAM</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      <HistogramChart histogram={histogram} size={300} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(20,20,22,0.97)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2C', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
