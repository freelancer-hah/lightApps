// The CIE 1931 2-degree standard observer color matching functions -
// published reference data (10nm steps, 380-780nm). A camera's RGB sensor
// filters are only a rough approximation of these curves, which is the
// main source of error in RGB-only color temperature measurement. When we
// have an actual per-wavelength spectrum (from the diffraction grating),
// we can integrate against these REAL curves instead - this is the
// concrete, physical reason a calibrated diffuser attachment measures
// more accurately than the single-averaged-pixel estimate mode.
export const CIE_CMF = [
  { wl: 380, x: 0.0014, y: 0.0000, z: 0.0065 },
  { wl: 390, x: 0.0042, y: 0.0001, z: 0.0201 },
  { wl: 400, x: 0.0143, y: 0.0004, z: 0.0679 },
  { wl: 410, x: 0.0435, y: 0.0012, z: 0.2074 },
  { wl: 420, x: 0.1344, y: 0.0040, z: 0.6456 },
  { wl: 430, x: 0.2839, y: 0.0116, z: 1.3856 },
  { wl: 440, x: 0.3483, y: 0.0230, z: 1.7471 },
  { wl: 450, x: 0.3362, y: 0.0380, z: 1.7721 },
  { wl: 460, x: 0.2908, y: 0.0600, z: 1.6692 },
  { wl: 470, x: 0.1954, y: 0.0910, z: 1.2876 },
  { wl: 480, x: 0.0956, y: 0.1390, z: 0.8130 },
  { wl: 490, x: 0.0320, y: 0.2080, z: 0.4652 },
  { wl: 500, x: 0.0049, y: 0.3230, z: 0.2720 },
  { wl: 510, x: 0.0093, y: 0.5030, z: 0.1582 },
  { wl: 520, x: 0.0633, y: 0.7100, z: 0.0782 },
  { wl: 530, x: 0.1655, y: 0.8620, z: 0.0422 },
  { wl: 540, x: 0.2904, y: 0.9540, z: 0.0203 },
  { wl: 550, x: 0.4334, y: 0.9950, z: 0.0087 },
  { wl: 560, x: 0.5945, y: 0.9950, z: 0.0039 },
  { wl: 570, x: 0.7621, y: 0.9520, z: 0.0021 },
  { wl: 580, x: 0.9163, y: 0.8700, z: 0.0017 },
  { wl: 590, x: 1.0263, y: 0.7570, z: 0.0011 },
  { wl: 600, x: 1.0622, y: 0.6310, z: 0.0008 },
  { wl: 610, x: 1.0026, y: 0.5030, z: 0.0003 },
  { wl: 620, x: 0.8544, y: 0.3810, z: 0.0002 },
  { wl: 630, x: 0.6424, y: 0.2650, z: 0.0000 },
  { wl: 640, x: 0.4479, y: 0.1750, z: 0.0000 },
  { wl: 650, x: 0.2835, y: 0.1070, z: 0.0000 },
  { wl: 660, x: 0.1649, y: 0.0610, z: 0.0000 },
  { wl: 670, x: 0.0874, y: 0.0320, z: 0.0000 },
  { wl: 680, x: 0.0468, y: 0.0170, z: 0.0000 },
  { wl: 690, x: 0.0227, y: 0.0082, z: 0.0000 },
  { wl: 700, x: 0.0114, y: 0.0041, z: 0.0000 },
  { wl: 710, x: 0.0058, y: 0.0021, z: 0.0000 },
  { wl: 720, x: 0.0029, y: 0.0010, z: 0.0000 },
  { wl: 730, x: 0.0014, y: 0.0005, z: 0.0000 },
  { wl: 740, x: 0.0007, y: 0.0002, z: 0.0000 },
  { wl: 750, x: 0.0003, y: 0.0001, z: 0.0000 },
  { wl: 760, x: 0.0002, y: 0.0001, z: 0.0000 },
  { wl: 770, x: 0.0001, y: 0.0000, z: 0.0000 },
  { wl: 780, x: 0.0000, y: 0.0000, z: 0.0000 },
];

// Linear interpolation of the CMF table at an arbitrary wavelength.
function cmfAt(wl) {
  if (wl <= CIE_CMF[0].wl) return CIE_CMF[0];
  if (wl >= CIE_CMF[CIE_CMF.length - 1].wl) return CIE_CMF[CIE_CMF.length - 1];
  for (let i = 0; i < CIE_CMF.length - 1; i++) {
    const a = CIE_CMF[i], b = CIE_CMF[i + 1];
    if (wl >= a.wl && wl <= b.wl) {
      const t = (wl - a.wl) / (b.wl - a.wl);
      return {
        wl,
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y),
        z: a.z + t * (b.z - a.z),
      };
    }
  }
  return CIE_CMF[CIE_CMF.length - 1];
}

// spectrum: array of { wl, intensity } (any wavelength spacing/range -
// interpolated against the CMF table). Returns proper CIE XYZ via
// numeric integration (trapezoid rule).
export function spectrumToXyz(spectrum) {
  if (!spectrum || spectrum.length < 2) return null;
  let X = 0, Y = 0, Z = 0;
  const sorted = [...spectrum].sort((a, b) => a.wl - b.wl);
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i], p2 = sorted[i + 1];
    const dWl = p2.wl - p1.wl;
    if (dWl <= 0) continue;
    const cmf1 = cmfAt(p1.wl), cmf2 = cmfAt(p2.wl);
    // trapezoid rule on (intensity * cmf) products
    X += 0.5 * dWl * (p1.intensity * cmf1.x + p2.intensity * cmf2.x);
    Y += 0.5 * dWl * (p1.intensity * cmf1.y + p2.intensity * cmf2.y);
    Z += 0.5 * dWl * (p1.intensity * cmf1.z + p2.intensity * cmf2.z);
  }
  return { X, Y, Z };
}
