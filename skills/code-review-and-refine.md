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

# SKILL: Code Review & Refinement — Self-Review Before Output
> Version: 3.0.0 | Replaces: code-review-and-refine.md + code-review-and-refine1.md

## ⚡ PHASE 2+ ACTIVE — FastAPI + SQLAlchemy 2 ONLY. PostgREST = DEAD.

---

## WHEN TO LOAD THIS SKILL (AUTO-TRIGGER)

Load automatically when ANY of the following match — do not wait to be asked:

**By task:**
- endpoint, router, migration, schema, RLS, policy
- component, hook, page, cart, billing, barcode, scan
- price, GST, paise, loyalty, ledger, tally, voucher
- bug, fix, refine, review, broken, error, wrong

**By output type:**
- About to write content under `### 3. Code`
- Writing Python function, async def, or SQLAlchemy model
- Writing `.tsx`, `.ts`, React component, or React Query hook
- Writing SQL `CREATE TABLE`, `ALTER TABLE`, or `INSERT`
- User says "fix this", "not working", "bug hai"

**Golden Rule:** When in doubt — load this skill. Missing a paise float bug costs real money.

---

## 🔴 9/10 QUALITY GATE — MANDATORY SELF-RATING

Run this scorecard before presenting ANY code:

| # | Criterion | Pass? |
|---|-----------|-------|
| 1 | Phase 2 (FastAPI, not PostgREST) | ✅/❌ |
| 2 | No hardcoded colors (`brand-*` tokens only) | ✅/❌ |
| 3 | No `any` in TypeScript | ✅/❌ |
| 4 | No hardcoded `store_id` | ✅/❌ |
| 5 | No `localStorage` for auth | ✅/❌ |
| 6 | RLS on every new DB table | ✅/❌ |
| 7 | `hasPermission()` not `role ===` | ✅/❌ |
| 8 | `try/catch` on all API calls | ✅/❌ |
| 9 | All 5 output sections present | ✅/❌ |
| 10 | Test case for every new function | ✅/❌ |

```
SCORE 10/10 → APPROVED. Ship it.
SCORE 9/10  → APPROVED. Note the failed criterion.
SCORE 8/10  → BLOCKED. Rewrite, then re-score.
SCORE ≤7/10 → BLOCKED. Restart from scratch.
```

Output format: `## ⚖️ QUALITY GATE | Score: X/10 | Status: APPROVED / BLOCKED`

---

## SEVERITY LABELS

| Label | Meaning | Required Action |
|-------|---------|----------------|
| 🔴 BLOCKING | Data corruption, security breach, wrong financial output | FIX before output — zero exceptions |
| 🟡 IMPORTANT | Bugs, test failures, UX breakage | Fix if < 5 lines; else flag in Notes |
| 🔵 NIT | Style, readability, minor improvements | Fix opportunistically or skip |
| ✅ PASS | Correct and well-structured | Note it |

---

## PHASE 1 — PRIMESETU NON-NEGOTIABLES (CHECK FIRST, ALWAYS)

Violation here = 🔴 BLOCKING, always.

### Money & GST
- [ ] 🔴 All monetary values are `INTEGER` (paise). Zero `float`, `Decimal`, `Numeric`.
- [ ] 🔴 GST rate validated server-side against `{0, 5, 12, 18, 28}` on every write.
- [ ] 🔴 Paise arithmetic uses `//` not `/` in Python — no accidental float.
- [ ] 🔴 Tally XML uses `paise_to_rupees()` helper — never raw division.
- [ ] 🔴 Frontend: no `.reduce()` or `.map()` that produces float from price × qty.

### Auth & Multi-tenancy
- [ ] 🔴 `store_id` comes from JWT auth context ONLY — never from request body, path param, or query string.
- [ ] 🔴 No hardcoded store UUIDs anywhere.
- [ ] 🔴 `service_role` key never referenced in frontend code.
- [ ] 🔴 No auth tokens in `localStorage` or `sessionStorage`.

