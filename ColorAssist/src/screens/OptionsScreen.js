import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

const OUTPUT_ROWS = [
  { key: 'rgb', label: 'RGB Values' },
  { key: 'hsl', label: 'HSL Values' },
  { key: 'ryb', label: 'RYB Values' },
  { key: 'cmyk', label: 'CMYK Values' },
  { key: 'htmlHex', label: 'HTML Hex Color Code' },
  { key: 'htmlName', label: 'HTML Color Name' },
  { key: 'colorName', label: 'Color Name' },
  { key: 'crayonName', label: 'Crayon Name' },
  { key: 'simpleName', label: 'Simple Color Name' },
  { key: 'rainbow7', label: '7 Color Rainbow Code' },
  { key: 'swatch', label: 'Color Sample' },
  { key: 'stampColorName', label: 'Stamp Color Name', locked: true },
  { key: 'proAnalysis', label: 'Pro Analysis', locked: true },
];

export default function OptionsScreen({ navigation }) {
  const { settings, update, toggleOutput } = useSettings();

  const temporalSeconds = (settings.temporalFrames / 30).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Options</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>SPATIAL SAMPLE APERTURE</Text>
        <View style={styles.sliderBlock}>
          <Text style={styles.sliderValue}>{settings.spatialAperture}x{settings.spatialAperture} pixels</Text>
          <Slider
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={settings.spatialAperture}
            minimumTrackTintColor="#34C759"
            maximumTrackTintColor="#5A5A5C"
            thumbTintColor="#FFFFFF"
            onValueChange={(v) => update({ spatialAperture: v })}
          />
        </View>

        <Text style={styles.sectionHeader}>TEMPORAL SAMPLE APERTURE</Text>
        <View style={styles.sliderBlock}>
          <Text style={styles.sliderValue}>
            {settings.temporalFrames} frames ({temporalSeconds} seconds)
          </Text>
          <Slider
            minimumValue={1}
            maximumValue={30}
            step={1}
            value={settings.temporalFrames}
            minimumTrackTintColor="#34C759"
            maximumTrackTintColor="#5A5A5C"
            thumbTintColor="#FFFFFF"
            onValueChange={(v) => update({ temporalFrames: v })}
          />
        </View>

        <Text style={styles.sectionHeader}>COLOR OUTPUTS</Text>
        {OUTPUT_ROWS.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={[styles.rowLabel, row.locked && styles.rowLabelLocked]}>{row.label}</Text>
            <Switch
              value={settings.outputs[row.key]}
              onValueChange={() => toggleOutput(row.key)}
              disabled={row.locked}
              trackColor={{ false: '#3A3A3C', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

        <Text style={styles.sectionHeader}>QUANTIZE BOUNDED AREA</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Quantized</Text>
          <Switch
            value={settings.quantized}
            onValueChange={() => update({ quantized: !settings.quantized })}
            trackColor={{ false: '#3A3A3C', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
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
  scrollContent: { paddingBottom: 40 },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sliderBlock: { backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 14 },
  sliderValue: { color: '#FFFFFF', fontSize: 18, marginBottom: 10 },
  row: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C2E',
  },
  rowLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  rowLabelLocked: { color: '#6E6E73' },
});
