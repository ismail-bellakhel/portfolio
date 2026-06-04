import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

// ── Sunrise/sunset — NOAA algorithm, accurate to ~1 min ──────────────────────
const RAD = Math.PI / 180;

function calcSunTimes(lat, lon, date = new Date()) {
  const J = date.getTime() / 86400000 + 2440587.5;
  const n = Math.round(J - 2451545.009 - lon / 360);
  const Jnoon = 2451545.009 + lon / 360 + n;
  const M = (357.5291 + 0.98560028 * (Jnoon - 2451545)) % 360;
  const C =
    1.9148 * Math.sin(M * RAD) +
    0.02   * Math.sin(2 * M * RAD) +
    0.0003 * Math.sin(3 * M * RAD);
  const lam = (M + C + 180 + 102.9372) % 360;
  const Jt  = Jnoon + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lam * RAD);
  const sindec = Math.sin(lam * RAD) * Math.sin(23.4397 * RAD);
  const cosH   =
    (Math.sin(-0.8333 * RAD) - Math.sin(lat * RAD) * sindec) /
    (Math.cos(lat * RAD) * Math.cos(Math.asin(sindec)));
  if (Math.abs(cosH) > 1) return null; // polar day or night
  const H = Math.acos(cosH) / RAD / 360;
  return {
    sunrise: new Date((Jt - H - 2440587.5) * 86400000),
    sunset:  new Date((Jt + H - 2440587.5) * 86400000),
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }) => {
  // mode: 'auto' | 'light' | 'dark'
  const [mode, setModeState] = useState(
    () => localStorage.getItem('theme-mode') || 'auto'
  );
  const [isDark, setIsDark] = useState(false);
  const timerRef = useRef(null);
  const posRef   = useRef(null); // cached geolocation

  const applyDark = useCallback((dark) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Schedule auto dark/light based on sunset/sunrise and set a timer for the next switch
  const scheduleAuto = useCallback((lat, lon) => {
    posRef.current = { lat, lon };
    if (timerRef.current) clearTimeout(timerRef.current);

    const now   = new Date();
    const today = calcSunTimes(lat, lon, now);

    if (!today) {
      // Polar day/night — fall back to system preference
      applyDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      return;
    }

    const isNowDark = now < today.sunrise || now > today.sunset;
    applyDark(isNowDark);

    // Find next transition time
    let next;
    if (now < today.sunrise) {
      next = today.sunrise;                          // currently dark (pre-dawn)
    } else if (now < today.sunset) {
      next = today.sunset;                           // currently light
    } else {
      // After sunset — schedule tomorrow's sunrise
      const tom = calcSunTimes(lat, lon, new Date(now.getTime() + 86400000));
      next = tom?.sunrise;
    }

    if (next) {
      const delay = next.getTime() - Date.now();
      if (delay > 0) {
        timerRef.current = setTimeout(() => scheduleAuto(lat, lon), delay + 2000);
      }
    }
  }, [applyDark]);

  const setMode = useCallback((newMode) => {
    localStorage.setItem('theme-mode', newMode);
    setModeState(newMode);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (mode === 'dark')  { applyDark(true);  return; }
    if (mode === 'light') { applyDark(false); return; }

    // ── auto mode ──────────────────────────────────────────────────────────
    if (posRef.current) {
      scheduleAuto(posRef.current.lat, posRef.current.lon);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    let mq = null;
    let mqHandler = null;

    const useMqFallback = () => {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mq.matches);
      mqHandler = (e) => applyDark(e.matches);
      mq.addEventListener('change', mqHandler);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => scheduleAuto(pos.coords.latitude, pos.coords.longitude),
        useMqFallback,
        { timeout: 6000 }
      );
    } else {
      useMqFallback();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (mq && mqHandler) mq.removeEventListener('change', mqHandler);
    };
  }, [mode, scheduleAuto, applyDark]);

  return (
    <ThemeContext.Provider value={{ isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
