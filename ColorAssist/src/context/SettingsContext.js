import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'colorassist:settings:v1';

export const DEFAULT_SETTINGS = {
  spatialAperture: 3,   // px, "Spatial Sample Aperture" slider (3x3 default like screenshot)
  temporalFrames: 10,   // "Temporal Sample Aperture" slider (10 frames / 0.33s default)
  outputs: {
    rgb: true,
    hsl: true,
    ryb: true,
    cmyk: true,
    htmlHex: true,
    htmlName: true,
    colorName: true,
    crayonName: true,
    simpleName: true,
    swatch: true,
    rainbow7: true,
    stampColorName: false, // pro-tier, locked off by default
    proAnalysis: false,    // pro-tier, locked off by default
  },
  quantized: false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            outputs: {
              ...DEFAULT_SETTINGS.outputs,
              ...(parsed.outputs || {}),
            },
          });
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleOutput = useCallback((key) => {
    setSettings((prev) => {
      const next = { ...prev, outputs: { ...prev.outputs, [key]: !prev.outputs[key] } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, update, toggleOutput, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
