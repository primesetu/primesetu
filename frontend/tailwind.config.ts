/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Tailwind Config: Elevation-Based Dark Design System
 * © 2026 AITDL Network
 * ============================================================ */
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Design Token Colors (elevation model) ─────────────
      colors: {
        // Surfaces
        'bg-base':     '#0C0C0E',
        'bg-elevated': '#141416',
        'bg-overlay':  '#1C1C1F',
        'bg-float':    '#242428',
        'bg-input':    '#1A1A1D',

        // Borders
        'border-subtle':  'rgba(255,255,255,0.05)',
        'border-default': 'rgba(255,255,255,0.09)',
        'border-strong':  'rgba(255,255,255,0.16)',

        // Text hierarchy
        'text-primary':   '#F2F2F4',
        'text-secondary': '#9A9AA8',
        'text-tertiary':  '#5C5C68',
        'text-disabled':  '#3A3A44',

        // Accent (Indigo — Linear-style)
        'accent':         '#6366F1',
        'accent-light':   '#818CF8',
        'accent-bg':      'rgba(99,102,241,0.10)',
        'accent-border':  'rgba(99,102,241,0.25)',

        // Status
        'status-green':  '#22C55E',
        'status-amber':  '#F59E0B',
        'status-red':    '#EF4444',
        'status-blue':   '#3B82F6',

        // POS CTA (billing screens only)
        'pos-cta':       '#10B981',
        'pos-cta-hover': '#059669',
        'pos-void':      '#EF4444',

        // ── Legacy aliases (backward compat) ──
        navy:         '#F2F2F4',
        'navy-light': '#1C1C1F',
        'navy-mid':   '#242428',
        saffron:      '#6366F1',
        'saffron-dk': '#818CF8',
        gold:         '#F59E0B',
        cream:        '#0C0C0E',
        muted:        '#9A9AA8',
        border:       'rgba(255,255,255,0.09)',
        surface:      '#1C1C1F',
        // brand aliases
        'brand-navy':    '#0C0C0E',
        'brand-saffron': '#6366F1',
        'brand-gold':    '#F59E0B',
        'brand-cream':   '#1C1C1F',
      },

      // ── Font Families ─────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        indic: ['Noto Sans Devanagari', 'sans-serif'],
      },

      // ── Font Scale ────────────────────────────────────────
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', fontWeight: '500' }],
        'xs':  ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'sm':  ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'md':  ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'lg':  ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'xl':  ['20px', { lineHeight: '28px', fontWeight: '600' }],
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '3xl': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        '4xl': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        // POS aliases
        'pos-xs': ['13px', { lineHeight: '18px' }],
        'pos-sm': ['14px', { lineHeight: '20px' }],
        'pos-md': ['15px', { lineHeight: '22px' }],
        'pos-lg': ['17px', { lineHeight: '24px' }],
        'pos-xl': ['22px', { lineHeight: '28px' }],
      },

      // ── Spacing ───────────────────────────────────────────
      spacing: {
        'touch':    '52px',
        'touch-lg': '64px',
        'sidebar':  '256px',
        'topbar':   '52px',
        'hotbar':   '44px',
      },

      // ── Border Radius ─────────────────────────────────────
      borderRadius: {
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
      },

      // ── Box Shadows (dark-mode aware) ─────────────────────
      boxShadow: {
        'card':     '0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.09)',
        'modal':    '0 24px 80px rgba(0,0,0,0.6)',
        'accent':   '0 4px 14px rgba(99,102,241,0.3)',
        'pos-pay':  '0 0 0 0 rgba(16,185,129,0.4)',
        'sidebar':  '4px 0 24px rgba(0,0,0,0.4)',
        'dropdown': '0 16px 40px rgba(0,0,0,0.5)',
      },

      // ── Animation ─────────────────────────────────────────
      transitionDuration: {
        'instant': '80ms',
        'fast':    '150ms',
        'normal':  '250ms',
        'slow':    '400ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'scan-flash': {
          '0%, 100%': { background: 'transparent' },
          '50%':      { background: 'rgba(99,102,241,0.12)' },
        },
        'pay-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(16,185,129,0)' },
        },
      },
      animation: {
        'shimmer':        'shimmer 1.4s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.2s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':     'slide-down 0.15s cubic-bezier(0.16,1,0.3,1)',
        'fade-up':        'fade-up 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':       'scale-in 0.15s cubic-bezier(0.16,1,0.3,1)',
        'scan-flash':     'scan-flash 0.3s ease-in-out',
        'pay-pulse':      'pay-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
