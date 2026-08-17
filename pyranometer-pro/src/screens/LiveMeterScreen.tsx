import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import GaugeView from "../components/Gauge";
import { useMeter } from "../context/MeterContext";
import { loadReadings, appendReading } from "../utils/storage";
import { predictIrradiance } from "../utils/calibration";
import { IrradianceReading } from "../types";
import { SOLAR_PRESETS } from "../../modules/camera-exposure";
import { captureFrame } from "../utils/frameSampler";

export default function LiveMeterScreen() {
  const {
    ev100,
    iso,
    exposureDurationSeconds,
    aperture,
    lux,
    activeMode,
    isHardwareSensorAvailable,
    isMonitoring,
    permissionDenied,
    startMonitoring,
    stopMonitoring,
    setMode,
    setPreset,
    setManualEv,
    updateFromFrame,
    fit,
    currentEstimate
  } = useMeter();

  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [saved, setSaved] = useState(false);

  const [finalEstimate, setFinalEstimate] = useState<{ value: number; extrapolated: boolean } | null>(null);
  const [finalTelemetry, setFinalTelemetry] = useState<{
    ev100: number;
    iso: number;
    exposureDurationSeconds: number;
    aperture: number;
    lux?: number;
  } | null>(null);

  const readingsRef = useRef<IrradianceReading[]>([]);
  const samplesRef = useRef<number[]>([]);

  const ev100Ref = useRef(ev100);
  const fitRef = useRef(fit);
  const isoRef = useRef(iso);
  const exposureDurationSecondsRef = useRef(exposureDurationSeconds);
  const apertureRef = useRef(aperture);
  const luxRef = useRef(lux);

  useEffect(() => { ev100Ref.current = ev100; }, [ev100]);
  useEffect(() => { fitRef.current = fit; }, [fit]);
  useEffect(() => { isoRef.current = iso; }, [iso]);
  useEffect(() => { exposureDurationSecondsRef.current = exposureDurationSeconds; }, [exposureDurationSeconds]);
  useEffect(() => { apertureRef.current = aperture; }, [aperture]);
  useEffect(() => { luxRef.current = lux; }, [lux]);

  useEffect(() => {
    startMonitoring();
    loadReadings().then((r) => (readingsRef.current = r));
    return () => {
      stopMonitoring();
    };
  }, []);

  // Live Camera sampling loop (only runs when tab is active and visible)
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
      const estimate = fitRef.current
        ? predictIrradiance(avgEv100, fitRef.current)
        : {
            value: Math.min(1500, Math.max(0, 0.02083 * Math.pow(2, avgEv100))),
            extrapolated: false
          };

      setFinalEstimate(estimate);
      setFinalTelemetry({
        ev100: avgEv100,
        iso: isoRef.current,
        exposureDurationSeconds: exposureDurationSecondsRef.current,
        aperture: apertureRef.current,
        lux: luxRef.current
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startMeasure = () => {
    samplesRef.current = [];
    setFinalEstimate(null);
    setFinalTelemetry(null);
    setSaved(false);
    setCountdown(5);
    setMeasuring(true);
  };

  const saveReadingToHistory = async () => {
    if (!finalEstimate || !finalTelemetry) return;
    const reading: IrradianceReading = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      ev100: finalTelemetry.ev100,
      irradianceWm2: finalEstimate.value,
      extrapolated: finalEstimate.extrapolated
    };
    readingsRef.current = await appendReading(readingsRef.current, reading);
    setSaved(true);
  };

  const displayEstimate = measuring ? currentEstimate : finalEstimate;
  const displayEv100 = measuring ? ev100 : (finalTelemetry?.ev100 ?? 0);
  const displayIso = measuring ? iso : (finalTelemetry?.iso ?? 0);
  const displayShutter = measuring ? exposureDurationSeconds : (finalTelemetry?.exposureDurationSeconds ?? 0);
  const displayAperture = measuring ? aperture : (finalTelemetry?.aperture ?? 0);
  const displayLux = measuring ? lux : finalTelemetry?.lux;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pyranometer Pro</Text>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Real-Time Solar Irradiance</Text>
          <Text style={styles.badgeSubtext}>W/m² & EV100 Meter</Text>
        </View>

        {permissionDenied && (
          <Text style={styles.error}>
            Camera/Sensor permission was denied. Enable it in system settings to take readings.
          </Text>
        )}

        {/* Live Camera Viewport (only mounted when tab is focused) */}
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
                <Text style={styles.permText}>Camera access required for live EV100 calculation.</Text>
                <Pressable style={styles.permBtn} onPress={requestPermission}>
                  <Text style={styles.permBtnText}>Grant Camera Permission</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.cameraOverlay} pointerEvents="box-none">
              <Pressable style={styles.cameraToggleBtn} onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}>
                <Text style={styles.cameraToggleText}>{facing === "front" ? "🔄 Front" : "🔄 Back"}</Text>
              </Pressable>
              <View style={styles.centerTarget} pointerEvents="none" />
            </View>
          </View>
        )}

        {!fit && (
          <Text style={styles.notice}>
            Using default sunlight model (0.02083 × 2^EV100). Calibrate with your W/m² reference meter in the Calibrate tab for custom precision.
          </Text>
        )}

        <GaugeView
          value={displayEstimate?.value ?? 0}
          extrapolated={displayEstimate?.extrapolated}
        />

        {/* Mode Selector */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionHeader}>Input Mode</Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeTab, activeMode === "camera" && styles.modeTabActive]}
              onPress={() => setMode("camera")}
            >
              <Text style={[styles.modeTabText, activeMode === "camera" && styles.modeTabTextActive]}>
                Camera EV100
              </Text>
            </Pressable>
            {isHardwareSensorAvailable && (
              <Pressable
                style={[styles.modeTab, activeMode === "sensor" && styles.modeTabActive]}
                onPress={() => setMode("sensor")}
              >
                <Text style={[styles.modeTabText, activeMode === "sensor" && styles.modeTabTextActive]}>
                  Light Sensor
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.modeTab, activeMode === "preset" && styles.modeTabActive]}
              onPress={() => setMode("preset")}
            >
              <Text style={[styles.modeTabText, activeMode === "preset" && styles.modeTabTextActive]}>
                Solar Presets
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeTab, activeMode === "manual" && styles.modeTabActive]}
              onPress={() => setMode("manual")}
            >
              <Text style={[styles.modeTabText, activeMode === "manual" && styles.modeTabTextActive]}>
                Manual EV
              </Text>
            </Pressable>
          </View>

          {/* Preset Buttons */}
          {activeMode === "preset" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {SOLAR_PRESETS.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.presetChip}
                  onPress={() => setPreset(p.id)}
                >
                  <Text style={styles.presetChipText}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Manual EV Nudge */}
          {activeMode === "manual" && (
            <View style={styles.nudgeRow}>
              <Pressable style={styles.nudgeBtn} onPress={() => setManualEv(ev100 - 0.5)}>
                <Text style={styles.nudgeBtnText}>-0.5 EV</Text>
              </Pressable>
              <Text style={styles.nudgeVal}>EV100: {ev100.toFixed(1)}</Text>
              <Pressable style={styles.nudgeBtn} onPress={() => setManualEv(ev100 + 0.5)}>
                <Text style={styles.nudgeBtnText}>+0.5 EV</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.telemetry}>
          <Row label="Live EV100" value={displayEv100.toFixed(2)} />
          {displayLux !== undefined && <Row label="Illuminance" value={`${displayLux.toFixed(0)} Lux`} />}
          <Row label="ISO" value={displayIso > 0 ? displayIso.toFixed(0) : "Auto"} />
          <Row label="Shutter Speed" value={displayShutter > 0 ? `1/${(1 / displayShutter).toFixed(0)}s` : "Auto"} />
          <Row label="Aperture" value={displayAperture > 0 ? `f/${displayAperture.toFixed(1)}` : "Auto"} />
          {fit && <Row label="Fit R²" value={fit.rSquared.toFixed(3)} />}
        </View>

        <Pressable
          style={[styles.button, measuring ? styles.buttonMeasuring : styles.buttonStart]}
          onPress={startMeasure}
          disabled={measuring}
        >
          <Text style={styles.buttonText}>
            {measuring ? `Measuring... (${countdown}s)` : "Start Measurement (5s)"}
          </Text>
        </Pressable>

        {finalEstimate && !measuring && (
          <Pressable
            style={[styles.button, saved ? styles.buttonSaved : styles.buttonSave]}
            onPress={saveReadingToHistory}
            disabled={saved}
          >
            <Text style={[styles.buttonText, saved && styles.buttonTextSaved]}>
              {saved ? "Saved to History" : "Save to History"}
            </Text>
          </Pressable>
        )}

        <Text style={styles.status}>
          {isMonitoring ? `Meter Active (${activeMode.toUpperCase()} Mode)` : "Meter Inactive"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F1A" },
  container: { alignItems: "center", padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
  badgeContainer: { backgroundColor: "#1E293B", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12, alignItems: "center" },
  badgeText: { color: "#F59E0B", fontWeight: "700", fontSize: 11 },
  badgeSubtext: { color: "#94A3B8", fontSize: 10 },
  error: { color: "#EF4444", textAlign: "center", marginBottom: 12 },
  notice: { color: "#F59E0B", textAlign: "center", marginBottom: 16, fontSize: 13 },

  cameraCard: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#141B2D",
    marginBottom: 16,
    position: "relative",
  },
  permWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  permText: { color: "#94A3B8", fontSize: 13, textAlign: "center", marginBottom: 12 },
  permBtn: { backgroundColor: "#F59E0B", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  permBtnText: { color: "#0B0F1A", fontWeight: "700", fontSize: 13 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", padding: 10 },
  cameraToggleBtn: { alignSelf: "flex-end", backgroundColor: "rgba(11, 15, 26, 0.75)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  cameraToggleText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  centerTarget: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.8)",
    borderRadius: 8,
  },

  modeSection: { width: "100%", marginTop: 16, marginBottom: 8 },
  sectionHeader: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  modeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  modeTab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#141B2D" },
  modeTabActive: { backgroundColor: "#F59E0B" },
  modeTabText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  modeTabTextActive: { color: "#0B0F1A" },
  presetScroll: { marginTop: 10, flexDirection: "row" },
  presetChip: { backgroundColor: "#1E293B", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 8 },
  presetChipText: { color: "#F59E0B", fontSize: 12, fontWeight: "600" },
  nudgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, backgroundColor: "#141B2D", padding: 10, borderRadius: 8 },
  nudgeBtn: { backgroundColor: "#1E293B", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  nudgeBtnText: { color: "#F59E0B", fontWeight: "700", fontSize: 13 },
  nudgeVal: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  telemetry: { width: "100%", marginTop: 16, backgroundColor: "#141B2D", borderRadius: 12, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { color: "#94A3B8", fontSize: 14 },
  rowValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  button: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: "100%" },
  buttonStart: { backgroundColor: "#F59E0B" },
  buttonMeasuring: { backgroundColor: "#475569" },
  buttonSave: { backgroundColor: "#10B981" },
  buttonSaved: { backgroundColor: "#1E293B" },
  buttonText: { color: "#0B0F1A", fontWeight: "700", textAlign: "center", fontSize: 15 },
  buttonTextSaved: { color: "#94A3B8" },
  status: { color: "#64748B", marginTop: 16, fontSize: 12 }
});
