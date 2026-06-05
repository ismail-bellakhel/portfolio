import React, { createContext, useContext, useEffect } from 'react';

// Always dark — no toggle
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme-mode', 'dark');
}

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true, mode: 'dark', setMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
