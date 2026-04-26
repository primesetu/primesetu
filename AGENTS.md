/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# AGENTS.md — AI Agent Role Registry

> Protocol Version: 2.0.0 | Effective: April 2026

## MANDATORY RULE

Follow `aiprotocol.md` and `AI_GUIDELINES.md` WITHOUT EXCEPTION.
Before any response: read aiprotocol.md → apply ALL rules → load `skills/code-review-and-refine.md` → output 5-section format.

---

## PHASE CONTEXT (READ FIRST)

**Current active phase: PHASE 2**

- Phase 1 (PostgREST + Edge Functions) is COMPLETE. Do not write PostgREST patterns for new work.
- Phase 2 (FastAPI + SQLAlchemy 2 async) is the current standard for all new backend work.
- The DB schema does not change between phases — only the API layer changes.

---

## AGENT ROLES

### AGENT-BACKEND
**Owns:** `backend/` — FastAPI routers, SQLAlchemy models, Pydantic schemas, business logic

**Responsibilities:**
- New API endpoints following the pattern in `skills/add-api-endpoint.md`
- SQLAlchemy 2 async models in `backend/app/models/`
- Pydantic v2 request/response schemas in `backend/app/schemas/`
- Tally XML voucher generation (see `skills/tally-voucher.md`)
- GST computation logic — always integers (paise), never floats
- RLS policy verification before any new table is queried

**Must NOT touch:**
- `frontend/` — no React, no Tailwind, no TSX
- `supabase/migrations/` — coordinate with AGENT-DB before schema changes
- Design tokens or UI components

**Output check:** Every new endpoint must have a test case in `### 4. Test Cases`

---

### AGENT-FRONTEND
**Owns:** `frontend/src/` — React components, pages, hooks, Tailwind UI

**Responsibilities:**
- New pages following the pattern in `skills/add-react-page.md`
- Keyboard hotkey registration via `react-hotkeys-hook` (see `skills/hotkey-registration.md`)
- All menu items fetched from DB — never static arrays
- Offline fallback to IndexedDB for all structural UI data
- UI validated against `primesetu-shoper9-ui.html` before commit
- `npm run build` must produce 0 TypeScript errors

**Must NOT touch:**
- `backend/` — no Python, no FastAPI, no SQLAlchemy
- `supabase/migrations/` — coordinate with AGENT-DB
- Any auth token stored in `localStorage` or `sessionStorage` — ever

**Permission binding rule:**
```typescript
// WRONG ❌
if (user.role === 'admin') { ... }

// CORRECT ✅
if (user.hasPermission('billing.void')) { ... }
```

---

### AGENT-DB
**Owns:** `supabase/migrations/`, RLS policies, DB schema

**Responsibilities:**
- New migration files following `skills/add-db-migration.md`
- RLS policy for every new table — no table goes live without RLS
- Every `store_id` column must reference the auth context, never be hardcoded
- Schema changes must be backward compatible (Phase 2 API uses same schema as Phase 1)

**Must NOT touch:**
- Application code in `frontend/` or `backend/`
- `.env` files or secrets

**RLS template for every new table:**
```sql
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.new_table
  FOR ALL USING (store_id = (
    SELECT store_id FROM public.store_users
    WHERE user_id = auth.uid()
  ));
```

---

### AGENT-QA (Writer/Reviewer Pattern)

When AGENT-BACKEND or AGENT-FRONTEND produces code, AGENT-QA reviews it in a **fresh context window** (no shared memory with the writer).

**AGENT-QA checks:**
- All 5 output sections present
- File signature present on new files
- No banned dependencies introduced
- No hardcoded `store_id`
- No `localStorage`/`sessionStorage` for auth
- No `any` in TypeScript
- `npm run build` passes (frontend)
- RLS confirmed on any new table (backend)
- Shoper9 hotkey parity maintained (if UI change)

**AGENT-QA does NOT:**
- Rewrite the code — it returns a pass/fail verdict with specific line-level feedback
- Merge or commit — human review is always the final gate

**Mandatory Self-Review:** Every agent MUST load `skills/code-review-and-refine.md` and run the 4-phase self-review before presenting code in Section 3. AGENT-QA reviews the output AFTER this self-review has already run.

---

## COLLISION AVOIDANCE RULES

When two agents work in the same session:

1. **Never write to the same file simultaneously.** If AGENT-BACKEND needs a new DB column, it must hand off to AGENT-DB and wait.
2. **Schema is the contract.** AGENT-BACKEND and AGENT-FRONTEND both consume the Supabase schema. AGENT-DB owns the schema. No one modifies it without AGENT-DB involvement.
3. **API contract first.** AGENT-BACKEND defines the endpoint shape (Pydantic schema) before AGENT-FRONTEND writes the React Query hook. Not the other way around.

---

## DO NOT (EVER)

- Give code without Understanding + Plan sections first
- Skip Test Cases section
- Use `localStorage` for auth tokens
- Call `service_role` key from frontend
- Hardcoded `store_id`
- Use any DB other than Supabase PostgreSQL
- Create static menu arrays in React
- Bind UI to roles instead of permissions
- Write Phase 1 PostgREST patterns for new Phase 2 features
