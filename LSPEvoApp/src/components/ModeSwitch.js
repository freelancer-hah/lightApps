import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ModeSwitch({ mode, onChange, calibrated }) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, mode === 'estimate' && styles.btnActive]}
        onPress={() => onChange('estimate')}
      >
        <Text style={[styles.text, mode === 'estimate' && styles.textActive]}>RGB Estimate</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, mode === 'diffraction' && styles.btnActive]}
        onPress={() => onChange('diffraction')}
      >
        <Text style={[styles.text, mode === 'diffraction' && styles.textActive]}>
          Diffraction {calibrated ? '' : '(uncalibrated)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 10, marginHorizontal: 20, padding: 3, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnActive: { backgroundColor: '#2E4FA0' },
  text: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  textActive: { color: '#FFFFFF' },
});
