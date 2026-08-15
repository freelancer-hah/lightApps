function srgbToLinear(c) {
  const v = c / 255;
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

export function xyzToXy(X, Y, Z) {
  const sum = X + Y + Z;
  if (sum === 0) return { x: 0.3127, y: 0.3290 };
  return { x: X / sum, y: Y / sum };
}

export function rgbToXy(r, g, b) {
  const { X, Y, Z } = rgbToXyz(r, g, b);
  return xyzToXy(X, Y, Z);
}

export function xyToCct(x, y) {
  const n = (x - 0.3320) / (0.1858 - y);
  const cct = 449 * n ** 3 + 3525 * n ** 2 + 6823.3 * n + 5520.33;
  return Math.round(cct);
}

export function rgbToCct(r, g, b) {
  const { x, y } = rgbToXy(r, g, b);
  return xyToCct(x, y);
}

export function xyToTintHint(x, y, cct) {
  const plankianY = -3 * x * x + 2.87 * x - 0.275;
  const dy = y - plankianY;
  if (Math.abs(dy) < 0.002) return 'Neutral';
  return dy > 0 ? 'Green tint' : 'Magenta tint';
}

export function classifyLightSource(cct) {
  if (cct < 2000) return 'Candlelight';
  if (cct < 3000) return 'Tungsten / Incandescent';
  if (cct < 4000) return 'Warm White LED / Halogen';
  if (cct < 4600) return 'Fluorescent';
  if (cct < 5500) return 'Cool White LED';
  if (cct < 6500) return 'Daylight';
  if (cct < 8000) return 'Overcast Daylight';
  return 'Shade / Blue Sky';
}

export function suggestedWhiteBalance(cct) {
  if (cct < 3200) return 'Tungsten (~3200K)';
  if (cct < 4000) return 'Warm Fluorescent (~3800K)';
  if (cct < 4600) return 'Fluorescent (~4200K)';
  if (cct < 5600) return 'Daylight (~5500K)';
  if (cct < 6700) return 'Cloudy (~6500K)';
  return 'Shade (~7500K)';
}
