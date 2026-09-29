import { useState, useEffect, useRef } from 'react';
import { captureFrame } from './frameSampler';
import { computeEV100, evToLux, luxToFootCandles, luxToPpfd, ppfdToDli } from './luxMath';
import { rgbToCct, xyToTintHint, rgbToXy } from './colorScience';

export function usePhotoneEngine(cameraRef, options = {}) {
  const {
    paused = false,
    calibrationFactor = 0.757,
    cctOffsetK = 0,
    lightSourceId = 'led_full_spec',
    diffuserOn = false,
    diffuserMultiplier = 2.25,
    photoperiodHours = 18,
    sampleIntervalMs = 250,
  } = options;

  const [reading, setReading] = useState({
    ppfd: null,
    dli: null,
    lux: null,
    fc: null,
    cct: null,
    cctRaw: null,
    ev100: null,
    tintHint: null,
    rgb: null,
    xy: null,
    timestamp: Date.now(),
  });

  const isRunningRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function sampleLoop() {
      if (!active || paused) return;

      if (!cameraRef?.current || isRunningRef.current) {
        timeoutRef.current = setTimeout(sampleLoop, 150);
        return;
      }

      isRunningRef.current = true;

      try {
        const frame = await captureFrame(cameraRef);
        if (frame?.rgb && active) {
          const rgb = frame.rgb;
          const ev = computeEV100(frame.aperture, frame.shutterSpeed, frame.iso, rgb);
          const rawLux = evToLux(ev, calibrationFactor);
          const fc = luxToFootCandles(rawLux);
          const ppfd = luxToPpfd(rawLux, lightSourceId, diffuserOn, diffuserMultiplier);
          const dli = ppfdToDli(ppfd, photoperiodHours);

          const cctRaw = rgbToCct(rgb.r, rgb.g, rgb.b);
          const cct = Math.round(cctRaw + cctOffsetK);
          const xy = rgbToXy(rgb.r, rgb.g, rgb.b);
          const tintHint = xyToTintHint(xy.x, xy.y);

          setReading({
            ppfd,
            dli,
            lux: rawLux,
            fc,
            cct,
            cctRaw,
            ev100: ev,
            tintHint,
            rgb,
            xy,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        // Suppress frame loop error
      } finally {
        isRunningRef.current = false;
        if (active && !paused) {
          timeoutRef.current = setTimeout(sampleLoop, sampleIntervalMs);
        }
      }
    }

    sampleLoop();

    return () => {
      active = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    cameraRef,
    paused,
    calibrationFactor,
    cctOffsetK,
    lightSourceId,
    diffuserOn,
    diffuserMultiplier,
    photoperiodHours,
    sampleIntervalMs,
  ]);

  return reading;
}
