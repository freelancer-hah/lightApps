import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAS_KEY = 'kelvinmeter:measurements:v1';
const FLASH_KEY = 'kelvinmeter:flashCct:v1';
const FACING_KEY = 'kelvinmeter:facing:v1';
const CAL_FRONT_KEY = 'kelvinmeter:calibOffsetFrontK:v1';
const CAL_BACK_KEY = 'kelvinmeter:calibOffsetBackK:v1';

const MeasurementsContext = createContext(null);

export function MeasurementsProvider({ children }) {
  const [measurements, setMeasurements] = useState([]);
  const [flashCct, setFlashCctState] = useState(5600);

  const [facing, setFacingState] = useState('front');
  const [frontCalibOffsetK, setFrontCalibOffsetK] = useState(0);
  const [backCalibOffsetK, setBackCalibOffsetK] = useState(0);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(MEAS_KEY);
      if (raw) setMeasurements(JSON.parse(raw));
      const flash = await AsyncStorage.getItem(FLASH_KEY);
      if (flash) setFlashCctState(parseFloat(flash));

      const savedFacing = await AsyncStorage.getItem(FACING_KEY);
      if (savedFacing === 'front' || savedFacing === 'back') setFacingState(savedFacing);

      const savedFront = await AsyncStorage.getItem(CAL_FRONT_KEY);
      if (savedFront) {
        const v = parseFloat(savedFront);
        if (!isNaN(v)) setFrontCalibOffsetK(v);
      }

      const savedBack = await AsyncStorage.getItem(CAL_BACK_KEY);
      if (savedBack) {
        const v = parseFloat(savedBack);
        if (!isNaN(v)) setBackCalibOffsetK(v);
      }
    })();
  }, []);

  const setFacing = useCallback((f) => {
    setFacingState(f);
    AsyncStorage.setItem(FACING_KEY, f).catch(() => {});
  }, []);

  const saveCalibrationOffset = useCallback((targetFacing, offset) => {
    const roundOffset = Math.round(offset);
    if (targetFacing === 'front') {
      setFrontCalibOffsetK(roundOffset);
      AsyncStorage.setItem(CAL_FRONT_KEY, String(roundOffset)).catch(() => {});
    } else {
      setBackCalibOffsetK(roundOffset);
      AsyncStorage.setItem(CAL_BACK_KEY, String(roundOffset)).catch(() => {});
    }
  }, []);

  const resetCalibrationOffset = useCallback((targetFacing) => {
    if (targetFacing === 'front') {
      setFrontCalibOffsetK(0);
      AsyncStorage.setItem(CAL_FRONT_KEY, '0').catch(() => {});
    } else {
      setBackCalibOffsetK(0);
      AsyncStorage.setItem(CAL_BACK_KEY, '0').catch(() => {});
    }
  }, []);

  const calibrationOffsetK = facing === 'front' ? frontCalibOffsetK : backCalibOffsetK;

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
    saveCalibrationOffset(facing, offset);
  }, [facing, saveCalibrationOffset]);

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
        facing,
        setFacing,
        frontCalibOffsetK,
        backCalibOffsetK,
        calibrationOffsetK,
        saveCalibrationOffset,
        resetCalibrationOffset,
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
