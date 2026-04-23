/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0D1B3E',
        navy2:   '#162248',
        navy3:   '#1E2F5C',
        saffron: '#F4840A',
        gold:    '#F9B942',
        cream:   '#FAF7F2',
        muted:   '#8A8FA8',
        border:  '#E8E4DC',
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
