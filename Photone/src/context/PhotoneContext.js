import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_FRONT_CALIB,
  DEFAULT_BACK_CALIB,
  DEFAULT_DIFFUSER_FACTOR,
  PLANT_TARGET_PRESETS,
  LIGHT_SOURCES,
} from '../engine/luxMath';

const STORAGE_KEYS = {
  FRONT_CALIB: '@photone_calib_front_v1',
  BACK_CALIB: '@photone_calib_back_v1',
  FRONT_CCT_OFFSET: '@photone_cct_offset_front_v1',
  BACK_CCT_OFFSET: '@photone_cct_offset_back_v1',
  DIFFUSER_MULTIPLIER: '@photone_diffuser_multiplier_v1',
  DIFFUSER_ON: '@photone_diffuser_on_v1',
  LIGHT_SOURCE: '@photone_light_source_v1',
  PLANT_TARGET: '@photone_plant_target_v1',
  PHOTOPERIOD: '@photone_photoperiod_v1',
  HISTORY: '@photone_saved_history_v1',
  UNIT_LUX: '@photone_unit_lux_v1',
};

const PhotoneContext = createContext(null);

export function PhotoneProvider({ children }) {
  const [facing, setFacing] = useState('back');
  const [frontCalib, setFrontCalib] = useState(DEFAULT_FRONT_CALIB);
  const [backCalib, setBackCalib] = useState(DEFAULT_BACK_CALIB);

  const [frontCctOffset, setFrontCctOffset] = useState(0);
  const [backCctOffset, setBackCctOffset] = useState(0);

  const [diffuserOn, setDiffuserOn] = useState(false);
  const [diffuserMultiplier, setDiffuserMultiplier] = useState(DEFAULT_DIFFUSER_FACTOR);

  const [lightSourceId, setLightSourceId] = useState('led_full_spec');
  const [plantTargetId, setPlantTargetId] = useState('veg');
  const [photoperiodHours, setPhotoperiodHours] = useState(18);
  const [unitIsLux, setUnitIsLux] = useState(true);

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      try {
        const [
          savedFront,
          savedBack,
          savedFrontCct,
          savedBackCct,
          savedDiffMult,
          savedDiffOn,
          savedSource,
          savedTarget,
          savedHours,
          savedHist,
          savedUnit,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FRONT_CALIB),
          AsyncStorage.getItem(STORAGE_KEYS.BACK_CALIB),
          AsyncStorage.getItem(STORAGE_KEYS.FRONT_CCT_OFFSET),
          AsyncStorage.getItem(STORAGE_KEYS.BACK_CCT_OFFSET),
          AsyncStorage.getItem(STORAGE_KEYS.DIFFUSER_MULTIPLIER),
          AsyncStorage.getItem(STORAGE_KEYS.DIFFUSER_ON),
          AsyncStorage.getItem(STORAGE_KEYS.LIGHT_SOURCE),
          AsyncStorage.getItem(STORAGE_KEYS.PLANT_TARGET),
          AsyncStorage.getItem(STORAGE_KEYS.PHOTOPERIOD),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.UNIT_LUX),
        ]);

        if (savedFront) setFrontCalib(parseFloat(savedFront) || DEFAULT_FRONT_CALIB);
        if (savedBack) setBackCalib(parseFloat(savedBack) || DEFAULT_BACK_CALIB);
        if (savedFrontCct) setFrontCctOffset(parseFloat(savedFrontCct) || 0);
        if (savedBackCct) setBackCctOffset(parseFloat(savedBackCct) || 0);
        if (savedDiffMult) setDiffuserMultiplier(parseFloat(savedDiffMult) || DEFAULT_DIFFUSER_FACTOR);
        if (savedDiffOn !== null) setDiffuserOn(savedDiffOn === 'true');
        if (savedSource) setLightSourceId(savedSource);
        if (savedTarget) setPlantTargetId(savedTarget);
        if (savedHours) setPhotoperiodHours(parseInt(savedHours, 10) || 18);
        if (savedUnit !== null) setUnitIsLux(savedUnit === 'true');
        if (savedHist) {
          const parsed = JSON.parse(savedHist);
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch (err) {
        // Suppress storage load error
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredData();
  }, []);

  const activeCalibrationFactor = facing === 'front' ? frontCalib : backCalib;
  const activeCctOffset = facing === 'front' ? frontCctOffset : backCctOffset;
  const activePlantTarget = PLANT_TARGET_PRESETS.find((p) => p.id === plantTargetId) || PLANT_TARGET_PRESETS[1];
  const activeLightSource = LIGHT_SOURCES.find((s) => s.id === lightSourceId) || LIGHT_SOURCES[0];

  const updateCalibration = async (cameraFacing, newCalibFactor) => {
    const val = Math.max(0.1, Math.min(10.0, newCalibFactor));
    if (cameraFacing === 'front') {
      setFrontCalib(val);
      await AsyncStorage.setItem(STORAGE_KEYS.FRONT_CALIB, val.toString()).catch(() => {});
    } else {
      setBackCalib(val);
      await AsyncStorage.setItem(STORAGE_KEYS.BACK_CALIB, val.toString()).catch(() => {});
    }
  };

  const updateCctOffset = async (cameraFacing, newOffset) => {
    if (cameraFacing === 'front') {
      setFrontCctOffset(newOffset);
      await AsyncStorage.setItem(STORAGE_KEYS.FRONT_CCT_OFFSET, newOffset.toString()).catch(() => {});
    } else {
      setBackCctOffset(newOffset);
      await AsyncStorage.setItem(STORAGE_KEYS.BACK_CCT_OFFSET, newOffset.toString()).catch(() => {});
    }
  };

  const toggleDiffuser = async () => {
    const nextState = !diffuserOn;
    setDiffuserOn(nextState);
    await AsyncStorage.setItem(STORAGE_KEYS.DIFFUSER_ON, nextState.toString()).catch(() => {});
  };

  const updateDiffuserMultiplier = async (val) => {
    const num = Math.max(1.0, Math.min(5.0, val));
    setDiffuserMultiplier(num);
    await AsyncStorage.setItem(STORAGE_KEYS.DIFFUSER_MULTIPLIER, num.toString()).catch(() => {});
  };

  const updateLightSource = async (id) => {
    setLightSourceId(id);
    await AsyncStorage.setItem(STORAGE_KEYS.LIGHT_SOURCE, id).catch(() => {});
  };

  const updatePlantTarget = async (id) => {
    setPlantTargetId(id);
    const found = PLANT_TARGET_PRESETS.find((p) => p.id === id);
    if (found) {
      setPhotoperiodHours(found.defaultPhotoperiod);
      await AsyncStorage.setItem(STORAGE_KEYS.PHOTOPERIOD, found.defaultPhotoperiod.toString()).catch(() => {});
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PLANT_TARGET, id).catch(() => {});
  };

  const updatePhotoperiod = async (hours) => {
    const h = Math.max(1, Math.min(24, hours));
    setPhotoperiodHours(h);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOPERIOD, h.toString()).catch(() => {});
  };

  const toggleUnit = async () => {
    const next = !unitIsLux;
    setUnitIsLux(next);
    await AsyncStorage.setItem(STORAGE_KEYS.UNIT_LUX, next.toString()).catch(() => {});
  };

  const resetCalibration = async (cameraFacing) => {
    if (cameraFacing === 'front') {
      setFrontCalib(DEFAULT_FRONT_CALIB);
      setFrontCctOffset(0);
      await AsyncStorage.setItem(STORAGE_KEYS.FRONT_CALIB, DEFAULT_FRONT_CALIB.toString()).catch(() => {});
      await AsyncStorage.setItem(STORAGE_KEYS.FRONT_CCT_OFFSET, '0').catch(() => {});
    } else {
      setBackCalib(DEFAULT_BACK_CALIB);
      setBackCctOffset(0);
      await AsyncStorage.setItem(STORAGE_KEYS.BACK_CALIB, DEFAULT_BACK_CALIB.toString()).catch(() => {});
      await AsyncStorage.setItem(STORAGE_KEYS.BACK_CCT_OFFSET, '0').catch(() => {});
    }
    setDiffuserMultiplier(DEFAULT_DIFFUSER_FACTOR);
    await AsyncStorage.setItem(STORAGE_KEYS.DIFFUSER_MULTIPLIER, DEFAULT_DIFFUSER_FACTOR.toString()).catch(() => {});
  };

  const saveMeasurementRecord = async (record) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ppfd: record.ppfd ? Math.round(record.ppfd) : 0,
      dli: record.dli ? parseFloat(record.dli.toFixed(2)) : 0,
      lux: record.lux ? Math.round(record.lux) : 0,
      fc: record.fc ? Math.round(record.fc) : 0,
      cct: record.cct ? Math.round(record.cct) : 0,
      lightSourceId,
      lightSourceName: activeLightSource.name,
      plantTargetId,
      plantTargetName: activePlantTarget.name,
      photoperiodHours,
      diffuserOn,
      notes: record.notes || '',
    };

    const updated = [newEntry, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated)).catch(() => {});
    return newEntry;
  };

  const deleteHistoryRecord = async (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated)).catch(() => {});
  };

  const clearAllHistory = async () => {
    setHistory([]);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([])).catch(() => {});
  };

  return (
    <PhotoneContext.Provider
      value={{
        facing,
        setFacing,
        frontCalib,
        backCalib,
        frontCctOffset,
        backCctOffset,
        activeCalibrationFactor,
        activeCctOffset,
        diffuserOn,
        diffuserMultiplier,
        toggleDiffuser,
        updateDiffuserMultiplier,
        lightSourceId,
        activeLightSource,
        updateLightSource,
        plantTargetId,
        activePlantTarget,
        updatePlantTarget,
        photoperiodHours,
        updatePhotoperiod,
        unitIsLux,
        toggleUnit,
        updateCalibration,
        updateCctOffset,
        resetCalibration,
        history,
        saveMeasurementRecord,
        deleteHistoryRecord,
        clearAllHistory,
        isLoading,
      }}
    >
      {children}
    </PhotoneContext.Provider>
  );
}

export function usePhotoneContext() {
  const ctx = useContext(PhotoneContext);
  if (!ctx) throw new Error('usePhotoneContext must be used within PhotoneProvider');
  return ctx;
}
