import { useRef, useState, useEffect, useCallback } from 'react';
import { sampleBrightness } from './frameSampler';
import { computeFlickerPercent, estimateFrequency, flickerRiskLabel } from './flickerAnalysis';

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

export function useLiveFlickerMeter(cameraRef, { calibrationHz = 120, calibrationRate = 8500, calibrationFactor = 1.0, paused = false } = {}) {
  const [percent, setPercent] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const rawSamplesRef = useRef([]);
  const loopRef = useRef(null);

  const sampleLoop = useCallback(async () => {
    if (paused || !cameraRef.current) {
      loopRef.current = setTimeout(sampleLoop, 500);
      return;
    }
    try {
      const samples = await withTimeout(sampleBrightness(cameraRef), 2000);
      if (samples && samples.length >= 8) {
        rawSamplesRef.current = samples;
        const pct = computeFlickerPercent(samples, calibrationFactor);
        const freq = estimateFrequency(samples, calibrationHz, calibrationRate);
        setPercent(pct);
        setFrequency(freq);
      }
    } catch (e) {
      console.log("Flicker capture error:", e);
    } finally {
      loopRef.current = setTimeout(sampleLoop, 700);
    }
  }, [paused, cameraRef, calibrationHz, calibrationRate, calibrationFactor]);

  useEffect(() => {
    sampleLoop();
    return () => clearTimeout(loopRef.current);
  }, [sampleLoop]);

  const risk = flickerRiskLabel(percent);

  return { percent, frequency, risk, rawSamples: rawSamplesRef.current };
}
