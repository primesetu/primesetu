/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: ux-design-system
 * ============================================================ */

# SKILL: PrimeSetu Design System

Read this file completely before writing any UI component, page, or style.
This is the single source of truth for all visual decisions.

---

## Why PrimeSetu needs its own design system

Standard Tailwind defaults and generic component libraries (MUI, Ant Design)
are built for business dashboards and consumer apps. A retail POS terminal has
fundamentally different constraints:

- Cashier stares at the screen 6–8 hours/day → eye fatigue is real
- Screen is 60–80cm away, not 40cm → type must be larger than typical UI
- Cashier CANNOT look away from the customer → every action must be findable by muscle memory
- High-stress environment (queue forming) → errors must be instantly obvious
- India retail context → rupee symbol, Indic font fallbacks, regional names

These constraints override standard UI conventions everywhere they conflict.

---

## 1. COLOUR SYSTEM

### Brand palette (non-negotiable)
```
brand-navy:    #0D1B3E   → Primary: navigation, headers, table rows
brand-saffron: #F4840A   → Action: CTAs, hotkey badges, alerts, primary buttons
brand-gold:    #F9B942   → Highlight: success states, selected rows, totals
brand-cream:   #FAF7F2   → Background: all page backgrounds
```

### Semantic palette (derive from brand)
```
/* STATUS */
status-success-bg:    #ECFDF3   text: #166534
status-warning-bg:    #FFFBEB   text: #92400E
status-danger-bg:     #FEF2F2   text: #991B1B
status-info-bg:       #EFF6FF   text: #1E40AF
status-offline-bg:    #F4840A   text: #FFFFFF   ← OFFLINE MODE banner

/* STOCK LEVELS (item matrix, billing cart) */
stock-ok:      bg-green-50   text-green-800   (qty > 3)
stock-low:     bg-amber-50   text-amber-700   (qty 1–3)
stock-zero:    bg-gray-100   text-gray-400    (qty = 0, greyed out)

/* BILLING CART ROWS */
cart-row-normal:   bg-white        hover: bg-brand-cream
cart-row-selected: bg-brand-gold/20  border-l-4 border-brand-saffron
cart-row-voided:   bg-gray-100     text-gray-400  line-through

/* HOTKEY BADGES */
hotkey-badge:  bg-brand-navy   text-white   font-mono  text-xs  px-1.5 py-0.5
```

### Tailwind config additions (tailwind.config.ts)
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        navy:    '#0D1B3E',
        saffron: '#F4840A',
        gold:    '#F9B942',
        cream:   '#FAF7F2',
      }
    },
    fontFamily: {
      // Primary: mono for all POS data (item codes, prices, quantities)
      mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      // Secondary: sans for labels, headings, navigation
      sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
      // Indic fallback for regional language mode
      indic: ['Noto Sans Devanagari', 'Noto Sans Tamil', 'sans-serif'],
    },
    fontSize: {
      // POS-specific sizes (larger than standard Tailwind)
      'pos-xl':  ['22px', { lineHeight: '28px', fontWeight: '600' }],  // totals
      'pos-lg':  ['18px', { lineHeight: '24px', fontWeight: '500' }],  // item names
      'pos-md':  ['15px', { lineHeight: '20px', fontWeight: '400' }],  // table rows
      'pos-sm':  ['13px', { lineHeight: '18px', fontWeight: '400' }],  // labels
      'pos-xs':  ['11px', { lineHeight: '16px', fontWeight: '400' }],  // hotkey hints
    }
  }
}
```

---

## 2. TYPOGRAPHY RULES

### The POS reading distance rule
Text viewed at 60–80cm must be at least 14px. Never use text below 13px for
anything the cashier needs to read during a transaction.

```
Page headings:         text-pos-xl  font-sans   text-brand-navy
Section labels:        text-pos-sm  font-sans   text-gray-500  uppercase tracking-wide
Item names in cart:    text-pos-lg  font-sans   text-gray-900
Item codes:            text-pos-md  font-mono   text-brand-navy
Prices / quantities:   text-pos-lg  font-mono   font-semibold
Totals:                text-pos-xl  font-mono   text-brand-navy font-bold
Hotkey labels:         text-pos-xs  font-mono   hotkey-badge
Error messages:        text-pos-md  font-sans   text-red-700   bg-red-50
```

### Monospace for all numbers
Every price, quantity, item code, invoice number, and barcode must use
`font-mono`. This aligns columns in tables and makes scanning easier.
Never render a rupee amount in a proportional font.

---

## 3. SPACING & LAYOUT SYSTEM

### The 3-zone billing terminal layout
This is the canonical PrimeSetu screen layout. ALL billing terminal pages
MUST use this structure. No exceptions.

```
┌─────────────────────────────────────────────────────────┐
│ ZONE A: TOP BAR (48px fixed)                            │
│ Store name | Till | Cashier | Time | Offline indicator  │
├──────────────────────────────────┬──────────────────────┤
│ ZONE B: LEFT — CART (flex-1)    │ ZONE C: RIGHT PANEL  │
│                                  │ (380px fixed)         │
│  Item search bar                 │                       │
│  ─────────────────               │  Customer panel       │
│  Cart line items (scrollable)    │  ─────────────────    │
│  ─────────────────               │  Cart summary         │
│                                  │  Subtotal             │
│                                  │  GST breakdown        │
│                                  │  ─────────────────    │
│                                  │  TOTAL (large)        │
│                                  │  ─────────────────    │
│                                  │  Payment buttons      │
│                                  │  [F10 PAY]            │
└──────────────────────────────────┴──────────────────────┘
│ ZONE D: BOTTOM HOTKEY BAR (56px fixed)                  │
│ [F2 New] [F5 Suspend] [F8 Recall] [F10 Pay] [Esc Close] │
└─────────────────────────────────────────────────────────┘
```

```typescript
// Layout shell — billing terminal
<div className="h-screen flex flex-col bg-brand-cream overflow-hidden">
  {/* Zone A */}
  <header className="h-12 bg-brand-navy flex items-center px-4 shrink-0">
    ...
  </header>

  {/* Zones B + C */}
  <main className="flex flex-1 overflow-hidden">
    {/* Zone B */}
    <section className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
      ...
    </section>
    {/* Zone C */}
    <aside className="w-96 flex flex-col bg-white shrink-0">
      ...
    </aside>
  </main>

  {/* Zone D */}
  <footer className="h-14 bg-brand-navy flex items-center px-4 gap-2 shrink-0">
    ...
  </footer>
