/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: ux-billing-terminal
 * ============================================================ */

# SKILL: Billing Terminal UX — Complete Specification

Read this file before writing any billing terminal UI code.
Also load: `skills/ux-design-system.md`

---

## The cashier reality (design context)

Before writing a single line of billing UI:

1. **The customer is always present.** The cashier cannot look at a tutorial or
   think too hard. Every action must be findable by muscle memory within 2 weeks.

2. **Queues create pressure.** When 3+ people are waiting, the cashier's
   working memory degrades. The UI must handle errors gracefully — not add to stress.

3. **Shoper9 users have 5–10 years of muscle memory.** F2 = New Bill.
   This is non-negotiable. Changing these keys will cause real business disruption.

4. **Scanner is the primary input.** Most items are scanned, not typed.
   The scan must resolve instantly and add to cart with zero confirmation steps.

5. **The total must always be visible.** The customer is looking at it too.
   Never hide, collapse, or animate-away the running total.

---

## Billing terminal states — the complete state machine

```
IDLE
  │ F2 / "New Bill" → BILLING_ACTIVE
  │
BILLING_ACTIVE
  │ Scan item     → ITEM_RESOLVING (50ms) → BILLING_ACTIVE (item added to cart)
  │ Type partial  → SEARCH_OPEN → item selected → BILLING_ACTIVE
  │ F5            → SUSPEND_CONFIRM → SUSPENDED (bill saved) → IDLE
  │ F8            → RECALL_BROWSER → select suspended bill → BILLING_ACTIVE
  │ F10           → PAYMENT_SCREEN
  │ Esc           → VOID_CONFIRM (if cart non-empty) → IDLE
  │
PAYMENT_SCREEN
  │ Select payment → TENDERING
  │ Back           → BILLING_ACTIVE
  │
TENDERING
  │ Amount entered → CHANGE_DISPLAY → RECEIPT_PRINT → IDLE
  │ Cancel         → BILLING_ACTIVE
  │
VOID_CONFIRM
  │ Confirm → IDLE (cart cleared, audit log written)
  │ Cancel  → BILLING_ACTIVE
```

Every state transition must be reflected in the UI immediately (< 50ms).
Never leave the cashier uncertain about which state they're in.

---

## Zone A — Top bar spec