### Database & RLS
- [ ] 🔴 Every new table: `ENABLE ROW LEVEL SECURITY` + store isolation policy.
- [ ] 🔴 RLS policy uses `store_users` table for `auth.uid()` resolution.
- [ ] 🔴 Audit/ledger tables: SELECT + INSERT only. No UPDATE or DELETE policies.
- [ ] 🔴 No existing migration files modified — new file always.
- [ ] 🔴 Money columns: `INTEGER`. Quantity columns: `INTEGER`. No exceptions.

### TypeScript
- [ ] 🔴 Zero `any` types — use `unknown` + type guard, or proper interface.
- [ ] 🔴 Permission-based UI: `user.hasPermission('x.y')` — never `user.role === 'admin'`.
- [ ] 🔴 No static menu arrays — all navigation is DB-driven.

---

## PHASE 2 — BACKEND DEEP CHECK (FastAPI + SQLAlchemy 2 async)

### Async correctness
- [ ] 🟡 All DB calls use `await` — no sync SQLAlchemy in async routes.
- [ ] 🟡 `await db.commit()` followed by `await db.refresh(obj)` for new records.
- [ ] 🟡 `await db.rollback()` in `except` block on commit failures.
- [ ] 🔵 `text()` with named params `{"key": val}` — no f-string SQL.

### Error handling
- [ ] 🟡 All `HTTPException` calls have descriptive `detail` prefixed with `[PrimeSetu]`.
- [ ] 🟡 No bare `except:` — catch specific exceptions.
- [ ] 🔵 422 for validation, 409 for conflict, 500 for unexpected DB errors.

### Pydantic v2
- [ ] 🔵 Response schemas use `model_config = {"from_attributes": True}`.
- [ ] 🔵 All `Optional` fields have explicit `= None` default.
- [ ] 🟡 Response schemas don't leak internal fields unnecessarily.

### Performance (check when new query added)
- [ ] 🟡 Barcode scan: UNIQUE index used, `LIMIT 1` present — must be < 50ms.
- [ ] 🟡 Customer phone lookup: indexed column — no full table scan, < 100ms.
- [ ] 🟡 Item search: trigram index (`gin_trgm_ops`) used — not plain `LIKE '%x%'`, < 200ms.
- [ ] 🟡 Price batch resolution: single query for all items — no N+1 loop, < 50ms.
- [ ] 🟡 New indexes added for `store_id` on every new multi-tenant table.

### Business Logic
- [ ] 🔴 Price resolution order: price_level → discount_pct → MRP. Never returns 0.
- [ ] 🟡 Loyalty redemption: cannot exceed available balance AND store-configured max %.
- [ ] 🟡 Tally XML: voucher is zero-sum validated before generating.
- [ ] 🔵 Customer code (`C0001`) uses DB ordering — not Python `max()`.
- [ ] 🟡 EAN-13 barcodes: check digit validated before saving to DB.
- [ ] 🟡 Price group: cannot have BOTH `price_level` AND `discount_pct > 0` simultaneously.

---

## PHASE 3 — FRONTEND DEEP CHECK (React 18 + TypeScript + Tailwind)

### React Query
- [ ] 🟡 All API calls go through hooks in `hooks/` — no raw `fetch()` in component body.
- [ ] 🟡 `onError` handler present in every `useMutation`.
- [ ] 🔵 `queryKey` specific enough for correct invalidation.
- [ ] 🟡 `store_id` never sent from frontend in any API payload.

### Offline + UX
- [ ] 🟡 `useOfflineFallback` used for structural data (menus, config, lookup data).
- [ ] 🟡 Offline banner shown when `isOffline = true`.
- [ ] 🟡 Destructive actions (void, delete) disabled when offline.

### Hotkeys — Shoper9 Sacred Keys
- [ ] 🔴 F2 = New Bill only. F5 = Suspend only. F8 = Recall only. F10 = Pay only. Esc = Cancel only.
- [ ] 🔴 These CANNOT be repurposed for any other action — ever.
- [ ] 🟡 All `useHotkeys` calls have `{ enableOnFormTags: true }`.
- [ ] 🔵 New hotkeys added to HotkeyBar component for visibility.

### Design Tokens
- [ ] 🟡 No hardcoded hex in `.tsx` — use `brand-navy`, `brand-saffron`, `brand-gold`, `brand-cream`.
- [ ] 🟡 All prices, quantities, codes, barcodes: `font-mono` — non-negotiable.
- [ ] 🔵 No `font-sans` on monetary values.

