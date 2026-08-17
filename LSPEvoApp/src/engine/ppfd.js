// Base lux->PPFD factor for a "typical" broad-spectrum source (close to
// sunlight's commonly published ~0.0185 umol/J-per-lux conversion), then
// scaled by how much of the *actual* measured spectrum's energy falls in
// the 400-700nm PAR band. This uses real spectral shape data instead of
// picking a fixed light-source-type preset from a dropdown - the more
// accurate diffraction-mode spectrum gives a better parFraction than the
// smooth RGB-estimate reconstruction, which is another concrete way the
// diffuser attachment improves accuracy end-to-end.
const BASE_FACTOR = 0.0185;

export function luxToPpfd(lux, parFraction) {
  if (lux == null || parFraction == null) return null;
  return lux * BASE_FACTOR * parFraction;
}
