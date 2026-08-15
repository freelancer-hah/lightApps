import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processSpectrometerReading } from '../utils/spectrometerMath';

const STORAGE_KEYS = {
  MEASUREMENTS: 'spectrometer:measurements:v1',
  WHITE_REF: 'spectrometer:whiteRef:v1',
  GAIN: 'spectrometer:gain:v1',
  MODE: 'spectrometer:mode:v1',
  SPOT_SIZE: 'spectrometer:spotSize:v1',
  UNITS: 'spectrometer:units:v1',
  WB_PRESET: 'spectrometer:wbPreset:v1',
  DISPLAY_PREFS: 'spectrometer:displayPrefs:v1',
};

const SpectrometerContext = createContext(null);

export function SpectrometerProvider({ children }) {
  const [measurements, setMeasurements] = useState([]);
  const [whiteRef, setWhiteRefState] = useState(null);
  const [calibrationGain, setCalibrationGainState] = useState(1.0);
  const [mode, setModeState] = useState('direct');
  const [spotSize, setSpotSizeState] = useState('medium');
  const [units, setUnitsState] = useState({ light: 'lux', temp: 'K', wavelength: 'nm' });
  const [whiteBalancePreset, setWbPresetState] = useState('auto');
  const [displayPrefs, setDisplayPrefsState] = useState({
    showGamut: true,
    showPlanckian: true,
    showD65: true,
    smoothReadings: true,
  });

  const [currentLiveReading, setCurrentLiveReading] = useState(() =>
    processSpectrometerReading({
      rawR: 180,
      rawG: 200,
      rawB: 150,
      whiteRef: null,
      calibrationGain: 1.0,
      mode: 'direct',
    })
  );

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rawMeas = await AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
        if (rawMeas) setMeasurements(JSON.parse(rawMeas));

        const rawWhite = await AsyncStorage.getItem(STORAGE_KEYS.WHITE_REF);
        if (rawWhite) setWhiteRefState(JSON.parse(rawWhite));

        const rawGain = await AsyncStorage.getItem(STORAGE_KEYS.GAIN);
        if (rawGain) setCalibrationGainState(parseFloat(rawGain));

        const rawMode = await AsyncStorage.getItem(STORAGE_KEYS.MODE);
        if (rawMode) setModeState(rawMode);

        const rawSpot = await AsyncStorage.getItem(STORAGE_KEYS.SPOT_SIZE);
        if (rawSpot) setSpotSizeState(rawSpot);

        const rawUnits = await AsyncStorage.getItem(STORAGE_KEYS.UNITS);
        if (rawUnits) setUnitsState(JSON.parse(rawUnits));

        const rawWb = await AsyncStorage.getItem(STORAGE_KEYS.WB_PRESET);
        if (rawWb) setWbPresetState(rawWb);

        const rawPrefs = await AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_PREFS);
        if (rawPrefs) setDisplayPrefsState(JSON.parse(rawPrefs));
      } catch (err) {
        console.warn('Error loading Spectrometer context storage:', err);
      }
    })();
  }, []);

  const saveMeasurement = useCallback(async (m) => {
    const withId = {
      ...m,
      id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      savedAt: Date.now(),
    };
    setMeasurements((prev) => {
      const next = [withId, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return withId;
  }, []);

  const deleteMeasurement = useCallback(async (id) => {
    setMeasurements((prev) => {
      const next = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearAllMeasurements = useCallback(async () => {
    setMeasurements([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.MEASUREMENTS).catch(() => {});
  }, []);

  const calibrateWhiteReference = useCallback(async (rgb) => {
    setWhiteRefState(rgb);
    if (rgb) {
      await AsyncStorage.setItem(STORAGE_KEYS.WHITE_REF, JSON.stringify(rgb)).catch(() => {});
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.WHITE_REF).catch(() => {});
    }
  }, []);

  const resetWhiteReference = useCallback(async () => {
    setWhiteRefState(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.WHITE_REF).catch(() => {});
  }, []);

  const setCalibrationGain = useCallback(async (gain) => {
    setCalibrationGainState(gain);
    await AsyncStorage.setItem(STORAGE_KEYS.GAIN, String(gain)).catch(() => {});
  }, []);

  const setMode = useCallback(async (newMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(STORAGE_KEYS.MODE, newMode).catch(() => {});
  }, []);

  const setSpotSize = useCallback(async (size) => {
    setSpotSizeState(size);
    await AsyncStorage.setItem(STORAGE_KEYS.SPOT_SIZE, size).catch(() => {});
  }, []);

  const setUnits = useCallback(async (newUnits) => {
    setUnitsState((prev) => {
      const next = { ...prev, ...newUnits };
      AsyncStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setWhiteBalancePreset = useCallback(async (preset) => {
    setWbPresetState(preset);
    await AsyncStorage.setItem(STORAGE_KEYS.WB_PRESET, preset).catch(() => {});
  }, []);

  const setDisplayPrefs = useCallback(async (prefs) => {
    setDisplayPrefsState((prev) => {
      const next = { ...prev, ...prefs };
      AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_PREFS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <SpectrometerContext.Provider
      value={{
        measurements,
        saveMeasurement,
        deleteMeasurement,
        clearAllMeasurements,
        whiteRef,
        calibrateWhiteReference,
        resetWhiteReference,
        calibrationGain,
        setCalibrationGain,
        mode,
        setMode,
        spotSize,
        setSpotSize,
        units,
        setUnits,
        whiteBalancePreset,
        setWhiteBalancePreset,
        displayPrefs,
        setDisplayPrefs,
        currentLiveReading,
        setCurrentLiveReading,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </SpectrometerContext.Provider>
  );
}

export function useSpectrometer() {
  const ctx = useContext(SpectrometerContext);
  if (!ctx) throw new Error('useSpectrometer must be used within SpectrometerProvider');
  return ctx;
}
