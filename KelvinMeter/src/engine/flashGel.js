import { cctToMired } from './colorScience';

const GELS = [
  { key: 'fullCto', label: 'Full CTO', miredShift: +159, description: '5600K -> ~3200K (matches incandescent)' },
  { key: 'halfCto', label: '1/2 CTO', miredShift: +81, description: '5600K -> ~3800K' },
  { key: 'quarterCto', label: '1/4 CTO', miredShift: +42, description: '5600K -> ~4500K' },
  { key: 'eighthCto', label: '1/8 CTO', miredShift: +20, description: '5600K -> ~5000K' },
  { key: 'fullCtb', label: 'Full CTB', miredShift: -137, description: '3200K -> ~5600K (matches daylight)' },
  { key: 'halfCtb', label: '1/2 CTB', miredShift: -68, description: '3200K -> ~4100K' },
  { key: 'quarterCtb', label: '1/4 CTB', miredShift: -35, description: '3200K -> ~3600K' },
];

export function recommendFlashGel(ambientCct, flashCct = 5600) {
  if (!ambientCct || !flashCct) {
    return { label: '—', gelKey: null, description: 'Point camera at a lit surface' };
  }

  const ambMired = cctToMired(ambientCct);
  const flashMired = cctToMired(flashCct);
  const neededShift = ambMired - flashMired;

  if (Math.abs(neededShift) < 10) {
    return { label: 'No Gel Needed', gelKey: 'none', description: 'Flash matches ambient light color temperature' };
  }

  let best = GELS[0];
  let bestErr = Infinity;
  for (const g of GELS) {
    const err = Math.abs(g.miredShift - neededShift);
    if (err < bestErr) {
      bestErr = err;
      best = g;
    }
  }

  return {
    label: best.label,
    gelKey: best.key,
    miredShift: best.miredShift,
    neededShift: Math.round(neededShift),
    description: best.description,
  };
}
