/* ============================================================
   SMRITI-OS — Lead Frontend Architect Theme Engine
   Zero-FOUC Runtime Governance
   ============================================================
   Registered System Themes (Level 1 — v3.0 Spec):
     LIGHT         → Clean institutional day mode
     DARK          → Deep sovereign night mode
     HIGH_CONTRAST → WCAG AAA accessibility mode
   Registered HO Themes (Level 2):
     MODERN_SLEEK  → Neo-sovereign, electric cyan on near-black
     IBM_SUREPOS   → Classic enterprise POS battleship grey
     OBSIDIAN      → Ultra-premium luxury, sovereign gold
     CLINICAL      → Sterile pharmacy / dispensary mode
   ============================================================ */

export type SmritiTheme =
  | 'LIGHT'
  | 'DARK'
  | 'HIGH_CONTRAST'
  | 'MODERN_SLEEK'
  | 'IBM_SUREPOS'
  | 'OBSIDIAN'
  | 'CLINICAL';

export interface SmritiThemeMeta {
  id: SmritiTheme;
  label: string;
  mode: 'light' | 'dark';
  level: 'system' | 'ho';
  accent: string;
  description: string;
}

export const SMRITI_THEMES: SmritiThemeMeta[] = [
  {
    id: 'MODERN_SLEEK',
    label: 'Neo-Sovereign',
    mode: 'dark',
    level: 'ho',
    accent: '#06b6d4',
    description: 'Electric cyan on near-black. Vercel/Linear inspired.',
  },
  {
    id: 'DARK',
    label: 'Sovereign Dark',
    mode: 'dark',
    level: 'system',
    accent: '#2563eb',
    description: 'Deep navy dark mode. Standard institutional default.',
  },
  {
    id: 'LIGHT',
    label: 'Institutional Light',
    mode: 'light',
    level: 'system',
    accent: '#1a3a5c',
    description: 'Clean day mode. Maximum readability.',
  },
  {
    id: 'HIGH_CONTRAST',
    label: 'High Contrast',
    mode: 'dark',
    level: 'system',
    accent: '#FFFF00',
    description: 'WCAG AAA. Absolute black + pure yellow/white.',
  },
  {
    id: 'IBM_SUREPOS',
    label: 'Big Blue POS',
    mode: 'light',
    level: 'ho',
    accent: '#0f62fe',
    description: 'IBM 4690 / SurePOS aesthetic. Battleship grey + Core Blue.',
  },
  {
    id: 'OBSIDIAN',
    label: 'Sovereign Obsidian',
    mode: 'dark',
    level: 'ho',
    accent: '#d4af37',
    description: 'True obsidian black + sovereign gold. Luxury retail.',
  },
  {
    id: 'CLINICAL',
    label: 'Institutional Medical',
    mode: 'light',
    level: 'ho',
    accent: '#0f4c81',
    description: 'Sterile white + clinical blue. Pharmacy / dispensary.',
  },
];

// Default theme — set to MODERN_SLEEK as per design directive
const DEFAULT_THEME: SmritiTheme = 'MODERN_SLEEK';

export const ThemeEngine = (() => {
  const STORAGE_KEY = 'smriti-theme';

  function setTheme(theme: SmritiTheme) {
    // Map our internal theme IDs to the CSS data-theme attribute values
    const attrMap: Record<SmritiTheme, string> = {
      LIGHT: 'LIGHT',
      DARK: 'DARK',
      HIGH_CONTRAST: 'HIGH-CONTRAST',
      MODERN_SLEEK: 'MODERN_SLEEK',
      IBM_SUREPOS: 'IBM_SUREPOS',
      OBSIDIAN: 'OBSIDIAN',
      CLINICAL: 'CLINICAL',
    };
    document.documentElement.setAttribute('data-theme', attrMap[theme]);
    localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(
      new CustomEvent('smriti-theme-change', {
        detail: {
          theme,
          meta: SMRITI_THEMES.find(t => t.id === theme),
        },
      })
    );
  }

  function getTheme(): SmritiTheme {
    return (localStorage.getItem(STORAGE_KEY) as SmritiTheme) || DEFAULT_THEME;
  }

  function init() {
    const theme = getTheme();
    setTheme(theme);
  }

  function getThemeMeta(theme: SmritiTheme): SmritiThemeMeta | undefined {
    return SMRITI_THEMES.find(t => t.id === theme);
  }

  return { setTheme, getTheme, init, getThemeMeta, SMRITI_THEMES };
})();
