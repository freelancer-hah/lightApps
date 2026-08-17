// Sample of the CIE 1931 spectral locus (the "horseshoe" boundary of pure
// monochromatic colors) used to draw the CIE diagram and plot the white
// point / measured color's position on it.
export const SPECTRAL_LOCUS = [
  { wl: 380, x: 0.1741, y: 0.0050 }, { wl: 400, x: 0.1733, y: 0.0048 },
  { wl: 420, x: 0.1714, y: 0.0051 }, { wl: 440, x: 0.1644, y: 0.0109 },
  { wl: 460, x: 0.1440, y: 0.0297 }, { wl: 470, x: 0.1241, y: 0.0578 },
  { wl: 480, x: 0.0913, y: 0.1327 }, { wl: 490, x: 0.0454, y: 0.2950 },
  { wl: 500, x: 0.0082, y: 0.5384 }, { wl: 510, x: 0.0139, y: 0.7502 },
  { wl: 520, x: 0.0743, y: 0.8338 }, { wl: 530, x: 0.1547, y: 0.8059 },
  { wl: 540, x: 0.2296, y: 0.7543 }, { wl: 550, x: 0.3016, y: 0.6923 },
  { wl: 560, x: 0.3731, y: 0.6245 }, { wl: 570, x: 0.4441, y: 0.5547 },
  { wl: 580, x: 0.5125, y: 0.4866 }, { wl: 590, x: 0.5752, y: 0.4242 },
  { wl: 600, x: 0.6270, y: 0.3725 }, { wl: 610, x: 0.6658, y: 0.3340 },
  { wl: 620, x: 0.6915, y: 0.3083 }, { wl: 630, x: 0.7079, y: 0.2920 },
  { wl: 650, x: 0.7260, y: 0.2740 }, { wl: 670, x: 0.7320, y: 0.2680 },
  { wl: 700, x: 0.7347, y: 0.2653 },
];

export const WHITE_POINT_D65 = { x: 0.3127, y: 0.3290 };

// Builds an SVG path string (in normalized 0-1 space, y already flipped
// for screen coords) tracing the horseshoe + the "line of purples" that
// closes it between 380nm and 700nm.
export function buildLocusPath(toScreen) {
  const pts = SPECTRAL_LOCUS.map((p) => toScreen(p.x, p.y));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return `${path} Z`;
}
