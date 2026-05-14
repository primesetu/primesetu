/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: ux-backoffice-patterns
 * ============================================================ */

# SKILL: Back-Office UI/UX Patterns

Read this file before writing any non-billing UI (Catalog, Reports, MIS,
Customer, Item Master, Price Groups, GTIN Studio, Config).
Also load: `skills/ux-design-system.md`

---

## The back-office user (design context)

Back-office users (store manager, owner, data entry staff) are different from
cashiers:
- Work in longer sessions, less time pressure than billing
- Still keyboard-driven — Indian retail back-office staff expect keyboard shortcuts
- Often older, less tech-savvy → clarity over cleverness
- Primary tasks: data entry, report reading, price changes, stock checks
- Screen: same terminal as billing, 1280×800 minimum

---

## 1. NAVIGATION SYSTEM

### Sidebar — the primary navigation
```
┌──────────────────────────────┐
│  PS  PrimeSetu               │  ← logo + app name
│  Store: Citywalk Mumbai      │  ← store name (truncated)
├──────────────────────────────┤
│  ⚡  Billing Terminal   F1   │  ← always first, always F1
│  📦  Item Master        F3   │
│  👥  Customers                │
│  🏷️   Price Groups             │
│  📊  MIS Reports              │
│  🏠  Head Office              │
│  ⚙️   Config                   │
├──────────────────────────────┤
│  🔲  GTINStudio               │
│  📋  Tally Sync               │
└──────────────────────────────┘
│  👤  Jawahar (Manager)        │  ← user + role
│  🔴  Sign Out                 │
```

Rules:
- Navigation items are DB-driven (`menus` table) — NEVER hardcoded
- Active item: left border brand-saffron + bg-brand-cream
- Hotkey badge shown for items that have one (F1, F3 etc.)
- Sidebar width: 240px, fixed, never collapsible on desktop
- Icons: Lucide React icons only — no external icon libraries

### Page breadcrumb
Every back-office page must have a breadcrumb:
```
Home > Item Master > Edit Item CW042
```
- Font: sans pos-sm, gray-500
- Current page: gray-900, not a link
- Max 3 levels

---

## 2. DATA TABLE PATTERNS

### The master table (used in: Item Master, Customers, Price Groups)

```
┌─────────────────────────────────────────────────────────────────┐
│  Item Master                                  [+ New Item F4]   │
│  ─────────────────────────────────────────────────────────────  │
│  🔍 Search items...  [Dept ▼]  [GST ▼]  [Active ▼]  [Export]  │
├───┬──────────────────────┬────────┬──────────┬─────────┬────────┤
│ # │ Item Name            │ Code   │ Dept     │ MRP     │ Stock  │
├───┼──────────────────────┼────────┼──────────┼─────────┼────────┤
│ 1 │ Citywalk Slip-On     │ CW042  │ Footwear │ ₹1,299  │ 24    │
│ 2 │ Cotton Kurta Set     │ KS018  │ Apparel  │ ₹899    │ 3  ⚠  │
│ 3 │ Linen Trousers       │ LT099  │ Apparel  │ ₹1,599  │ 0  ✕  │
├───┴──────────────────────┴────────┴──────────┴─────────┴────────┤
│  Showing 1–50 of 1,247 items          [< Prev]  Page 1  [Next >]│
└─────────────────────────────────────────────────────────────────┘
```

