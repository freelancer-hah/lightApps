import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoneContext } from '../context/PhotoneContext';
import { PLANT_TARGET_PRESETS, calculateHangingHeightAdvice } from '../engine/luxMath';

export default function AdvisorScreen() {
  const { plantTargetId, activePlantTarget, updatePlantTarget, photoperiodHours } = usePhotoneContext();

  const [currentDistInput, setCurrentDistInput] = useState('45');
  const [currentPpfdInput, setCurrentPpfdInput] = useState('450');

  const curDist = parseFloat(currentDistInput) || 45;
  const curPpfd = parseFloat(currentPpfdInput) || 450;
  const targetPpfdMid = Math.round((activePlantTarget.targetPpfdMin + activePlantTarget.targetPpfdMax) / 2);

  const heightAdvice = calculateHangingHeightAdvice(curPpfd, targetPpfdMid, curDist);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Grow Light Advisor</Text>
        <Text style={styles.subtitle}>Optimum DLI & Canopy Distance Guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Plant Growth Stage Selector */}
        <Text style={styles.sectionHeading}>Target Growth Stage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
          {PLANT_TARGET_PRESETS.map((preset) => {
            const isActive = preset.id === plantTargetId;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.stageChip, isActive && styles.stageChipActive]}
                onPress={() => updatePlantTarget(preset.id)}
              >
                <Ionicons
                  name={preset.icon}
                  size={16}
                  color={isActive ? '#00E676' : '#94A3B8'}
                />
                <Text style={[styles.stageChipText, isActive && styles.stageChipTextActive]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Stage Detail Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Ionicons name={activePlantTarget.icon} size={22} color="#00E676" />
            <Text style={styles.detailTitle}>{activePlantTarget.name}</Text>
          </View>

          <Text style={styles.detailDesc}>{activePlantTarget.description}</Text>

          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Target DLI</Text>
              <Text style={styles.metricVal}>
                {activePlantTarget.targetDliMin}–{activePlantTarget.targetDliMax}
              </Text>
              <Text style={styles.metricUnit}>mol/m²/d</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Target PPFD</Text>
              <Text style={[styles.metricVal, { color: '#38BDF8' }]}>
                {activePlantTarget.targetPpfdMin}–{activePlantTarget.targetPpfdMax}
              </Text>
              <Text style={styles.metricUnit}>µmol/m²/s</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Recommended Hours</Text>
              <Text style={[styles.metricVal, { color: '#F59E0B' }]}>
                {photoperiodHours} hrs
              </Text>
              <Text style={styles.metricUnit}>Daily Photoperiod</Text>
            </View>
          </View>
        </View>

        {/* Hanging Distance & Dimming Calculator */}
        <View style={styles.calcCard}>
          <View style={styles.calcTitleRow}>
            <Ionicons name="resize-outline" size={20} color="#00E676" />
            <Text style={styles.calcTitle}>Light Hanging Distance Advisor</Text>
          </View>
          <Text style={styles.calcHint}>
            Calculate exact canopy distance adjustments using the Inverse Square Law ($1/d^2$).
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Current Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={currentDistInput}
                onChangeText={setCurrentDistInput}
                placeholder="45"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Current PPFD (µmol)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={currentPpfdInput}
                onChangeText={setCurrentPpfdInput}
                placeholder="450"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          {heightAdvice && (
            <View style={styles.adviceResult}>
              <View style={styles.adviceRow}>
                <Ionicons name="compass-outline" size={18} color="#00E676" />
                <Text style={styles.adviceText}>{heightAdvice.action}</Text>
              </View>

              <View style={styles.adviceMetricsRow}>
                <View style={styles.advMetric}>
                  <Text style={styles.advVal}>{heightAdvice.suggestedDistanceCm} cm</Text>
                  <Text style={styles.advSub}>({heightAdvice.suggestedDistanceInches} in)</Text>
                  <Text style={styles.advTag}>Suggested Height</Text>
                </View>

                <View style={styles.advMetric}>
                  <Text style={[styles.advVal, { color: '#38BDF8' }]}>{heightAdvice.dimmingRatio}%</Text>
                  <Text style={styles.advSub}>or adjustment</Text>
                  <Text style={styles.advTag}>Estimated Dimming</Text>
                </View>

                <View style={styles.advMetric}>
                  <Text style={[styles.advVal, { color: '#F59E0B' }]}>{targetPpfdMid}</Text>
                  <Text style={styles.advSub}>µmol/m²/s</Text>
                  <Text style={styles.advTag}>Target PPFD</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Photoperiod vs DLI Reference Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>DLI vs Exposure Hours Guide</Text>
          <Text style={styles.tableDesc}>
            DLI measures total photons delivered per square meter per day:
          </Text>
          <Text style={styles.formulaText}>
            DLI (mol/m²/d) = PPFD × Hours × 3600 ÷ 1,000,000
          </Text>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { flex: 1.2 }]}>PPFD</Text>
            <Text style={styles.thCell}>12 Hours</Text>
            <Text style={styles.thCell}>16 Hours</Text>
            <Text style={styles.thCell}>18 Hours</Text>
          </View>

          {[200, 400, 600, 800, 1000].map((p) => (
            <View key={p} style={styles.trRow}>
              <Text style={[styles.tdCell, { flex: 1.2, fontWeight: '800', color: '#00E676' }]}>
                {p} µmol
              </Text>
              <Text style={styles.tdCell}>{((p * 12 * 3600) / 1e6).toFixed(1)} mol</Text>
              <Text style={styles.tdCell}>{((p * 16 * 3600) / 1e6).toFixed(1)} mol</Text>
              <Text style={styles.tdCell}>{((p * 18 * 3600) / 1e6).toFixed(1)} mol</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeading: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  stageScroll: {
    paddingLeft: 16,
    marginBottom: 10,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stageChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#00E676',
  },
  stageChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  stageChipTextActive: {
    color: '#F8FAFC',
  },
  detailCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  detailDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricVal: {
    color: '#00E676',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  metricUnit: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  calcCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  calcTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  calcHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontWeight: '700',
  },
  adviceResult: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#00E67644',
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adviceText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '800',
  },
  adviceMetricsRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  advMetric: {
    alignItems: 'center',
  },
  advVal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  advSub: {
    color: '#64748B',
    fontSize: 10,
  },
  advTag: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  tableDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  formulaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  thCell: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  trRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tdCell: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
