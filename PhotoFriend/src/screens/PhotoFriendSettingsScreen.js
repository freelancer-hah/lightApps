import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { usePhotoFriend } from '../context/PhotoFriendContext';
import { SENSOR_PRESETS, exportPhotoFriendCsv } from '../utils/photoFriendMath';

export default function PhotoFriendSettingsScreen({ navigation }) {
  const {
    sensorPreset,
    setSensorPreset,
    meterMode,
    setMeterMode,
    savedSnapshots,
    clearAllSnapshots,
  } = usePhotoFriend();

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

  const handleConfirmClearAll = () => {
    Alert.alert(
      'Clear Exposure Snapshots',
      'Are you sure you want to delete all saved Photo Friend exposure snapshots?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllSnapshots },
      ]
    );
  };

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      <View style={styles.headerBar}>
        {canGoBack ? (
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text style={styles.headerTitle}>Photo Friend Settings</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Camera Sensor & Circle of Confusion (CoC)</Text>
        <View style={styles.card}>
          {SENSOR_PRESETS.map((preset) => {
            const isSelected = sensorPreset.id === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetRow, isSelected && styles.presetRowSelected]}
                onPress={() => setSensorPreset(preset)}
              >
                <View style={styles.presetTextCol}>
                  <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                    {preset.name}
                  </Text>
                  <Text style={styles.presetSub}>
                    Circle of Confusion: {preset.cocMm} mm · Crop: {preset.cropFactor}x
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D97706" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Default Metering View</Text>
        <View style={styles.card}>
          {[
            { id: 'camera', label: 'Reflected Camera Metering', sub: 'Sample scene brightness through phone camera' },
            { id: 'incident', label: 'Incident Light Meter (Lux/EV)', sub: 'LCD style lux to EV exposure conversion' },
            { id: 'histogram', label: 'RGB Histogram Overlay', sub: 'Real-time luminance & color distribution preview' },
          ].map((modeItem) => {
            const isSelected = meterMode === modeItem.id;
            return (
              <TouchableOpacity
                key={modeItem.id}
                style={[styles.presetRow, isSelected && styles.presetRowSelected]}
                onPress={() => setMeterMode(modeItem.id)}
              >
                <View style={styles.presetTextCol}>
                  <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                    {modeItem.label}
                  </Text>
                  <Text style={styles.presetSub}>{modeItem.sub}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D97706" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Data & Exports</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRowBtn} onPress={handleExportCsv}>
            <Ionicons name="download-outline" size={20} color="#D97706" />
            <Text style={styles.actionRowText}>Export Saved Snapshots to CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRowBtn, styles.borderTop]}
            onPress={handleConfirmClearAll}
          >
            <Ionicons name="trash-outline" size={20} color="#FF453A" />
            <Text style={[styles.actionRowText, { color: '#FF453A' }]}>Clear All Saved Snapshots</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guideCard}>
          <Ionicons name="information-circle-outline" size={20} color="#D97706" />
          <Text style={styles.guideText}>
            Tip for Depth of Field (DoF): Select your exact camera sensor preset above to get razor-sharp hyperfocal & DoF calculations matched to your lens focal length and distance.
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: { padding: 12, paddingBottom: 30 },

  sectionHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  presetRowSelected: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: -14,
    paddingHorizontal: 14,
  },
  presetTextCol: { flex: 1 },
  presetName: { color: '#1C1C1E', fontSize: 14, fontWeight: '700' },
  presetNameSelected: { color: '#D97706' },
  presetSub: { color: '#6E6E73', fontSize: 11, marginTop: 2 },

  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  borderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  actionRowText: { color: '#1C1C1E', fontSize: 14, fontWeight: '700' },

  guideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  guideText: { color: '#6E6E73', fontSize: 12, flex: 1, lineHeight: 16 },
});
