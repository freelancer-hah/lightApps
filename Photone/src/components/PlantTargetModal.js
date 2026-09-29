import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLANT_TARGET_PRESETS } from '../engine/luxMath';

export default function PlantTargetModal({ visible, activeId, onClose, onSelect }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Plant Growth Stage</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle-outline" size={26} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Target DLI and PPFD ranges guide light height and daily photoperiod hours for optimal growth.
          </Text>

          <ScrollView contentContainerStyle={styles.list}>
            {PLANT_TARGET_PRESETS.map((preset) => {
              const isActive = preset.id === activeId;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.itemCard, isActive && styles.itemCardActive]}
                  onPress={() => {
                    onSelect(preset.id);
                    onClose();
                  }}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.iconTitleRow}>
                      <Ionicons
                        name={preset.icon}
                        size={20}
                        color={isActive ? '#00E676' : '#94A3B8'}
                      />
                      <Text style={[styles.itemName, isActive && styles.itemNameActive]}>
                        {preset.name}
                      </Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color="#00E676" />}
                  </View>

                  <Text style={styles.itemDesc}>{preset.description}</Text>

                  <View style={styles.badgeRow}>
                    <Text style={styles.dliBadge}>
                      Target DLI: {preset.targetDliMin}–{preset.targetDliMax} mol/m²/d
                    </Text>
                    <Text style={styles.ppfdBadge}>
                      {preset.targetPpfdMin}–{preset.targetPpfdMax} PPFD
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  list: {
    paddingBottom: 24,
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemCardActive: {
    borderColor: '#00E676',
    backgroundColor: '#064E3B33',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  itemNameActive: {
    color: '#00E676',
  },
  itemDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dliBadge: {
    backgroundColor: '#334155',
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ppfdBadge: {
    backgroundColor: '#334155',
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
