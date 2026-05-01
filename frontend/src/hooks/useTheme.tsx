/* ============================================================
   SMRITI-OS — Shoper9-Based Retail OS
   Zero Cloud · Sovereign · AI-Governed
   ============================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeEngine, SmritiTheme } from '../lib/ThemeEngine';

interface ThemeContextType {
  theme: SmritiTheme;
  setTheme: (theme: SmritiTheme) => void;
  accent: string;
  setAccent: (color: string) => void;
  isInstitutional: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SmritiTheme>(() => ThemeEngine.getTheme());
  const [accent, setAccentState] = useState(() => localStorage.getItem('smriti-accent') || '#2563eb');

  useEffect(() => {
    ThemeEngine.init();
  }, []);

  useEffect(() => {
    ThemeEngine.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
    localStorage.setItem('smriti-accent', accent);
  }, [accent]);

  const setTheme = (newTheme: SmritiTheme) => setThemeState(newTheme);
  const setAccent = (newColor: string) => setAccentState(newColor);
  const isInstitutional = theme === 'LIGHT';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, isInstitutional }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
