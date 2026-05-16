/* ============================================================
   SMRITI-OS — Shoper9-Based Retail OS
   Zero Cloud · Sovereign · AI-Governed
   ============================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeEngine, SmritiTheme, SmritiThemeMeta, SMRITI_THEMES } from '@/lib/ThemeEngine';
import { api } from '@/api/client';

interface ThemeContextType {
  theme: SmritiTheme;
  setTheme: (theme: SmritiTheme) => void;
  accent: string;
  setAccent: (color: string) => void;
  isInstitutional: boolean;
  themes: SmritiThemeMeta[];
  themeMeta: SmritiThemeMeta | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SmritiTheme>(() => ThemeEngine.getTheme());
  const [accent, setAccentState] = useState(() => {
    const meta = ThemeEngine.getThemeMeta(ThemeEngine.getTheme());
    return localStorage.getItem('smriti-accent') || meta?.accent || '#06b6d4';
  });

  useEffect(() => {
    ThemeEngine.init();
  }, []);

  useEffect(() => {
    ThemeEngine.setTheme(theme);
    // Auto-sync accent with theme's native accent unless user overrode it
    const savedAccentOverride = localStorage.getItem('smriti-accent-override');
    if (!savedAccentOverride) {
      const meta = ThemeEngine.getThemeMeta(theme);
      if (meta) setAccentState(meta.accent);
    }

    // Sync theme to backend for Delta-Sync Cloud Hub Parity
    const syncToBackend = async () => {
      try {
        await api.users.updatePreferences({ theme });
      } catch (err: any) {
        // Silently ignore when backend is offline (ERR_CONNECTION_REFUSED) or auth errors
        const isNetworkDown = !err.response;
        const isAuthError = err.response?.status === 401 || err.response?.status === 403;
        if (!isNetworkDown && !isAuthError) {
          console.warn('[ThemeEngine] Background sync deferred:', err.message);
        }
      }
    };
    syncToBackend();
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
    localStorage.setItem('smriti-accent', accent);
  }, [accent]);

  const setTheme = (newTheme: SmritiTheme) => setThemeState(newTheme);
  const setAccent = (newColor: string) => {
    localStorage.setItem('smriti-accent-override', newColor);
    setAccentState(newColor);
  };

  const themeMeta = ThemeEngine.getThemeMeta(theme);
  const isInstitutional = themeMeta?.mode === 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, isInstitutional, themes: SMRITI_THEMES, themeMeta }}>
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
