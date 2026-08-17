import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  addExposureListener,
  startExposureMonitoring,
  stopExposureMonitoring,
  ExposureSample,
  setMonitoringMode,
  setManualEv as updateManualEv,
  setPreset as updatePreset,
  checkHardwareSensorSupport,
  SOLAR_PRESETS
} from "../../modules/camera-exposure";
import { CalibrationPoint, FitResult } from "../types";
import { fitCalibration, loadCalibrationPoints, saveCalibrationPoints, predictIrradiance } from "../utils/calibration";

type MeterContextValue = {
  // live camera/sensor state
  ev100: number;
  iso: number;
  exposureDurationSeconds: number;
  aperture: number;
  lux?: number;
  activeMode: "sensor" | "camera" | "preset" | "manual";
  isHardwareSensorAvailable: boolean;

  isMonitoring: boolean;
  permissionDenied: boolean;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  setMode: (mode: "sensor" | "camera" | "preset" | "manual") => void;
  setManualEv: (ev: number) => void;
  setPreset: (presetId: string) => void;

  // calibration
  points: CalibrationPoint[];
  fit: FitResult | null;
  addCalibrationPoint: (referenceIrradiance: number, customEv100?: number, note?: string) => Promise<void>;
  removeCalibrationPoint: (id: string) => Promise<void>;
  clearCalibrationPoints: () => Promise<void>;

  updateFromFrame: (frame: {
    ev100: number;
    iso?: number | null;
    shutterSpeed?: number | null;
    aperture?: number | null;
    lux?: number;
  }) => void;

  // derived live reading
  currentEstimate: { value: number; extrapolated: boolean } | null;
};

const MeterContext = createContext<MeterContextValue | null>(null);

export function MeterProvider({ children }: { children: React.ReactNode }) {
  const [ev100, setEv100] = useState(14.5);
  const [iso, setIso] = useState(100);
  const [exposureDurationSeconds, setExposureDurationSeconds] = useState(1 / 1000);
  const [aperture, setAperture] = useState(2.8);
  const [lux, setLux] = useState<number | undefined>(undefined);
  const [activeMode, setActiveModeState] = useState<"sensor" | "camera" | "preset" | "manual">("sensor");
  const [isHardwareSensorAvailable, setIsHardwareSensorAvailable] = useState(false);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [points, setPoints] = useState<CalibrationPoint[]>([]);
  const [fit, setFit] = useState<FitResult | null>(null);

  const subRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    loadCalibrationPoints().then((loaded) => {
      setPoints(loaded);
      setFit(fitCalibration(loaded));
    });
    checkHardwareSensorSupport().then((available) => {
      setIsHardwareSensorAvailable(available);
      if (!available) {
        setActiveModeState("camera");
        setMonitoringMode("camera");
      }
    });
  }, []);

  const startMonitoring = useCallback(async () => {
    try {
      subRef.current?.remove();
      subRef.current = addExposureListener((sample: ExposureSample) => {
        setEv100(sample.ev100);
        setIso(sample.iso);
        setExposureDurationSeconds(sample.exposureDurationSeconds);
        setAperture(sample.aperture);
        setLux(sample.lux);
        setActiveModeState(sample.mode);
      });
      await startExposureMonitoring();
      setIsMonitoring(true);
      setPermissionDenied(false);
    } catch (e: any) {
      if (e?.code === "PERMISSION_DENIED") {
        setPermissionDenied(true);
      }
      console.warn("startMonitoring failed", e);
    }
  }, []);

  const stopMonitoring = useCallback(async () => {
    subRef.current?.remove();
    subRef.current = null;
    await stopExposureMonitoring();
    setIsMonitoring(false);
  }, []);

  const setMode = useCallback((mode: "sensor" | "camera" | "preset" | "manual") => {
    setActiveModeState(mode);
    setMonitoringMode(mode);
  }, []);

  const setManualEv = useCallback((ev: number) => {
    updateManualEv(ev);
    setActiveModeState("manual");
  }, []);

  const setPreset = useCallback((presetId: string) => {
    updatePreset(presetId);
    setActiveModeState("preset");
  }, []);

  const persistAndRefit = useCallback(async (next: CalibrationPoint[]) => {
    setPoints(next);
    setFit(fitCalibration(next));
    await saveCalibrationPoints(next);
  }, []);

  const addCalibrationPoint = useCallback(
    async (referenceIrradiance: number, customEv100?: number, note?: string) => {
      if (referenceIrradiance <= 0) return;
      const targetEv100 = customEv100 !== undefined ? customEv100 : ev100;
      const point: CalibrationPoint = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ev100: targetEv100,
        referenceIrradiance,
        timestamp: Date.now(),
        note
      };
      await persistAndRefit([...points, point]);
    },
    [ev100, points, persistAndRefit]
  );

  const removeCalibrationPoint = useCallback(
    async (id: string) => {
      await persistAndRefit(points.filter((p) => p.id !== id));
    },
    [points, persistAndRefit]
  );

  const updateFromFrame = useCallback((frame: {
    ev100: number;
    iso?: number | null;
    shutterSpeed?: number | null;
    aperture?: number | null;
    lux?: number;
  }) => {
    setEv100(frame.ev100);
    if (frame.iso) setIso(frame.iso);
    if (frame.shutterSpeed) setExposureDurationSeconds(frame.shutterSpeed);
    if (frame.aperture) setAperture(frame.aperture);
    if (frame.lux !== undefined) setLux(frame.lux);
    setActiveModeState("camera");
  }, []);

  const clearCalibrationPoints = useCallback(async () => {
    await persistAndRefit([]);
  }, [persistAndRefit]);

  const currentEstimate = fit
    ? predictIrradiance(ev100, fit)
    : {
        value: Math.min(1500, Math.max(0, 0.02083 * Math.pow(2, ev100))),
        extrapolated: false
      };

  return (
    <MeterContext.Provider
      value={{
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
        setManualEv,
        setPreset,
        points,
        fit,
        addCalibrationPoint,
        removeCalibrationPoint,
        clearCalibrationPoints,
        updateFromFrame,
        currentEstimate
      }}
    >
      {children}
    </MeterContext.Provider>
  );
}

export function useMeter(): MeterContextValue {
  const ctx = useContext(MeterContext);
  if (!ctx) throw new Error("useMeter must be used within MeterProvider");
  return ctx;
}
