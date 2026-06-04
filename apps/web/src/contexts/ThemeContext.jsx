import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Apply initial theme immediately (prevents flash of wrong mode on load)
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('theme-mode') || 'dark';
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // auto: follow system
    document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

// Cycles: auto → dark → light → auto
export const NEXT_MODE = { auto: 'dark', dark: 'light', light: 'auto' };

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(
    () => localStorage.getItem('theme-mode') || 'dark'
  );
  const [isDark, setIsDark] = useState(
    () => (localStorage.getItem('theme-mode') || 'dark') !== 'light'
  );

  const applyDark = useCallback((dark) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const setMode = useCallback((newMode) => {
    localStorage.setItem('theme-mode', newMode);
    setModeState(newMode);
  }, []);

  useEffect(() => {
    if (mode === 'dark')  { applyDark(true);  return; }
    if (mode === 'light') { applyDark(false); return; }

    // auto: follow system preference, listen for changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyDark(mq.matches);
    const handler = (e) => applyDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, applyDark]);

  return (
    <ThemeContext.Provider value={{ isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
