/* ============================================================
   SMRITI-OS — Lead Frontend Architect Theme Engine
   Zero-FOUC Runtime Governance
   ============================================================ */

export type SmritiTheme = 'shopper-prime' | 'SMRITI-OS' | 'vyom' | 'pratham' | 'dark' | 'tesla';

export const ThemeEngine = (() => {
  const STORAGE_KEY = "smriti-theme";

  const domainThemeMap: Record<string, SmritiTheme> = {
    "smritios.com": "shopper-prime",
    "vyomautomation.com": "vyom",
    "prathamone.com": "pratham"
  };

  /**
   * Applies the theme to the document and persists it.
   */
  function setTheme(theme: SmritiTheme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Dispatch event for reactive components
    window.dispatchEvent(new CustomEvent('smriti-theme-change', { detail: { theme } }));
  }

  /**
   * Retrieves the current theme from storage or domain mapping.
   */
  function getTheme(): SmritiTheme {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as SmritiTheme | null;
    if (savedTheme) return savedTheme;

    const domainTheme = domainThemeMap[window.location.hostname];
    return domainTheme || "shopper-prime";
  }

  /**
   * Initializes the theme on application load (redundant but safe with head script).
   */
  function init() {
    const theme = getTheme();
    document.documentElement.setAttribute("data-theme", theme);
  }

  return { setTheme, getTheme, init };
})();
