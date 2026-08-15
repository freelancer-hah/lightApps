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
import { usePhotoFriend } from '../context/PhotoFriendContext';
import { exportPhotoFriendCsv, exportPhotoFriendText } from '../utils/photoFriendMath';

export default function PhotoFriendSavedScreen({ navigation }) {
  const { savedSnapshots, deleteSnapshot, clearAllSnapshots, setEv, setIso, setShutter, setAperture } = usePhotoFriend();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filteredSnapshots = savedSnapshots.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.sceneLabel && s.sceneLabel.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      String(s.ev).includes(q) ||
      String(s.aperture).includes(q)
    );
  });

  const handleExportCsv = async () => {
    if (savedSnapshots.length === 0) {
      Alert.alert('No Snapshots', 'There are no saved exposure snapshots to export.');
      return;
    }
    const csvData = exportPhotoFriendCsv(savedSnapshots);
    try {
      await Share.share({
        message: csvData,
        title: 'PhotoFriend_Exposures.csv',
      });
    } catch (err) {
      console.warn('CSV Export error:', err);
    }
  };

  const handleExportTextSummary = async () => {
    if (savedSnapshots.length === 0) {
      Alert.alert('No Snapshots', 'There are no saved exposure snapshots to export.');
      return;
    }
    const textData = savedSnapshots.map((s) => exportPhotoFriendText(s)).join('\n\n');
    try {
      await Share.share({
        message: textData,
        title: 'PhotoFriend_Report.txt',
      });
    } catch (err) {
      console.warn('Text Export error:', err);
    }
  };

  const handleConfirmClearAll = () => {
    Alert.alert(
      'Clear All Snapshots',
      'Are you sure you want to delete all saved Photo Friend exposure snapshots?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllSnapshots },
      ]
    );
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const loadIntoDials = (item) => {
    if (item.ev !== undefined) setEv(item.ev, false);
    if (item.iso !== undefined) setIso(item.iso);
    if (item.aperture !== undefined) setAperture(item.aperture);
    setDetailModalVisible(false);
    navigation.navigate('PhotoFriendHome');
  };

  const renderItem = ({ item }) => {
    const dateStr = new Date(item.timestamp || item.savedAt).toLocaleString();
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.evBadge}>
            <Text style={styles.evBadgeVal}>{item.ev}</Text>
            <Text style={styles.evBadgeUnit}>EV</Text>
          </View>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.sceneTitle}>{item.sceneLabel || 'Exposure Snapshot'}</Text>
            <Text style={styles.dateSub}>{dateStr}</Text>
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSnapshot(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#FF453A" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardValuesRow}>
          <View style={styles.valPill}>
            <Text style={styles.valPillLabel}>ISO</Text>
            <Text style={styles.valPillText}>{item.iso}</Text>
          </View>

          <View style={styles.valPill}>
            <Text style={styles.valPillLabel}>SHUTTER</Text>
            <Text style={styles.valPillText}>{item.shutterLabel}</Text>
          </View>

          <View style={styles.valPill}>
            <Text style={styles.valPillLabel}>APERTURE</Text>
            <Text style={styles.valPillText}>f/{item.aperture}</Text>
          </View>
        </View>

        {item.notes ? (
          <Text style={styles.notesPreview} numberOfLines={1}>
            Note: {item.notes}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        {canGoBack ? (
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text style={styles.headerTitle}>Saved Exposures</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, EV, scene..."
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
            <Ionicons name="document-text-outline" size={16} color="#D97706" />
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportBtn} onPress={handleExportTextSummary}>
            <Ionicons name="share-outline" size={16} color="#D97706" />
            <Text style={styles.exportBtnText}>Text</Text>
          </TouchableOpacity>

          {savedSnapshots.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleConfirmClearAll}>
              <Ionicons name="trash-outline" size={16} color="#FF453A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Snapshots List */}
      {filteredSnapshots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={54} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Saved Exposures</Text>
          <Text style={styles.emptySub}>
            Tap Save on the Photo Friend meter view to record exposure calculation snapshots.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSnapshots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
        />
      )}

      {/* Detail Modal */}
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
                <Text style={styles.modalTitle}>{selectedItem.sceneLabel || 'Exposure Details'}</Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {selectedItem.imageUri ? (
                  <Image source={{ uri: selectedItem.imageUri }} style={styles.snapshotImg} resizeMode="cover" />
                ) : null}

                <Text style={styles.modalDate}>
                  Captured: {new Date(selectedItem.timestamp || selectedItem.savedAt).toLocaleString()}
                </Text>

                <View style={styles.detailGrid}>
                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Exposure Value (EV)</Text>
                    <Text style={styles.gridVal}>{selectedItem.ev} EV</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>ISO</Text>
                    <Text style={styles.gridVal}>{selectedItem.iso}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Shutter Speed</Text>
                    <Text style={styles.gridVal}>{selectedItem.shutterLabel}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Aperture</Text>
                    <Text style={styles.gridVal}>f/{selectedItem.aperture}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>EV Compensation</Text>
                    <Text style={styles.gridVal}>{selectedItem.evComp > 0 ? `+${selectedItem.evComp}` : selectedItem.evComp}</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Focal Length</Text>
                    <Text style={styles.gridVal}>{selectedItem.focalLength} mm</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Subject Distance</Text>
                    <Text style={styles.gridVal}>{selectedItem.distanceFeet} ft</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Near Limit</Text>
                    <Text style={styles.gridVal}>{selectedItem.dof?.nearLimitFeet} ft</Text>
                  </View>

                  <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Far Limit</Text>
                    <Text style={styles.gridVal}>
                      {selectedItem.dof?.farLimitFeet === Infinity ? 'Infinity (∞)' : `${selectedItem.dof?.farLimitFeet} ft`}
                    </Text>
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
                <TouchableOpacity style={styles.loadBtn} onPress={() => loadIntoDials(selectedItem)}>
                  <Ionicons name="options-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.loadBtnText}>Apply to Dials</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={async () => {
                    await Share.share({ message: exportPhotoFriendText(selectedItem) });
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
  headerBar: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerBackBtn: { padding: 4 },
  headerTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800' },

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
  searchInput: { flex: 1, color: '#1C1C1E', fontSize: 13 },
  exportBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  exportBtnText: { color: '#1C1C1E', fontSize: 12, fontWeight: '700' },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: 8,
  },

  listPadding: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  evBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  evBadgeVal: { color: '#D97706', fontSize: 15, fontWeight: '800' },
  evBadgeUnit: { color: '#B45309', fontSize: 9, fontWeight: '700', marginTop: -2 },
  cardHeaderContent: { flex: 1 },
  sceneTitle: { color: '#1C1C1E', fontSize: 15, fontWeight: '800' },
  dateSub: { color: '#6E6E73', fontSize: 11, marginTop: 2 },
  deleteBtn: { padding: 6 },

  cardValuesRow: { flexDirection: 'row', gap: 8 },
  valPill: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  valPillLabel: { color: '#8E8E93', fontSize: 9, fontWeight: '700' },
  valPillText: { color: '#1C1C1E', fontSize: 13, fontWeight: '800', marginTop: 2 },
  notesPreview: { color: '#6E6E73', fontSize: 11, fontStyle: 'italic', marginTop: 8 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800', marginTop: 14 },
  emptySub: { color: '#6E6E73', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  modalTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800' },
  modalScroll: { marginTop: 12 },
  snapshotImg: { width: '100%', height: 160, borderRadius: 12, marginBottom: 10 },
  modalDate: { color: '#6E6E73', fontSize: 12, marginBottom: 12 },
  detailGrid: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
  gridLabel: { color: '#6E6E73', fontSize: 12 },
  gridVal: { color: '#1C1C1E', fontSize: 12, fontWeight: '700' },
  notesBox: { marginTop: 10, paddingTop: 10 },
  notesTitle: { color: '#D97706', fontSize: 12, fontWeight: '700' },
  notesText: { color: '#1C1C1E', fontSize: 13, marginTop: 2 },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  loadBtn: { flex: 2, height: 44, backgroundColor: '#D97706', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  loadBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  shareBtn: { flex: 1, height: 44, backgroundColor: '#E5E5EA', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  shareBtnText: { color: '#1C1C1E', fontWeight: '700', fontSize: 14 },
});