### Billing Terminal Specific
- [ ] 🔴 Running total always visible — never in scroll container, never animated away.
- [ ] 🟡 Voided lines: strikethrough in DOM — NOT removed (audit trail).
- [ ] 🟡 Barcode scan → cart add: ZERO confirmation dialog. Instant.
- [ ] 🔵 Payment screen: full-screen overlay, not modal.
- [ ] 🟡 Cart re-prices ALL existing items when customer/price group changes.

### Indian Context
- [ ] 🔵 Large amounts: lakh/crore format — `₹3.2L` not `₹3,20,000`.
- [ ] 🔵 GST breakdown: CGST+SGST shown separately (not single "Tax" line).
- [ ] 🔵 No hardcoded English label strings — use `useLanguage()` hook.
- [ ] 🔵 Loyalty points: full number — `1,240 pts` not `1.24K pts`.

---

## PHASE 4 — BUG PATTERN SCAN (mental checklist)

| Bug Pattern | What to look for | Severity |
|-------------|-----------------|---------|
| Float money | `price * qty` without integer floor | 🔴 |
| Missing await | `db.execute(...)` without `await` | 🔴 |
| store_id from body | `payload.store_id` used instead of JWT context | 🔴 |
| RLS gap | New table without `ENABLE ROW LEVEL SECURITY` | 🔴 |
| N+1 query | Price/stock fetched in a loop per item | 🟡 |
| Stale closure | `useEffect` value not in dependency array | 🟡 |
| Null not handled | Customer lookup returns `None` → code assumes object | 🟡 |
| Off-by-one | Pagination offset, array index, loop bound | 🟡 |
| Race condition | Concurrent loyalty point redeem, cart qty update | 🟡 |
| Permission bypass | UI shows button based on role, not permission | 🔴 |
| any type | TypeScript `any` used for convenience | 🔴 |
| Hardcoded UUID | Store or config UUID embedded in code | 🔴 |

---

## SELF-CORRECTION LOOP

```
BLOCKING issues found?
  → Fix ALL now → re-run Phase 1 on fixed code → then output

IMPORTANT issues found, fix > 5 lines?
  → Note in Section 5: "KNOWN ISSUE: <desc> — fix in next iteration"

NIT issues found?
  → Fix inline if trivial (rename, add comment)
  → Skip if distracting from main output

ZERO issues found?
  → Note "Self-review: all phases passed" in Section 5
```

---

## SECTION 5 OUTPUT TEMPLATE

Add this to every Section 5 (Notes) when this skill was run:

```
### Self-Review (code-review-and-refine)
- Phase 1 — Non-Negotiables : ✅ PASS  /  ❌ [issue fixed: ...]
- Phase 2 — Backend         : ✅ PASS  /  ⚠️ NOTED — [issue: ...]
- Phase 3 — Frontend        : ✅ PASS  /  N/A (backend-only task)
- Phase 4 — Bug Patterns    : ✅ PASS  /  ❌ [bug found and fixed: ...]
- Corrections made          : [list what was fixed, or "none needed"]
```

---

## SHOPER9 PARITY CHECKLIST (for UI changes)

- [ ] Item name max 40 chars enforced in form + DB constraint
- [ ] Item code max 20 chars enforced
- [ ] Size × colour matrix renders correctly (not virtualised — max ~100 cells)
- [ ] Stock: qty=0 → gray, qty≤3 → amber, qty>3 → green
- [ ] Price group badge shown in billing (`STAFF PRICE`, `10% OFF MRP`)
- [ ] Customer outstanding > 0 → amber warning in billing customer panel
- [ ] Suspended bills: max 9 per till, bills > 2hrs → amber row

---

## SKILL SELF-CHECK

- [ ] This skill was loaded before Section 3 code was written
- [ ] All 🔴 BLOCKING items checked — none skipped
- [ ] Self-review result documented in Section 5
- [ ] No items from GOVERNANCE.md banned list introduced
- [ ] If frontend changed: `npm run build` will pass with 0 TypeScript errors
