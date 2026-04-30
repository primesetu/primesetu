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
  const theme = 'SMRITI-OS';
  const [accent, setAccentState] = useState(() => localStorage.getItem('smriti-accent') || '#f29b12');

  useEffect(() => {
    ThemeEngine.setTheme('SMRITI-OS');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
    localStorage.setItem('smriti-accent', accent);
  }, [accent]);

  const setTheme = (_newTheme: SmritiTheme) => {}; // No-op as theme is locked
  const setAccent = (newColor: string) => setAccentState(newColor);
  const isInstitutional = true;

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
