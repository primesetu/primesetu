/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# AI_ATOMIC_RULES.md — Sovereign Law Registry
> **Protocol Version:** 3.0.0 | Effective: 2026-04-30
> **Scope:** ALL AI Agents — Large (GPT-4, Claude) AND Small (Flash, Haiku, Gemini-Mini)
> **Authority:** Jawahar R Mallah — System Architect, AITDL Network

---

## ⚡ CURRENT ACTIVE PHASE: **PHASE 2**
```
Phase 1 (PostgREST + Edge Functions) = COMPLETE. DEAD. DO NOT USE.
Phase 2 (FastAPI + SQLAlchemy 2 Async) = ACTIVE. THIS IS THE ONLY STANDARD.
DB Schema = UNCHANGED between phases. Only the API layer differs.
```

---

## 🔴 QUALITY GATE — THE 9/10 LAW

> **"No code ships below 9/10. Period."**

### HOW THE SELF-RATING WORKS

Before presenting ANY code, every AI agent MUST self-rate it on this scorecard:

| # | Criterion | Max Points |
|---|-----------|-----------|
| 1 | Follows Phase 2 (FastAPI, not PostgREST) | 1 |
| 2 | No hardcoded colors (uses `var(--token)`) | 1 |
| 3 | No `any` in TypeScript | 1 |
| 4 | No hardcoded `store_id` | 1 |
| 5 | No `localStorage` for auth | 1 |
| 6 | RLS verified on any new DB table | 1 |
| 7 | `hasPermission()` used (not `role ===`) | 1 |
| 8 | `try/catch` on all Supabase/API calls | 1 |
| 9 | All 5 output sections present | 1 |
| 10 | Test case written for every new function | 1 |

### MANDATORY SELF-RATING FORMAT

Every AI response with code MUST end with:
```
## ⚖️ CODE QUALITY GATE
| Score | X / 10 |
| Status | ✅ APPROVED (≥9) OR 🔴 BLOCKED (<9) |
| Failed Criteria | [list any criterion that scored 0] |
```

### GATE RULES

```
SCORE 10/10 → APPROVED. Ship it.
SCORE 9/10  → APPROVED. Note the 1 failed criterion.
SCORE 8/10  → BLOCKED. AI must rewrite before presenting.
SCORE ≤7/10 → BLOCKED. AI must restart from scratch.
```

> **Small AI Note:** If you cannot self-rate accurately, default to:
> "I am not confident this scores 9/10. Please review criterion [X]."
> This is ALWAYS better than presenting unrated code.

---

## 🔒 THE 15 ATOMIC RULES

> One line each. No exceptions. No "but". No "unless".

```
RULE-001: NEVER write `user.role === 'x'`. ALWAYS use `user.hasPermission('x')`.
RULE-002: NEVER hardcode colors. ALWAYS use `var(--token-name)` from index.css.
RULE-003: NEVER create static menu arrays. ALWAYS fetch from FastAPI backend.
RULE-004: NEVER store auth tokens in localStorage or sessionStorage. Ever.
RULE-005: NEVER use `any` in TypeScript. ALWAYS use explicit types/interfaces.
RULE-006: NEVER write PostgREST (`/rest/v1/`) patterns. ALWAYS use FastAPI.
RULE-007: NEVER touch frontend/ as AGENT-BACKEND. NEVER touch backend/ as AGENT-FRONTEND.
RULE-008: NEVER create a new DB table without an RLS policy.
RULE-009: NEVER hardcode store_id. ALWAYS derive from `auth.uid()` in RLS.
RULE-010: NEVER use `bg-white` or `text-black` in any component.
RULE-011: NEVER use emojis as UI icons. ALWAYS use Lucide React.
RULE-012: NEVER use `font-black` (900 weight). Max is `font-bold` (700).
RULE-013: ALWAYS wrap every Supabase/API call in `try/catch`.
RULE-014: ALWAYS provide IndexedDB fallback for structural UI data.
RULE-015: ALWAYS present code with a self-rating score. No score = INVALID response.
RULE-016: ONLY AI Data Grid (DataTable) allowed. Sync with Direct Entry rows. (skills/ai-grid-protocol.md)
```

---

## 🚦 PRE-CODE CHECKLIST (Run Before Writing Any Code)

