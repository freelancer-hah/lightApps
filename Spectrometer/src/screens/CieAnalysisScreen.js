import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSpectrometer } from '../context/SpectrometerContext';
import CieDiagramSvg from '../components/CieDiagramSvg';
import SpectralCurveGraph from '../components/SpectralCurveGraph';
import TemperatureGauge from '../components/TemperatureGauge';
import ColorChipsView from '../components/ColorChipsView';

export default function CieAnalysisScreen({ navigation }) {
  const { currentLiveReading, displayPrefs, setDisplayPrefs } = useSpectrometer();
  const reading = currentLiveReading;

  const [showGamut, setShowGamut] = useState(displayPrefs.showGamut);
  const [showPlanckian, setShowPlanckian] = useState(displayPrefs.showPlanckian);
  const [showD65, setShowD65] = useState(displayPrefs.showD65);

  const toggleGamut = () => {
    const next = !showGamut;
    setShowGamut(next);
    setDisplayPrefs({ showGamut: next });
  };

  const togglePlanckian = () => {
    const next = !showPlanckian;
    setShowPlanckian(next);
    setDisplayPrefs({ showPlanckian: next });
  };

  const toggleD65 = () => {
    const next = !showD65;
    setShowD65(next);
    setDisplayPrefs({ showD65: next });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>CIE & Color Analysis</Text>
        <Text style={styles.headerSub}>Chromaticity & Spectral Locus</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, showGamut && styles.filterChipActive]} onPress={toggleGamut}>
            <Ionicons name={showGamut ? 'checkbox' : 'square-outline'} size={16} color={showGamut ? '#0891B2' : '#8E8E93'} />
            <Text style={styles.filterText}>sRGB Gamut</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.filterChip, showPlanckian && styles.filterChipActive]} onPress={togglePlanckian}>
            <Ionicons name={showPlanckian ? 'checkbox' : 'square-outline'} size={16} color={showPlanckian ? '#0891B2' : '#8E8E93'} />
            <Text style={styles.filterText}>Planckian Locus</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.filterChip, showD65 && styles.filterChipActive]} onPress={toggleD65}>
            <Ionicons name={showD65 ? 'checkbox' : 'square-outline'} size={16} color={showD65 ? '#0891B2' : '#8E8E93'} />
            <Text style={styles.filterText}>D65 Point</Text>
          </TouchableOpacity>
        </View>

        <CieDiagramSvg
          x={reading.cie1931?.x}
          y={reading.cie1931?.y}
          uPrime={reading.cie1976?.uPrime}
          vPrime={reading.cie1976?.vPrime}
          showGamut={showGamut}
          showPlanckian={showPlanckian}
          showD65={showD65}
          height={280}
        />

        <SpectralCurveGraph
          spectrum={reading.spectrum}
          dominantWavelength={reading.dominantWavelength}
          height={160}
        />

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Chromaticity & Tristimulus</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>CIE 1931 Chromaticity (x, y)</Text>
              <Text style={styles.tableValue}>x = {reading.cie1931?.x}, y = {reading.cie1931?.y}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>CIE 1976 Chromaticity (u′, v′)</Text>
              <Text style={styles.tableValue}>u′ = {reading.cie1976?.uPrime}, v′ = {reading.cie1976?.vPrime}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>CIE XYZ Tristimulus</Text>
              <Text style={styles.tableValue}>X:{reading.xyz?.X} Y:{reading.xyz?.Y} Z:{reading.xyz?.Z}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Dominant Wavelength</Text>
              <Text style={[styles.tableValue, { color: '#0891B2' }]}>
                {reading.dominantWavelength ? `${reading.dominantWavelength} nm` : 'Non-spectral'} ({reading.wavelengthLabel})
              </Text>
            </View>
          </View>
        </View>

        <ColorChipsView
          rgb={reading.rgb}
          hex={reading.hex}
          hsv={reading.hsv}
          lab={reading.lab}
          dominantWavelength={reading.dominantWavelength}
          wavelengthLabel={reading.wavelengthLabel}
        />

        <TemperatureGauge cct={reading.cct} duv={reading.duv} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  topHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#6E6E73', fontSize: 11 },
  scrollContent: { padding: 12, paddingBottom: 30 },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 6,
  },
  filterChipActive: {
    borderColor: '#0891B2',
  },
  filterText: {
    color: '#1C1C1E',
    fontSize: 11,
    fontWeight: '600',
  },

  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  table: {},
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tableLabel: { color: '#6E6E73', fontSize: 12, fontWeight: '600' },
  tableValue: { color: '#1C1C1E', fontSize: 13, fontWeight: '700' },
});
