/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import { Palette, Monitor, Zap, CheckCircle2 } from 'lucide-react';

const THEMES = [
  {
    id: 'SMRITI-OS' as const,
    name: 'SMRITI-OS Institutional',
    tagline: 'Enterprise ERP Parity — Zero Distraction',
    icon: Monitor,
    preview: {
      bg: '#f0f1f1',
      sidebar: '#008c85',
      header: '#008c85',
      primary: '#f29b12',
      text: '#212121',
      card: '#FFFFFF',
      border: '#bcbcbc',
    }
  },
  {
    id: 'tesla' as const,
    name: 'Tesla Design',
    tagline: 'Premium Dark Mode — Zero Compromise',
    icon: Zap,
    preview: {
      bg: '#080F21',
      sidebar: '#0F1A35',
      header: '#152347',
      primary: '#F4840A',
      text: '#FAF7F2',
      card: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.08)',
    }
  }
];

const ACCENTS = [
  { id: 'default' as const, color: '#F4840A', name: 'Saffron' },
  { id: 'gold'    as const, color: '#F9B942', name: 'Gold' },
  { id: 'cream'   as const, color: '#E5D3B3', name: 'Cream' },
  { id: 'crimson' as const, color: '#DC2626', name: 'Crimson' },
];

// Mini preview of the billing terminal in each theme
function ThemePreview({ preview, themeName }: { preview: typeof THEMES[0]['preview'], themeName: string }) {
  const isInstitutional = themeName === 'SMRITI-OS Institutional';
  const br = isInstitutional ? '0px' : '12px';
  const brSm = isInstitutional ? '0px' : '8px';
  const shadow = isInstitutional ? 'none' : '0 4px 20px rgba(0,0,0,0.4)';
  const font = isInstitutional ? "'Segoe UI', Tahoma, sans-serif" : "'Inter', sans-serif";
  const btnBg = isInstitutional ? '#f29b12' : preview.primary;
  const btnColor = isInstitutional ? '#000' : '#FFF';
  const btnBorder = isInstitutional ? '1px solid #000' : 'none';

  return (
    <div
      style={{
        background: preview.bg,
        borderRadius: br,
        overflow: 'hidden',
        width: '100%',
        height: 160,
        display: 'flex',
        fontFamily: font,
        border: `1px solid ${preview.border}`,
        boxShadow: shadow,
      }}
    >
      {/* Sidebar */}
      <div style={{ width: 50, background: preview.sidebar, padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 6, borderRight: `1px solid ${preview.border}` }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 8, background: i === 1 ? preview.primary : 'rgba(255,255,255,0.15)', borderRadius: brSm, margin: '0 4px' }} />
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 24, background: preview.header, borderBottom: `1px solid ${preview.border}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
          <div style={{ fontSize: 8, color: '#FFF', fontWeight: 'bold', opacity: 0.9 }}>SMRITI-OS</div>
          <div style={{ marginLeft: 'auto', width: 40, height: 12, background: preview.primary, borderRadius: brSm, opacity: 0.9 }} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: 8, display: 'flex', gap: 6 }}>
          {/* Cart area */}
          <div style={{ flex: 2, background: preview.card, border: `1px solid ${preview.border}`, borderRadius: brSm, padding: 4 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                <div style={{ flex: 2, height: 8, background: isInstitutional ? '#000' : preview.text, opacity: 0.3, borderRadius: 2 }} />
                <div style={{ flex: 1, height: 8, background: preview.primary, opacity: 0.6, borderRadius: 2 }} />
              </div>
            ))}
          </div>
          {/* Right panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 32, background: preview.card, border: `1px solid ${preview.border}`, borderRadius: brSm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: isInstitutional ? '#000' : preview.text, fontWeight: 'bold', fontFamily: isInstitutional ? 'Segoe UI' : 'monospace' }}>₹1,240</span>
            </div>
            <div style={{ flex: 1, background: btnBg, border: btnBorder, borderRadius: brSm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: btnColor, fontWeight: 'bold' }}>F10 PAY</span>
            </div>
          </div>
        </div>
        {/* HotkeyBar */}
        <div style={{ height: 18, background: isInstitutional ? '#225c5a' : preview.header, borderTop: `1px solid ${preview.border}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 8 }}>
          {['F2', 'F5', 'F8', 'F10'].map(k => (
            <span key={k} style={{ fontSize: 7, color: isInstitutional ? '#ffc107' : 'rgba(255,255,255,0.5)', fontFamily: 'monospace', background: isInstitutional ? '#004d40' : 'rgba(255,255,255,0.1)', padding: '0 3px', borderRadius: brSm, border: isInstitutional ? 'none' : 'none' }}>{k}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Personalization() {
  const { theme, setTheme, accent, setAccent } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-saffron" />
        <div>
          <h2 className="text-xl font-bold text-navy">Personalization</h2>
          <p className="text-xs text-muted uppercase tracking-widest font-bold mt-0.5">
            Theme &amp; Ambient Design Controls
          </p>
        </div>
      </div>

      {/* Theme Selector */}
      <section>
        <p className="section-label mb-4">Display Mode</p>
        <div className="grid grid-cols-2 gap-6">
          {THEMES.map((t, idx) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => setTheme(t.id)}
                className="text-left w-full"
              >
                <div className={`relative rounded-2xl p-4 border-2 transition-all ${
                  isActive
                    ? 'border-saffron bg-saffron/5 shadow-lg shadow-saffron/10'
                    : 'border-border bg-white hover:border-saffron/40'
                }`}>
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-saffron" />
                    </div>
                  )}
                  {/* Theme preview */}
                  <div className="mb-3">
                    <ThemePreview preview={t.preview} themeName={t.name} />
                  </div>
                  {/* Label */}
                  <div className="flex items-center gap-2 mt-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-saffron' : 'text-muted'}`} />
                    <div>
                      <div className="font-bold text-sm text-navy">{t.name}</div>
                      <div className="text-xs text-muted">{t.tagline}</div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Accent Selector — only for Tesla mode */}
      {theme === 'tesla' && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="section-label mb-4">Ambient Accent Color</p>
          <div className="flex gap-4 flex-wrap">
            {ACCENTS.map((a) => {
              const isActive = accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
                    isActive ? 'border-navy shadow-md bg-cream/30' : 'border-border bg-white hover:border-muted'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-border/50 shadow-sm"
                    style={{ background: a.color }}
                  />
                  <span className={`text-sm font-semibold ${isActive ? 'text-navy' : 'text-muted'}`}>
                    {a.name}
                  </span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-saffron ml-auto" />}
                </button>
              );
            })}
          </div>
          {/* Live accent preview bar */}
          <div className="mt-4 h-2 rounded-full w-full" style={{ background: `linear-gradient(to right, var(--saffron-dk), var(--saffron), var(--gold))` }} />
        </motion.section>
      )}

      {/* SMRITI-OS Institutional note */}
      {theme === 'SMRITI-OS' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border border-border rounded-xl bg-emerald-50 text-sm text-emerald-900 flex items-start gap-3"
        >
          <Monitor className="w-5 h-5 mt-0.5 shrink-0 text-[var(--teal-primary)]" />
          <div>
            <strong className="text-[var(--teal-primary)]">Institutional Mode Active</strong> — All animations disabled for maximum speed.
            Fonts set to Segoe UI. Headers use SMRITI Institutional Teal.
            Hotkey labels are locked to Golden Amber.
          </div>
        </motion.div>
      )}
    </div>
  );
}




