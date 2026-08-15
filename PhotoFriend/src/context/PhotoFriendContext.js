import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateEV,
  calculateShutterFromEv,
  calculateApertureFromEv,
  calculateDoF,
  findClosest,
  ISO_VALUES,
  SHUTTER_SPEEDS,
  APERTURES,
  FOCAL_LENGTHS,
  SUBJECT_DISTANCES,
  SENSOR_PRESETS,
  getSceneLabelForEv,
} from '../utils/photoFriendMath';

const STORAGE_KEYS = {
  SNAPSHOTS: 'photofriend:snapshots:v1',
  SETTINGS: 'photofriend:settings:v1',
};

const PhotoFriendContext = createContext(null);

export function PhotoFriendProvider({ children }) {
  const [ev, setEvState] = useState(3.0);
  const [iso, setIsoState] = useState(100);
  const [evComp, setEvCompState] = useState(0);
  const [aperture, setApertureState] = useState(22.0);
  const [shutter, setShutterState] = useState(SHUTTER_SPEEDS[12]);
  const [focalLength, setFocalLengthState] = useState(50);
  const [distanceFeet, setDistanceFeetState] = useState(3.3);
  const [sensorPreset, setSensorPresetState] = useState(SENSOR_PRESETS[0]);
  const [meterMode, setMeterModeState] = useState('camera');
  const [lockMode, setLockModeState] = useState('ev');
  const [savedSnapshots, setSavedSnapshots] = useState([]);
  const [currentLux, setCurrentLux] = useState(3.0);

  useEffect(() => {
    (async () => {
      try {
        const rawSnap = await AsyncStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
        if (rawSnap) setSavedSnapshots(JSON.parse(rawSnap));

        const rawSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (rawSettings) {
          const parsed = JSON.parse(rawSettings);
          if (parsed.iso) setIsoState(parsed.iso);
          if (parsed.focalLength) setFocalLengthState(parsed.focalLength);
          if (parsed.sensorPresetId) {
            const found = SENSOR_PRESETS.find((s) => s.id === parsed.sensorPresetId);
            if (found) setSensorPresetState(found);
          }
        }
      } catch (err) {
        console.warn('Error loading PhotoFriend storage:', err);
      }
    })();
  }, []);

  const dofResult = useMemo(() => {
    return calculateDoF({
      aperture,
      focalLengthMm: focalLength,
      distanceFeet,
      cocMm: sensorPreset.cocMm,
    });
  }, [aperture, focalLength, distanceFeet, sensorPreset]);

  const sceneLabel = useMemo(() => {
    return getSceneLabelForEv(ev);
  }, [ev]);

  const setEv = useCallback((newEv, updateCoupled = true) => {
    const roundedEv = Math.round(newEv * 10) / 10;
    setEvState(roundedEv);

    if (updateCoupled) {
      const targetShutterVal = calculateShutterFromEv(roundedEv, aperture, iso);
      const closestShutter = findClosest(SHUTTER_SPEEDS, targetShutterVal, 'val');
      setShutterState(closestShutter);
    }
  }, [aperture, iso]);

  const setIso = useCallback((newIso) => {
    setIsoState(newIso);
    const targetShutterVal = calculateShutterFromEv(ev, aperture, newIso);
    const closestShutter = findClosest(SHUTTER_SPEEDS, targetShutterVal, 'val');
    setShutterState(closestShutter);
  }, [ev, aperture]);

  const setShutter = useCallback((newShutter) => {
    setShutterState(newShutter);
    const newEv = calculateEV(aperture, newShutter.val, iso, evComp);
    setEvState(newEv);
  }, [aperture, iso, evComp]);

  const setAperture = useCallback((newAperture) => {
    setApertureState(newAperture);
    const targetShutterVal = calculateShutterFromEv(ev, newAperture, iso);
    const closestShutter = findClosest(SHUTTER_SPEEDS, targetShutterVal, 'val');
    setShutterState(closestShutter);
  }, [ev, iso]);

  const setEvComp = useCallback((newComp) => {
    setEvCompState(newComp);
    const newEv = calculateEV(aperture, shutter.val, iso, newComp);
    setEvState(newEv);
  }, [aperture, shutter, iso]);

  const setFocalLength = useCallback((fl) => {
    setFocalLengthState(fl);
  }, []);

  const setDistanceFeet = useCallback((dist) => {
    setDistanceFeetState(dist);
  }, []);

  const setSensorPreset = useCallback(async (preset) => {
    setSensorPresetState(preset);
    AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ sensorPresetId: preset.id, iso, focalLength })
    ).catch(() => {});
  }, [iso, focalLength]);

  const saveSnapshot = useCallback(async (snapshot) => {
    const withId = {
      ...snapshot,
      id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      savedAt: Date.now(),
    };
    setSavedSnapshots((prev) => {
      const next = [withId, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return withId;
  }, []);

  const deleteSnapshot = useCallback(async (id) => {
    setSavedSnapshots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearAllSnapshots = useCallback(async () => {
    setSavedSnapshots([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.SNAPSHOTS).catch(() => {});
  }, []);

  return (
    <PhotoFriendContext.Provider
      value={{
        ev,
        setEv,
        iso,
        setIso,
        evComp,
        setEvComp,
        shutter,
        setShutter,
        aperture,
        setAperture,
        focalLength,
        setFocalLength,
        distanceFeet,
        setDistanceFeet,
        sensorPreset,
        setSensorPreset,
        meterMode,
        setMeterMode: setMeterModeState,
        lockMode,
        setLockMode: setLockModeState,
        dofResult,
        sceneLabel,
        savedSnapshots,
        saveSnapshot,
        deleteSnapshot,
        clearAllSnapshots,
        currentLux,
        setCurrentLux,
      }}
    >
      {children}
    </PhotoFriendContext.Provider>
  );
}

export function usePhotoFriend() {
  const ctx = useContext(PhotoFriendContext);
  if (!ctx) throw new Error('usePhotoFriend must be used within PhotoFriendProvider');
  return ctx;
}