**Table rules:**
- Row height: 48px minimum
- Alternating row bg: white / gray-50
- Hover: bg-brand-cream
- Selected: gold/20 + left saffron border
- Stock column: coloured badge (green/amber/red) per qty thresholds
- Click row → opens detail drawer (NOT a new page — see Drawer pattern below)
- Sort by clicking column header → shows ↑ or ↓ arrow
- Sticky header (doesn't scroll away with data)

**Filter bar rules:**
- Search input: auto-focused on page load (F3 focuses it from anywhere)
- Filter dropdowns: never more than 4 visible at once
- "Clear all filters" link appears when any filter is active
- Filter state persists within the session (user returns from edit → same filters)
- Export button: always visible, exports current filtered view as CSV

**Pagination:**
- Default page size: 50 rows
- Show: "Showing 1–50 of 1,247"
- Keyboard: Page Down / Page Up for next/prev page
- No infinite scroll — POS users prefer predictable pagination

### Inline edit mode (Price Management / Bulk Edit)
```
When user clicks "Bulk Edit" or presses F6 in Item Master:
→ Editable cells render with input borders
→ Changed cells: amber background
→ [Save All] button appears in top-right (primary, saffron)
→ [Discard] button appears next to it
→ Escape key → Discard changes confirm
→ Only changed rows sent to API (PATCH /items/bulk-price-update)
```

---

## 3. FORM PATTERNS

### Standard form layout
```
┌──────────────────────────────────────────────────────┐
│  New Item                                   [× Close] │
│  ──────────────────────────────────────────────────── │
│                                                       │
│  Item Code *          Item Name *                    │
│  [______________]     [___________________________]  │
│                                                       │
│  Department *         GST Rate *     HSN Code *      │
│  [Footwear ▼  ]       [18% ▼  ]     [__________]    │
│                                                       │
│  MRP (₹) *            Cost Price (₹)                 │
│  [__________]         [__________]                   │
│                                                       │
│  Size Group           Brand                          │
│  [UK Footwear ▼]      [__________]                   │
│                                                       │
│  ─────────────────────────────────────────────────── │
│  [  Cancel (Esc)  ]         [  Save Item (F10)  ]    │
└──────────────────────────────────────────────────────┘
```

**Form rules:**
- Label above field (not beside) — easier to scan
- Required fields: asterisk * in label (never show it on focus, always show)
- Tab order: left→right, top→bottom, exactly as visually laid out
- F10 = submit on ALL forms (parity with Shoper9's F10 = confirm)
- Esc = cancel on ALL forms
- Validation: show errors on blur (not on submit) for faster correction
- Currency fields: accept plain number (₹ symbol is display-only, not typed)
- Dropdown search: all dropdowns with > 8 options must be searchable

### Field validation display
```typescript
// CORRECT — error below field, always visible once triggered
<div>
  <label className="text-pos-sm text-gray-600">MRP (₹) *</label>
  <input
    className={cn(
      "w-full border rounded px-3 py-2 font-mono text-pos-md",
      error ? "border-red-400 bg-red-50" : "border-gray-300"
    )}
  />
  {error && (
    <p className="text-pos-xs text-red-600 mt-1">{error}</p>
  )}
</div>

// WRONG — tooltip error, toast error, or error only on submit
```

### Drawer vs Modal vs Page
| Use case | Component | When |
|----------|-----------|------|
| View/edit a single record | Drawer (slides from right, 480px) | Table row click |
| Quick confirmation | Modal (centered, 400px max) | Destructive actions |
| Multi-step complex form | Full page | New Item, New Customer |
| Error/alert | Modal | Tier 3 errors |

**Drawer rules:**
- Slides in from right, 480px wide on desktop
- Background content dimmed (not disabled) — user can see context
- Esc closes the drawer
- Unsaved changes → "Discard changes?" confirm before close
- F10 = save from within drawer

---

## 4. SEARCH & FILTER UX

### Ctrl+K — Global Omnisearch
This is the power-user shortcut (from walkthrough.md: "Ctrl+K opens the Sovereign Command Bar").

```
┌──────────────────────────────────────────────────────────────┐
│  🔍  Search items, customers, modules...         [Esc Close]  │
├──────────────────────────────────────────────────────────────┤
│  ITEMS                                                       │
│  📦  CW042 — Citywalk Slip-On   ₹1,299  •  24 in stock      │
│  📦  KS018 — Cotton Kurta Set   ₹899    •  3 in stock  ⚠    │
├──────────────────────────────────────────────────────────────┤
│  CUSTOMERS                                                   │
│  👤  Priya Sharma  •  C0042  •  9876543210  •  1,240 pts    │
├──────────────────────────────────────────────────────────────┤
│  MODULES                                                     │
│  📊  Go to MIS Reports                                       │
│  ⚙️   Go to Config                                            │
└──────────────────────────────────────────────────────────────┘
```

Rules:
- Opens on Ctrl+K from anywhere in the app
- Auto-focused, starts searching after 2 chars
- Results grouped by type (Items / Customers / Modules)
- Arrow keys navigate, Enter selects
- For items: Ctrl+B adds directly to billing cart (if billing is suspended)
- Max 5 results per group visible without scrolling
- Search API: `GET /catalogue/search?q=` (see shoper9-catalog.md)

---

## 5. NOTIFICATION & FEEDBACK SYSTEM

### Toast notifications (non-blocking)
```typescript
// 4 types, positioned top-right, auto-dismiss
type ToastType = 'success' | 'error' | 'warning' | 'info'

// Duration:
// success: 2 seconds
// info:    3 seconds
// warning: 4 seconds (user may need to read it)
// error:   stays until dismissed (errors need action)

// Examples:
toast.success("Item CW042 saved")
toast.warning("Low stock: Cotton Kurta Set has 3 units")
toast.error("Tally sync failed — check connection")    // stays until ×
```

### Days of Cover (DOC) warnings — proactive alerts
From Phase 5: stock velocity and DOC are calculated per item. Surface them:

```
// On Item Master list:
// Stock column shows badge:
// qty > DOC*3:  green  "24 units"
// qty <= DOC*3: amber  "3 units ⚠"  (tooltip: "~3 days of cover")
// qty <= DOC:   red    "0 units ✕"  (tooltip: "Reorder recommended")

// On Management Dashboard:
// "Stockout Alerts" card shows top-5 items approaching zero cover
```

---

## 6. MIS REPORTS UX

### Report viewer standard layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Sales Report                            [Date Range] [Export]   │
│  ─────────────────────────────────────────────────────────────── │
│  📅 From: 01 Apr 2026  To: 26 Apr 2026  [This Month ▼]          │
│  Filter: [All Depts ▼]  [All Cashiers ▼]  [Apply F5]            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SUMMARY CARDS                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Revenue  │  │ GST      │  │ Invoices │  │ Avg. Basket  │   │
│  │ ₹3.2L   │  │ ₹38,400  │  │ 247      │  │ ₹1,296       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                  │
│  DETAIL TABLE (scrollable)                                       │
│  Date  │ Invoice  │ Customer │ Items │ GST   │ Total            │
│  ...                                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Report UX rules:**
- Summary KPI cards always at top — one glance tells the story
- Date range presets: Today / This Week / This Month / Custom
- F5 = Apply filters (matches Shoper9 behaviour for reports)
- Export: always CSV (+ PDF in Phase 5)
- Numbers in KPI cards: `font-mono`, large (pos-xl)
- Large numbers abbreviated: ₹3,20,000 → shown as ₹3.2L (Indian lakh format)

### Indian number formatting
```typescript
// ALWAYS use Indian lakh/crore format for large numbers
function formatIndianCurrency(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_000_000) return `₹${(rupees/10_000_000).toFixed(1)}Cr`
  if (rupees >= 100_000)    return `₹${(rupees/100_000).toFixed(1)}L`
  if (rupees >= 1_000)      return `₹${rupees.toLocaleString('en-IN')}`
  return `₹${rupees.toFixed(0)}`
}

// Examples:
// 32_000_00  paise → "₹3.2L"
// 1_50_00000 paise → "₹1.5Cr"
// 1299_00    paise → "₹1,299"
// NEVER: "₹32000" (no comma) or "₹32,000.00" (2 decimal places on whole amounts)
```

---

## 7. ACCESSIBILITY ADDITIONS (India-specific)

### Regional language support (Phase 5)
```typescript
// All label strings must go through the useLanguage hook
// NEVER hardcode English strings in JSX for labels
const { t } = useLanguage()

// ✅ CORRECT
<label>{t('item.name')}</label>

// ❌ WRONG
<label>Item Name</label>
```

### Low-bandwidth consideration
India tier-2/tier-3 retail stores often have slow connections.
- All tables must show skeleton loaders, not spinners
- Skeleton: animated shimmer (gray-200 → gray-300) matching the row layout
- Pages must be usable with IndexedDB cache on 2G (offline-first)
- Images: lazy-load with `loading="lazy"`, placeholder bg-gray-100

---

## 8. CONFIG MODULE UX

The Config module (store settings, printer setup, Tally bridge) uses a settings panel layout:

```
┌── SETTINGS ──────────────────────────────────────────────────┐
│  [🖨  Printer]  [💰 Billing]  [🔗 Tally]  [👥 Users]  [🏪 Store] │
├──────────────────────────────────────────────────────────────┤
│  Printer Settings                                            │
│  ─────────────────────────────────────────────────────────── │
│  Printer IP       [192.168.1.105        ]  [Test Print]     │
│  Printer Port     [9100  ]                                   │
│  Paper width      [● 80mm   ○ 58mm]                         │
│  Auto-print receipt   [● Yes   ○ No]                        │
│  ─────────────────────────────────────────────────────────── │
│                                     [Save Settings  F10]    │
└──────────────────────────────────────────────────────────────┘
```

Rules:
- Tab-based settings, not a long scroll page
- F10 saves the current tab
- "Test Print" fires a test label immediately (no modal confirm)
- Changes auto-saved with a subtle "Saved ✓" indicator (not a toast)
- Sensitive fields (API keys, Supabase URL): masked with show/hide toggle

---

## Back-office UX checklist

- [ ] Sidebar navigation is DB-driven (no hardcoded menu arrays)
- [ ] Active nav item has left saffron border + cream bg
- [ ] Page has breadcrumb (max 3 levels)
- [ ] Data tables: 48px row height, sticky header, sort on column click
- [ ] Filter state persists within session
- [ ] Search input auto-focused on page load (F3 refocuses)
- [ ] Row click opens drawer, not new page
- [ ] F10 = save, Esc = cancel on ALL forms and drawers
- [ ] Currency fields use `font-mono`
- [ ] Indian number format (lakh/crore) on all large numbers in reports
- [ ] Summary KPI cards on all report pages
- [ ] Toast: success 2s, info 3s, warning 4s, error stays
- [ ] Ctrl+K Omnisearch wired and working
- [ ] Skeleton loaders (not spinners) for all tables
- [ ] All label strings go through `useLanguage()` hook
- [ ] `ux-design-system.md` tokens used throughout
