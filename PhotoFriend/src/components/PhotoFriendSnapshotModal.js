import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exportPhotoFriendText } from '../utils/photoFriendMath';

export default function PhotoFriendSnapshotModal({
  visible,
  snapshotData,
  imageUri,
  onSave,
  onClose,
}) {
  const [notes, setNotes] = useState('');

  if (!snapshotData) return null;

  const handleSave = () => {
    onSave({
      ...snapshotData,
      notes,
      imageUri: imageUri || null,
    });
    setNotes('');
  };

  const handleShare = async () => {
    try {
      const summaryText = exportPhotoFriendText({ ...snapshotData, notes });
      await Share.share({
        message: summaryText,
        title: 'Photo Friend Exposure Report',
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="camera" size={22} color="#D97706" />
              <Text style={styles.modalTitle}>Save Exposure Snapshot</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 20 }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            ) : null}

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Exposure (EV)</Text>
                <Text style={styles.cardVal}>{snapshotData.ev} EV</Text>
                <Text style={styles.cardSub}>{snapshotData.sceneLabel}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Shutter / Aperture</Text>
                <Text style={styles.cardVal}>
                  {snapshotData.shutterLabel} f/{snapshotData.aperture}
                </Text>
                <Text style={styles.cardSub}>ISO {snapshotData.iso}</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Depth of Field (DoF)</Text>
            <View style={styles.dofBox}>
              <View style={styles.dofRow}>
                <Text style={styles.dofLabel}>Subject Distance</Text>
                <Text style={styles.dofVal}>{snapshotData.distanceFeet} ft</Text>
              </View>
              <View style={styles.dofRow}>
                <Text style={styles.dofLabel}>Near Limit</Text>
                <Text style={styles.dofVal}>{snapshotData.dof?.nearLimitFeet} ft</Text>
              </View>
              <View style={styles.dofRow}>
                <Text style={styles.dofLabel}>Far Limit</Text>
                <Text style={styles.dofVal}>
                  {snapshotData.dof?.farLimitFeet === Infinity ? 'Infinity (∞)' : `${snapshotData.dof?.farLimitFeet} ft`}
                </Text>
              </View>
              <View style={styles.dofRow}>
                <Text style={styles.dofLabel}>Total DoF</Text>
                <Text style={styles.dofVal}>
                  {snapshotData.dof?.totalDofFeet === Infinity ? 'Infinite' : `${snapshotData.dof?.totalDofFeet} ft`}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add photo details (e.g. 50mm f/1.8 lens, Golden hour portrait)..."
              placeholderTextColor="#8E8E93"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#1C1C1E" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Exposure</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: { color: '#1C1C1E', fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 2 },
  scrollBody: { marginTop: 12 },
  imagePreview: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },

  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardLabel: { color: '#6E6E73', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardVal: { color: '#D97706', fontSize: 17, fontWeight: '800', marginTop: 4 },
  cardSub: { color: '#555555', fontSize: 12, marginTop: 2 },

  sectionHeader: { color: '#8E8E93', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  dofBox: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  dofRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
  dofLabel: { color: '#6E6E73', fontSize: 13 },
  dofVal: { color: '#1C1C1E', fontSize: 13, fontWeight: '700' },

  notesInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    color: '#1C1C1E',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 70,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  shareBtn: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: { color: '#1C1C1E', fontSize: 15, fontWeight: '700' },
  saveBtn: {
    flex: 2,
    backgroundColor: '#D97706',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
