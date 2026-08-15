import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const PRESETS = [100, 120];

export default function CalibrationModal({ visible, currentHz, onClose, onSave }) {
  const [custom, setCustom] = useState(String(currentHz));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Calibrate Frequency</Text>
          <Text style={styles.subtitle}>
            Select your region's mains frequency, or enter a custom value.
          </Text>

          <View style={styles.presetRow}>
            {PRESETS.map((hz) => (
              <TouchableOpacity
                key={hz}
                style={[styles.presetBtn, currentHz === hz && styles.presetBtnActive]}
                onPress={() => onSave(hz)}
              >
                <Text style={[styles.presetText, currentHz === hz && styles.presetTextActive]}>{hz} Hz</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customRow}>
            <TextInput
              style={styles.input}
              value={custom}
              onChangeText={setCustom}
              keyboardType="decimal-pad"
              placeholder="Custom Hz"
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                const v = parseFloat(custom);
                if (!isNaN(v) && v > 0) onSave(v);
              }}
            >
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22 },
  title: { color: '#1C1C1E', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#6E6E73', fontSize: 13, marginTop: 6, marginBottom: 18, lineHeight: 18 },
  presetRow: { flexDirection: 'row', marginBottom: 16 },
  presetBtn: { flex: 1, backgroundColor: '#E5E5EA', paddingVertical: 12, borderRadius: 10, marginRight: 10, alignItems: 'center' },
  presetBtnActive: { backgroundColor: '#16A34A' },
  presetText: { color: '#1C1C1E', fontWeight: '600' },
  presetTextActive: { color: '#FFFFFF' },
  customRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#FFFFFF', color: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  applyBtn: { backgroundColor: '#16A34A', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10 },
  applyText: { color: '#FFFFFF', fontWeight: '700' },
  closeBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 10 },
  closeText: { color: '#16A34A', fontSize: 15, fontWeight: '700' },
});
