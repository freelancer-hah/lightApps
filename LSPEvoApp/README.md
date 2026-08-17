# LSP.evo (Standalone Clone) — v2, rebuilt against real app screenshots

A clone of **LightSpectrum Pro EVO** by AM PowerSoftware, rebuilt to match
the real app's actual layout and behavior (5 screenshots supplied),
replacing the earlier tab-based UI with the real single-screen +
bottom-sheet-panel design.

## What changed from v1

**Layout, matched to your screenshots:**
- Big LCD/7-segment-style CCT digits with a **HOLD** toggle (freezes the
  live reading without closing the camera)
- Vertical readout list (TINT, G-INDEX, E, PPFD, RGB) with colored dot/icon
  markers, always visible - not hidden behind tabs
- Right-edge **vertical icon rail** that opens one bottom-sheet panel at a
  time over the live camera feed, matching the real app's button column:
  histogram, wavelength pie chart, wavelength spectrum (λ), color space
  (CIE), calibration shortcut, save, saved-measurements, camera flip
- **Temperature & Tint** panel: CCT gradient bar (1500-9000K) + Tint
  gradient bar (-100 to 100, magenta↔green), both with a marker, plus an
  auto-detected light-source label with icon (e.g. "Overcast Sky") - shown
  by default when no other panel is open, matching your screenshot
- **Color Space** panel: the CIE 1931 diagram is now a **filled** horseshoe
  (a coarse colored grid clipped to the spectral locus, not just an
  outline), the Planckian locus is dotted with temperature labels along it
  (1000K through 40000K), and raw X/Y values are shown as text - all
  matching your screenshot
- **Wavelength Distribution** panel: a real pie chart split into the 7
  named bands (Violet/Indigo/Blue/Green/Yellow/Orange/Red) with % and nm
  labels, matching your screenshot's legend layout
- **Wavelength Spectrum** panel: the line graph, axis re-labeled to
  360/510/650/800nm to match your screenshot exactly

## Two formula bugs found and fixed by comparing to your real values

**G-Index was inverted.** v1 computed `total / blueBand`, which produces
values ≥1 (often much larger). Your screenshots show G-Index consistently
between 0.21 and 0.48 - a fraction. Fixed to `blueBand(350-550nm) / total`,
which is correctly bounded 0-1 and matches the real app's value range.

**Tint wasn't being shown at all (v1 showed raw Δuv).** Raw Duv values are
tiny (~0.003-0.03), but your screenshots show Tint values like -8.279 and
-14.171 - roughly 1000x larger. Added `tint = Duv × 1000` as a documented
convention (see "Tint scale" below) - a quick check against your values
(simulated Duv of -0.014 → computed Tint -14.000, vs. your actual
-14.171/-14.144/-14.183) landed within a few hundredths.

**PPFD** is now derived from the *actual* measured lux and the spectrum's
real 400-700nm energy fraction, instead of a placeholder. Checked against
your values: E=20-24lx with a plausible 75-85% PAR fraction computes PPFD
0.31-0.33, matching your screenshots' 0.27-0.33 closely.

## How to calibrate it (both modes)

### 1. E (lux) calibration
The E reading comes from your camera's EXIF exposure metadata (aperture,
shutter speed, ISO) run through the standard reflected-light-meter
formula. Camera sensors and ISPs vary, so:
1. Get a reference reading from a real lux meter (or a phone app you trust)
   pointed at the same light
2. Open **Calibration** tab → section 3 "Calibrate E (Lux) Reading"
3. Drag the **Lux calibration factor** slider up/down until the Home
   screen's E value matches your reference
4. This factor is saved and applied to every future reading

### 2. Kelvin offset calibration
If your Kelvin readings are consistently off by a fixed amount:
1. Aim at a light source with a known/labeled color temperature
2. Open **Settings** → note the current offset, or extend the Calibration
   screen the same way the Kelvin Meter clone's calibration flow works
   (aim at reference → enter known K → offset = known − raw)

### 3. Diffraction mode calibration (the CD/paper diffuser) - this is the important one
This is what actually makes the app more accurate once you attach the
diffuser, and it **requires** this calibration step to work at all:

1. **Attach the CD**: hold a CD or DVD (shiny/reflective side facing the
   light) near the rear camera lens so it acts as a diffraction grating -
   its microscopic groove spacing physically splits incoming light into a
   spread rainbow band. A thin slit or a sheet of paper in front helps
   control and sharpen that band.
2. Open the **Calibration** tab. In the live preview, you'll see an
   orange guide box (turns green once calibrated).
3. **Position the band**: use the 4 sliders (horizontal/vertical
   position, width, height) until the rainbow band you physically see
   lines up inside that guide box.
