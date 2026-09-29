import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_SOURCES } from '../engine/luxMath';

export default function LightSourceModal({ visible, activeId, onClose, onSelect }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Light Source Spectrum</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle-outline" size={26} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Photone uses exact PAR conversion factors tailored to each light spectrum type for precise PPFD measurement.
          </Text>

          <ScrollView contentContainerStyle={styles.list}>
            {LIGHT_SOURCES.map((source) => {
              const isActive = source.id === activeId;
              return (
                <TouchableOpacity
                  key={source.id}
                  style={[styles.itemCard, isActive && styles.itemCardActive]}
                  onPress={() => {
                    onSelect(source.id);
                    onClose();
                  }}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.iconTitleRow}>
                      <Ionicons
                        name={source.icon}
                        size={20}
                        color={isActive ? '#00E676' : '#94A3B8'}
                        style={styles.itemIcon}
                      />
                      <Text style={[styles.itemName, isActive && styles.itemNameActive]}>
                        {source.name}
                      </Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color="#00E676" />}
                  </View>

                  <Text style={styles.itemDesc}>{source.description}</Text>

                  <View style={styles.badgeRow}>
                    <Text style={styles.factorBadge}>
                      PAR Factor: {(source.parFactor * 1000).toFixed(1)} µmol/klux
                    </Text>
                    <Text style={styles.cctBadge}>{source.cctRange}</Text>
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
  itemIcon: {
    marginRight: 2,
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
  factorBadge: {
    backgroundColor: '#334155',
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cctBadge: {
    backgroundColor: '#334155',
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
