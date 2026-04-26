/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Brand Palette ─────────────────────────────
      colors: {
        navy:         '#0D1B3E',
        'navy-light': '#162248',
        'navy-mid':   '#1E2F5C',
        saffron:      '#F4840A',
        'saffron-dk': '#D9720A',
        gold:         '#F9B942',
        cream:        '#FAF7F2',
        muted:        '#6B7280',
        border:       '#E5E0D8',
        surface:      '#FFFFFF',
        // aliases for legacy code
        navy2:        '#162248',
        navy3:        '#1E2F5C',
        navylight:    '#162248',
        'brand-navy':    '#0D1B3E',
        'brand-saffron': '#F4840A',
        'brand-gold':    '#F9B942',
        'brand-cream':   '#FAF7F2',
      },

      // ── Font Families ─────────────────────────────
      fontFamily: {
        // Primary UI — legible at 60–80cm screen distance
        sans:  ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        // All numbers, prices, codes, barcodes — tabular alignment
        mono:  ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        // Hindi regional language fallback
        indic: ['Noto Sans Devanagari', 'sans-serif'],
      },

      // ── POS Font Size Scale ────────────────────────
      // Minimum: 13px (text-xs). NEVER go below for cashier-facing text.
      // Reading distance 60–80cm requires larger-than-standard sizes.
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', fontWeight: '700' }],  // hotkey badges only
        'xs':  ['13px', { lineHeight: '18px', fontWeight: '400' }],  // secondary labels (min)
        'sm':  ['14px', { lineHeight: '20px', fontWeight: '400' }],  // table cells
        'md':  ['15px', { lineHeight: '22px', fontWeight: '400' }],  // body / form fields
        'lg':  ['17px', { lineHeight: '24px', fontWeight: '500' }],  // item names in cart
        'xl':  ['20px', { lineHeight: '28px', fontWeight: '600' }],  // section headings
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '700' }],  // page titles
        '3xl': ['32px', { lineHeight: '40px', fontWeight: '700' }],  // TOTAL amount
        '4xl': ['44px', { lineHeight: '52px', fontWeight: '800' }],  // payment confirm screen
        // Legacy aliases
        'pos-xs': ['13px', { lineHeight: '18px' }],
        'pos-sm': ['14px', { lineHeight: '20px' }],
        'pos-md': ['15px', { lineHeight: '22px' }],
        'pos-lg': ['17px', { lineHeight: '24px' }],
        'pos-xl': ['22px', { lineHeight: '28px' }],
      },

      // ── Spacing ───────────────────────────────────
      spacing: {
        // Touch target minimum
        'touch': '52px',
        'touch-lg': '60px',
        'touch-xl': '72px',
        // Layout constants
        'sidebar': '280px',
        'sidebar-sm': '72px',
        'topbar': '56px',
        'hotbar': '56px',
      },

      // ── Border Radius ─────────────────────────────
      borderRadius: {
        'sm':   '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '20px',
        '2xl': '24px',
      },

      // ── Box Shadows ───────────────────────────────
      boxShadow: {
        'card':    '0 1px 3px rgba(13,27,62,0.06), 0 4px 16px rgba(13,27,62,0.04)',
        'card-hover': '0 8px 24px rgba(13,27,62,0.10)',
        'modal':   '0 24px 80px rgba(13,27,62,0.24)',
        'saffron': '0 4px 14px rgba(244,132,10,0.35)',
        'saffron-lg': '0 8px 24px rgba(244,132,10,0.40)',
        'gold':    '0 4px 14px rgba(249,185,66,0.30)',
        'sidebar': '4px 0 24px rgba(13,27,62,0.15)',
      },

      // ── Animation ─────────────────────────────────
      transitionDuration: {
        'instant': '80ms',
        'fast':   '150ms',
        'normal': '250ms',
        'slow':   '400ms',
      },
      transitionTimingFunction: {
        'pos': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'scan-flash': {
          '0%, 100%': { background: 'transparent' },
          '50%':      { background: 'rgba(249,185,66,0.2)' },
        },
        'pay-pulse': {
          '0%, 100%': { boxShadow: '0 8px 24px rgba(244,132,10,0.4)' },
          '50%':      { boxShadow: '0 12px 40px rgba(244,132,10,0.6)' },
        },
      },
      animation: {
        'shimmer':         'shimmer 1.4s ease-in-out infinite',
        'slide-in-right':  'slide-in-right 0.25s cubic-bezier(0.2,0,0,1)',
        'slide-down':      'slide-down 0.25s cubic-bezier(0.2,0,0,1)',
        'scale-in':        'scale-in 0.2s cubic-bezier(0.2,0,0,1)',
        'scan-flash':      'scan-flash 0.3s ease-in-out',
        'pay-pulse':       'pay-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
