import { LightSensor } from "expo-sensors";
import { Platform } from "react-native";

export type ExposureSample = {
  iso: number;
  exposureDurationSeconds: number;
  aperture: number; // f-number
  ev100: number;    // ISO-100-referenced Exposure Value
  lux?: number;     // Raw ambient illuminance in Lux if hardware sensor active
  timestamp: number;
  mode: "sensor" | "camera" | "preset" | "manual";
};

export type EventSubscription = {
  remove: () => void;
};

// Preset solar lighting conditions for calibration and field testing
export const SOLAR_PRESETS = [
  { id: "clear_sun", label: "Clear Sun (~1000 W/m²)", ev100: 15.2 },
  { id: "hazy_sun", label: "Hazy Sun (~750 W/m²)", ev100: 14.8 },
  { id: "scattered_cloud", label: "Scattered Cloud (~500 W/m²)", ev100: 14.1 },
  { id: "overcast", label: "Overcast Sky (~250 W/m²)", ev100: 13.1 },
  { id: "shade", label: "Open Shade (~100 W/m²)", ev100: 11.8 }
];

let activeMode: "sensor" | "camera" | "preset" | "manual" = "sensor";
let manualEvValue = 14.5;
let activePresetId = "clear_sun";
let updateTimer: any = null;
let sensorSubscription: any = null;
let isHardwareSensorAvailable = false;
let currentLux: number | null = null;

const listeners = new Set<(sample: ExposureSample) => void>();

/**
 * Convert Lux to EV100
 * Formula: EV100 = log2(Lux / 2.5)
 */
export function luxToEv100(lux: number): number {
  if (lux <= 0) return 0;
  return Math.log2(lux / 2.5);
}

/**
 * Convert EV100 to Lux
 * Formula: Lux = 2.5 * 2^(EV100)
 */
export function ev100ToLux(ev100: number): number {
  return 2.5 * Math.pow(2, ev100);
}

/**
 * Helper to produce ExposureSample given EV100
 */
function createSample(ev100: number, lux?: number, modeOverride?: ExposureSample["mode"]): ExposureSample {
  const aperture = 2.8;
  const iso = 100;
  // duration = aperture^2 / (2^EV100 * (iso/100))
  const duration = Math.max(0.00005, Math.min(1.0, Math.pow(aperture, 2) / Math.pow(2, ev100)));

  return {
    iso,
    exposureDurationSeconds: duration,
    aperture,
    ev100: parseFloat(ev100.toFixed(2)),
    lux: lux !== undefined ? parseFloat(lux.toFixed(1)) : parseFloat(ev100ToLux(ev100).toFixed(1)),
    timestamp: Date.now(),
    mode: modeOverride || activeMode
  };
}

export async function checkHardwareSensorSupport(): Promise<boolean> {
  try {
    isHardwareSensorAvailable = await LightSensor.isAvailableAsync();
    return isHardwareSensorAvailable;
  } catch {
    isHardwareSensorAvailable = false;
    return false;
  }
}

export function getActiveMode(): "sensor" | "camera" | "preset" | "manual" {
  return activeMode;
}

export function setMonitoringMode(mode: "sensor" | "camera" | "preset" | "manual") {
  activeMode = mode;
}

export function setManualEv(ev: number) {
  manualEvValue = Math.max(0, Math.min(20, ev));
  activeMode = "manual";
}

export function setPreset(presetId: string) {
  const found = SOLAR_PRESETS.find((p) => p.id === presetId);
  if (found) {
    activePresetId = presetId;
    manualEvValue = found.ev100;
    activeMode = "preset";
  }
}

export function emitCameraFrameSample(frameSample: {
  ev100: number;
  aperture: number | null;
  shutterSpeed: number | null;
  iso: number | null;
  lux: number;
}) {
  activeMode = "camera";
  const sample: ExposureSample = {
    iso: frameSample.iso || 100,
    exposureDurationSeconds: frameSample.shutterSpeed || 1 / 1000,
    aperture: frameSample.aperture || 2.8,
    ev100: frameSample.ev100,
    lux: frameSample.lux,
    timestamp: Date.now(),
    mode: "camera"
  };
  listeners.forEach((l) => l(sample));
}

export function emitSampleFromEv(ev100: number, modeOverride?: ExposureSample["mode"]) {
  const sample = createSample(ev100, undefined, modeOverride);
  listeners.forEach((l) => l(sample));
}

export async function startExposureMonitoring(): Promise<void> {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
  if (sensorSubscription) {
    sensorSubscription.remove();
    sensorSubscription = null;
  }

  // Check hardware sensor (e.g., Android devices in Expo Go)
  const sensorAvailable = await checkHardwareSensorSupport();

  if (sensorAvailable) {
    try {
      LightSensor.setUpdateInterval(500);
      sensorSubscription = LightSensor.addListener((data: { illuminance: number }) => {
        currentLux = data.illuminance;
        if (activeMode === "sensor") {
          const ev = luxToEv100(data.illuminance);
          const sample = createSample(ev, data.illuminance, "sensor");
          listeners.forEach((l) => l(sample));
        }
      });
    } catch (err) {
      console.warn("Failed to listen to LightSensor:", err);
    }
  }

  // Timer loop handles preset/manual modes or fallback on devices without hardware light sensor
  updateTimer = setInterval(() => {
    let sample: ExposureSample;

    if (activeMode === "camera") {
      // Handled by live camera frame sampler
      return;
    } else if (activeMode === "sensor" && currentLux !== null) {
      // Handled by hardware sensor listener above
      return;
    } else if (activeMode === "manual") {
      sample = createSample(manualEvValue, undefined, "manual");
    } else if (activeMode === "preset") {
      const preset = SOLAR_PRESETS.find((p) => p.id === activePresetId) || SOLAR_PRESETS[0];
      const jitter = (Math.random() - 0.5) * 0.05;
      sample = createSample(preset.ev100 + jitter, undefined, "preset");
    } else {
      return;
    }

    listeners.forEach((l) => l(sample));
  }, 500);
}

export async function stopExposureMonitoring(): Promise<void> {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
  if (sensorSubscription) {
    sensorSubscription.remove();
    sensorSubscription = null;
  }
}

export function addExposureListener(
  listener: (sample: ExposureSample) => void
): EventSubscription {
  listeners.add(listener);
  return {
    remove: () => {
      listeners.delete(listener);
    }
  };
}
