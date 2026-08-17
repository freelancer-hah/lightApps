// Same reflected-light-meter formula validated in the ToolBox/Light Meter
// clone: EV100 = log2(aperture^2 / shutter) - log2(ISO/100),
// Lux = calibrationFactor * 2^EV100.
export const DEFAULT_CALIBRATION = 2.5;

export function computeEV100(aperture, shutterSpeed, iso) {
  if (!aperture || !shutterSpeed || !iso) return null;
  return Math.log2((aperture * aperture) / shutterSpeed) - Math.log2(iso / 100);
}

export function evToLux(ev100, calibrationFactor = DEFAULT_CALIBRATION) {
  if (ev100 == null) return null;
  return calibrationFactor * Math.pow(2, ev100);
}
