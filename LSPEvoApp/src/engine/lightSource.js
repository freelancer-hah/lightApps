// Classifies a CCT reading into a human label + icon, matching the
// "Overcast Sky" style label shown in the real app's Temperature & Tint
// panel. Boundaries are the standard rough CCT ranges for each source.
const BUCKETS = [
  { max: 2000, label: 'Candlelight', icon: 'flame-outline' },
  { max: 3000, label: 'Warm White / Tungsten', icon: 'bulb-outline' },
  { max: 4200, label: 'Fluorescent', icon: 'flash-outline' },
  { max: 5000, label: 'Daylight', icon: 'sunny-outline' },
  { max: 6500, label: 'Cloudy', icon: 'partly-sunny-outline' },
  { max: 8500, label: 'Overcast Sky', icon: 'cloud-outline' },
  { max: Infinity, label: 'Blue Sky / Shade', icon: 'cloud-outline' },
];

export function classifyLightSource(cct) {
  if (cct == null) return { label: '—', icon: 'help-outline' };
  const bucket = BUCKETS.find((b) => cct < b.max);
  return bucket || BUCKETS[BUCKETS.length - 1];
}
