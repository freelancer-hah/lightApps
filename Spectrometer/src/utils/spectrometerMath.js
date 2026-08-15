// Spectrometer color science and measurement calculations
import { dominantWavelength, wavelengthToColorLabel, WHITE_POINT_D65 } from './spectralLocus';

export function srgbToLinear(c) {
  const v = Math.max(0, Math.min(255, c)) / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function rgbToXyz(r, g, b) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return {
    X: R * 0.4124564 + G * 0.3575761 + B * 0.1804375,
    Y: R * 0.2126729 + G * 0.7151522 + B * 0.0721750,
    Z: R * 0.0193339 + G * 0.1191920 + B * 0.9503041,
  };
}

export function xyzToXy(X, Y, Z, defaultWhite = WHITE_POINT_D65) {
  const sum = X + Y + Z;
  if (sum <= 1e-7) return { x: defaultWhite.x, y: defaultWhite.y };
  return { x: X / sum, y: Y / sum };
}

export function rgbToXy(r, g, b) {
  const { X, Y, Z } = rgbToXyz(r, g, b);
  return xyzToXy(X, Y, Z);
}

export function xyToUvPrime(x, y) {
  const denom = -2 * x + 12 * y + 3;
  if (Math.abs(denom) < 1e-7) return { uPrime: 0.1978, vPrime: 0.4683 };
  const uPrime = (4 * x) / denom;
  const vPrime = (9 * y) / denom;
  return { uPrime, vPrime };
}

export function rgbToHsv(r, g, b) {
  const rNorm = Math.max(0, Math.min(255, r)) / 255;
  const gNorm = Math.max(0, Math.min(255, g)) / 255;
  const bNorm = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta > 1e-5) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v),
  };
}

export function rgbToLab(r, g, b) {
  const { X, Y, Z } = rgbToXyz(r, g, b);
  const Xn = 0.95047;
  const Yn = 1.00000;
  const Zn = 1.08883;

  const xr = X / Xn;
  const yr = Y / Yn;
  const zr = Z / Zn;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(xr);
  const fy = f(yr);
  const fz = f(zr);

  const L = Math.max(0, 116 * fy - 16);
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return {
    L: Math.round(L * 10) / 10,
    a: Math.round(a * 10) / 10,
    b: Math.round(bVal * 10) / 10,
  };
}

export function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function xyToCct(x, y) {
  const n = (x - 0.3320) / (0.1858 - y);
  const cct = 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
  if (isNaN(cct) || cct < 1000) return 1000;
  if (cct > 25000) return 25000;
  return Math.round(cct);
}

export function calculateDuv(x, y, cct) {
  const planckianY = -3 * x * x + 2.87 * x - 0.275;
  const dy = y - planckianY;
  const duv = Math.max(-0.05, Math.min(0.05, dy * 0.85));
  return Math.round(duv * 10000) / 10000;
}

export function calculateLightLevel({ r, g, b, aperture, shutterSpeed, iso, calibrationGain = 2.5, mode = 'direct' }) {
  const Rlin = srgbToLinear(r);
  const Glin = srgbToLinear(g);
  const Blin = srgbToLinear(b);
  const luminance = 0.2126729 * Rlin + 0.7151522 * Glin + 0.0721750 * Blin;

  let baseLux = 0;

  if (aperture && shutterSpeed && iso) {
    const ev100 = Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
    baseLux = calibrationGain * Math.pow(2, ev100);
  } else {
    baseLux = luminance * 1250 * calibrationGain;
  }

  const modeMultiplier = mode === 'reflected' ? 5.55 : 1.0;
  const lux = Math.max(0, Math.round(baseLux * modeMultiplier));
  const fc = Math.round((lux / 10.764) * 10) / 10;

  return { lux, fc };
}

export function generateEstimatedSpectrum(r, g, b, dominantWl) {
  const wavelengths = [
    380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 670, 700, 730, 750
  ];

  const peakWl = dominantWl || 550;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  return wavelengths.map((wl) => {
    const peakDist = Math.abs(wl - peakWl);
    const mainPeak = Math.exp(-Math.pow(peakDist / 45, 2));

    let rgbWeight = 0;
    if (wl < 490) {
      rgbWeight = bNorm * Math.exp(-Math.pow((wl - 450) / 40, 2));
    } else if (wl < 590) {
      rgbWeight = gNorm * Math.exp(-Math.pow((wl - 540) / 50, 2));
    } else {
      rgbWeight = rNorm * Math.exp(-Math.pow((wl - 630) / 50, 2));
    }

    const intensity = Math.min(1.0, Math.max(0.02, mainPeak * 0.6 + rgbWeight * 0.4));
    return {
      wl,
      intensity: Math.round(intensity * 100) / 100,
    };
  });
}

export function applyCalibration(rawR, rawG, rawB, whiteRef, gain = 1.0) {
  if (!whiteRef) {
    return {
      r: Math.min(255, Math.max(0, Math.round(rawR * gain))),
      g: Math.min(255, Math.max(0, Math.round(rawG * gain))),
      b: Math.min(255, Math.max(0, Math.round(rawB * gain))),
    };
  }

  const rFactor = 255 / (whiteRef.r || 255);
  const gFactor = 255 / (whiteRef.g || 255);
  const bFactor = 255 / (whiteRef.b || 255);

  const calR = Math.min(255, Math.max(0, Math.round(rawR * rFactor * gain)));
  const calG = Math.min(255, Math.max(0, Math.round(rawG * gFactor * gain)));
  const calB = Math.min(255, Math.max(0, Math.round(rawB * bFactor * gain)));

  return { r: calR, g: calG, b: calB };
}

