import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findDominantCycleCount } from '../engine/flickerAnalysis';

const KEY = 'flickermeter:measurements:v1';
const CAL_KEY = 'flickermeter:calibrationHz:v1';
const CAL_K_KEY = 'flickermeter:calibrationK:v1';

const MeasurementsContext = createContext(null);

export function MeasurementsProvider({ children }) {
  const [measurements, setMeasurements] = useState([]);
  const [calibrationHz, setCalibrationHzState] = useState(120);
  const [calibrationRate, setCalibrationRateState] = useState(8500);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setMeasurements(JSON.parse(raw));
      const cal = await AsyncStorage.getItem(CAL_KEY);
      if (cal) setCalibrationHzState(parseFloat(cal));
      const calK = await AsyncStorage.getItem(CAL_K_KEY);
      if (calK) setCalibrationRateState(parseFloat(calK));
    })();
  }, []);

  const saveMeasurement = useCallback(async (m) => {
    const withId = { ...m, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, savedAt: Date.now() };
    setMeasurements((prev) => {
      const next = [withId, ...prev];
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteMeasurement = useCallback(async (id) => {
    setMeasurements((prev) => {
      const next = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setCalibrationHz = useCallback((hz) => {
    setCalibrationHzState(hz);
    AsyncStorage.setItem(CAL_KEY, String(hz)).catch(() => {});
  }, []);

  const calibrateK = useCallback((hz, samples) => {
    if (!samples || samples.length < 20) {
      setCalibrationHz(hz);
      return;
    }
    const kInfo = findDominantCycleCount(samples, 1.0, 15.0, 0.05);
    if (kInfo && kInfo.bestK > 0) {
      const rate = (samples.length * hz) / kInfo.bestK;
      setCalibrationRateState(rate);
      AsyncStorage.setItem(CAL_K_KEY, String(rate)).catch(() => {});
    }
    setCalibrationHz(hz);
  }, [setCalibrationHz]);

  return (
    <MeasurementsContext.Provider
      value={{
        measurements,
        saveMeasurement,
        deleteMeasurement,
        calibrationHz,
        setCalibrationHz,
        calibrationRate,
        calibrateK,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  );
}

export function useMeasurements() {
  const ctx = useContext(MeasurementsContext);
  if (!ctx) throw new Error('useMeasurements must be used within MeasurementsProvider');
  return ctx;
}
