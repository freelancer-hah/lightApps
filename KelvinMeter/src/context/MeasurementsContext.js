import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAS_KEY = 'kelvinmeter:measurements:v1';
const CAL_KEY = 'kelvinmeter:calibrationOffsetK:v1';
const FLASH_KEY = 'kelvinmeter:flashCct:v1';

const MeasurementsContext = createContext(null);

export function MeasurementsProvider({ children }) {
  const [measurements, setMeasurements] = useState([]);
  const [calibrationOffsetK, setCalibrationOffsetKState] = useState(0);
  const [flashCct, setFlashCctState] = useState(5600);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(MEAS_KEY);
      if (raw) setMeasurements(JSON.parse(raw));
      const cal = await AsyncStorage.getItem(CAL_KEY);
      if (cal) setCalibrationOffsetKState(parseFloat(cal));
      const flash = await AsyncStorage.getItem(FLASH_KEY);
      if (flash) setFlashCctState(parseFloat(flash));
    })();
  }, []);

  const saveMeasurement = useCallback(async (m) => {
    const withId = { ...m, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, savedAt: Date.now() };
    setMeasurements((prev) => {
      const next = [withId, ...prev];
      AsyncStorage.setItem(MEAS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteMeasurement = useCallback(async (id) => {
    setMeasurements((prev) => {
      const next = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem(MEAS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setCalibrationOffsetK = useCallback((offset) => {
    setCalibrationOffsetKState(offset);
    AsyncStorage.setItem(CAL_KEY, String(offset)).catch(() => {});
  }, []);

  const setFlashCct = useCallback((cct) => {
    setFlashCctState(cct);
    AsyncStorage.setItem(FLASH_KEY, String(cct)).catch(() => {});
  }, []);

  return (
    <MeasurementsContext.Provider
      value={{
        measurements,
        saveMeasurement,
        deleteMeasurement,
        calibrationOffsetK,
        setCalibrationOffsetK,
        flashCct,
        setFlashCct,
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
