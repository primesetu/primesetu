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
  const { theme, accent, setAccent } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-saffron" />
        <div>
          <h2 className="text-xl font-bold text-navy">Personalization</h2>
          <p className="text-xs text-muted uppercase tracking-widest font-bold mt-0.5">
            Institutional Display Governance
          </p>
        </div>
      </div>

      {/* SMRITI-OS Institutional Mode Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border-2 border-teal-100 bg-teal-50/30 shadow-lg shadow-teal-600/5"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white border border-teal-100 text-teal-600">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-teal-900">Institutional Mode Active</h3>
            <p className="text-sm text-teal-700/80 leading-relaxed mb-4">
              SMRITI-OS Governance is enforcing the master institutional theme. All UI elements, fonts, and interaction protocols are locked to ERP-parity standards for maximum operational speed and zero distraction.
            </p>
            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-teal-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> SEGUE UI FONTS</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> TEAL HEADER PROTOCOL</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> ZERO ANIMATION OVERHEAD</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accent Selector — for functional highlights */}
      <section>
        <p className="section-label mb-4">Functional Accent Color</p>
        <div className="flex gap-4 flex-wrap">
          {ACCENTS.map((a) => {
            const isActive = accent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
                  isActive ? 'border-teal-600 shadow-md bg-white' : 'border-border bg-white hover:border-teal-200'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-border/50 shadow-sm"
                  style={{ background: a.color }}
                />
                <span className={`text-sm font-semibold ${isActive ? 'text-teal-900' : 'text-muted'}`}>
                  {a.name}
                </span>
                {isActive && <CheckCircle2 className="w-4 h-4 text-teal-600 ml-auto" />}
              </button>
            );
          })}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-400 font-mono uppercase tracking-widest text-center">
          Note: Accents apply to buttons, badges, and notification pulses only.
        </div>
      </section>
    </div>
  );
}




