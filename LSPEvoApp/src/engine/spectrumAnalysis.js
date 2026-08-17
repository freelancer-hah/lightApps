// Turns the raw band-strip pixel array into a proper {wl, intensity}
// spectrum using the pixel-position -> wavelength calibration, then
// derives the G-Index and PAR (photosynthetically active radiation)
// fraction from it.

export const DEFAULT_CALIBRATION = { a: null, b: 380, calibrated: false };

// Two-point calibration: given two (pixelIndex, knownWavelength) pairs,
// solve for the linear mapping wavelength = a*pixelIndex + b. This is the
// same technique DIY spectrometer projects use (e.g. calibrating against
// a fluorescent tube's known mercury emission lines at 405/436/546/578nm).
export function calibrateFromTwoPoints(px1, wl1, px2, wl2) {
  if (px1 === px2) return null;
  const a = (wl2 - wl1) / (px2 - px1);
  const b = wl1 - a * px1;
  return { a, b, calibrated: true };
}

export function pixelToWavelength(calibration, pixelIndex, numSamples) {
  if (calibration?.calibrated && calibration.a != null) {
    return calibration.a * pixelIndex + calibration.b;
  }
  // Uncalibrated default: assume the band linearly spans 380-700nm across
  // its width. Works out of the box but is only a rough approximation -
  // real accuracy requires calibrating against a known reference (see
  // CalibrationScreen), same requirement the real app's "refraction box"
  // mode has.
  const t = pixelIndex / Math.max(1, numSamples - 1);
  return 380 + t * (700 - 380);
}

// pixels: array of { r, g, b } from sampleBandStrip
export function buildSpectrum(pixels, calibration) {
  const n = pixels.length;
  return pixels.map((p, i) => {
    const wl = pixelToWavelength(calibration, i, n);
    // Luminance as the intensity proxy for that wavelength bin.
    const intensity = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
    return { wl, intensity };
  }).sort((a, b) => a.wl - b.wl);
}

function sumInBand(spectrum, loWl, hiWl) {
  return spectrum
    .filter((p) => p.wl >= loWl && p.wl <= hiWl)
    .reduce((sum, p) => sum + p.intensity, 0);
}

// G-Index: fraction of total spectrum energy concentrated in the
// 350-550nm (blue-heavy) band, 0-1. Low G -> little blue-band energy
// (warm-shifted source). High G (toward 1) -> most energy is in that
// band (blue-heavy source). Confirmed against real-app screenshot values
// (0.21-0.48 for overcast/indoor light) - this ratio-of-total form
// produces values in that same 0-1 range; the earlier inverted
// total/blueBand form produced values >=1 that didn't match.
export function computeGIndex(spectrum) {
  if (!spectrum?.length) return null;
  const total = spectrum.reduce((s, p) => s + p.intensity, 0);
  if (total <= 0) return null;
  const blueBand = sumInBand(spectrum, 350, 550);
  return blueBand / total;
}

// Fraction of total energy inside the 400-700nm PAR band, used to refine
// the lux->PPFD conversion factor from real spectral shape instead of a
// guessed light-source-type preset.
export function computeParFraction(spectrum) {
  if (!spectrum?.length) return null;
  const total = spectrum.reduce((s, p) => s + p.intensity, 0);
  if (total <= 0) return null;
  const par = sumInBand(spectrum, 400, 700);
  return par / total;
}

export function dominantPeak(spectrum) {
  if (!spectrum?.length) return null;
  let best = spectrum[0];
  for (const p of spectrum) if (p.intensity > best.intensity) best = p;
  return best.wl;
}
