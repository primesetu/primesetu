/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: ux-index
 * ============================================================ */

# SKILL: UI/UX Index — Load This First for Any UI Task

This is the entry point for all UI/UX work in PrimeSetu.
Read this file, then load the specific UX skill for your task.

---

## Which UX skill to load

| Task involves... | Load this skill file |
|-----------------|---------------------|
| Any UI work (ALL agents load this first) | `skills/ux-design-system.md` |
| Billing terminal, cart, payment, F-key flows | `skills/ux-billing-terminal.md` |
| Item Master, Customer, Catalog, Reports, Config | `skills/ux-backoffice-patterns.md` |
| New React page (any module) | `skills/add-react-page.md` + `skills/ux-design-system.md` |
| Shoper9 module (Item/Customer/Barcode/Catalog) | `skills/shoper9-module-index.md` |
| Predictive stockout, HQ Sync Pulse, DoC, Node health | `skills/ux-operational-intelligence.md` |
| Language toggle, i18n, regional labels | `skills/ux-operational-intelligence.md` + `skills/ux-design-system.md` |

**The minimum for ANY UI task: load `ux-design-system.md` first, always.**

---

## Core UI/UX principles — memorize these

These are derived from POS UX research and Shoper9 parity requirements.
They override generic Tailwind/React conventions wherever they conflict.

### 1. Muscle memory is sacred
Shoper9 users have 5–10 years of keyboard habits.
- F2 = New Bill. F5 = Suspend. F8 = Recall. F10 = Confirm/Pay. Esc = Cancel.
- These keys CANNOT be repurposed for anything else — ever.
- Every form, every drawer, every modal: F10 saves, Esc cancels.

### 2. The total is always visible
The running total in the billing terminal is the most important piece of
information on screen — for the cashier AND the customer watching.
- Never hide it behind a scroll container
- Never animate it away
- Never truncate it with ellipsis

### 3. Font-mono for all data
Every price, quantity, item code, barcode, invoice number:
```
font-mono  ← non-negotiable
```
This aligns columns, makes scanning easier, and looks professional.
Use `font-sans` for labels, headings, navigation only.

### 4. Speed beats aesthetics at the POS
Animations must NEVER delay a transaction:
- Hotkey responses: instant (< 16ms, no animation)
- Barcode scan result: instant (< 50ms)
- Cart row add: 150ms max
- Modal open: 200ms max
- Page transitions: 200ms max

### 5. Errors have severity tiers
Never default to a toast for everything.
- Toast (auto-dismiss): non-critical, no action needed
- Inline (stays visible): field validation, soft warnings
- Blocking modal: financial errors, GST errors, auth errors

### 6. Indian context is first-class
- All large amounts: lakh/crore format (₹3.2L not ₹3,20,000)
- GST shown as CGST+SGST breakdown (not a single "Tax" line)
- State codes for GST routing (two-digit, e.g. "27" = Maharashtra)
- Loyalty points shown in full (not abbreviated — "1,240 pts" not "1.24K pts")
- Regional language labels via `useLanguage()` hook — no hardcoded English strings

### 7. Offline is a first-class state
Every page must:
- Show the orange offline banner when `isOffline = true`
- Still display data (from IndexedDB cache)
- Disable destructive actions (void, delete) when offline
- Queue writes for sync when connection restores

### 8. Permissions, not roles
```typescript
// ❌ NEVER
if (user.role === 'manager') { showVoidButton() }

// ✅ ALWAYS
if (user.hasPermission('billing.void')) { showVoidButton() }
```

---

## UX decisions log — why we made key choices

This section documents past decisions so agents don't re-open closed debates.

### Why no infinite scroll in tables?
Indian retail managers use keyboard navigation (Page Up/Down).
Infinite scroll breaks keyboard-only navigation and makes exporting
current-view data unpredictable. Pagination wins.

### Why sidebar is not collapsible on desktop?
POS terminals have dedicated screens — not laptops where screen space is
precious. The 240px sidebar always visible means navigation is always
findable without a hamburger click. Shoper9 had always-visible navigation.

### Why F10 = save on ALL forms (not just billing)?
Shoper9 uses F10 as the "confirm/finalise" key throughout the app, not just
in billing. Power users muscle-memory F10. Making it inconsistent (F10 in
billing, but Enter or click in forms) would feel broken.

### Why drawer (not new page) for record editing?
Navigating to a new page for editing loses the filter/sort state of the
table the user came from. Drawer preserves context. Shoper9 had popup-style
overlays for editing. Drawer is the modern equivalent.

### Why no auto-logout on inactivity?
Retail billing terminals are shared and cashiers step away frequently
(restocking, customer queries). Auto-logout mid-transaction would void the
active bill. Till-based session management handles this instead.

### Why Lucide React for icons (not FontAwesome, Material Icons)?
Lucide is tree-shakeable (smaller bundles), has a clean consistent style,
is MIT licensed, and is already a peer dependency of shadcn/ui which is in
the stack. Mixing icon libraries creates visual inconsistency.

### Why skeleton loaders instead of spinners?
Indian tier-2/3 retail stores often have slow/intermittent connectivity.
Spinners show "nothing yet" — skeletons show the shape of what's coming,
reducing perceived wait time. Applies especially to the Item Master table
which can have 50,000+ rows.

---

## UX anti-patterns — banned in PrimeSetu

| Anti-pattern | Banned because |
|-------------|---------------|
| Hardcoded English label strings | Phase 5 adds 14 regional languages |
| Hardcoded hex colours in TSX | Must use brand tokens only |
| `font-sans` for prices/codes | Use `font-mono` — non-negotiable |
| Spinner for table loading | Use skeleton loaders |
| Toast for payment failures | Tier 3 = blocking modal |
| Role-based UI (`if role === 'admin'`) | Use permission-based |
| Infinite scroll in tables | Use pagination |
| Auto-logout on inactivity | Breaks mid-transaction billing |
| Repurposing F2/F5/F8/F10/Esc | Sacred Shoper9 hotkeys |
| Hiding or animating away the total | Customer is watching it |
| Confirmation dialog after every scan | Kills throughput |
| Non-Indian number format | Use lakh/crore |
| Inline CSS or style props | Use Tailwind tokens only |
| New icon library (not Lucide) | Visual inconsistency |
| Collapse sidebar on desktop | Navigation must always be visible |

---

## Phase 5 UX — Status Tracker

| Improvement | Status | Skill |
|-------------|--------|-------|
| Predictive Stockout (DoC) | ✅ LIVE — `InventoryModule.tsx` | `ux-operational-intelligence.md` |
| HQ Heartbeat (Sync Pulse) | ✅ LIVE — `useNodeSync` + Sidebar | `ux-operational-intelligence.md` |
| Multi-lingual toggle (EN/HI) | ✅ LIVE — `useLanguage` + Sidebar | `ux-operational-intelligence.md` |
| Auto-Print Bridge (GRN→Barcode) | ✅ LIVE — `GRNProcessor` + `BarcodeStudio` | `shoper9-barcode.md` |
| Touch / Tablet mode | ⏳ Phase 6 | TBD |
| Dark mode (night shift) | ⏳ Phase 6 | TBD |
| Cashier performance dashboard | ⏳ Phase 6 | `ux-operational-intelligence.md` |
| Customer-facing display (2nd screen) | ⏳ Phase 7 | TBD |
| Accessibility audit (ARIA) | ⏳ Phase 7 | TBD |
| Print preview (thermal) | ⏳ Phase 7 | TBD |
