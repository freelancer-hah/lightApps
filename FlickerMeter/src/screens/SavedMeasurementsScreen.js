import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMeasurements } from '../context/MeasurementsContext';

const RISK_COLORS = { Low: '#16A34A', Moderate: '#D97706', High: '#EF4444' };

export default function SavedMeasurementsScreen() {
  const { measurements, deleteMeasurement } = useMeasurements();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Saved Measurements</Text>
      </View>

      {measurements.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="save-outline" size={40} color="#8E8E93" />
          <Text style={styles.emptyText}>No saved measurements yet.{'\n'}Tap Save on the Home screen to record one.</Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: RISK_COLORS[item.riskLabel] || '#16A34A' }]} />
              <View style={styles.info}>
                <Text style={styles.percent}>{item.percent.toFixed(0)}% Flickering</Text>
                <Text style={styles.sub}>
                  {item.frequency ? `${item.frequency.toFixed(0)} Hz · ` : ''}
                  {item.riskLabel} risk · {new Date(item.savedAt).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteMeasurement(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  topBar: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20 },
  title: { color: '#1C1C1E', fontSize: 22, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: '#6E6E73', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  info: { flex: 1 },
  percent: { color: '#1C1C1E', fontSize: 16, fontWeight: '700' },
  sub: { color: '#6E6E73', fontSize: 12, marginTop: 3 },
  deleteBtn: { padding: 6 },
});
