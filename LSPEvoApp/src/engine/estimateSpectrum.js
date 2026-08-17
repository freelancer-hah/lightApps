// When no diffuser is attached, we still want the Spectrum/Pie/G-Index
// panels to show *something* sensible instead of going blank. This
// reconstructs a smooth plausible spectrum from just R/G/B by modeling it
// as three Gaussian humps centered on each channel's representative
// wavelength, weighted by that channel's measured intensity.
//
// This is explicitly an approximation (a "metamer" - a different physical
// spectrum that happens to look the same RGB to a sensor) - it will
// always come out smoother/blobbier than a real captured spectrum, which
// is actually a useful visual signal: compare the RGB-estimate spectrum
// shape to the sharp-peaked diffraction-mode spectrum in the app and the
// difference in fidelity is obvious at a glance.
const CHANNELS = [
  { wl: 610, sigma: 55 }, // "red" hump
  { wl: 550, sigma: 45 }, // "green" hump
  { wl: 465, sigma: 40 }, // "blue" hump
];

function gaussian(wl, center, sigma, amplitude) {
  const d = wl - center;
  return amplitude * Math.exp(-(d * d) / (2 * sigma * sigma));
}

export function estimateSpectrumFromRgb(r, g, b) {
  const amps = [r, g, b];
  const spectrum = [];
  for (let wl = 380; wl <= 780; wl += 10) {
    let intensity = 0;
    CHANNELS.forEach((c, i) => {
      intensity += gaussian(wl, c.wl, c.sigma, amps[i]);
    });
    spectrum.push({ wl, intensity });
  }
  return spectrum;
}