export function processSpectrometerReading({ rawR, rawG, rawB, aperture, shutterSpeed, iso, whiteRef, calibrationGain = 1.0, mode = 'direct' }) {
  const { r, g, b } = applyCalibration(rawR, rawG, rawB, whiteRef, calibrationGain);

  const hex = rgbToHex(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const lab = rgbToLab(r, g, b);

  const xyz = rgbToXyz(r, g, b);
  const { x, y } = xyzToXy(xyz.X, xyz.Y, xyz.Z);
  const { uPrime, vPrime } = xyToUvPrime(x, y);

  const dominantWl = dominantWavelength(x, y, WHITE_POINT_D65);
  const wavelengthLabel = wavelengthToColorLabel(dominantWl);

  const cct = xyToCct(x, y);
  const duv = calculateDuv(x, y, cct);

  const { lux, fc } = calculateLightLevel({ r, g, b, aperture, shutterSpeed, iso, calibrationGain, mode });

  const spectrum = generateEstimatedSpectrum(r, g, b, dominantWl);

  return {
    raw: { r: rawR, g: rawG, b: rawB },
    rgb: { r, g, b },
    hex,
    hsv,
    lab,
    xyz: {
      X: Math.round(xyz.X * 1000) / 1000,
      Y: Math.round(xyz.Y * 1000) / 1000,
      Z: Math.round(xyz.Z * 1000) / 1000,
    },
    cie1931: {
      x: Math.round(x * 10000) / 10000,
      y: Math.round(y * 10000) / 10000,
    },
    cie1976: {
      uPrime: Math.round(uPrime * 10000) / 10000,
      vPrime: Math.round(vPrime * 10000) / 10000,
    },
    dominantWavelength: dominantWl,
    wavelengthLabel,
    cct,
    duv,
    lux,
    fc,
    spectrum,
    mode,
    timestamp: Date.now(),
  };
}

export function exportToCsv(measurements) {
  const headers = [
    'Timestamp',
    'Date Time',
    'Mode',
    'HEX',
    'RGB_R',
    'RGB_G',
    'RGB_B',
    'HSV_H',
    'HSV_S',
    'HSV_V',
    'Lab_L',
    'Lab_a',
    'Lab_b',
    'CIE1931_x',
    'CIE1931_y',
    'CIE1976_uPrime',
    'CIE1976_vPrime',
    'Dominant_Wavelength_nm',
    'Wavelength_Label',
    'CCT_Kelvin',
    'Duv',
    'Lux',
    'Foot_Candles',
    'Notes',
  ].join(',');

  const rows = measurements.map((m) => {
    const dateStr = new Date(m.timestamp).toLocaleString().replace(/,/g, '');
    return [
      m.timestamp,
      `"${dateStr}"`,
      m.mode || 'direct',
      m.hex || '',
      m.rgb?.r ?? 0,
      m.rgb?.g ?? 0,
      m.rgb?.b ?? 0,
      m.hsv?.h ?? 0,
      m.hsv?.s ?? 0,
      m.hsv?.v ?? 0,
      m.lab?.L ?? 0,
      m.lab?.a ?? 0,
      m.lab?.b ?? 0,
      m.cie1931?.x ?? 0,
      m.cie1931?.y ?? 0,
      m.cie1976?.uPrime ?? 0,
      m.cie1976?.vPrime ?? 0,
      m.dominantWavelength ?? 'N/A',
      `"${m.wavelengthLabel || ''}"`,
      m.cct ?? 0,
      m.duv ?? 0,
      m.lux ?? 0,
      m.fc ?? 0,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

export function exportToText(m) {
  const dateStr = new Date(m.timestamp).toLocaleString();
  return `=== SPECTROMETER MEASUREMENT REPORT ===
Date & Time: ${dateStr}
Measurement Mode: ${(m.mode || 'direct').toUpperCase()}

--- COLOR ANALYSIS ---
HEX: ${m.hex}
RGB: R:${m.rgb?.r} G:${m.rgb?.g} B:${m.rgb?.b}
HSV: H:${m.hsv?.h}° S:${m.hsv?.s}% V:${m.hsv?.v}%
CIE L*a*b*: L*:${m.lab?.L} a*:${m.lab?.a} b*:${m.lab?.b}
Dominant Wavelength: ${m.dominantWavelength ? `${m.dominantWavelength} nm (${m.wavelengthLabel})` : 'Non-spectral'}

--- CHROMATICITY ---
CIE 1931 (x, y): (${m.cie1931?.x}, ${m.cie1931?.y})
CIE 1976 (u', v'): (${m.cie1976?.uPrime}, ${m.cie1976?.vPrime})

--- COLOR TEMPERATURE ---
Correlated Color Temp: ${m.cct} K
Duv (Tint): ${m.duv} (${m.duv > 0 ? 'Green tint' : m.duv < 0 ? 'Magenta tint' : 'Neutral'})

--- LIGHT LEVEL ---
Illuminance: ${m.lux} Lux (${m.fc} fc)

${m.notes ? `Notes:\n${m.notes}\n` : ''}========================================`;
}