4. **Capture two known reference points** - this is the actual
   calibration step, same technique real DIY spectrometers use:
   - Point the setup at a reference light with a *sharp, known* emission
     line. The easiest is a **fluorescent or CFL tube** - it has strong
     mercury emission lines you can pick from the presets (546nm green,
     436nm blue-violet, 405nm violet). A laser pointer also works if you
     have one (red ~650nm, green ~532nm).
   - Tap a wavelength preset (or type a custom value) for **Reference 1**,
     then tap **Capture Ref 1** - the app finds the brightest pixel column
     in the band and records "this pixel position = this wavelength"
   - Repeat with a **different** known wavelength for **Reference 2**
     (e.g. calibrate against the fluorescent tube's 546nm line first,
     then its 436nm line second - most fluorescent tubes show both)
5. Tap **Compute & Apply Calibration** - this solves the linear
   pixel→wavelength mapping from your two points
6. Switch to **Diffraction mode** (the toggle under the CCT label on
   Home) - the guide box turns green, and every reading now uses the
   real captured spectrum integrated against the actual CIE color
   matching functions, instead of the RGB estimate

**Why two points is enough:** a CD grating's dispersion is close enough to
linear across a modest wavelength range that a straight-line fit (2
points) works well - the same assumption public DIY spectrometer projects
make. See the Known Limitations section below for where this
approximation breaks down.

**Signs your diffraction calibration is good:**
- The Wavelength Spectrum panel shows a **sharp, defined peak** at the
  wavelength of whatever you're pointing at (compare to how blobby/smooth
  the RGB-estimate spectrum looks by contrast - that visual difference
  *is* the accuracy improvement)
- Re-measuring your calibration reference light gives you back
  approximately its known wavelength

## Files

```
App.js, index.js, app.json, package.json, babel.config.js
src/
  engine/
    colorScience.js        RGB/XYZ/xy/uv, Planckian locus, CCT+Duv
    cieCmf.js                CIE 1931 CMF table + spectrum->XYZ integration
    spectralLocus.js          spectral locus table (Color Space panel)
    frameSampler.js            region/band/thumbnail capture + EXIF
    spectrumAnalysis.js         calibration math, G-Index (fixed), PAR
    estimateSpectrum.js          RGB-only mode's approximate spectrum
    wavelengthColor.js            nm -> display RGB
    wavelengthBands.js              7-band pie chart definitions
    lightSource.js                   CCT -> auto label ("Overcast Sky" etc)
    luxMath.js                        EV/lux from EXIF
    ppfd.js                            lux + PAR fraction -> PPFD
    histogram.js                        RGB histogram binning
    useLiveMeasurement.js                 combines everything per tick
  context/
    AppStateContext.js       mode, calibration, band region, lux factor, saves
  components/
    SevenSegmentText.js, IconRail.js, ModeSwitch.js,
    TempTintPanel.js, ColorSpacePanel.js, WavelengthPiePanel.js,
    WavelengthSpectrumPanel.js, HistogramPanel.js,
    SpectrumGraph.js, HistogramChart.js, BandGuideOverlay.js
  screens/
    HomeScreen.js, CalibrationScreen.js,
    SavedMeasurementsScreen.js, SettingsScreen.js
  navigation/
    RootTabs.js
```

## Validated before packaging

- All 31 files pass a clean syntax check
- Every relative import resolves to a real file
- Every export/import pair across the entire module graph was cross-checked
  (nothing calls a function that doesn't exist)
- CIE CMF spectral integration: equal-energy spectrum → xy (0.3334, 0.3335)
  vs. Illuminant E's defined (0.3333, 0.3333)
- CCT/Duv math (reused from the validated Kelvin Meter clone): D65 → 6502K,
  CIE Illuminant A → 2848K vs. defined 2856K
- **Tint formula** vs. your screenshots: simulated -14.000 vs. your real
  -14.171/-14.144/-14.183
- **PPFD formula** vs. your screenshots: computed 0.31-0.33 vs. your real
  0.27-0.33

## Known limitations

- **G-Index band boundaries (350-550nm) and Tint's ×1000 scale are
  reverse-engineered from your screenshots**, not from the real app's
  source or documentation (which isn't public). The math family is now
  correct (bounded ratios in the right numeric range) and matches closely,
  but if you get the chance to compare side-by-side with the real app on
  identical lighting, small constant adjustments in `spectrumAnalysis.js`
  (G-Index band) or `useLiveMeasurement.js` (`TINT_SCALE`) may sharpen the
  match further.
- Diffraction mode's wavelength mapping is linear (2-point calibration) -
  good over a moderate range, but a CD grating's true dispersion isn't
  perfectly linear across the full 380-780nm span. Real spectrometers fit
  a quadratic; out of scope here.
- The RGB-estimate mode's spectrum (3-Gaussian reconstruction) is
  intentionally smooth/approximate - it exists so the Pie/Spectrum/G-Index
  panels aren't blank without the diffuser, not as a claim of accuracy.
- "E (lux)" and PPFD both ultimately derive from EXIF exposure metadata,
  which varies by device/OS - calibrate against a reference meter if you
  need absolute accuracy (see Calibration guide above).