```
┌──────────────────────────────────────────────────────────────────┐
│ PrimeSetu  │  TILL: T01  │  Jawahar  │  10:42 AM  │  ● ONLINE   │
└──────────────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Store name | brand-saffron text, font-sans font-semibold |
| Till ID | white text, monospace, shows "T01" |
| Cashier name | white text, truncated at 12 chars |
| Live clock | white, monospace, updates every minute |
| Connection status | Green dot + "ONLINE" or Saffron dot + "OFFLINE" |
| Height | 48px, bg-brand-navy, shrink-0 |

---

## Zone B — Cart (left panel) spec

### Item search bar
```
[ 🔍 Scan or type item code / name... ]
```
- Always auto-focused when billing is active
- `enterkeyhint="search"` for mobile keyboards
- Debounce: 300ms for text search, 0ms for barcode scan (instant)
- Barcode detected when: input length ≥ 6 AND Enter received within 100ms of last char
- On match: clear search bar + add item to cart + refocus search bar
- On no match: shake animation + red border + "Item not found" inline
- NEVER navigate away from billing on a failed scan — cashier stays in BILLING_ACTIVE

### Cart table columns
```
[#] [Item Name          ] [Code  ] [S/C  ] [Qty] [MRP  ] [Price ] [Total ]
 1   Citywalk Slip-On     CW042    8/BLK    1    1,299   1,169    1,169
 2   Cotton Kurta Set     KS018    M/NVY    2      899     899    1,798
```

| Column | Width | Font | Notes |
|--------|-------|------|-------|
| # (row number) | 40px | mono sm | Shows 1-based index |
| Item Name | flex-1 | sans pos-lg | Truncate at 28 chars for readability |
| Item Code | 80px | mono pos-sm | Gray, secondary |
| Size/Colour | 60px | sans pos-sm | "M/NVY" format |
| Qty | 56px | mono pos-md | ↑↓ arrows on hover/select |
| MRP | 80px | mono pos-sm gray | Strikethrough if discounted |
| Selling Price | 88px | mono pos-md | Brand-saffron if discounted from MRP |
| Line Total | 96px | mono pos-md bold | Right-aligned |
| Delete | 36px | — | × icon, red on hover |

### Cart interaction rules
- Click any row → selects it (gold border)
- Selected row: `+` and `-` keys change qty; `Delete` key removes item
- Right-click (or long-press) → context menu: Edit Qty / Apply Discount / Void Line
- Void a line: row stays visible with strikethrough (audit trail), doesn't disappear
- Qty change: update line total and running total instantly (no spinner)
- Empty cart: show centered placeholder "Press F2 or scan an item to begin"

### Discount application
```
When a discount is applied to a line:
  - Selling price shows in brand-saffron
  - MRP shows in gray with strikethrough
  - Discount % badge shows: [10% OFF] in amber

When a price group discount is active (customer selected):
  - Customer panel shows: "WHOLESALE PRICE" badge
  - All prices auto-updated, no individual item notification needed
```

---

## Zone C — Right panel spec

### Customer sub-panel (top ~40% of Zone C)
```
┌─────────────────────────────────────┐
│ 📱 Type phone or scan loyalty card  │
│ ─────────────────────────────────── │
│ Priya Sharma          [C0042] [VIP] │
│ ⭐ 1,240 pts  │  Outstanding: ₹0   │
│ Last visit: 3 days ago              │
└─────────────────────────────────────┘
```

States:
- **No customer:** phone input visible, placeholder text
- **Typing:** live search (debounce 300ms), dropdown suggestions
- **Customer found:** show name + code + loyalty + outstanding
- **Outstanding > 0:** show in amber with warning icon
- **Loyalty eligible:** show "Redeem up to X pts" link
- **Clear button (×):** always visible when customer is set

### Cart summary sub-panel (middle ~35% of Zone C)
```
Subtotal         ₹2,967
GST (12%)          ₹356
─────────────────────────
Loyalty discount   -₹100   ← only if redemption active
─────────────────────────
TOTAL            ₹3,223    ← LARGEST TEXT ON SCREEN
```
- Total must always be visible — do NOT put it in a scroll container
- GST breakdown: show per-rate if multiple rates (12% + 5% items on same bill)
- Loyalty discount: green, negative sign, only when redeemed

### Payment sub-panel (bottom ~25% of Zone C)
```
[       CASH       ]   ← F10 shortcut, brand-saffron, large
[  UPI / QR Code  ]
[     Card POS    ]
[ Store Credit    ]    ← only if customer has outstanding credit
```
- Buttons: minimum 52px height
- Most common method (Cash) is always first
- Tapping a button → enters PAYMENT_SCREEN state

---

## Zone D — HotkeyBar spec

```
[ F2  New Bill ] [ F5  Suspend ] [ F8  Recall ] [ Alt+D  Discount ] [ F10  PAY ] [ Esc  Close ]
```

| Hotkey | Label | Style | State visibility |
|--------|-------|-------|-----------------|
| F2 | New Bill | Default | Always visible |
| F5 | Suspend | Default | Only when cart non-empty |
| F8 | Recall | Default | Always visible |
| Alt+D | Discount | Default | Only when item selected |
| F10 | PAY | Primary (saffron) | Only when cart non-empty |
| Esc | Close / Cancel | Danger (red text) | Always visible |

---

## Payment screen UX

When F10 is pressed, a full-screen overlay appears (not a modal — full screen):

```
┌──────────────────────────────────────────────────────┐
│  PAYMENT                              TOTAL ₹3,223   │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  [● CASH    ]   [  UPI    ]   [  CARD   ]           │
│                                                      │
│  Cash tendered: [ 5,000 ]                            │
│                                                      │
│  Change due:    ₹1,777   ← LARGE, green, prominent  │
│                                                      │
│  [     CONFIRM PAYMENT (Enter)     ]                 │
│  [          Cancel (Esc)          ]                  │
└──────────────────────────────────────────────────────┘
```

Rules:
- Cash tendered field auto-focused
- If tendered < total: show red "Insufficient amount" inline
- Change amount: updates live as tendered is typed
- Enter key confirms payment (no need to reach for mouse)
- "Round off" to nearest ₹1 (common Indian retail practice) — show option if change > ₹0.50
- After confirm: full-screen "✓ PAYMENT COMPLETE" for 1 second, then → receipt print prompt

---

## Receipt / invoice UX

```
After payment confirmed:
→ Show: "Print receipt? [Enter = Yes] [Esc = No]"
→ Auto-print if store setting: auto_print_receipt = true
→ Never block the next transaction waiting for print confirmation
→ Print error: show toast "Print failed — continue anyway?" non-blocking
```

---

## Suspended bills UX (F8 recall browser)

```
┌── SUSPENDED BILLS ─────────────────────────────────┐
│ #  │ Time    │ Customer      │ Items │ Total        │
│ 1  │ 10:31   │ Walk-in       │ 3     │ ₹2,100  [↩] │
│ 2  │ 10:44   │ Priya Sharma  │ 1     │ ₹899    [↩] │
└────────────────────────────────────────────────────┘
```
- Arrow keys navigate rows
- Enter or [↩] recalls the selected bill into the active cart
- Max 9 suspended bills per till (Shoper9 parity)
- Bill suspended > 2 hours: amber row highlight

---

## Error handling UX — the 3 tiers

**Tier 1 — Non-blocking (toast, 3 seconds):**
- "Receipt print failed"
- "Customer loyalty sync delayed"
- "Barcode not found" (if cashier can continue without resolving)

**Tier 2 — Inline (stays visible until resolved):**
- Item search not found → red text below search bar
- Tendered amount insufficient → red text below tender field
- Customer has outstanding balance → amber banner in customer panel

**Tier 3 — Blocking modal (cashier must resolve before continuing):**
- GST rate missing on item (cannot bill without it)
- Till not opened for the day
- Payment amount mismatch at end of day
- Void requires manager override

---

## Anti-patterns — what to NEVER do in billing UI

| Anti-pattern | Why it's harmful |
|-------------|-----------------|
| Confirmation dialog after every scan | Kills speed — cashier scans 200+ items/hour |
| Animate the running total away | Customer is watching it — must always be visible |
| Auto-logout after inactivity | Cashier mid-transaction gets logged out |
| Modal for barcode not found | Cashier loses keyboard focus on the cart |
| Require mouse to complete payment | Many billing desks have keyboard only |
| Show item codes smaller than 13px | Unreadable at POS distance |
| Truncate the total in Zone C | The most important number — never clip it |
| Multiple clicks to void a line | Voiding is frequent in busy retail |
| Navigate away on scan failure | Cashier loses their place in the transaction |
| Toast for payment failures | Payment failure is Tier 3 — must be a blocking modal |

---

## Checklist — billing terminal UX

- [ ] 3-zone layout: top bar / left cart / right panel / bottom hotkey bar
- [ ] Item search bar auto-focused in BILLING_ACTIVE state
- [ ] Barcode scan resolves in < 50ms, no confirmation step
- [ ] F2 / F5 / F8 / F10 / Esc all wired with `enableOnFormTags: true`
- [ ] Running TOTAL always visible, never animated away
- [ ] Cart rows min 52px height
- [ ] Voided lines show strikethrough, not deleted
- [ ] Payment screen is full-screen overlay, not modal
- [ ] Change amount updates live as cash tendered is typed
- [ ] Suspended bills max 9 per till, recalled with Enter key
- [ ] Error tier logic: toast / inline / blocking modal per severity
- [ ] All prices in `font-mono`
- [ ] `ux-design-system.md` tokens used throughout (no hardcoded colours)
