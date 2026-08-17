import { useRef, useState, useEffect, useCallback } from 'react';
import { sampleAveragedRegion, sampleBandStrip, sampleThumbnail } from './frameSampler';
import { rgbToXy, xyToUv1960, nearestCctAndDuv, cctToMired, xyzToXy } from './colorScience';
import { spectrumToXyz } from './cieCmf';
import { buildSpectrum, computeGIndex, computeParFraction, dominantPeak } from './spectrumAnalysis';
import { estimateSpectrumFromRgb } from './estimateSpectrum';
import { computeHistogram } from './histogram';
import { computeEV100, evToLux } from './luxMath';

// Scaling convention for "Tint": reverse-engineered from the real app's
// screenshot values (-8.279, -14.171, -14.144...) which are roughly 1000x
// larger than a raw Duv value (~0.003-0.03 typically). Duv*1000 is also a
// common convention in photography tools for presenting tint as a more
// human-readable number. If you have the real app side-by-side, compare a
// few readings and adjust TINT_SCALE in this file if needed - see README.
const TINT_SCALE = 1000;

const EMPTY_READING = {
  rgb: null, xy: null, cctRaw: null, cct: null, duv: null, tint: null, mired: null,
  lux: null, spectrum: null, gIndex: null, parFraction: null, peakWl: null,
  histogram: null, spectrumIsEstimated: true,
};

export function useLiveMeasurement(cameraRef, {
  mode = 'estimate', // 'estimate' | 'diffraction'
  bandRegion,
  calibration,
  intervalMs = 700,
  paused = false,
  calibrationOffsetK = 0,
  luxCalibrationFactor,
} = {}) {
  const [reading, setReading] = useState(EMPTY_READING);
  const busyRef = useRef(false);
  const intervalRef = useRef(null);

  const tick = useCallback(async () => {
    if (busyRef.current || paused || !cameraRef.current) return;
    busyRef.current = true;
    try {
      // Always sample a centered region - gives us RGB, EXIF exposure
      // (-> lux), and (in estimate mode) the xy/spectrum source too.
      const region = await sampleAveragedRegion(cameraRef);

      let xy, spectrum = null, gIndex = null, parFraction = null, peakWl = null;
      let rgb = region;
      let spectrumIsEstimated = true;
      let lux = null;

      if (region) {
        const ev100 = computeEV100(region.aperture, region.shutterSpeed, region.iso);
        lux = evToLux(ev100, luxCalibrationFactor);
      }

      if (mode === 'diffraction' && bandRegion) {
        const pixels = await sampleBandStrip(cameraRef, bandRegion, 120);
        if (pixels) {
          spectrum = buildSpectrum(pixels, calibration);
          spectrumIsEstimated = !calibration?.calibrated;
          const xyz = spectrumToXyz(spectrum);
          if (xyz) xy = xyzToXy(xyz.X, xyz.Y, xyz.Z);
          rgb = pixels[Math.floor(pixels.length / 2)];
        }
      } else if (region) {
        xy = rgbToXy(region.r, region.g, region.b);
        // Reconstruct an approximate spectrum from RGB so the
        // Spectrum/Pie/G-Index panels still show something meaningful
        // without the diffuser attached (see estimateSpectrum.js).
        spectrum = estimateSpectrumFromRgb(region.r, region.g, region.b);
        spectrumIsEstimated = true;
      }

      if (spectrum) {
        gIndex = computeGIndex(spectrum);
        parFraction = computeParFraction(spectrum);
        peakWl = dominantPeak(spectrum);
      }

      const thumb = await sampleThumbnail(cameraRef, 24);
      const histogram = thumb ? computeHistogram(thumb) : null;

      if (xy) {
        const uv = xyToUv1960(xy.x, xy.y);
        const { cct: cctRaw, duv } = nearestCctAndDuv(uv.u, uv.v);
        const cct = cctRaw + calibrationOffsetK;
        setReading({
          rgb, xy, cctRaw, cct, duv, tint: duv * TINT_SCALE, mired: cctToMired(cct),
          lux, spectrum, gIndex, parFraction, peakWl, histogram, spectrumIsEstimated,
        });
      } else if (histogram) {
        setReading((prev) => ({ ...prev, histogram, lux }));
      }
    } catch (e) {
      // transient capture error - skip this tick
    } finally {
      busyRef.current = false;
    }
  }, [cameraRef, mode, bandRegion, calibration, paused, calibrationOffsetK, luxCalibrationFactor]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) intervalRef.current = setInterval(tick, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [tick, intervalMs, paused]);

  return reading;
}