</div>
```

### Management / back-office layout (non-billing pages)
```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (240px) │ CONTENT AREA (flex-1)                 │
│                 │                                        │
│  Logo           │  Page header + breadcrumb             │
│  Navigation     │  ─────────────────                    │
│  (DB-driven)    │  Main content                         │
│                 │                                        │
│  ─────────────  │                                        │
│  User + store   │                                        │
└─────────────────┴────────────────────────────────────────┘
```

### Spacing scale
```
Micro gaps (within a component):   gap-1 (4px), gap-2 (8px)
Component internal padding:        p-3 (12px), p-4 (16px)
Between components:                gap-4 (16px), gap-6 (24px)
Page padding:                      px-6 py-4
Card/panel padding:                p-4 or p-6
```

---

## 4. COMPONENT LIBRARY

### HotkeyBar (Zone D)
The bottom bar appears on EVERY screen that has keyboard actions.
It is the on-screen reminder of what keyboard shortcuts are available.

```typescript
// components/HotkeyBar.tsx
interface HotkeyItem {
  key: string        // "F2", "F10", "Esc"
  label: string      // "New Bill", "Pay", "Close"
  action: () => void
  variant?: 'default' | 'primary' | 'danger'
}

// Rendering:
// [F2] New Bill    [F5] Suspend    [F8] Recall    [F10] PAY    [Esc] Close
//
// F10 and primary actions use brand-saffron background
// Esc/destructive actions use red-700 text
// All others: white text on brand-navy
```

### CartItem row
```typescript
// components/CartItemRow.tsx
// Height: 52px minimum (tall enough to tap on touchscreen)
// Columns: Qty | Item Name + Code | Size/Colour | Price | Line Total | [Delete]
// Selected row: left gold border + gold/20 background
// Voided row: strikethrough + gray

<tr className={cn(
  "h-13 border-b border-gray-100 cursor-pointer select-none",
  isSelected && "bg-brand-gold/20 border-l-4 border-brand-saffron",
  isVoided  && "bg-gray-50 opacity-60"
)}>
  <td className="w-12 text-center font-mono text-pos-md">{qty}</td>
  <td className="flex-1 px-3">
    <p className={cn("font-sans text-pos-lg", isVoided && "line-through")}>{itemName}</p>
    <p className="font-mono text-pos-xs text-gray-500">{itemCode}</p>
  </td>
  <td className="w-20 text-center text-pos-sm text-gray-500">{size}/{colour}</td>
  <td className="w-24 text-right font-mono text-pos-md">₹{(unitPrice/100).toFixed(2)}</td>
  <td className="w-28 text-right font-mono text-pos-md font-semibold">₹{(lineTotal/100).toFixed(2)}</td>
  <td className="w-10 text-center"><DeleteButton /></td>
