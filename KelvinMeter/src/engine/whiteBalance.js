export const WB_PRESETS = [
  { key: 'tungsten', label: 'Tungsten', cct: 3200 },
  { key: 'fluorescent', label: 'Fluorescent', cct: 4000 },
  { key: 'daylight', label: 'Daylight', cct: 5600 },
  { key: 'cloudy', label: 'Cloudy', cct: 6500 },
  { key: 'shade', label: 'Shade', cct: 7500 },
];

export function suggestWhiteBalance(measuredCct) {
  if (!measuredCct) return null;

  let closest = WB_PRESETS[0];
  let minDiff = Infinity;
  for (const p of WB_PRESETS) {
    const diff = Math.abs(p.cct - measuredCct);
    if (diff < minDiff) {
      minDiff = diff;
      closest = p;
    }
  }

  const offset = measuredCct - closest.cct;
  const offsetLabel = offset === 0 ? '' : offset > 0 ? ` +${offset}K` : ` ${offset}K`;

  return {
    preset: closest.key,
    label: `${closest.label} (${closest.cct}K)`,
    closestCct: closest.cct,
    offsetK: offset,
    displayLabel: `${closest.label}${offsetLabel}`,
  };
}
