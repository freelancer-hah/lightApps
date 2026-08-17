import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMeter } from "../context/MeterContext";
import { CalibrationPoint } from "../types";
import { captureFrame } from "../utils/frameSampler";

export default function CalibrationScreen() {
  const {
    ev100,
    activeMode,
    isMonitoring,
    updateFromFrame,
    points,
    fit,
    addCalibrationPoint,
    removeCalibrationPoint,
    clearCalibrationPoints
  } = useMeter();

  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);

  const [refValue, setRefValue] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const samplesRef = useRef<number[]>([]);
  const ev100Ref = useRef(ev100);

  useEffect(() => {
    ev100Ref.current = ev100;
  }, [ev100]);

  // Camera sampling loop for live EV100 during calibration (only active when focused)
  useEffect(() => {
    let timer: any = null;
    if (isFocused && isMonitoring && activeMode === "camera") {
      timer = setInterval(async () => {
        if (cameraRef.current) {
          const sample = await captureFrame(cameraRef);
          if (sample) {
            updateFromFrame(sample);
          }
        }
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isFocused, isMonitoring, activeMode, updateFromFrame]);

  // Collect samples while measuring is active
  useEffect(() => {
    let sampleTimer: any = null;
    if (measuring && isMonitoring) {
      sampleTimer = setInterval(() => {
        samplesRef.current.push(ev100Ref.current);
      }, 300);
    }
    return () => {
      if (sampleTimer) clearInterval(sampleTimer);
    };
  }, [measuring, isMonitoring]);

  // Countdown timer loop
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setMeasuring(false);
      setCountdown(null);

      const samples = samplesRef.current;
      const avgEv100 = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : ev100Ref.current;
      
      const parsed = parseFloat(refValue);
      addCalibrationPoint(parsed, avgEv100);
      setRefValue("");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleAdd = async () => {
    const parsed = parseFloat(refValue);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid Input", "Enter a valid positive W/m² reading from your reference pyranometer.");
      return;
    }
    Keyboard.dismiss();
    samplesRef.current = [];
    setCountdown(5);
    setMeasuring(true);
  };

  const handleClear = () => {
    Alert.alert("Clear all calibration points?", "This resets the fit entirely.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCalibrationPoints }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Pyranometer Calibration</Text>
        <Text style={styles.instructions}>
          Point phone camera at the reference target next to your physical pyranometer (Watt meter per square meter). Enter its W/m² reading and tap Add Point.
        </Text>

        {isFocused && activeMode === "camera" && (
          <View style={styles.cameraCard}>
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                animateShutter={false}
              />
            ) : (
              <View style={styles.permWrap}>
                <Text style={styles.permText}>Camera access required for calibration.</Text>
                <Pressable style={styles.permBtn} onPress={requestPermission}>
                  <Text style={styles.permBtnText}>Grant Camera Permission</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.cameraOverlay} pointerEvents="box-none">
              <Pressable style={styles.cameraToggleBtn} onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}>
                <Text style={styles.cameraToggleText}>{facing === "front" ? "🔄 Front" : "🔄 Back"}</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.liveBox}>
          <Text style={styles.liveLabel}>Current Real Camera EV100</Text>
          <Text style={styles.liveValue}>{ev100.toFixed(2)}</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, measuring && styles.inputDisabled]}
            placeholder="Reference W/m²"
            placeholderTextColor="#64748B"
            keyboardType="decimal-pad"
            value={refValue}
            onChangeText={setRefValue}
            editable={!measuring}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {isInputFocused && (
            <Pressable style={styles.doneButton} onPress={() => Keyboard.dismiss()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.addButton, measuring && styles.addButtonMeasuring]}
            onPress={handleAdd}
            disabled={measuring}
          >
            <Text style={styles.addButtonText}>
              {measuring ? `Measuring (${countdown}s)` : "Add Point"}
            </Text>
          </Pressable>
        </View>

        {fit && (
          <View style={styles.fitBox}>
            <Text style={styles.fitText}>
              Fit Model: log10(W/m²) = {fit.slope.toFixed(4)} × EV100 + {fit.intercept.toFixed(4)}
            </Text>
            <Text style={styles.fitText}>R² = {fit.rSquared.toFixed(4)} · EV100 Range [{fit.minEv100.toFixed(1)}, {fit.maxEv100.toFixed(1)}]</Text>
            {fit.rSquared < 0.9 && (
              <Text style={styles.warn}>
                R² below 0.9 — readings are noisy or range is narrow. Add more spread-out points.
              </Text>
            )}
          </View>
        )}

        <FlatList
          data={[...points].sort((a, b) => b.timestamp - a.timestamp)}
          keyExtractor={(p) => p.id}
          style={styles.list}
          renderItem={({ item }: { item: CalibrationPoint }) => (
            <View style={styles.pointRow}>
              <Text style={styles.pointText}>
                EV100 {item.ev100.toFixed(2)} → {item.referenceIrradiance.toFixed(0)} W/m²
              </Text>
              <Pressable onPress={() => removeCalibrationPoint(item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No calibration points yet.</Text>}
        />

        {points.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F1A" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
  instructions: { color: "#94A3B8", fontSize: 12, marginBottom: 12, lineHeight: 17 },

  cameraCard: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#141B2D",
    marginBottom: 12,
    position: "relative",
  },
  permWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
  permText: { color: "#94A3B8", fontSize: 12, textAlign: "center", marginBottom: 8 },
  permBtn: { backgroundColor: "#F59E0B", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  permBtnText: { color: "#0B0F1A", fontWeight: "700", fontSize: 12 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-start", padding: 8 },
  cameraToggleBtn: { alignSelf: "flex-end", backgroundColor: "rgba(11, 15, 26, 0.75)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  cameraToggleText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },

  liveBox: { backgroundColor: "#141B2D", borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 12 },
  liveLabel: { color: "#94A3B8", fontSize: 12 },
  liveValue: { color: "#F59E0B", fontSize: 28, fontWeight: "700" },
  inputRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: "#141B2D",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  inputDisabled: { opacity: 0.5 },
  doneButton: { backgroundColor: "#1E293B", borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  doneButtonText: { color: "#FFFFFF", fontWeight: "700" },
  addButton: { backgroundColor: "#F59E0B", borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  addButtonMeasuring: { backgroundColor: "#475569" },
  addButtonText: { color: "#0B0F1A", fontWeight: "700" },
  fitBox: { backgroundColor: "#141B2D", borderRadius: 12, padding: 12, marginBottom: 12 },
  fitText: { color: "#94A3B8", fontSize: 12 },
  warn: { color: "#F59E0B", fontSize: 12, marginTop: 4 },
  list: { flex: 1 },
  pointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#1E293B",
    borderBottomWidth: 1
  },
  pointText: { color: "#FFFFFF", fontSize: 13 },
  remove: { color: "#EF4444", fontSize: 13 },
  empty: { color: "#64748B", textAlign: "center", marginTop: 14 },
  clearButton: { marginTop: 10, alignSelf: "center" },
  clearButtonText: { color: "#EF4444", fontSize: 13 }
});
