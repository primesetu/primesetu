/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation     :  AITDL Network
 * Project            :  SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'tesla' | 'tallyprime' | 'dark';
type Accent = 'default' | 'gold' | 'cream' | 'crimson';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    let savedTheme = localStorage.getItem('smriti-theme') || 'dark';
    if (savedTheme === 'shoper9') savedTheme = 'tallyprime';
    return savedTheme as Theme;
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    const savedAccent = localStorage.getItem('smriti-accent');
    return (savedAccent as Accent) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('smriti-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('smriti-accent', accent);
    if (accent !== 'default') {
      document.documentElement.setAttribute('data-accent', accent);
    } else {
      document.documentElement.removeAttribute('data-accent');
    }
  }, [accent]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setAccent = (newAccent: Accent) => setAccentState(newAccent);

  return (
    <ThemeContext.Provider value={{ theme, accent, setTheme, setAccent }}>
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
