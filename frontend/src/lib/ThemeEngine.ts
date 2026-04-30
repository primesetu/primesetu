/* ============================================================
   SMRITI-OS — Lead Frontend Architect Theme Engine
   Zero-FOUC Runtime Governance
   ============================================================ */

export type SmritiTheme = 'SMRITI-OS';

export const ThemeEngine = (() => {
  const STORAGE_KEY = "smriti-theme";

  function setTheme(theme: SmritiTheme) {
    document.documentElement.setAttribute("data-theme", "SMRITI-OS");
    localStorage.setItem(STORAGE_KEY, "SMRITI-OS");
    window.dispatchEvent(new CustomEvent('smriti-theme-change', { detail: { theme: "SMRITI-OS" } }));
  }

  function getTheme(): SmritiTheme {
    return "SMRITI-OS";
  }

  function init() {
    document.documentElement.setAttribute("data-theme", "SMRITI-OS");
  }

  return { setTheme, getTheme, init };
})();
