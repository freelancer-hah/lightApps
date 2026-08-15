export const EV_PRESETS = [
  { ev: -6, label: 'Starry night sky' },
  { ev: -4, label: 'Night full moon' },
  { ev: -2, label: 'Night city lights' },
  { ev: 0, label: 'Dim artificial light' },
  { ev: 3, label: 'Indoor room lighting' },
  { ev: 7, label: 'Sunset / Deep shade' },
  { ev: 10, label: 'Overcast daylight' },
  { ev: 13, label: 'Daylight / Bright sky' },
  { ev: 15, label: 'Direct sunlight' },
  { ev: 17, label: 'Brightly lit monuments / Snow' },
];

export const ISO_VALUES = [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];

export const EV_COMP_VALUES = [-3, -2, -1, 0, 1, 2, 3];

export const SHUTTER_SPEEDS = [
  { val: 1 / 8000, label: '1/8000' },
  { val: 1 / 4000, label: '1/4000' },
  { val: 1 / 2000, label: '1/2000' },
  { val: 1 / 1000, label: '1/1000' },
  { val: 1 / 500, label: '1/500' },
  { val: 1 / 250, label: '1/250' },
  { val: 1 / 125, label: '1/125' },
  { val: 1 / 60, label: '1/60' },
  { val: 1 / 30, label: '1/30' },
  { val: 1 / 15, label: '1/15' },
  { val: 1 / 8, label: '1/8' },
  { val: 1 / 4, label: '1/4' },
  { val: 1 / 2, label: '1/2' },
  { val: 1, label: '1"' },
  { val: 2, label: '2"' },
  { val: 4, label: '4"' },
  { val: 8, label: '8"' },
  { val: 15, label: '15"' },
  { val: 30, label: '30"' },
  { val: 60, label: '60"' },
  { val: 120, label: '120"' },
  { val: 240, label: '240"' },
  { val: 480, label: '480"' },
];

export const APERTURES = [
  1.0, 1.2, 1.4, 1.8, 2.0, 2.5, 2.8, 3.5, 4.0, 4.5, 5.6, 6.3, 8.0, 9.0, 11, 13, 16, 18, 22, 25, 32, 45, 64
];

export const FOCAL_LENGTHS = [14, 18, 20, 24, 30, 35, 50, 58, 70, 85, 105, 135, 200, 300];

export const SUBJECT_DISTANCES = [
  { feet: 1.6, meters: 0.5 },
  { feet: 2.0, meters: 0.6 },
  { feet: 2.5, meters: 0.75 },
  { feet: 3.0, meters: 0.9 },
  { feet: 3.3, meters: 1.0 },
  { feet: 4.0, meters: 1.2 },
  { feet: 6.0, meters: 1.8 },
  { feet: 10.0, meters: 3.0 },
  { feet: 16.0, meters: 5.0 },
  { feet: 30.0, meters: 9.0 },
  { feet: Infinity, meters: Infinity },
];

export const SENSOR_PRESETS = [
  { id: 'ff', name: '35mm Full Frame (1.0x)', cocMm: 0.029, cropFactor: 1.0 },
  { id: 'apsc_sony', name: 'APS-C (Sony/Nikon 1.5x)', cocMm: 0.019, cropFactor: 1.5 },
  { id: 'apsc_canon', name: 'APS-C (Canon 1.6x)', cocMm: 0.018, cropFactor: 1.6 },
  { id: 'mft', name: 'Micro 4/3 (2.0x)', cocMm: 0.015, cropFactor: 2.0 },
  { id: 'medium_645', name: 'Medium Format (6x4.5)', cocMm: 0.045, cropFactor: 0.7 },
  { id: 'large_45', name: 'Large Format (4x5")', cocMm: 0.11, cropFactor: 0.3 },
];

export function calculateEV(aperture, shutterSpeed, iso = 100, evComp = 0) {
  if (!aperture || !shutterSpeed || !iso) return 0;
  const ev100 = Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
  return Math.round((ev100 + evComp) * 10) / 10;
}

export function calculateShutterFromEv(ev, aperture, iso = 100) {
  const ev100 = ev - Math.log2(iso / 100);
  const shutter = (aperture * aperture) / Math.pow(2, ev100);
  return shutter;
}

export function calculateApertureFromEv(ev, shutterSpeed, iso = 100) {
  const ev100 = ev - Math.log2(iso / 100);
  const apertureSq = shutterSpeed * Math.pow(2, ev100);
  return Math.sqrt(Math.max(0.1, apertureSq));
}

export function luxToEv(lux, iso = 100, calibrationConstant = 2.5) {
  if (lux <= 0) return -10;
  const ev100 = Math.log2((lux * (iso / 100)) / calibrationConstant);
  return Math.round(ev100 * 10) / 10;
}

