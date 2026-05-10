/* ============================================================
 * SMRITI-OS — Sovereign Theme Picker
 * Allows HO/Admin to switch between all registered system themes
 * ============================================================ */

import React, { useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { SmritiTheme, SmritiThemeMeta } from '../lib/ThemeEngine';
import '../styles/components/theme-picker.css';

// Swatch colour maps — visual preview of each theme
const SWATCH_MAP: Record<SmritiTheme, { bg: string; accent: string; surface: string }> = {
  MODERN_SLEEK:  { bg: '#050505', accent: '#06b6d4', surface: '#121212' },
  DARK:          { bg: '#0a1118', accent: '#2563eb', surface: '#1a2a3a' },
  LIGHT:         { bg: '#e8edf5', accent: '#1a3a5c', surface: '#ffffff' },
  HIGH_CONTRAST: { bg: '#000000', accent: '#FFFF00', surface: '#000000' },
  IBM_SUREPOS:   { bg: '#e0e0e0', accent: '#0f62fe', surface: '#ffffff' },
  OBSIDIAN:      { bg: '#050505', accent: '#d4af37', surface: '#0f0f0f' },
  CLINICAL:      { bg: '#f4f6f8', accent: '#0f4c81', surface: '#ffffff' },
};

interface ThemeSwatchProps {
  theme: SmritiThemeMeta;
  isActive: boolean;
}

function ThemeSwatch({ theme }: ThemeSwatchProps) {
  const s = SWATCH_MAP[theme.id];
  return (
    <div
      className="theme-card-swatch"
      style={{ background: s.bg }}
    >
      {/* Surface block */}
      <div style={{
        position: 'absolute', left: 10, top: 8, right: 10, bottom: 8,
        background: s.surface,
        border: `1px solid ${s.accent}`,
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
      }}>
        {/* Accent bar */}
        <div style={{ width: 4, height: '70%', background: s.accent, flexShrink: 0 }} />
        {/* Mock text lines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ height: 3, background: s.accent, width: '60%', opacity: 0.9 }} />
          <div style={{ height: 2, background: s.accent, width: '40%', opacity: 0.4 }} />
        </div>
        {/* Accent dot */}
        <div style={{ width: 8, height: 8, background: s.accent, borderRadius: '50%', flexShrink: 0 }} />
      </div>
    </div>
  );
}

interface ThemePickerProps {
  onClose: () => void;
}

export function ThemePicker({ onClose }: ThemePickerProps) {
  const { theme: activeTheme, setTheme, themes, accent, setAccent } = useTheme();

  const handleSelect = useCallback((id: SmritiTheme) => {
    setTheme(id);
  }, [setTheme]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const systemThemes = themes.filter(t => t.level === 'system');
  const hoThemes     = themes.filter(t => t.level === 'ho');

  return (
    <div className="theme-picker-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Theme Picker">
      <div className="theme-picker-panel">

        {/* ── Header ── */}
        <div className="theme-picker-header">
          <span className="theme-picker-title">⬛ Sovereign Theme Manager</span>
          <button className="theme-picker-close" onClick={onClose} aria-label="Close theme picker">✕</button>
        </div>

        {/* ── System Themes ── */}
        <div className="theme-picker-section-label">System Themes — Level 1 (Cannot be deleted)</div>
        <div className="theme-picker-grid">
          {systemThemes.map(t => (
            <div
              key={t.id}
              className={`theme-card${activeTheme === t.id ? ' active' : ''}`}
              onClick={() => handleSelect(t.id)}
              role="button"
              tabIndex={0}
              aria-pressed={activeTheme === t.id}
              onKeyDown={e => e.key === 'Enter' && handleSelect(t.id)}
            >
              <span className="theme-card-badge system">SYS</span>
              <ThemeSwatch theme={t} isActive={activeTheme === t.id} />
              <div className="theme-card-name">{t.label}</div>
              <div className="theme-card-desc">{t.description}</div>
              {activeTheme === t.id && <div className="theme-card-active-dot" />}
            </div>
          ))}
        </div>

        {/* ── HO Themes ── */}
        <div className="theme-picker-section-label">HO Themes — Level 2 (Retail Verticals)</div>
        <div className="theme-picker-grid">
          {hoThemes.map(t => (
            <div
              key={t.id}
              className={`theme-card${activeTheme === t.id ? ' active' : ''}`}
              onClick={() => handleSelect(t.id)}
              role="button"
              tabIndex={0}
              aria-pressed={activeTheme === t.id}
              onKeyDown={e => e.key === 'Enter' && handleSelect(t.id)}
            >
              <span className="theme-card-badge ho">HO</span>
              <ThemeSwatch theme={t} isActive={activeTheme === t.id} />
              <div className="theme-card-name">{t.label}</div>
              <div className="theme-card-desc">{t.description}</div>
              {activeTheme === t.id && <div className="theme-card-active-dot" />}
            </div>
          ))}
        </div>

        {/* ── Footer — Accent Override ── */}
        <div className="theme-picker-footer">
          <span className="theme-picker-accent-label">Accent Override:</span>
          <div
            className="theme-picker-accent-swatch"
            style={{ background: accent }}
            title="Click to pick custom accent colour"
          >
            <input
              type="color"
              value={accent}
              onChange={e => setAccent(e.target.value)}
              aria-label="Custom accent colour"
            />
          </div>
          <span className="theme-picker-accent-label" style={{ fontSize: 9, opacity: 0.6 }}>
            {accent.toUpperCase()}
          </span>
          <span style={{ flex: 1 }} />
          <span className="theme-picker-accent-label" style={{ opacity: 0.4 }}>
            {activeTheme}
          </span>
        </div>

      </div>
    </div>
  );
}

export default ThemePicker;
