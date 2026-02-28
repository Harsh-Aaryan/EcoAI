import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [system, setSystemState] = useState(
    () => localStorage.getItem('homenode_units') || 'metric'
  );

  const setSystem = useCallback((s) => {
    setSystemState(s);
    localStorage.setItem('homenode_units', s);
  }, []);

  const isImperial = system === 'imperial';

  const convertTemp = useCallback((celsius) => {
    if (celsius == null) return null;
    return isImperial ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius);
  }, [isImperial]);

  const convertSpeed = useCallback((kmh) => {
    if (kmh == null) return null;
    return isImperial ? Math.round(kmh * 0.621371) : Math.round(kmh);
  }, [isImperial]);

  const tempUnit = isImperial ? '°F' : '°C';
  const speedUnit = isImperial ? 'mph' : 'km/h';

  const value = useMemo(() => ({
    system,
    setSystem,
    isImperial,
    convertTemp,
    convertSpeed,
    tempUnit,
    speedUnit,
  }), [system, setSystem, isImperial, convertTemp, convertSpeed, tempUnit, speedUnit]);

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within <UnitsProvider>');
  return ctx;
}