export function getSceneLabelForEv(ev) {
  let closest = EV_PRESETS[0];
  let minDiff = Math.abs(ev - closest.ev);

  for (const item of EV_PRESETS) {
    const diff = Math.abs(ev - item.ev);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest.label;
}

export function findClosest(arr, target, key = null) {
  let best = arr[0];
  let bestVal = key ? arr[0][key] : arr[0];
  let minDiff = Math.abs(bestVal - target);

  for (let i = 1; i < arr.length; i++) {
    const itemVal = key ? arr[i][key] : arr[i];
    const diff = Math.abs(itemVal - target);
    if (diff < minDiff) {
      minDiff = diff;
      best = arr[i];
    }
  }
  return best;
}

export function calculateDoF({ aperture, focalLengthMm, distanceFeet, cocMm = 0.029 }) {
  if (!aperture || !focalLengthMm || !distanceFeet) {
    return {
      nearLimitFeet: 0,
      farLimitFeet: 0,
      totalDofFeet: 0,
      frontDofFeet: 0,
      backDofFeet: 0,
      hyperfocalFeet: 0,
    };
  }

  const fMeters = focalLengthMm / 1000;
  const dMeters = distanceFeet * 0.3048;
  const cocMeters = cocMm / 1000;

  const hMeters = (fMeters * fMeters) / (aperture * cocMeters) + fMeters;
  const nearMeters = (hMeters * dMeters) / (hMeters + (dMeters - fMeters));

  let farMeters = Infinity;
  if (dMeters < hMeters - (dMeters - fMeters)) {
    farMeters = (hMeters * dMeters) / (hMeters - (dMeters - fMeters));
  }

  const nearFeet = Math.round((nearMeters / 0.3048) * 10) / 10;
  const farFeet = farMeters === Infinity ? Infinity : Math.round((farMeters / 0.3048) * 10) / 10;
  const hyperfocalFeet = Math.round((hMeters / 0.3048) * 10) / 10;

  const frontFeet = Math.round((distanceFeet - nearFeet) * 10) / 10;
  const backFeet = farFeet === Infinity ? Infinity : Math.round((farFeet - distanceFeet) * 10) / 10;
  const totalFeet = farFeet === Infinity ? Infinity : Math.round((farFeet - nearFeet) * 10) / 10;

  return {
    nearLimitFeet: nearFeet,
    farLimitFeet: farFeet,
    totalDofFeet: totalFeet,
    frontDofFeet: frontFeet,
    backDofFeet: backFeet,
    hyperfocalFeet,
  };
}

export function exportPhotoFriendCsv(measurements) {
  const headers = [
    'Timestamp',
    'Date Time',
    'EV',
    'ISO',
    'Shutter Speed',
    'Aperture',
    'EV Comp',
    'Focal Length (mm)',
    'Subject Distance (ft)',
    'DoF Near (ft)',
    'DoF Far (ft)',
    'DoF Total (ft)',
    'Lux',
    'Notes',
  ].join(',');

  const rows = measurements.map((m) => {
    const dateStr = new Date(m.timestamp).toLocaleString().replace(/,/g, '');
    return [
      m.timestamp,
      `"${dateStr}"`,
      m.ev ?? 0,
      m.iso ?? 100,
      `"${m.shutterLabel || '1/60'}"`,
      `f/${m.aperture ?? 2.8}`,
      m.evComp ?? 0,
      m.focalLength ?? 50,
      m.distanceFeet ?? 3.3,
      m.dof?.nearLimitFeet ?? 0,
      m.dof?.farLimitFeet === Infinity ? 'Infinity' : m.dof?.farLimitFeet ?? 0,
      m.dof?.totalDofFeet === Infinity ? 'Infinity' : m.dof?.totalDofFeet ?? 0,
      m.lux ?? 0,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

export function exportPhotoFriendText(m) {
  const dateStr = new Date(m.timestamp).toLocaleString();
  return `=== PHOTO FRIEND EXPOSURE REPORT ===
Date & Time: ${dateStr}

--- EXPOSURE TRIANGLE ---
EV: ${m.ev} (${m.sceneLabel || ''})
ISO: ${m.iso}
Shutter Speed: ${m.shutterLabel}
Aperture: f/${m.aperture}
EV Compensation: ${m.evComp > 0 ? `+${m.evComp}` : m.evComp}

--- LENS & DEPTH OF FIELD ---
Focal Length: ${m.focalLength} mm
Subject Distance: ${m.distanceFeet} ft
Near Limit: ${m.dof?.nearLimitFeet} ft
Far Limit: ${m.dof?.farLimitFeet === Infinity ? 'Infinity' : `${m.dof?.farLimitFeet} ft`}
Depth of Field: -${m.dof?.frontDofFeet} +${m.dof?.backDofFeet} ft (${m.dof?.totalDofFeet === Infinity ? 'Infinite' : `${m.dof?.totalDofFeet} ft`})
Hyperfocal Distance: ${m.dof?.hyperfocalFeet} ft

${m.lux ? `Illuminance: ${m.lux} Lux\n` : ''}${m.notes ? `Notes:\n${m.notes}\n` : ''}====================================`;
}