</tr>
```

### TotalPanel (Zone C bottom)
```typescript
// The most important number on screen — must be immediately readable
<div className="border-t-2 border-brand-navy p-4 bg-white">
  <div className="flex justify-between text-pos-sm text-gray-500 mb-1">
    <span>Subtotal</span>
    <span className="font-mono">₹{subtotal}</span>
  </div>
  <div className="flex justify-between text-pos-sm text-gray-500 mb-1">
    <span>GST ({gstRate}%)</span>
    <span className="font-mono">₹{gst}</span>
  </div>
  {discount > 0 && (
    <div className="flex justify-between text-pos-sm text-green-700 mb-1">
      <span>Discount</span>
      <span className="font-mono">-₹{discount}</span>
    </div>
  )}
  {/* TOTAL: largest text on the page */}
  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
    <span className="text-pos-xl font-sans font-bold text-brand-navy">TOTAL</span>
    <span className="text-pos-xl font-mono font-bold text-brand-navy">
      ₹{total}
    </span>
  </div>
</div>
```

### StatusBadge
```typescript
// Reusable status indicator used across all modules
type Status = 'active' | 'inactive' | 'low-stock' | 'out-of-stock' | 'pending' | 'paid' | 'voided'

const STATUS_STYLES: Record<Status, string> = {
  'active':      'bg-green-100 text-green-800',
  'inactive':    'bg-gray-100 text-gray-600',
  'low-stock':   'bg-amber-100 text-amber-800',
  'out-of-stock':'bg-red-100 text-red-700',
  'pending':     'bg-blue-100 text-blue-800',
  'paid':        'bg-green-100 text-green-800',
  'voided':      'bg-gray-100 text-gray-500 line-through',
}
```

### OfflineBanner
```typescript
// Must appear at the top of every page when backend is unreachable
{isOffline && (
  <div className="bg-brand-saffron text-white text-pos-sm font-sans
                  px-4 py-1.5 flex items-center gap-2 w-full">
    <WifiOff className="h-4 w-4" />
    <span>OFFLINE — showing cached data. Changes will sync when connection restores.</span>
  </div>
)}
```

---

## 5. ANIMATION RULES

### The POS animation contract
Animations in a POS terminal must never delay a transaction.
Every animation must be:
- Duration ≤ 150ms for micro-interactions (row selection, button press)
- Duration ≤ 300ms for panel transitions (modal open, drawer slide)
- Duration ≤ 500ms for page transitions
- `prefers-reduced-motion` respected — all animations must degrade gracefully

```typescript
// Framer Motion variants — use these, don't invent new ones
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
}

export const slideInFromRight = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { x: 24, opacity: 0, transition: { duration: 0.15 } },
}

export const cartItemAdd = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.15 } },
  exit:    { opacity: 0, height: 0, transition: { duration: 0.1 } },
}
```

### What gets animated
| Element | Animation | Duration |
|---------|-----------|----------|
| Cart item added | `cartItemAdd` (height expand) | 150ms |
| Cart item removed | `cartItemAdd` exit | 100ms |
| Row selected | bg-color CSS transition | 100ms |
| Modal open | `slideInFromRight` | 200ms |
| Toast/notification | `fadeIn` | 150ms |
| Page transition | opacity fade | 200ms |
| Total amount change | number count-up | 300ms |

### What NEVER gets animated
- Hotkey responses (must feel instant)
- Table data loading (use skeleton instead)
- Error messages (must appear immediately)
- Barcode scan result (< 50ms, no animation)

---

## 6. ACCESSIBILITY & USABILITY RULES

### Contrast requirements (WCAG AA minimum, POS-adapted)
- Normal text on cream background: ratio ≥ 4.5:1
- Large text (pos-xl, pos-lg): ratio ≥ 3:1
- Brand navy #0D1B3E on cream #FAF7F2 = 12.8:1 ✅
- White on brand-saffron #F4840A = 3.2:1 ✅ (large text only)
- Gray-500 on white = 3.9:1 (use only for secondary labels, not primary data)

### Focus management
- Every modal and drawer MUST trap focus inside while open
- When modal closes, focus returns to the element that opened it
- Tab order must follow visual reading order (left → right, top → bottom)
- All interactive elements must be reachable by keyboard without mouse

### Touch targets (for tablet mode, future-proofing)
- Minimum touch target: 44×44px
- Cart row height: minimum 52px
- Hotkey bar buttons: minimum 48px height
- Payment buttons: minimum 60px height (they're the final action)

### Error state rules
- Never show just a red border. Always show red border + error message text.
- Error message must be adjacent to the field, not in a toast.
- Critical errors (payment failed, GST validation failed) → modal, not toast.
- Non-critical errors (barcode not found) → inline red text below search bar.

---

## Design system checklist (before any PR)

- [ ] All colours use brand tokens — no hardcoded hex values in TSX
- [ ] All prices/codes/quantities use `font-mono`
- [ ] Minimum text size: 13px (text-pos-xs)
- [ ] Billing terminal uses 3-zone layout (A/B/C/D)
- [ ] HotkeyBar present on all billing pages
- [ ] Offline banner wired to `useOfflineFallback`
- [ ] Animations use exported variants — no inline `transition` objects
- [ ] Focus trap implemented for all modals
- [ ] All touch targets ≥ 44px
- [ ] `npm run build` passes with 0 TypeScript errors
