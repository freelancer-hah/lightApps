// Color space conversion helpers, mirroring the value set shown in ColorAssist:
// RGB, HSL, RYB, CMYK, and HTML hex.

export function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const k = 1 - Math.max(rf, gf, bf);
  const c = (1 - rf - k) / (1 - k);
  const m = (1 - gf - k) / (1 - k);
  const y = (1 - bf - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Widely-used approximate RGB->RYB (subtractive) conversion:
// removes the common "white" component shared by R/G/B and remaps the
// remaining chroma onto Red/Yellow/Blue subtractive primaries.
export function rgbToRyb(r, g, b) {
  let rf = r / 255, gf = g / 255, bf = b / 255;

  const white = Math.min(rf, gf, bf);
  rf -= white; gf -= white; bf -= white;

  const maxG = Math.max(rf, gf, bf);

  let yellow = Math.min(rf, gf);
  rf -= yellow;
  gf -= yellow;

  if (bf > 0 && gf > 0) {
    bf /= 2;
    gf /= 2;
  }

  yellow += gf;
  bf += gf;

  let maxY = Math.max(rf, yellow, bf);
  if (maxY > 0) {
    const n = maxG / maxY;
    rf *= n; yellow *= n; bf *= n;
  }

  rf += white; yellow += white; bf += white;

  return {
    r: Math.round(rf * 100),
    y: Math.round(yellow * 100),
    b: Math.round(bf * 100),
  };
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Perceptual (redmean) distance - closer to how the eye judges color
// similarity than plain Euclidean RGB distance. Used for name matching.
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export function rgbToRainbow7(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  
  let rv = 0, ov = 0, yv = 0, gv = 0, bv = 0, iv = 0, vv = 0;
  
  if (s > 0 && l > 0 && l < 100) {
    if (h >= 0 && h < 30) {
      const w = h / 30;
      rv = 1 - w;
      ov = w;
    } else if (h >= 30 && h < 60) {
      const w = (h - 30) / 30;
      ov = 1 - w;
      yv = w;
    } else if (h >= 60 && h < 120) {
      const w = (h - 60) / 60;
      yv = 1 - w;
      gv = w;
    } else if (h >= 120 && h < 180) {
      const w = (h - 120) / 60;
      gv = 1 - w;
      bv = w;
    } else if (h >= 180 && h < 220) {
      const w = (h - 180) / 40;
      bv = 1 - w;
      iv = w;
    } else if (h >= 220 && h < 280) {
      const w = (h - 220) / 60;
      iv = 1 - w;
      vv = w;
    } else { // h >= 280 && h <= 360
      const w = (h - 280) / 80;
      vv = 1 - w;
      rv = w;
    }
  }
  
  const factor = s / 100;
  
  return {
    r: Math.round(rv * 100 * factor),
    o: Math.round(ov * 100 * factor),
    y: Math.round(yv * 100 * factor),
    g: Math.round(gv * 100 * factor),
    b: Math.round(bv * 100 * factor),
    i: Math.round(iv * 100 * factor),
    v: Math.round(vv * 100 * factor),
  };
}
