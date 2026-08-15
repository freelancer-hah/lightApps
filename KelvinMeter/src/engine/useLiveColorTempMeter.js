import { useRef, useState, useEffect, useCallback } from 'react';
import { sampleAveragedRegion } from './frameSampler';
import { rgbToXy, xyToUv1960, nearestCctAndDuv } from './colorScience';

function withTimeout(promise, ms = 1500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function useLiveColorTempMeter(cameraRef, { paused = false, calibrationOffsetK = 0 } = {}) {
  const [reading, setReading] = useState({
    rgb: null,
    xy: null,
    cctRaw: null,
    cct: null,
    duv: null,
  });
  const loopRef = useRef(null);

  const sampleLoop = useCallback(async () => {
    if (paused || !cameraRef.current) {
      loopRef.current = setTimeout(sampleLoop, 500);
      return;
    }
    try {
      const rgb = await withTimeout(sampleAveragedRegion(cameraRef), 2000);
      if (rgb) {
        const xy = rgbToXy(rgb.r, rgb.g, rgb.b);
        const uv = xyToUv1960(xy.x, xy.y);
        const { cct: cctRaw, duv } = nearestCctAndDuv(uv.u, uv.v);
        const cct = Math.max(1000, Math.round(cctRaw + calibrationOffsetK));
        setReading({ rgb, xy, cctRaw, cct, duv });
      }
    } catch (e) {
      console.log("Kelvin capture error:", e);
    } finally {
      loopRef.current = setTimeout(sampleLoop, 400);
    }
  }, [paused, cameraRef, calibrationOffsetK]);

  useEffect(() => {
    sampleLoop();
    return () => clearTimeout(loopRef.current);
  }, [sampleLoop]);

  return reading;
}
