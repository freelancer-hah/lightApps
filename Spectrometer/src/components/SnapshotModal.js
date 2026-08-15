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
import { exportToText } from '../utils/spectrometerMath';

export default function SnapshotModal({
  visible,
  reading,
  imageUri,
  onSave,
  onClose,
}) {
  const [notes, setNotes] = useState('');

  if (!reading) return null;

  const handleSave = () => {
    onSave({
      ...reading,
      notes,
      imageUri: imageUri || null,
    });
    setNotes('');
  };

  const handleShare = async () => {
    try {
      const summaryText = exportToText({ ...reading, notes });
      await Share.share({
        message: summaryText,
        title: 'Spectrometer Measurement Report',
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
              <View style={[styles.colorBadge, { backgroundColor: reading.hex }]} />
              <Text style={styles.modalTitle}>Measurement Snapshot</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 20 }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <View style={[styles.colorBanner, { backgroundColor: reading.hex }]} />
            )}

            <View style={styles.summaryBox}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Dominant Wavelength</Text>
                <Text style={styles.summaryVal}>
                  {reading.dominantWavelength ? `${reading.dominantWavelength} nm` : 'N/A'}
                </Text>
                <Text style={styles.summarySub}>{reading.wavelengthLabel}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Color Temp (CCT)</Text>
                <Text style={styles.summaryVal}>{reading.cct} K</Text>
                <Text style={styles.summarySub}>Duv: {reading.duv}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Light Level</Text>
                <Text style={styles.summaryVal}>{reading.lux} lx</Text>
                <Text style={styles.summarySub}>{reading.fc} fc</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Color Analysis & Coordinates</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>HEX</Text>
                <Text style={styles.detailValue}>{reading.hex}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>RGB</Text>
                <Text style={styles.detailValue}>
                  {reading.rgb?.r}, {reading.rgb?.g}, {reading.rgb?.b}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>HSV</Text>
                <Text style={styles.detailValue}>
                  {reading.hsv?.h}°, {reading.hsv?.s}%, {reading.hsv?.v}%
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CIE L*a*b*</Text>
                <Text style={styles.detailValue}>
                  L*:{reading.lab?.L} a*:{reading.lab?.a} b*:{reading.lab?.b}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CIE 1931 (x, y)</Text>
                <Text style={styles.detailValue}>
                  ({reading.cie1931?.x}, {reading.cie1931?.y})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CIE 1976 (u′, v′)</Text>
                <Text style={styles.detailValue}>
                  ({reading.cie1976?.uPrime}, {reading.cie1976?.vPrime})
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Measurement Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add optional notes (e.g. Living room LED, Direct sun, Office fluorescent)..."
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
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Reading</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  },
  colorBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 10,
  },
  modalTitle: {
    color: '#1C1C1E',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 2,
  },
  scrollBody: {
    marginTop: 12,
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  colorBanner: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#6E6E73',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryVal: {
    color: '#0891B2',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  summarySub: {
    color: '#555555',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  detailGrid: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    color: '#6E6E73',
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    color: '#1C1C1E',
    fontSize: 13,
    fontWeight: '700',
  },
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
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#0891B2',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
