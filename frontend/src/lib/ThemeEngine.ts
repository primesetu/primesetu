/* ============================================================
   SMRITI-OS — Lead Frontend Architect Theme Engine
   Zero-FOUC Runtime Governance
   ============================================================ */

export type SmritiTheme = 'LIGHT' | 'DARK';

export const ThemeEngine = (() => {
  const STORAGE_KEY = "smriti-theme";

  function setTheme(theme: SmritiTheme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('smriti-theme-change', { detail: { theme } }));
  }

  function getTheme(): SmritiTheme {
    return (localStorage.getItem(STORAGE_KEY) as SmritiTheme) || "LIGHT";
  }

  function init() {
    const theme = getTheme();
    document.documentElement.setAttribute("data-theme", theme);
  }

  return { setTheme, getTheme, init };
})();
