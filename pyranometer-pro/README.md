# Pyranometer Pro (React Native / Expo Go SDK 54)

A cross-platform solar irradiance meter built with **React Native** and **Expo Go SDK 54**. It runs directly inside the standard Expo Go app on both **iPhone (iOS)** and **Android** devices with zero native build or compilation steps required.

## Key Features

- **Expo Go SDK 54 Ready**: 100% pure React Native JS/TS code. No custom Swift or Kotlin native binaries required.
- **Cross-Platform Sensor Support**:
  - **Auto Light Sensor**: Reads live ambient light levels (Lux) on devices with hardware illuminance sensors (`expo-sensors`).
  - **Camera & Solar Presets**: Multi-mode sampling for field testing under Clear Sun, Hazy Sky, Overcast, and Shade.
  - **Manual EV Adjustment**: Precision Nudge controls for instant field calibration and verification.
- **Log-Linear Calibration Engine**: Fits $EV_{100} \to W/m^2$ against your paired readings from a real thermopile reference pyranometer using ordinary least squares.
- **History & CSV Export**: Store readings locally with timestamps and export directly via `expo-sharing`.

## Running on iPhone and Android (Expo Go)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open the app:
   - **iPhone**: Scan the terminal QR code using the iOS Camera app or Expo Go app.
   - **Android**: Scan the QR code inside the Expo Go app.

## Calibration Protocol

1. Open the **Calibrate** tab next to your reference pyranometer, both pointed at the same patch of sky/surface.
2. At the same moment your reference instrument reads $N \text{ W/m}^2$, enter $N$ and tap **Add Point**.
3. Repeat across a spread of conditions: shade, overcast, hazy sun, and clear sky sun (5–10 points recommended).
4. Monitor **$R^2$** in the Calibrate tab ($R^2 \ge 0.90$ indicates a clean fit).
5. The gauge flags readings taken outside your calibrated $EV_{100}$ range as extrapolated.

## Project Structure

```
App.tsx                         Navigation root & bottom tabs
src/
  types.ts                      TypeScript interfaces
  context/MeterContext.tsx      State management for sensors & calibration engine
  utils/calibration.ts          Log-linear regression model
  utils/storage.ts              AsyncStorage & CSV export utility
  components/Gauge.tsx          SVG radial solar gauge
  screens/
    LiveMeterScreen.tsx         Live gauge readout & mode toggles
    CalibrationScreen.tsx       Reference pyranometer calibration
    HistoryScreen.tsx           Logged readings & CSV exporter
modules/camera-exposure/        Pure React Native Expo SDK 54 light engine
  index.ts                      Cross-platform sensor & exposure module
```
