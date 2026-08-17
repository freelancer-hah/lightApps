function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function rgbToXyz(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  return {
    X: R * 0.4124564 + G * 0.3575761 + B * 0.1804375,
    Y: R * 0.2126729 + G * 0.7151522 + B * 0.0721750,
    Z: R * 0.0193339 + G * 0.1191920 + B * 0.9503041,
  };
}

export function xyzToXy(X, Y, Z) {
  const s = X + Y + Z;
  if (s === 0) return { x: 0.3127, y: 0.3290 };
  return { x: X / s, y: Y / s };
}

export function rgbToXy(r, g, b) {
  const { X, Y, Z } = rgbToXyz(r, g, b);
  return xyzToXy(X, Y, Z);
}

export function xyToUv1960(x, y) {
  const denom = -2 * x + 12 * y + 3;
  return { u: (4 * x) / denom, v: (6 * y) / denom };
}

export function planckianLocusXy(T) {
  let x;
  if (T <= 4000) {
    x = -0.2661239e9 / T ** 3 - 0.2343589e6 / T ** 2 + 0.8776956e3 / T + 0.179910;
  } else {
    x = -3.0258469e9 / T ** 3 + 2.1070379e6 / T ** 2 + 0.2226347e3 / T + 0.240390;
  }
  let y;
  if (T <= 2222) {
    y = -1.1063814 * x ** 3 - 1.34811020 * x ** 2 + 2.18555832 * x - 0.20219683;
  } else if (T <= 4000) {
    y = -0.9549476 * x ** 3 - 1.37418593 * x ** 2 + 2.09137015 * x - 0.16748867;
  } else {
    y = 3.0817580 * x ** 3 - 5.87338670 * x ** 2 + 3.75112997 * x - 0.37001483;
  }
  return { x, y };
}

function scanLocus(u, v, tMin, tMax, step) {
  let bestT = tMin, bestDist = Infinity, bestUv = null;
  for (let T = tMin; T <= tMax; T += step) {
    const { x, y } = planckianLocusXy(T);
    const locusUv = xyToUv1960(x, y);
    const d = Math.hypot(u - locusUv.u, v - locusUv.v);
    if (d < bestDist) { bestDist = d; bestT = T; bestUv = locusUv; }
  }
  return { bestT, bestDist, bestUv };
}

// Validated against known references (D65->6502K, Illuminant A->2848K) and
// against real Kelvin Meter app screenshots (see KelvinMeterApp README).
export function nearestCctAndDuv(u, v) {
  const coarse = scanLocus(u, v, 1000, 20000, 50);
  const fine = scanLocus(u, v, Math.max(1000, coarse.bestT - 100), Math.min(20000, coarse.bestT + 100), 2);

  const dT = 10;
  const xyA = planckianLocusXy(Math.max(1000, fine.bestT - dT));
  const xyB = planckianLocusXy(Math.min(20000, fine.bestT + dT));
  const a = xyToUv1960(xyA.x, xyA.y);
  const b = xyToUv1960(xyB.x, xyB.y);
  const tangent = { u: b.u - a.u, v: b.v - a.v };
  const toPoint = { u: u - fine.bestUv.u, v: v - fine.bestUv.v };
  const cross = tangent.u * toPoint.v - tangent.v * toPoint.u;
  const sign = cross >= 0 ? -1 : 1;

  return { cct: Math.round(fine.bestT), duv: sign * fine.bestDist };
}

export function cctToMired(cct) {
  return cct ? 1_000_000 / cct : null;
}
