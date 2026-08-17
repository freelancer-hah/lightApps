import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalibrationPoint, FitResult } from "../types";

const STORAGE_KEY = "@pyranometer_pro/calibration_points";

/**
 * Model: log10(irradiance) = a * EV100 + b
 * Fits against 1 or more paired reference readings from a physical pyranometer (W/m²).
 * Supports 1-point gain calibration or multi-point linear regression.
 */
export function fitCalibration(points: CalibrationPoint[]): FitResult | null {
  if (points.length === 0) return null;

  if (points.length === 1) {
    const p = points[0];
    const slope = Math.log10(2); // ~0.30103, theoretical base-2 log slope
    const intercept = Math.log10(Math.max(p.referenceIrradiance, 0.001)) - slope * p.ev100;
    return {
      slope,
      intercept,
      rSquared: 1.0,
      minEv100: p.ev100,
      maxEv100: p.ev100
    };
  }

  const xs = points.map((p) => p.ev100);
  const ys = points.map((p) => Math.log10(Math.max(p.referenceIrradiance, 0.001)));
  const n = xs.length;

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) {
    const p = points[0];
    const slope = Math.log10(2);
    const intercept = Math.log10(Math.max(p.referenceIrradiance, 0.001)) - slope * p.ev100;
    return {
      slope,
      intercept,
      rSquared: 1.0,
      minEv100: Math.min(...xs),
      maxEv100: Math.max(...xs)
    };
  }

  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;

  const meanY = sumY / n;
  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const ssRes = xs.reduce((acc, x, i) => acc + (ys[i] - (a * x + b)) ** 2, 0);
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;

  return {
    slope: a,
    intercept: b,
    rSquared: r2,
    minEv100: Math.min(...xs),
    maxEv100: Math.max(...xs)
  };
}

export function predictIrradiance(
  ev100: number,
  fit: FitResult
): { value: number; extrapolated: boolean } {
  const logIrradiance = fit.slope * ev100 + fit.intercept;
  const raw = Math.pow(10, logIrradiance);
  const clamped = Math.min(Math.max(raw, 0), 2000); // physical sanity bounds
  const extrapolated = ev100 < fit.minEv100 || ev100 > fit.maxEv100;
  return { value: clamped, extrapolated };
}

export async function loadCalibrationPoints(): Promise<CalibrationPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CalibrationPoint[]) : [];
  } catch {
    return [];
  }
}

export async function saveCalibrationPoints(points: CalibrationPoint[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}
