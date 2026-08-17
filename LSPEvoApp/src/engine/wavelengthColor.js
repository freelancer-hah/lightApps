// Standard "visible wavelength to approximate RGB" conversion (based on
// the widely used Dan Bruton algorithm), for coloring the spectrum graph
// and wavelength overlay - this is a rendering approximation, not a
// measurement, same as how the real app colors its spectrum band.
export function wavelengthToRgb(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380); g = 0; b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0; g = (wl - 440) / (490 - 440); b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0; g = 1; b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510); g = 1; b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1; g = -(wl - 645) / (645 - 580); b = 0;
  } else if (wl >= 645 && wl <= 780) {
    r = 1; g = 0; b = 0;
  }

  let factor = 1;
  if (wl >= 380 && wl < 420) factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
  else if (wl >= 700 && wl <= 780) factor = 0.3 + (0.7 * (780 - wl)) / (780 - 700);
  else if (wl < 380 || wl > 780) factor = 0;

  const gamma = 0.8;
  const adjust = (c) => (c === 0 ? 0 : Math.round(255 * Math.pow(c * factor, gamma)));
  return { r: adjust(r), g: adjust(g), b: adjust(b) };
}

export function wavelengthToHex(wl) {
  const { r, g, b } = wavelengthToRgb(wl);
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