### For AGENT-FRONTEND
```
[ ] I am working in frontend/src/ only
[ ] Colors use var(--token), not hex codes
[ ] No role-based checks (using hasPermission)
[ ] No static menu arrays
[ ] No localStorage for auth
[ ] npm run build will pass (no TypeScript errors)
[ ] Using AI Data Grid (DataTable) for all tabular data (RULE-016)
[ ] Self-rating scorecard is ready to fill
```

### For AGENT-BACKEND
```
[ ] I am working in backend/app/ only
[ ] Using FastAPI + SQLAlchemy 2 async (NOT PostgREST)
[ ] GST computed in paise (integers), never floats
[ ] Every Supabase call has try/catch
[ ] store_id from auth session, never hardcoded
[ ] Self-rating scorecard is ready to fill
```

### For AGENT-DB
```
[ ] I am working in supabase/migrations/ only
[ ] Every new table has RLS enabled
[ ] store_id column references auth context
[ ] Migration is backward compatible
[ ] Self-rating scorecard is ready to fill
```

---

## 📋 FILE OWNERSHIP — ONE-LINE MAP

```
AGENT-BACKEND  → OWNS: backend/app/           BANNED FROM: frontend/, supabase/
AGENT-FRONTEND → OWNS: frontend/src/           BANNED FROM: backend/, supabase/
AGENT-DB       → OWNS: supabase/migrations/    BANNED FROM: frontend/, backend/
```

---

## ❌ BANNED PATTERN LOOKUP TABLE

| ❌ BANNED | ✅ CORRECT |
|-----------|------------|
| `user.role === 'admin'` | `user.hasPermission('billing.void')` |
| `bg-[#1a2340]` | `bg-[var(--navy-deep)]` |
| `text-white` | `text-[var(--aside-text)]` |
| `const menus = [...]` | `const { data } = useQuery('menus', fetchMenus)` |
| `localStorage.setItem('token', x)` | Use Supabase session cookie only |
| `type foo = any` | `type foo = { id: string; name: string }` |
| `store_id = 'X01'` | `store_id = (SELECT store_id FROM store_users WHERE user_id = auth.uid())` |
| `fetch('/rest/v1/products')` | `GET /api/v1/products` (FastAPI) |
| `font-black` | `font-bold` |
| `rounded-[3.5rem]` | `rounded-2xl` |
| `<img src="emoji.png" />` | `<PackageIcon size={16} />` (Lucide) |
| `0.15 * price` (float GST) | `Math.round(price * 15) / 100` (paise) |

---

## 🔄 DESIGN_LOCK HIERARCHY (Conflict Resolution)

```
LEVEL 1 — HARD LOCK (NEVER touch without Architect sign-off):
  --bg-base, --text-primary, --accent, --pos-cta values

LEVEL 2 — SOFT LOCK (Allowed with commit note):
  Adding new tokens (--navy-deep, --teal-primary, etc.) to index.css

LEVEL 3 — FREE (No approval needed):
  Component-level classes, spacing, layout adjustments
```

---

## 📤 MANDATORY 5-SECTION OUTPUT FORMAT

Every AI response with code MUST have exactly these 5 sections:

```
### 1. Understanding the Request
[What the user asked for, in plain English]

### 2. Plan
[What files will be changed and why]

### 3. Implementation (Code)
[The actual code changes]

### 4. Test Cases
[At least 2 test scenarios to verify the change works]

### 5. Self-Review & Quality Gate
[Checklist + Score X/10 + Status APPROVED/BLOCKED]
```

> Missing ANY section = **INVALID RESPONSE**. The AI must regenerate.

---

## 🔁 THE AUTONOMOUS PIPELINE (For Complex Tasks)

```
1. Gap-Engine   → What is missing or broken?
2. Enforcer     → Does the fix violate any ATOMIC RULE?
3. Validator    → Does npm run build / pytest pass?
4. Critic       → Does it meet 9/10 Quality Gate?
5. Improver     → If <9, rewrite and re-score.
6. Loop         → Repeat until score ≥ 9. Only then present to user.
```

---

*"A rule that can be broken by a small AI is not a rule — it is a suggestion."*
*— SMRITI-OS Sovereign Governance Protocol v3.0*
