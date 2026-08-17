// Builds a per-channel histogram (binned 0-255) from an array of {r,g,b}
// pixels, for the real RGB histogram panel.
export function computeHistogram(pixels, bins = 32) {
  if (!pixels?.length) return null;
  const binSize = 256 / bins;
  const r = new Array(bins).fill(0);
  const g = new Array(bins).fill(0);
  const b = new Array(bins).fill(0);

  for (const p of pixels) {
    r[Math.min(bins - 1, Math.floor(p.r / binSize))]++;
    g[Math.min(bins - 1, Math.floor(p.g / binSize))]++;
    b[Math.min(bins - 1, Math.floor(p.b / binSize))]++;
  }

  const maxCount = Math.max(...r, ...g, ...b, 1);
  return {
    bins,
    r: r.map((c) => c / maxCount),
    g: g.map((c) => c / maxCount),
    b: b.map((c) => c / maxCount),
  };
}
