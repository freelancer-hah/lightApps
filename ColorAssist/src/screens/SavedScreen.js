import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { loadSamples, deleteSample } from '../utils/savedSamples';
import { rgbToHex } from '../utils/colorConversions';
import { nearestColorName } from '../utils/colorNames';

export default function SavedScreen({ navigation }) {
  const [samples, setSamples] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadSamples().then(setSamples);
    }, [])
  );

  const handleDelete = async (id) => {
    const next = await deleteSample(id);
    setSamples(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          <Text style={styles.backText}>Live</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Colors</Text>
        <View style={{ width: 60 }} />
      </View>

      {samples.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved samples yet.{'\n'}Tap + on the Live screen to save a color.</Text>
        </View>
      ) : (
        <FlatList
          data={samples}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const hex = rgbToHex(item.r, item.g, item.b);
            return (
              <View style={styles.row}>
                <View style={[styles.swatch, { backgroundColor: hex }]} />
                <View style={styles.info}>
                  <Text style={styles.name}>{nearestColorName(item.r, item.g, item.b)}</Text>
                  <Text style={styles.sub}>
                    RGB {item.r}, {item.g}, {item.b}  ·  {hex}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backText: { color: '#FFFFFF', fontSize: 17, marginLeft: 2 },
  title: { color: '#FFFFFF', fontSize: 19, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: '#8E8E93', fontSize: 15, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C2E',
  },
  swatch: { width: 44, height: 44, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  info: { flex: 1, marginLeft: 14 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  sub: { color: '#8E8E93', fontSize: 13, marginTop: 2, fontFamily: 'Menlo, Courier' },
  deleteBtn: { padding: 8 },
});
