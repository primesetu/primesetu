/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# AGENTS_BOOTSTRAP.md — Session Startup Protocol
> Version: 1.0.0 | Effective: May 2026
> READ THIS FILE FIRST. BEFORE ANYTHING ELSE.

---

## STEP 1 — IDENTITY (mandatory, every session)

You are an AI agent operating inside **PrimeSetu** — a Shoper9-parity
Retail OS for Indian specialty retail built by AITDL Network.

Your first action in every session:
**Read `GOVERNANCE.md` completely before doing anything else.**

---

## STEP 2 — MANDATORY READING ORDER

Load files in this exact order at session start:

```
1. GOVERNANCE.md                  ← identity, stack, agent roles, banned list
2. code-review-and-refine.md      ← quality gate, runs on ALL code output
```

Then load the task-specific skill based on what you need to do:

| Task | Load this next |
|------|---------------|
| Any grid / table UI | `ai-grid-protocol.md` |
| Billing terminal, cart, F-key flows | `ux-billing-terminal.md` |
| Any UI component | `ux-index.md` → then specific ux skill |
| Item Master, stock, size matrix | `shoper9-item-master.md` |
| Customer, loyalty, ledger | `shoper9-customer.md` |
| Price groups, wholesale pricing | `shoper9-customer-price-group.md` |
| Barcodes, EAN-13, label print | `shoper9-barcode.md` |
| Catalog, departments, search | `shoper9-catalog.md` |
| Tally XML, voucher sync | `tally-voucher.md` |
| New FastAPI endpoint | `add-api-endpoint.md` |
| New DB table / migration | `add-db-migration.md` |
| New React page | `add-react-page.md` |
| Predictive stockout, DoC, HQ sync | `ux-operational-intelligence.md` |
| Shoper9 module (any) | `shoper9-module-index.md` first |

---

## STEP 3 — RULES THAT ARE ALWAYS ACTIVE

These never turn off. No exception, no override:

**Money:** INTEGER paise only. No float. No Decimal. No Numeric.

**GST:** `{0, 5, 12, 18, 28}` only. Validated server-side every write.

**store_id:** JWT auth context only. Never from request body. Never hardcoded.

**RLS:** Every new DB table gets `ENABLE ROW LEVEL SECURITY` + store isolation policy.

**TypeScript:** Zero `any`. Permission-based UI only (`hasPermission()`), never `role ===`.

**Hotkeys:** F2/F5/F8/F10/Esc are sacred. Never repurpose them.

**Grid:** Every AG Grid uses `useGridMask(trn_type)`. Hardcoded ColDef = Score 0/10.

**Auth:** No `localStorage`/`sessionStorage` for auth tokens. Ever.

**Menus:** Always DB-driven. No static arrays in React.

---

## STEP 4 — OUTPUT FORMAT (every response, no exceptions)

```
### 1. Understanding
### 2. Plan
### 3. Code
### 4. Test Cases
### 5. Notes (include Self-Review result here)
```

If any section is missing → output is incomplete. Do not skip.

---

## STEP 5 — QUALITY GATE (runs before every code output)

From `code-review-and-refine.md`:

```
SCORE 10/10 → APPROVED
SCORE 9/10  → APPROVED, note failed criterion
SCORE 8/10  → BLOCKED, rewrite
SCORE ≤7/10 → BLOCKED, restart
```

Always output: `## ⚖️ QUALITY GATE | Score: X/10 | Status: APPROVED / BLOCKED`

---

## STEP 6 — WHAT HAS BEEN DELETED (do not reference these)

These files no longer exist. Do not load or mention them:

| Deleted | Replaced by |
|---------|------------|
| `aitdl.md` | `GOVERNANCE.md` |
| `AGENTS.md` | `GOVERNANCE.md` |
| `code-review-and-refine1.md` | `code-review-and-refine.md` (v3.0.0) |

If you find yourself referencing `aitdl.md` or `AGENTS.md` — stop.
Load `GOVERNANCE.md` instead.

---

## STEP 7 — CURRENT PROJECT STATUS

| Phase | Status |
|-------|--------|
| Phase 1 | ✅ COMPLETE — PostgREST (dead, do not use) |
| Phase 2 | ✅ COMPLETE — FastAPI + SQLAlchemy 2 |
| Phase 3 | ✅ COMPLETE — Inventory, GRN, Barcode Studio |
| Phase 4 | ✅ COMPLETE — Catalog, Customer, Price Groups |
| Phase 5 | 🔄 ACTIVE — DoC, HQ Heartbeat, Multi-lingual |
| Phase 6 | ⏳ PENDING — Till Mgmt, Cashier Dashboard, MIS Reports |

---

## STEP 8 — COMPLETE SKILLS FILE LIST

Only these files exist in `skills/`. Do not reference anything outside this list:

```
GOVERNANCE.md
AGENTS_BOOTSTRAP.md              ← this file
code-review-and-refine.md
ai-grid-protocol.md
add-api-endpoint.md
add-db-migration.md
add-react-page.md
shoper9-module-index.md
shoper9-item-master.md
shoper9-catalog.md
shoper9-customer.md
shoper9-customer-price-group.md
shoper9-barcode.md
shoper9skill.md
tally-voucher.md
ux-index.md
ux-design-system.md
ux-billing-terminal.md
ux-backoffice-patterns.md
ux-operational-intelligence.md
```

---

## HOW TO USE THIS FILE

**Option A — Cursor / Windsurf / VS Code AI:**
Add this file to your `.cursorrules` or system prompt context.
Agent will auto-load it at session start.

**Option B — Claude / ChatGPT manual session:**
Paste this file content at the start of every new conversation
before giving any task.

**Option C — API / Custom agent:**
Include this file content in the `system` prompt.
Then include task-specific skill files in the first `user` message.

---

> "Memory, Not Code." — Build less, build right.
> © 2026 AITDL Network · All Rights Reserved
