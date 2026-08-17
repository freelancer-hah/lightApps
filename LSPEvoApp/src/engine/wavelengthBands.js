import { wavelengthToHex } from './wavelengthColor';

// Band edges chosen to match the representative wavelengths shown in the
// real app's pie chart (Violet 400, Indigo 425, Blue 470, Green 550,
// Yellow 600, Orange 630, Red 665), split at the midpoints between them.
export const WAVELENGTH_BANDS = [
  { key: 'violet', label: 'VIOLET', repWl: 400, lo: 380, hi: 412 },
  { key: 'indigo', label: 'INDIGO', repWl: 425, lo: 412, hi: 447 },
  { key: 'blue', label: 'BLUE', repWl: 470, lo: 447, hi: 510 },
  { key: 'green', label: 'GREEN', repWl: 550, lo: 510, hi: 575 },
  { key: 'yellow', label: 'YELLOW', repWl: 600, lo: 575, hi: 615 },
  { key: 'orange', label: 'ORANGE', repWl: 630, lo: 615, hi: 647 },
  { key: 'red', label: 'RED', repWl: 665, lo: 647, hi: 780 },
];

// spectrum: array of {wl, intensity} -> returns bands with their % share
export function computeWavelengthDistribution(spectrum) {
  if (!spectrum?.length) return null;
  const total = spectrum.reduce((s, p) => s + p.intensity, 0);
  if (total <= 0) return null;

  return WAVELENGTH_BANDS.map((band) => {
    const sum = spectrum
      .filter((p) => p.wl >= band.lo && p.wl < band.hi)
      .reduce((s, p) => s + p.intensity, 0);
    return {
      ...band,
      percent: (sum / total) * 100,
      color: wavelengthToHex(band.repWl),
    };
  });
}
