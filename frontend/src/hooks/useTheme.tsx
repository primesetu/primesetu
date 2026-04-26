/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'tesla' | 'shoper9';
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
    const savedTheme = localStorage.getItem('primesetu_theme');
    return (savedTheme as Theme) || 'tesla';
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    const savedAccent = localStorage.getItem('primesetu_accent');
    return (savedAccent as Accent) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('primesetu_theme', theme);
    if (theme === 'shoper9') {
      document.documentElement.setAttribute('data-theme', 'shoper9');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('primesetu_accent', accent);
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
