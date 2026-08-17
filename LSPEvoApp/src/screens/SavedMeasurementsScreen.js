import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';

export default function SavedMeasurementsScreen() {
  const { measurements, deleteMeasurement } = useAppState();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Saved Measurements</Text>
      </View>

      {measurements.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="save-outline" size={40} color="#3A3A3C" />
          <Text style={styles.emptyText}>No saved measurements yet.{'\n'}Tap Save on the Home screen to record one.</Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.mode === 'diffraction' ? 'SPEC' : 'EST'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.cct}>{Math.round(item.cct)}K · {item.mired?.toFixed(0)} mired</Text>
                <Text style={styles.sub}>
                  Tint {item.tint != null ? item.tint.toFixed(2) : '—'}
                  {item.gIndex != null ? ` · G-Index ${item.gIndex.toFixed(2)}` : ''}
                  {item.lux != null ? ` · E ${item.lux.toFixed(0)}lx` : ''}
                  {item.ppfd != null ? ` · PPFD ${item.ppfd.toFixed(2)}` : ''}
                </Text>
                <Text style={styles.date}>{new Date(item.savedAt).toLocaleString()}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteMeasurement(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0C' },
  topBar: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  badge: { width: 46, height: 32, borderRadius: 8, backgroundColor: '#2E4FA0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  info: { flex: 1 },
  cct: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sub: { color: '#8E8E93', fontSize: 12, marginTop: 3 },
  date: { color: '#5A5A5C', fontSize: 11, marginTop: 3 },
  deleteBtn: { padding: 6 },
});
