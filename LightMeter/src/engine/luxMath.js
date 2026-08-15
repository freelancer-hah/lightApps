export const DEFAULT_CALIBRATION = 0.757;

export function computeEV100(aperture, shutterSpeed, iso) {
  if (!aperture || !shutterSpeed || !iso) return null;
  const ev = Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
  return ev;
}

export function evToLux(ev100, calibrationFactor = DEFAULT_CALIBRATION) {
  if (ev100 === null || ev100 === undefined) return null;
  return calibrationFactor * Math.pow(2, ev100);
}

export function luxToFootCandles(lux) {
  return lux / 10.764;
}

export const DEFAULT_LUMINOUS_EFFICACY = 120;

export function luxToWattsPerM2(lux, luminousEfficacy = DEFAULT_LUMINOUS_EFFICACY) {
  if (lux === null || lux === undefined) return null;
  return lux / luminousEfficacy;
}

export const PPFD_CONVERSION_FACTORS = {
  sunlight: 0.0185,
  ledWhite: 0.0160,
  ledFullSpectrum: 0.0180,
  hps: 0.0122,
  mh: 0.0140,
  fluorescent: 0.0140,
  cfl: 0.0130,
};

export function luxToPpfd(lux, sourceKey = 'ledWhite') {
  if (lux === null || lux === undefined) return null;
  const factor = PPFD_CONVERSION_FACTORS[sourceKey] ?? PPFD_CONVERSION_FACTORS.ledWhite;
  return lux * factor;
}

export function ppfdToDli(ppfd, photoperiodHours) {
  if (ppfd === null || ppfd === undefined) return null;
  return (ppfd * photoperiodHours * 3600) / 1_000_000;
}
