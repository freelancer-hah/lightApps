// A coarse sample of the CIE 1931 spectral locus (the "horseshoe" boundary
// of monochromatic/pure colors on the xy chromaticity diagram).
export const SPECTRAL_LOCUS = [
  { wl: 380, x: 0.1741, y: 0.0050 }, { wl: 390, x: 0.1738, y: 0.0049 },
  { wl: 400, x: 0.1733, y: 0.0048 }, { wl: 410, x: 0.1726, y: 0.0048 },
  { wl: 420, x: 0.1714, y: 0.0051 }, { wl: 430, x: 0.1689, y: 0.0069 },
  { wl: 440, x: 0.1644, y: 0.0109 }, { wl: 450, x: 0.1566, y: 0.0177 },
  { wl: 460, x: 0.1440, y: 0.0297 }, { wl: 470, x: 0.1241, y: 0.0578 },
  { wl: 480, x: 0.0913, y: 0.1327 }, { wl: 490, x: 0.0454, y: 0.2950 },
  { wl: 500, x: 0.0082, y: 0.5384 }, { wl: 510, x: 0.0139, y: 0.7502 },
  { wl: 520, x: 0.0743, y: 0.8338 }, { wl: 530, x: 0.1547, y: 0.8059 },
  { wl: 540, x: 0.2296, y: 0.7543 }, { wl: 550, x: 0.3016, y: 0.6923 },
  { wl: 560, x: 0.3731, y: 0.6245 }, { wl: 570, x: 0.4441, y: 0.5547 },
  { wl: 580, x: 0.5125, y: 0.4866 }, { wl: 590, x: 0.5752, y: 0.4242 },
  { wl: 600, x: 0.6270, y: 0.3725 }, { wl: 610, x: 0.6658, y: 0.3340 },
  { wl: 620, x: 0.6915, y: 0.3083 }, { wl: 630, x: 0.7079, y: 0.2920 },
  { wl: 640, x: 0.7190, y: 0.2809 }, { wl: 650, x: 0.7260, y: 0.2740 },
  { wl: 660, x: 0.7300, y: 0.2700 }, { wl: 670, x: 0.7320, y: 0.2680 },
  { wl: 680, x: 0.7334, y: 0.2666 }, { wl: 690, x: 0.7344, y: 0.2656 },
  { wl: 700, x: 0.7347, y: 0.2653 },
];

export const WHITE_POINT_D65 = { x: 0.3127, y: 0.3290 };

export function dominantWavelength(x, y, whitePoint = WHITE_POINT_D65) {
  const dx = x - whitePoint.x;
  const dy = y - whitePoint.y;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return null;

  let best = null;
  let bestT = Infinity;

  for (let i = 0; i < SPECTRAL_LOCUS.length - 1; i++) {
    const p1 = SPECTRAL_LOCUS[i];
    const p2 = SPECTRAL_LOCUS[i + 1];
    const hit = raySegmentIntersection(whitePoint.x, whitePoint.y, dx, dy, p1.x, p1.y, p2.x, p2.y);
    if (hit && hit.t > 0 && hit.t < bestT) {
      bestT = hit.t;
      const wl = p1.wl + hit.u * (p2.wl - p1.wl);
      best = wl;
    }
  }
  return best ? Math.round(best) : null;
}

function raySegmentIntersection(ox, oy, dx, dy, x1, y1, x2, y2) {
  const sx = x2 - x1;
  const sy = y2 - y1;
  const denom = dx * sy - dy * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((x1 - ox) * sy - (y1 - oy) * sx) / denom;
  const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
  if (u < 0 || u > 1) return null;
  return { t, u };
}

export function wavelengthToColorLabel(wl) {
  if (wl == null) return 'Non-spectral (mixed color)';
  if (wl < 450) return 'Violet';
  if (wl < 485) return 'Blue';
  if (wl < 500) return 'Cyan';
  if (wl < 565) return 'Green';
  if (wl < 590) return 'Yellow';
  if (wl < 625) return 'Orange';
  return 'Red';
}
