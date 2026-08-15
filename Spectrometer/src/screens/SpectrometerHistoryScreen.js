import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  ScrollView,
  Share,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSpectrometer } from '../context/SpectrometerContext';
import { exportToCsv, exportToText } from '../utils/spectrometerMath';

export default function SpectrometerHistoryScreen() {
  const { measurements, deleteMeasurement, clearAllMeasurements, setCurrentLiveReading } = useSpectrometer();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filteredMeasurements = measurements.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.hex && m.hex.toLowerCase().includes(q)) ||
      (m.wavelengthLabel && m.wavelengthLabel.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q)) ||
      (m.mode && m.mode.toLowerCase().includes(q))
    );
  });

  const handleExportCsv = async () => {
    if (measurements.length === 0) {
      Alert.alert('No History', 'There are no saved measurements to export.');
      return;
    }
    const csvData = exportToCsv(measurements);
    try {
      await Share.share({
        message: csvData,
        title: 'Spectrometer_Measurements.csv',
      });
    } catch (err) {
      console.warn('CSV Export error:', err);
    }
  };

  const handleExportTextSummary = async () => {
    if (measurements.length === 0) {
      Alert.alert('No History', 'There are no saved measurements to export.');
      return;
    }
    const textData = measurements.map((m) => exportToText(m)).join('\n\n');
    try {
      await Share.share({
        message: textData,
        title: 'Spectrometer_Report.txt',
      });
    } catch (err) {
      console.warn('Text Export error:', err);
    }
  };

  const handleConfirmClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved spectrometer measurements?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllMeasurements },
      ]
    );
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const loadIntoLiveScreen = (item) => {
    setCurrentLiveReading(item);
    setDetailModalVisible(false);
  };

  const renderHistoryItem = ({ item }) => {
    const dateStr = new Date(item.timestamp).toLocaleString();
    return (
      <TouchableOpacity style={styles.historyCard} onPress={() => openDetail(item)}>
        <View style={[styles.colorSwab, { backgroundColor: item.hex || '#FFFFFF' }]} />

        <View style={styles.historyContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHex}>{item.hex}</Text>
            <Text style={styles.itemDate}>{dateStr}</Text>
          </View>

          <View style={styles.itemMetricsRow}>
            <Text style={styles.metricBadge}>
              {item.dominantWavelength ? `${item.dominantWavelength} nm` : 'Non-spectral'}
            </Text>
            <Text style={styles.metricText}>{item.cct} K</Text>
            <Text style={styles.metricText}>{item.lux} lx</Text>
          </View>

          {item.notes ? (
            <Text style={styles.itemNotes} numberOfLines={1}>
              Note: {item.notes}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.deleteItemBtn}
          onPress={() => deleteMeasurement(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Measurement History</Text>
        <Text style={styles.headerSub}>{measurements.length} Saved Snapshots</Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, HEX, wavelength..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.exportBtnRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportCsv}>
            <Ionicons name="document-text-outline" size={16} color="#0891B2" />
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportBtn} onPress={handleExportTextSummary}>
            <Ionicons name="share-outline" size={16} color="#0891B2" />
            <Text style={styles.exportBtnText}>Text</Text>
          </TouchableOpacity>

          {measurements.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleConfirmClearAll}>
              <Ionicons name="trash-outline" size={16} color="#FF453A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredMeasurements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={54} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Saved Measurements</Text>
          <Text style={styles.emptySub}>
            Captured snapshots from the live camera will be saved here with detailed colorimetry reports.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeasurements}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listPadding}
        />
      )}

      {selectedItem && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={[styles.colorSwab, { backgroundColor: selectedItem.hex }]} />
                  <Text style={styles.modalTitle}>{selectedItem.hex}</Text>
                </View>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {selectedItem.imageUri ? (
                  <Image source={{ uri: selectedItem.imageUri }} style={styles.snapshotImg} resizeMode="cover" />
                ) : null}

                <Text style={styles.modalDate}>
                  Captured: {new Date(selectedItem.timestamp).toLocaleString()}
                </Text>

                <View style={styles.detailGrid}>
                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Dominant Wavelength</Text>
                    <Text style={styles.gridVal}>
                      {selectedItem.dominantWavelength ? `${selectedItem.dominantWavelength} nm` : 'Non-spectral'} ({selectedItem.wavelengthLabel})
                    </Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Color Temperature</Text>
                    <Text style={styles.gridVal}>{selectedItem.cct} K (Duv: {selectedItem.duv})</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Illuminance</Text>
                    <Text style={styles.gridVal}>{selectedItem.lux} Lux ({selectedItem.fc} fc)</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>CIE 1931 (x, y)</Text>
                    <Text style={styles.gridVal}>x: {selectedItem.cie1931?.x}, y: {selectedItem.cie1931?.y}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>CIE 1976 (u′, v′)</Text>
                    <Text style={styles.gridVal}>u′: {selectedItem.cie1976?.uPrime}, v′: {selectedItem.cie1976?.vPrime}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>RGB Values</Text>
                    <Text style={styles.gridVal}>R:{selectedItem.rgb?.r} G:{selectedItem.rgb?.g} B:{selectedItem.rgb?.b}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>CIE L*a*b*</Text>
                    <Text style={styles.gridVal}>L*:{selectedItem.lab?.L} a*:{selectedItem.lab?.a} b*:{selectedItem.lab?.b}</Text>
                  </View>

                  {selectedItem.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedItem.notes}</Text>
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.loadBtn}
                  onPress={() => loadIntoLiveScreen(selectedItem)}
                >
                  <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.loadBtnText}>Load into Spectrometer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={async () => {
                    await Share.share({ message: exportToText(selectedItem) });
                  }}
                >
                  <Ionicons name="share-outline" size={18} color="#1C1C1E" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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

  toolbar: {
    padding: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#1C1C1E',
    fontSize: 13,
  },
  exportBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  exportBtnText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: 8,
  },

  listPadding: { padding: 12, gap: 10 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  colorSwab: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 12,
  },
  historyContent: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemHex: { color: '#1C1C1E', fontSize: 15, fontWeight: '800' },
  itemDate: { color: '#6E6E73', fontSize: 11 },
  itemMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metricBadge: {
    color: '#0891B2',
    fontSize: 12,
    fontWeight: '700',
  },
  metricText: { color: '#555555', fontSize: 12 },
  itemNotes: { color: '#6E6E73', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  deleteItemBtn: { padding: 8 },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800', marginTop: 14 },
  emptySub: { color: '#6E6E73', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800' },
  modalScroll: { marginTop: 12 },
  snapshotImg: { width: '100%', height: 160, borderRadius: 12, marginBottom: 10 },
  modalDate: { color: '#6E6E73', fontSize: 12, marginBottom: 12 },
  detailGrid: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  gridLabel: { color: '#6E6E73', fontSize: 12 },
  gridVal: { color: '#1C1C1E', fontSize: 12, fontWeight: '700' },
  notesBox: { marginTop: 10, paddingTop: 10 },
  notesTitle: { color: '#0891B2', fontSize: 12, fontWeight: '700' },
  notesText: { color: '#1C1C1E', fontSize: 13, marginTop: 2 },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  loadBtn: {
    flex: 2,
    height: 44,
    backgroundColor: '#0891B2',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loadBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  shareBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: { color: '#1C1C1E', fontWeight: '700', fontSize: 14 },
});
