import { useRef, useState, useEffect, useCallback } from 'react';
import { captureFrame } from './frameSampler';
import { computeEV100, evToLux, DEFAULT_CALIBRATION } from './luxMath';

export function useLightMeterEngine(cameraRef, { intervalMs = 500, region = null, calibrationFactor = DEFAULT_CALIBRATION, paused = false } = {}) {
  const [reading, setReading] = useState({
    rgb: null,
    aperture: null,
    shutterSpeed: null,
    iso: null,
    ev100: null,
    lux: null,
  });
  const [error, setError] = useState(null);
  const busyRef = useRef(false);
  const intervalRef = useRef(null);

  const tick = useCallback(async () => {
    if (busyRef.current || paused || !cameraRef.current) return;
    busyRef.current = true;
    try {
      const frame = await captureFrame(cameraRef, region);
      if (frame) {
        const ev100 = computeEV100(frame.aperture, frame.shutterSpeed, frame.iso);
        const lux = evToLux(ev100, calibrationFactor);
        setReading({
          rgb: frame.rgb,
          aperture: frame.aperture,
          shutterSpeed: frame.shutterSpeed,
          iso: frame.iso,
          ev100,
          lux,
        });
        setError(null);
      }
    } catch (e) {
      setError(e?.message || 'capture failed');
    } finally {
      busyRef.current = false;
    }
  }, [cameraRef, region, calibrationFactor, paused]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(tick, intervalMs);
    }
    return () => clearInterval(intervalRef.current);
  }, [tick, intervalMs, paused]);

  return { reading, error };
}
