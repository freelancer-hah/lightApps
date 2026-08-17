import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CALIBRATION } from '../engine/spectrumAnalysis';
import { DEFAULT_CALIBRATION as DEFAULT_LUX_CAL } from '../engine/luxMath';

const MODE_KEY = 'lspevo:mode:v1';
const CAL_KEY = 'lspevo:calibration:v1';
const BAND_KEY = 'lspevo:bandRegion:v1';
const OFFSET_KEY = 'lspevo:offsetK:v1';
const LUX_CAL_KEY = 'lspevo:luxCalibrationFactor:v1';
const MEAS_KEY = 'lspevo:measurements:v1';

const DEFAULT_BAND_REGION = { x: 0.15, y: 0.45, w: 0.7, h: 0.1 };

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [mode, setModeState] = useState('estimate');
  const [calibration, setCalibrationState] = useState(DEFAULT_CALIBRATION);
  const [bandRegion, setBandRegionState] = useState(DEFAULT_BAND_REGION);
  const [calibrationOffsetK, setCalibrationOffsetKState] = useState(0);
  const [luxCalibrationFactor, setLuxCalibrationFactorState] = useState(DEFAULT_LUX_CAL);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    (async () => {
      const m = await AsyncStorage.getItem(MODE_KEY);
      if (m) setModeState(m);
      const c = await AsyncStorage.getItem(CAL_KEY);
      if (c) setCalibrationState(JSON.parse(c));
      const br = await AsyncStorage.getItem(BAND_KEY);
      if (br) setBandRegionState(JSON.parse(br));
      const off = await AsyncStorage.getItem(OFFSET_KEY);
      if (off) setCalibrationOffsetKState(parseFloat(off));
      const luxCal = await AsyncStorage.getItem(LUX_CAL_KEY);
      if (luxCal) setLuxCalibrationFactorState(parseFloat(luxCal));
      const meas = await AsyncStorage.getItem(MEAS_KEY);
      if (meas) setMeasurements(JSON.parse(meas));
    })();
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  }, []);

  const setCalibration = useCallback((c) => {
    setCalibrationState(c);
    AsyncStorage.setItem(CAL_KEY, JSON.stringify(c)).catch(() => {});
  }, []);

  const setBandRegion = useCallback((br) => {
    setBandRegionState(br);
    AsyncStorage.setItem(BAND_KEY, JSON.stringify(br)).catch(() => {});
  }, []);

  const setCalibrationOffsetK = useCallback((v) => {
    setCalibrationOffsetKState(v);
    AsyncStorage.setItem(OFFSET_KEY, String(v)).catch(() => {});
  }, []);

  const setLuxCalibrationFactor = useCallback((v) => {
    setLuxCalibrationFactorState(v);
    AsyncStorage.setItem(LUX_CAL_KEY, String(v)).catch(() => {});
  }, []);

  const saveMeasurement = useCallback((m) => {
    const withId = { ...m, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, savedAt: Date.now() };
    setMeasurements((prev) => {
      const next = [withId, ...prev];
      AsyncStorage.setItem(MEAS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteMeasurement = useCallback((id) => {
    setMeasurements((prev) => {
      const next = prev.filter((x) => x.id !== id);
      AsyncStorage.setItem(MEAS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        mode, setMode,
        calibration, setCalibration,
        bandRegion, setBandRegion,
        calibrationOffsetK, setCalibrationOffsetK,
        luxCalibrationFactor, setLuxCalibrationFactor,
        measurements, saveMeasurement, deleteMeasurement,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
