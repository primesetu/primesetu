# DESIGN LOCK — PrimeSetu UI System
> **Version:** 1.0.0 · Locked: 2026-04-27
> **Authority:** Jawahar R. M. — System Architect, AITDL Network
> **Status:** 🔒 LOCKED — No changes without explicit architect approval

---

## ⚠️ FROZEN FILES — DO NOT MODIFY

The following files define the entire visual system.  
**Any PR touching these files will be auto-rejected by the pre-commit hook.**

| File | Purpose |
|------|---------|
| `frontend/src/index.css` | All design tokens (CSS variables), component classes |
| `frontend/tailwind.config.ts` | Tailwind token mapping — must mirror `index.css` |
| `frontend/src/components/layout/Sidebar.tsx` | Navigation chrome — locked layout |
| `frontend/src/components/layout/TopBar.tsx` | Top navigation bar — locked layout |

---

## 🎨 Locked Token System

### Surface Elevation (4-layer)
```
--bg-base:       #0C0C0E   ← Page background. NEVER change.
--bg-elevated:   #141416   ← Sidebar, toolbar. NEVER change.
--bg-overlay:    #1C1C1F   ← Cards, panels. NEVER change.
--bg-float:      #242428   ← Hover states, dropdowns. NEVER change.
```

### Typography
```
--text-primary:   #F2F2F4   ← Headlines, values
--text-secondary: #9A9AA8   ← Labels
--text-tertiary:  #5C5C68   ← Hints, timestamps
```

### Accent — ONE color only
```
--accent:       #6366F1  (Indigo — Linear-style)
--accent-light: #818CF8
```

### POS-only CTA
```
--pos-cta: #10B981  ← Green PAY button. ONLY on finalize/pay actions.
```

---

## ❌ BANNED PATTERNS

These patterns are **blocked by ESLint** and will fail CI:

```tsx
// ❌ BANNED: hardcoded colors
className="bg-[#0D1B3E]"
className="text-white"
className="bg-navy"
className="bg-brand-gold"
className="text-emerald-600"
style={{ color: '#fff' }}       // only allowed with var() tokens

// ❌ BANNED: old font weights
className="font-black"          // use font-semibold or font-medium
className="tracking-[0.5em]"    // never more than tracking-wider

// ❌ BANNED: oversized radii
className="rounded-[3.5rem]"    // max is rounded-2xl (20px)
className="rounded-full"        // only for avatars/dots

// ✅ CORRECT patterns
style={{ color: 'var(--text-primary)' }}
style={{ background: 'var(--bg-overlay)' }}
style={{ border: '1px solid var(--border-subtle)' }}
className="finput"
className="btn-primary"
className="surface-2"
```

---

## 📐 Layout Constants (Frozen)

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-w` | 256px | Expanded sidebar |
| `--topbar-h` | 52px | Top navigation bar |
| `--content-pad` | 28px | Page content padding |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, panels |

---

## 🔑 Component Rules

### Buttons
- Primary actions → `btn-primary` (indigo)
- Secondary → `btn-sec` (ghost border)
- POS pay/finalize → `btn-pay` (green, 64px height)
- Danger → `btn-danger` (red tint)
- **NEVER create a new button style without adding to `index.css` first**

### Inputs
- All form inputs → `finput` (36px height)
- Large POS inputs → `finput-lg` (48px height)
- Dropdowns → `fselect`
- Labels → `flabel`

### Typography
- Page titles → `page-title` class (20px/600)
- Section labels → `section-label` (11px/500/uppercase/tracked)
- KPI values → `kval` (32px/600/mono)
- **NEVER use `font-black` (900) in the dark UI. Max is `font-semibold` (600)**

### Icons
- **ALWAYS use Lucide React** — no emojis in UI
- Size: 14px for inline, 16px for standalone, 20px for featured
- Color: always from token (`var(--text-tertiary)` or `var(--accent-light)`)

---

## 🚫 What Triggers Automatic Rejection

1. Any hardcoded hex color not using `var(--)`
2. Emoji used as UI icon (`📈`, `📦`, etc.)
3. `bg-white` or `text-black` in any component
4. `font-black` weight class anywhere
5. Direct modification of `index.css` or `tailwind.config.ts` without architect sign-off
6. New Tailwind color that doesn't map to an existing CSS variable

---

## ✅ How to Request a Design Change

1. Open a GitHub issue with label `design-system`
2. Tag `@AITDL-Architect`
3. Provide: screenshot, token name to change, justification
4. Wait for approval before touching locked files

---

*"A design system is only as strong as the discipline to not break it."*  
*— PrimeSetu Design Protocol*
