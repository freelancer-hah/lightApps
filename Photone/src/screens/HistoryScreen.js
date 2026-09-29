import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoneContext } from '../context/PhotoneContext';

export default function HistoryScreen() {
  const { history, deleteHistoryRecord, clearAllHistory } = usePhotoneContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.plantTargetName?.toLowerCase().includes(q) ||
      item.lightSourceName?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    if (history.length === 0) {
      Alert.alert('No Records', 'There are no saved measurements to export.');
      return;
    }

    const header = 'Date,Time,PPFD (umol/m2/s),DLI (mol/m2/d),Lux,FootCandles,CCT (K),Light Source,Plant Stage,Photoperiod (hrs),Diffuser,Notes\n';
    const rows = history
      .map((r) => {
        const dateStr = new Date(r.timestamp).toISOString();
        const cleanNotes = `"${(r.notes || '').replace(/"/g, '""')}"`;
        return `${dateStr},${r.ppfd},${r.dli},${r.lux},${r.fc},${r.cct},"${r.lightSourceName}","${r.plantTargetName}",${r.photoperiodHours},${r.diffuserOn ? 'YES' : 'NO'},${cleanNotes}`;
      })
      .join('\n');

    const csvContent = header + rows;

    Alert.alert(
      'CSV Export Generated',
      `Exported ${history.length} record(s).\n\nCSV Data Sample:\n${csvContent.slice(0, 180)}...`,
      [{ text: 'OK' }]
    );
  };

  const handleConfirmClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to permanently delete all saved measurement records?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllHistory },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Saved History</Text>
          <Text style={styles.subtitle}>{history.length} Measurement Record(s)</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleExportCsv}>
            <Ionicons name="download-outline" size={20} color="#00E676" />
          </TouchableOpacity>
          {history.length > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={handleConfirmClearAll}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by crop, light profile, or notes..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* History Record List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="journal-outline" size={48} color="#334155" />
            <Text style={styles.emptyTitle}>No Saved Measurements</Text>
            <Text style={styles.emptySub}>
              Snapshots saved from the Live PAR Meter will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dateStr = new Date(item.timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedRecord(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <Text style={styles.cropBadge}>{item.plantTargetName}</Text>
                  <Text style={styles.sourceBadge}>{item.lightSourceName}</Text>
                </View>
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metricCol}>
                  <Text style={styles.valPpfd}>{item.ppfd}</Text>
                  <Text style={styles.lblPpfd}>µmol/m²/s</Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.valDli}>{item.dli}</Text>
                  <Text style={styles.lblDli}>mol/m²/d</Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.valLux}>{item.lux ? item.lux.toLocaleString() : '—'}</Text>
                  <Text style={styles.lblLux}>Lux</Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.valCct}>{item.cct ? `${item.cct}K` : '—'}</Text>
                  <Text style={styles.lblCct}>CCT</Text>
                </View>
              </View>

              {item.notes ? (
                <Text style={styles.notesText} numberOfLines={1}>
                  Note: {item.notes}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {/* Record Detail Modal */}
      <Modal visible={!!selectedRecord} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedRecord && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Measurement Detail</Text>
                  <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                    <Ionicons name="close-circle-outline" size={26} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDate}>
                  Captured: {new Date(selectedRecord.timestamp).toLocaleString()}
                </Text>

                <View style={styles.detailGrid}>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>PPFD (PAR)</Text>
                    <Text style={styles.detailBoxVal}>{selectedRecord.ppfd} µmol</Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>DLI ({selectedRecord.photoperiodHours}h)</Text>
                    <Text style={[styles.detailBoxVal, { color: '#38BDF8' }]}>
                      {selectedRecord.dli} mol/m²/d
                    </Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Illuminance</Text>
                    <Text style={[styles.detailBoxVal, { color: '#F59E0B' }]}>
                      {selectedRecord.lux ? `${selectedRecord.lux.toLocaleString()} Lux` : '—'}
                    </Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Color Temp</Text>
                    <Text style={[styles.detailBoxVal, { color: '#C084FC' }]}>
                      {selectedRecord.cct ? `${selectedRecord.cct} K` : '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoMeta}>
                  <Text style={styles.metaText}>Light Profile: {selectedRecord.lightSourceName}</Text>
                  <Text style={styles.metaText}>Crop Target: {selectedRecord.plantTargetName}</Text>
                  <Text style={styles.metaText}>
                    Paper Diffuser: {selectedRecord.diffuserOn ? 'Attached (ON)' : 'Raw Lens'}
                  </Text>
                  {selectedRecord.notes ? (
                    <Text style={styles.metaNotes}>Notes: {selectedRecord.notes}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.deleteRecordBtn}
                  onPress={() => {
                    deleteHistoryRecord(selectedRecord.id);
                    setSelectedRecord(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.deleteRecordText}>Delete Measurement</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  topBar: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#00E676', fontSize: 12, fontWeight: '700', marginTop: 2 },
  topActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  listContent: { padding: 16, paddingBottom: 40 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 30 },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  cropBadge: {
    backgroundColor: '#064E3B',
    color: '#00E676',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadge: {
    backgroundColor: '#334155',
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateText: { color: '#64748B', fontSize: 11, fontWeight: '600' },

  cardBody: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  metricCol: { alignItems: 'center' },
  valPpfd: { color: '#00E676', fontSize: 20, fontWeight: '900' },
  lblPpfd: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  valDli: { color: '#38BDF8', fontSize: 20, fontWeight: '900' },
  lblDli: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  valLux: { color: '#F59E0B', fontSize: 16, fontWeight: '800' },
  lblLux: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  valCct: { color: '#C084FC', fontSize: 16, fontWeight: '800' },
  lblCct: { color: '#64748B', fontSize: 10, fontWeight: '700' },

  notesText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  modalDate: { color: '#64748B', fontSize: 12, marginTop: 4, marginBottom: 16 },

  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailBox: {
    width: '48%',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailBoxLabel: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  detailBoxVal: { color: '#00E676', fontSize: 18, fontWeight: '900', marginTop: 2 },

  infoMeta: { marginTop: 16, padding: 12, backgroundColor: '#0F172A', borderRadius: 12, gap: 4 },
  metaText: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  metaNotes: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic', marginTop: 4 },

  deleteRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF444466',
  },
  deleteRecordText: { color: '#EF4444', fontWeight: '800', fontSize: 13 },
});
