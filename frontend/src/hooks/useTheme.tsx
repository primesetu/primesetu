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
  const [accent, setAccentState] = useState(() => localStorage.getItem('smriti-accent') || '#ffc107');

  useEffect(() => {
    // Synchronize with document attribute
    ThemeEngine.setTheme(theme);

    // Listen for external theme changes
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) setThemeState(e.detail.theme);
    };

    window.addEventListener('smriti-theme-change', handleThemeChange);
    return () => window.removeEventListener('smriti-theme-change', handleThemeChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
    localStorage.setItem('smriti-accent', accent);
  }, [accent]);

  const setTheme = (newTheme: SmritiTheme) => setThemeState(newTheme);
  const setAccent = (newColor: string) => setAccentState(newColor);
  const isInstitutional = theme === 'SMRITI-OS';

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
