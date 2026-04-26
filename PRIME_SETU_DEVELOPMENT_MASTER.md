# PRIME SETU DEVELOPMENT MASTER REFERENCE
> Consolidated on April 2026



================================================================================
# FILE: aitdl.md
================================================================================

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

# aitdl.md — PrimeSetu Sovereign Identity Manifest
> Protocol Version: 2.1.0 | Effective: April 2026

> [!IMPORTANT]
> **MANDATORY CROSS-REFERENCE**
> This file is the identity manifest AND the operational runbook.
> You MUST also load: `AGENTS.md`, `aiprotocol.md`, `AI_GUIDELINES.md`.
> You MUST read the relevant skill file in `skills/` before any feature task.

---

## IDENTITY LOCK

You are operating inside **PrimeSetu** — an AITDL Network flagship Retail OS. It achieves 100% Shoper9-parity for Indian specialty retail (apparel, footwear, textile). It replaces legacy Windows clients with a modern, zero-cloud browser terminal.

Before generating ANY output:
1. Internalize this file completely
2. Load and apply `AGENTS.md`
3. Load and apply `aiprotocol.md`
4. Confirm all rules from `AI_GUIDELINES.md` are active
5. Load the relevant `skills/*.md` for the task at hand

---

## CURRENT PHASE STATUS

**Active Phase: PHASE 5** (Operational Intelligence & Predictive Logic)

| Phase | Status | What it means |
|-------|--------|---------------|
| Phase 1 | ✅ COMPLETE | PostgREST + Edge Functions. |
| Phase 2 | ✅ COMPLETE | FastAPI + SQLAlchemy 2 async Backend. |
| Phase 3 | ✅ COMPLETE | Inventory Master & Master Registry. |
| Phase 4 | ✅ COMPLETE | Sovereign Catalogue & Partners Matrix. |
| Phase 5 | 🔄 ACTIVE | Predictive Analytics (DoC), Auto-Print Bridge, Multi-lingual. |
| Phase 6 | ⏳ PENDING | HO Synchronization Pulse & Heartbeat. |

> [!TIP]
> All new work must strictly follow Phase 2+ patterns (FastAPI).

---

## SOVEREIGN STACK (NON-NEGOTIABLE)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite + TypeScript | Vanilla CSS + Tailwind. Strict mode. |
| Database | Supabase PostgreSQL | Direct interaction. RLS always on. |
| Auth | Supabase Auth | RBAC per store. No `service_role` on client. |
| API | Python 3.12 + FastAPI | SQLAlchemy 2 async standard. |
| Intelligence| Predictive Heuristics | Days of Cover (DoC) & Risk Analysis. |
| Hosting | Cloudflare (UI) + Render (API) | Sovereign Node deployment. |

---

## MANDATORY SELF-REVIEW (PROTOCOL v2)

Every code output MUST pass the 4-phase self-review from `skills/code-review-and-refine.md` before presentation.

---

## HOW TO RUN LOCALLY

### Unified Launcher
```bash
npm run dev
```

### Backend Manual
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Frontend Manual
```bash
cd frontend
npm run dev
```

---

## BANNED (ZERO EXCEPTIONS)

- `service_role` key on the frontend.
- `localStorage` / `sessionStorage` for auth tokens.
- Any ORM other than SQLAlchemy 2 async.
- Hardcoded `store_id` (derive from `auth.uid()`).
- Static menu arrays in React (must be DB-driven).
- Float for currency (always use `paise` as `INTEGER`).

---

## MANDATORY OUTPUT FORMAT

Every AI response MUST contain all 5 sections:
1. **Understanding**
2. **Plan**
3. **Code**
4. **Test Cases**
5. **Notes**

---

## FILE SIGNATURE (ALL NEW FILES)

Every new file MUST begin with the AITDL Network standard header:
```
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
```

---

## SHOPER9 PARITY REFERENCE

| Feature | Shoper9 key | PrimeSetu Status |
|---------|------------|------------------|
| New bill | F2 | ✅ |
| Suspend | F5 | ✅ |
| Recall | F8 | ✅ |
| Payment | F10 | ✅ |
| Dept. Sale | Alt+1 | ✅ |
| Stock Query| Alt+S | ✅ Phase 5 |

---

## GST / COMPLIANCE RULES

- All tax amounts are `paise` (integers).
- GST rates: 0, 5, 12, 18, 28.
- Tally XML sync: see `skills/tally-voucher.md`.

---

**© 2026 AITDL Network · All Rights Reserved**  
*"Memory, Not Code."*



================================================================================
# FILE: AGENTS.md
================================================================================

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



================================================================================
# FILE: aiprotocol.md
================================================================================

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

# AI PROTOCOL — PrimeSetu (STRICT ENFORCEMENT)

## THE 4-PHASE WORKFLOW
1. Explore   — Research codebase, read KIs, understand context
2. Plan      — Draft implementation_plan.md, get approval
3. Implement — Code in chunks, update task.md
4. Commit    — Verify, run tests, draft walkthrough.md

## OUTPUT FORMAT (MANDATORY)
1. Understanding  2. Plan  3. Code  4. Test Cases  5. Notes

## PRIMESETU-SPECIFIC RULES
- Always derive store_id from Supabase auth session
- Always verify RLS is enabled on every table before querying
- Always use TypeScript strict mode (no `any` allowed)
- Always handle Supabase error objects — never swallow silently
- Always use design tokens from aitdl.md for UI work

## FAILURE CONDITIONS → REGENERATE RESPONSE
- Missing any of the 5 output sections
- Missing file signature on new files
- Using banned dependencies
- Skipping test cases

## PROTOCOL: SOVEREIGN NAVIGATION & ACCESS CONTROL (MenuManager)
Whenever an AI Agent or Developer is tasked with modifying menus, navigation, or access control in PrimeSetu, the following rules MUST be applied WITHOUT EXCEPTION:

1. **NO HARDCODED MENUS (DYNAMIC ONLY)**
   - NEVER create static arrays (e.g., `const menus = [...]`) in React for system navigation.
   - All menu structures MUST be resolved dynamically from the FastAPI backend via Supabase PostgreSQL.

2. **SOVEREIGN OFFLINE FALLBACK (CRITICAL)**
   - The UI MUST NEVER CRASH if the backend is unreachable.
   - Any API call fetching structural UI data (Menus, Configurations) MUST wrap the network call in a `try/catch`.
   - The `catch` block MUST instantly fallback to `IndexedDB` (`idb`) to load the last known configuration.

3. **PERMISSIONS OVER ROLES (ANTI-EXPLOSION)**
   - NEVER bind a UI element directly to a role (e.g., `if user.role === 'admin'`).
   - ALWAYS bind UI elements to a specific permission (e.g., `if user.hasPermission('billing.access')`).
   - The backend is strictly responsible for mapping Roles -> Permissions.

4. **TERMINAL MODE HOTKEYS (KEYBOARD FIRST)**
   - The system is designed for high-speed retail checkout. Mice are secondary.
   - Every dynamic menu object returned by the database MUST include a `shortcut` property (e.g., `"shortcut": "F1"`).
   - The frontend MUST parse this property and register it with `react-hotkeys-hook`.



================================================================================
# FILE: AI_GUIDELINES.md
================================================================================

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

# AI Agent Coding Guidelines — PrimeSetu Sovereign Standard

## 1. The 4-Phase Workflow
Every task: Explore → Plan → Implement → Commit. No skipping.

## 2. Context Window Rule
If agent becomes repetitive or ignores rules — START A FRESH SESSION.

## 3. Verification is Non-Negotiable
- Unit tests for all business logic
- UI validated against primesetu-shoper9-ui.html reference
- `npm run build` must pass before any commit

## 4. Writer / Reviewer Pattern
Agent A writes. Agent B (fresh context) reviews. Prevents self-bias.

## 5. Human Review
Every AI change must be human-reviewed before merge.

> "Memory, Not Code." — Every line is a liability.

## 6. The Autonomous AI Orchestration Pipeline
PrimeSetu operates on a highly structured cognitive loop defined in `aitdl.md` as the AI Pipeline: `gap-engine → enforcer → validator → critic → improver → loop`. Any AI operating on this codebase must internalize and execute this loop to guarantee zero-defect commits.

### The 6-Step Pipeline Definition:
1. **Gap-Engine**: Scans the codebase to detect deltas between the current state and the required architecture (e.g., missing imports, undefined states, protocol violations).
2. **Enforcer**: Intercepts the proposed fix and forces it through the Sovereign Laws (`AGENTS.md`, `aiprotocol.md`). Rejects any approach violating the rules.
3. **Validator**: Executes structural checks (TypeScript compilation, SQL syntax, etc.) before assuming the code works.
4. **Critic**: Evaluates the code against institutional parity (Shoper 9 standards, Terminal Mode UX, Tailwind aesthetics).
5. **Improver**: Auto-refines and rewrites the code based on the Critic and Validator feedback.
6. **Loop**: If ANY stage fails, the process repeats. The loop breaks only upon 100% compliance.

### Case Study: The TS2741 Resolution
*How the pipeline self-corrected a deployment blocker:*
- **Gap-Engine**: Identified that the frontend deployment failed.
- **Validator**: Triggered `npm run build` and caught a TypeScript error (`TS2741: Property 'moduleName' is missing in type '{}'`).
- **Critic**: Recognized that injecting a hardcoded string would violate dynamic UI protocols, but leaving it undefined breaks the build.
- **Improver**: Refactored `ComingSoon.tsx` to make `moduleName` an optional parameter (`{ moduleName = 'Module' }`), perfectly satisfying both TypeScript strict mode and the UI requirements.
- **Loop Exit**: Ran `npm run build` again. Result: 0 errors. The AI officially reported the build as production-ready.



################################################################################
# SKILLS DIRECTORY CONSOLIDATION
################################################################################



--------------------------------------------------------------------------------
## SKILL: AGENTS.md
--------------------------------------------------------------------------------

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
Before any response: read aiprotocol.md → apply ALL rules → output 5-section format.

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
- Hardcode `store_id`
- Use any DB other than Supabase PostgreSQL
- Create static menu arrays in React
- Bind UI to roles instead of permissions
- Write Phase 1 PostgREST patterns for new Phase 2 features



--------------------------------------------------------------------------------
## SKILL: CLAUDE-patch.md
--------------------------------------------------------------------------------

/* ============================================================
 * CLAUDE.md PATCH — Add to your existing CLAUDE.md
 * Add Section A inside CLAUDE.md (after SOVEREIGN STACK section)
 * Add Section B inside your available_skills XML block
 * ============================================================ */

/* ============================================================
 * SECTION A — Paste inside CLAUDE.md
 * Location: After the "SOVEREIGN STACK" table, before "HOW TO RUN LOCALLY"
 * ============================================================ */

---

## SKILL AUTO-LOAD RULES

These skills load automatically based on task context.
Do NOT wait to be asked — load proactively.

| When you are about to... | Must load |
|--------------------------|-----------|
| Write any Python / FastAPI / SQLAlchemy code | `skills/code-review-and-refine.md` |
| Write any TSX / React component or hook | `skills/code-review-and-refine.md` |
| Write any SQL migration or RLS policy | `skills/code-review-and-refine.md` |
| Fix a bug reported by the user | `skills/code-review-and-refine.md` |
| Output Section 3 (Code) of any response | `skills/code-review-and-refine.md` |
| Work on billing, pricing, GST, loyalty logic | `skills/code-review-and-refine.md` |
| Work on Shoper9 parity modules (Phase 4) | `skills/shoper9-module-index.md` + `skills/code-review-and-refine.md` |
| Work on any UI component | `skills/ux-index.md` + `skills/code-review-and-refine.md` |

**Golden Rule:** If task produces code → `code-review-and-refine.md` runs. No exceptions.

---


/* ============================================================
 * SECTION B — Paste inside your available_skills XML
 * Add this <skill> block alongside your existing skill entries
 * ============================================================ */

<skill>
<name>
code-review-and-refine
</name>
<description>
ALWAYS load this skill before writing any code output — this is mandatory, not optional.
Auto-triggers on: any FastAPI endpoint, SQLAlchemy model, Pydantic schema, React component,
TypeScript hook, SQL migration, RLS policy, bug fix, or any Section 3 (Code) output.
Also triggers when user says: fix, bug, broken, error, wrong, not working, refine, review.
Runs a 4-phase self-review to catch: paise float bugs, store_id body leaks, missing RLS,
N+1 queries, any TypeScript types, missing await in async, Shoper9 hotkey violations,
hardcoded hex colours, permission-vs-role UI errors, and 12 other common AI code bugs.
Agent fixes all BLOCKING issues before presenting output. Reports results in Section 5.
</description>
<location>
skills/code-review-and-refine.md
</location>
</skill>



--------------------------------------------------------------------------------
## SKILL: CLAUDE.md
--------------------------------------------------------------------------------

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

# CLAUDE.md — PrimeSetu Sovereign Identity Manifest
> Protocol Version: 2.0.0 | Effective: April 2026

> [!IMPORTANT]
> **MANDATORY CROSS-REFERENCE**
> This file is the identity manifest AND the operational runbook.
> You MUST also load: `AGENTS.md`, `aiprotocol.md`, `AI_GUIDELINES.md`.
> You MUST read the relevant skill file in `skills/` before any feature task.

---

## IDENTITY LOCK

You are operating inside **PrimeSetu** — a Shoper9-parity Retail OS for Indian specialty retail (apparel, footwear, textile). It replaces Shoper9's legacy Windows client with a modern browser-based terminal that cashiers can operate with zero retraining.

Before generating ANY output:
1. Internalize this file completely
2. Load and apply `AGENTS.md`
3. Load and apply `aiprotocol.md`
4. Confirm all rules from `AI_GUIDELINES.md` are active
5. Load the relevant `skills/*.md` for the task at hand

---

## CURRENT PHASE STATUS

**Active Phase: PHASE 2** (as of commit ~52, April 2026)

| Phase | Status | What it means |
|-------|--------|---------------|
| Phase 1 | ✅ COMPLETE | Supabase PostgREST + Edge Functions. No Python. |
| Phase 2 | 🔄 ACTIVE | FastAPI + SQLAlchemy 2 async replaces PostgREST for complex logic. Same DB schema — zero migration needed. |
| Phase 3 | ⏳ PENDING | HO Telemetry, multi-store sync, PDT integration |

> Do NOT write Phase 1 PostgREST patterns for new features. Phase 2 FastAPI is the standard.

---

## SOVEREIGN STACK (NON-NEGOTIABLE)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite + TypeScript + Tailwind | Strict mode. No `any`. |
| Database | Supabase PostgreSQL | Cloud, direct. No Docker. RLS always on. |
| Auth | Supabase Auth | JWT + RBAC per store. Never expose `service_role` to frontend. |
| API | Python 3.12 + FastAPI + SQLAlchemy 2 async | Phase 2 active |
| Edge Logic | Supabase Edge Functions (Deno/TypeScript) | For lightweight serverless tasks only |
| AI Pipeline | gap-engine → enforcer → validator → critic → improver → loop | See AI_GUIDELINES.md |
| Hosting | Cloudflare Pages (Frontend) + Render (Backend) | render.yaml is source of truth for backend deploy |
| CI/CD | GitHub Actions | `.github/workflows/` |
| Dev OS | Windows 11 + Antigravity VSCode OSS 1.107.0 | Path separators matter in scripts |
| Offline | IndexedDB via `idb` library | Fallback for all structural UI data |

---

## HOW TO RUN LOCALLY

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp ../.env.example .env        # then fill in SUPABASE_URL, SUPABASE_KEY, JWT_SECRET
uvicorn app.main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local     # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Before any commit
```bash
cd frontend && npm run build   # must produce 0 TypeScript errors
```

---

## FOLDER STRUCTURE

```
primesetu/
├── backend/          # FastAPI app (Phase 2)
│   └── app/
│       ├── main.py
│       ├── routers/  # one file per domain (billing, inventory, reports...)
│       ├── models/   # SQLAlchemy 2 async models
│       └── schemas/  # Pydantic v2 request/response shapes
├── frontend/         # React 18 + Vite + TypeScript
│   └── src/
│       ├── pages/    # one folder per module
│       ├── components/
│       ├── hooks/    # React Query hooks — all API calls go here
│       └── lib/      # supabase client, utils
├── supabase/         # migrations + RLS policies
│   └── migrations/
├── skills/           # AI task templates — READ BEFORE CODING
├── docs/             # architecture decisions
├── .github/workflows/
├── CLAUDE.md         # ← you are here
├── AGENTS.md
├── aiprotocol.md
└── AI_GUIDELINES.md
```

---

## BANNED (ZERO EXCEPTIONS)

- `firebase` / `firestore` — ever
- `service_role` key on the frontend — ever
- `localStorage` / `sessionStorage` for auth tokens
- Any ORM other than SQLAlchemy 2 async (Phase 2+)
- Hardcoded `store_id` — always derive from Supabase auth context
- Direct DB mutations without RLS policies verified active
- `any` type in TypeScript
- Static menu arrays in React — all navigation is DB-driven
- Role-based UI bindings (`if role === 'admin'`) — use permissions instead

---

## DESIGN TOKENS

```
Navy:   #0D1B3E  (primary brand)
Saffron:#F4840A  (CTAs, hotkey badges)
Gold:   #F9B942  (highlights, success)
Cream:  #FAF7F2  (background)
```

Always use Tailwind tokens — never hardcode hex in `.tsx` components.
Token names: `brand-navy`, `brand-saffron`, `brand-gold`, `brand-cream`.

---

## GOLDEN RULE OF MUTATION

Every Supabase insert/update/delete MUST be followed by:
```typescript
const { error } = await supabase.from('table').upsert(data)
if (error) throw new Error(`[PrimeSetu] Mutation failed: ${error.message}`)
```

---

## MANDATORY OUTPUT FORMAT

Every AI response MUST contain all 5 sections. A response missing ANY section is INVALID and must be regenerated.

```
### 1. Understanding
[Restate what was asked and confirm the relevant context from codebase]

### 2. Plan
[Step-by-step approach before writing a single line of code]

### 3. Code
[The actual implementation]

### 4. Test Cases
[At minimum: happy path, error path, edge case]

### 5. Notes
[Assumptions made, follow-up tasks, risks]
```

---

## FILE SIGNATURE (ALL NEW FILES)

Every new file MUST begin with:
```
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
```

---

## SHOPER9 PARITY REFERENCE

The gold standard is `primesetu-shoper9-ui.html` in the root. Every UI change must be validated against it visually. Key parity requirements:

| Feature | Shoper9 key | PrimeSetu status |
|---------|------------|-----------------|
| New bill | F2 | ✅ |
| Suspend bill | F5 | ✅ |
| Recall bill | F8 | ✅ |
| Payment | F10 | ✅ |
| Dept. sale | Alt+1 | ✅ |
| Return/CN | — | ✅ Phase 2 |
| Stock query | — | ⏳ Phase 3 |

---

## GST / COMPLIANCE RULES

- All tax amounts are stored as `paise` (integer), never floats
- GST rates: 0%, 5%, 12%, 18%, 28% — no other values accepted
- Every invoice must carry: GSTIN of store, HSN code per line item, CGST+SGST breakdown (intrastate) or IGST (interstate)
- Tally XML sync: see `skills/tally-voucher.md`

---

## WHEN CONTEXT WINDOW GETS STALE

If the agent becomes repetitive, contradicts earlier decisions, or ignores rules:
**START A FRESH SESSION.** Re-load this file. Do not attempt to fix a confused session.

> "Memory, Not Code." — Every line is a liability. Build less, build right.



--------------------------------------------------------------------------------
## SKILL: add-api-endpoint.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: add-api-endpoint
 * ============================================================ */

# SKILL: Add a FastAPI Endpoint (Phase 2)

Read this file completely before writing any code.

---

## When to use this skill

Any time a new API route is needed in `backend/`. This skill covers the full
chain: Pydantic schema → SQLAlchemy model → router → error handling → test cases.

---

## Step 1 — Define the Pydantic schema first

File: `backend/app/schemas/<domain>.py`

```python
# backend/app/schemas/billing.py

from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal
from datetime import datetime

class SaleLineItem(BaseModel):
    product_id: UUID
    qty: int = Field(gt=0)
    unit_price_paise: int = Field(gt=0, description="Price in paise. Never float.")
    gst_rate: int = Field(ge=0, description="GST % as integer: 0,5,12,18,28 only")
    hsn_code: str

class CreateSaleRequest(BaseModel):
    store_id: UUID          # derived from auth — NEVER accept from client body
    cashier_id: UUID
    items: list[SaleLineItem]
    payment_mode: str       # "cash" | "upi" | "card"

class SaleResponse(BaseModel):
    sale_id: UUID
    invoice_no: str
    total_paise: int
    gst_paise: int
    created_at: datetime

    model_config = {"from_attributes": True}
```

**Rules:**
- Money is always `int` (paise). Never `float` or `Decimal` in schemas.
- `store_id` must come from the JWT auth context — never from the request body.
- GST rates are integers: 0, 5, 12, 18, 28. Reject anything else.

---

## Step 2 — Check/create the SQLAlchemy model

File: `backend/app/models/<domain>.py`

```python
# backend/app/models/billing.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
import uuid
from backend.app.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    cashier_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    invoice_no = Column(String, nullable=False, unique=True)
    total_paise = Column(Integer, nullable=False)
    gst_paise = Column(Integer, nullable=False)
    payment_mode = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default="now()")
```

---

## Step 3 — Write the router

File: `backend/app/routers/<domain>.py`

```python
# backend/app/routers/billing.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.auth import get_current_store_context
from backend.app.schemas.billing import CreateSaleRequest, SaleResponse
from backend.app.models.billing import Sale

router = APIRouter(prefix="/billing", tags=["billing"])

@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def create_sale(
    payload: CreateSaleRequest,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new sale. store_id is ALWAYS derived from JWT — never trusted from body.
    """
    # Override any client-supplied store_id with the one from JWT
    safe_store_id = store_ctx["store_id"]

    # Validate GST rates
    valid_gst_rates = {0, 5, 12, 18, 28}
    for item in payload.items:
        if item.gst_rate not in valid_gst_rates:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid GST rate: {item.gst_rate}. Must be one of {valid_gst_rates}"
            )

    # Compute totals in paise (integer math only)
    subtotal_paise = sum(i.unit_price_paise * i.qty for i in payload.items)
    gst_paise = sum(
        (i.unit_price_paise * i.qty * i.gst_rate) // 100
        for i in payload.items
    )
    total_paise = subtotal_paise + gst_paise

    sale = Sale(
        store_id=safe_store_id,
        cashier_id=payload.cashier_id,
        total_paise=total_paise,
        gst_paise=gst_paise,
        payment_mode=payload.payment_mode,
        invoice_no=await generate_invoice_no(db, safe_store_id),
    )

    db.add(sale)
    try:
        await db.commit()
        await db.refresh(sale)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"[PrimeSetu] Mutation failed: {str(e)}"
        )

    return sale
```

---

## Step 4 — Register the router in main.py

```python
# backend/app/main.py
from backend.app.routers import billing

app.include_router(billing.router, prefix="/api/v1")
```

---

## Step 5 — Write the React Query hook (frontend)

File: `frontend/src/hooks/use<Domain>.ts`

```typescript
// frontend/src/hooks/useBilling.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

interface CreateSalePayload {
  items: SaleLineItem[]
  paymentMode: 'cash' | 'upi' | 'card'
  // store_id is added server-side from JWT — do NOT include here
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSalePayload) =>
      apiClient.post('/billing/sales', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (error) => {
      console.error('[PrimeSetu] Sale creation failed:', error)
    },
  })
}
```

**Rules:**
- All API calls go through hooks — never `fetch()` directly in a component
- `store_id` is NEVER sent from the frontend
- Always handle `onError`

---

## Checklist before committing

- [ ] Pydantic schema defined with `store_id` derived from JWT
- [ ] Money values are `int` (paise), never float
- [ ] GST rate validated against `{0, 5, 12, 18, 28}`
- [ ] Router error handling uses `HTTPException` with descriptive messages
- [ ] Router registered in `main.py`
- [ ] React Query hook written for frontend consumption
- [ ] RLS policy confirmed active on any table touched
- [ ] Test cases written (happy path + invalid GST rate + auth failure)
- [ ] File signature present
- [ ] `npm run build` passes (if frontend files changed)



--------------------------------------------------------------------------------
## SKILL: add-db-migration.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: add-db-migration
 * ============================================================ */

# SKILL: Add a Supabase DB Migration

Read this file completely before writing any migration SQL.

---

## When to use this skill

Any time the database schema needs to change: new table, new column,
new index, new RLS policy, or data backfill.

---

## Step 1 — Create the migration file

```
supabase/migrations/<timestamp>_<description>.sql
```

Timestamp format: `YYYYMMDDHHMMSS` — use current UTC time.
Example: `20260426143000_add_inventory_audit_table.sql`

**Never modify an existing migration file.** Always create a new one.

---

## Step 2 — Migration file template

```sql
/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: add_inventory_audit_table
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id),
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    action      TEXT NOT NULL CHECK (action IN ('count', 'adjust', 'write_off')),
    qty_before  INTEGER NOT NULL,
    qty_after   INTEGER NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_inventory_audit_store_id
    ON public.inventory_audit(store_id);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_created_at
    ON public.inventory_audit(store_id, created_at DESC);

-- ============================================================
-- RLS (MANDATORY — no table goes live without RLS)
-- ============================================================

ALTER TABLE public.inventory_audit ENABLE ROW LEVEL SECURITY;

-- Store isolation: users can only see their own store's data
CREATE POLICY "store_isolation_select" ON public.inventory_audit
    FOR SELECT USING (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- Insert: only authenticated users of this store
CREATE POLICY "store_isolation_insert" ON public.inventory_audit
    FOR INSERT WITH CHECK (
        store_id = (
            SELECT store_id FROM public.store_users
            WHERE user_id = auth.uid()
            LIMIT 1
        )
    );

-- No UPDATE or DELETE on audit tables — audit is append-only
-- (Do NOT add UPDATE or DELETE policies on audit tables)

-- ============================================================
-- COMMENTS (helps future agents understand intent)
-- ============================================================

COMMENT ON TABLE public.inventory_audit IS
    'Append-only log of all inventory count and adjustment events per store.';

COMMENT ON COLUMN public.inventory_audit.qty_before IS
    'Stock quantity before this action. Stored as integer units.';

COMMENT ON COLUMN public.inventory_audit.qty_after IS
    'Stock quantity after this action. Stored as integer units.';
```

---

## Step 3 — Verify RLS is working

Before committing, test the policy manually in Supabase SQL editor:

```sql
-- Test as a specific user (replace UUID with a real test user)
SET request.jwt.claims = '{"sub": "user-uuid-here", "role": "authenticated"}';

-- Should return only rows for that user's store
SELECT * FROM public.inventory_audit LIMIT 5;

-- Should FAIL (return 0 rows) for a different store's data
SELECT * FROM public.inventory_audit
WHERE store_id = 'some-other-store-uuid';
```

---

## Rules for all migrations

**Money / quantities:**
- Money columns: `INTEGER` (paise). Never `DECIMAL`, `FLOAT`, or `NUMERIC`.
- Quantity columns: `INTEGER`. Never float.
- GST rates: `SMALLINT` with CHECK constraint `CHECK (gst_rate IN (0,5,12,18,28))`

**Identifiers:**
- All PKs: `UUID DEFAULT gen_random_uuid()`
- All FKs to stores: `store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE`
- Never use serial/integer PKs for new tables

**Timestamps:**
- Always `TIMESTAMPTZ` (with timezone), never `TIMESTAMP`
- Default: `DEFAULT now()`

**Constraints:**
- Add `CHECK` constraints for enum-like columns rather than creating separate enum types
- Add `NOT NULL` to every column that should never be null

**Indexes:**
- Always index `store_id` on multi-tenant tables
- Index `(store_id, created_at DESC)` on any table queried by date range
- Index foreign keys that will be used in JOINs

**RLS — non-negotiable:**
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on every new table
- At minimum: a SELECT policy scoped to `store_id` from `store_users`
- Audit tables: SELECT + INSERT only. No UPDATE. No DELETE.
- Never use `service_role` to bypass RLS in application code.

---

## Step 4 — Apply the migration

```bash
# Apply to local Supabase (if running locally)
supabase db push

# Or apply via Supabase dashboard SQL editor for cloud-only setups
# Copy-paste the migration SQL and run it
```

---

## Step 5 — Update SQLAlchemy model (Phase 2)

After the migration is applied, update or create the corresponding model:

```python
# backend/app/models/inventory.py

class InventoryAudit(Base):
    __tablename__ = "inventory_audit"

    id         = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id   = Column(PGUUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    product_id = Column(PGUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    user_id    = Column(PGUUID(as_uuid=True), nullable=False)
    action     = Column(String, nullable=False)
    qty_before = Column(Integer, nullable=False)
    qty_after  = Column(Integer, nullable=False)
    note       = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default="now()")
```

---

## Checklist before committing

- [ ] Migration file named `<timestamp>_<description>.sql`
- [ ] `ENABLE ROW LEVEL SECURITY` present
- [ ] SELECT policy scoped to `store_id` from `store_users`
- [ ] Money columns are `INTEGER` (paise) — not float
- [ ] `store_id` indexed
- [ ] `(store_id, created_at DESC)` index on date-queried tables
- [ ] Migration tested in Supabase SQL editor
- [ ] Corresponding SQLAlchemy model updated
- [ ] No existing migration files modified
- [ ] File signature present



--------------------------------------------------------------------------------
## SKILL: add-react-page.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: add-react-page
 * ============================================================ */

# SKILL: Add a React Page / Module

Read this file completely before writing any code.

---

## When to use this skill

Any time a new page or module is added to `frontend/src/pages/`.
This skill covers: route registration, hotkey binding, permission guard,
offline fallback, and the standard page shell.

---

## Step 1 — Create the page folder

```
frontend/src/pages/<ModuleName>/
├── index.tsx          ← main page component
├── components/        ← module-local components only
└── hooks/             ← module-local hooks (if needed)
```

---

## Step 2 — Write the page shell

```typescript
/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * © 2026 — All Rights Reserved
 * ============================================================ */

import { useHotkeys } from 'react-hotkeys-hook'
import { usePermission } from '@/hooks/usePermission'
import { useOfflineFallback } from '@/hooks/useOfflineFallback'

// PERMISSION CHECK — bind to permission, never to role
const REQUIRED_PERMISSION = 'inventory.access'  // change per module

export default function InventoryPage() {
  const { hasPermission, isLoading: authLoading } = usePermission(REQUIRED_PERMISSION)

  // Register Shoper9-parity hotkeys
  useHotkeys('f2', () => handleNewBill(),    { enableOnFormTags: true })
  useHotkeys('f5', () => handleSuspend(),    { enableOnFormTags: true })
  useHotkeys('f8', () => handleRecall(),     { enableOnFormTags: true })
  useHotkeys('f10', () => handlePayment(),   { enableOnFormTags: true })
  useHotkeys('alt+1', () => handleDeptSale(),{ enableOnFormTags: true })

  // Offline-first: load from IndexedDB if backend unreachable
  const { data: moduleConfig, isOffline } = useOfflineFallback(
    'inventory-config',          // IndexedDB key
    () => fetchInventoryConfig() // live fetch function
  )

  if (authLoading) return <LoadingTerminal />

  // Permission guard — never role guard
  if (!hasPermission) {
    return <AccessDenied permission={REQUIRED_PERMISSION} />
  }

  return (
    <div className="bg-brand-cream min-h-screen font-mono">
      {isOffline && (
        <div className="bg-brand-saffron text-white text-xs px-4 py-1">
          OFFLINE MODE — showing cached data
        </div>
      )}
      {/* page content */}
    </div>
  )
}
```

---

## Step 3 — Register the route in the router

File: `frontend/src/router.tsx` (or wherever routes are defined)

```typescript
import { lazy } from 'react'

const InventoryPage = lazy(() => import('@/pages/Inventory'))

// Add to routes array:
{
  path: '/inventory',
  element: <InventoryPage />,
  // No role check here — permission check is inside the page
}
```

---

## Step 4 — Dynamic menu entry (NEVER static)

The menu for this page comes from the database, not from a hardcoded array.
Add a row to the `menus` table via a Supabase migration:

```sql
-- In supabase/migrations/<timestamp>_add_inventory_menu.sql

INSERT INTO public.menus (label, path, icon, shortcut, permission, store_id)
VALUES ('Inventory', '/inventory', 'package', 'F3', 'inventory.access', NULL);
-- store_id NULL = available to all stores; set a UUID to restrict to one store
```

The frontend reads menus dynamically — see `useOfflineFallback` + `MenuManager`.

---

## Step 5 — The useOfflineFallback hook pattern

```typescript
// frontend/src/hooks/useOfflineFallback.ts

import { useEffect, useState } from 'react'
import { get, set } from 'idb-keyval'

export function useOfflineFallback<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    fetchFn()
      .then(async (fresh) => {
        setData(fresh)
        setIsOffline(false)
        await set(cacheKey, fresh)  // update IndexedDB cache
      })
      .catch(async () => {
        // Backend unreachable — fall back to IndexedDB
        const cached = await get<T>(cacheKey)
        if (cached) {
          setData(cached)
          setIsOffline(true)
        }
      })
  }, [cacheKey])

  return { data, isOffline }
}
```

**This hook is mandatory for all structural UI data fetches.**
The UI must NEVER crash if the backend is unreachable.

---

## Step 6 — Permission hook pattern

```typescript
// frontend/src/hooks/usePermission.ts

import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export function usePermission(permission: string) {
  const { user, isLoading } = useSupabaseUser()

  const hasPermission = user?.permissions?.includes(permission) ?? false

  return { hasPermission, isLoading }
}
```

---

## Hotkey reference (Shoper9 parity)

| Key | Action | Status |
|-----|--------|--------|
| F2 | New bill | ✅ Required on billing pages |
| F5 | Suspend bill | ✅ Required on billing pages |
| F8 | Recall bill | ✅ Required on billing pages |
| F10 | Payment / complete | ✅ Required on billing pages |
| Alt+1 | Department sale | ✅ Required on billing pages |
| F3 | Item search / barcode | ⏳ Implement |
| Esc | Cancel / back | ✅ All pages |

Every hotkey registration MUST use `{ enableOnFormTags: true }` — cashiers
type in input fields; hotkeys must work even when an input is focused.

---

## Checklist before committing

- [ ] Page uses `usePermission` — no role checks
- [ ] All Shoper9 hotkeys registered with `react-hotkeys-hook`
- [ ] `useOfflineFallback` used for any structural data fetch
- [ ] Route added to router
- [ ] Menu entry added via DB migration (not hardcoded in array)
- [ ] UI validated against `primesetu-shoper9-ui.html`
- [ ] No `any` TypeScript types
- [ ] `npm run build` passes with 0 errors
- [ ] File signature present on `index.tsx`



--------------------------------------------------------------------------------
## SKILL: code-review-and-refine.md
--------------------------------------------------------------------------------

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

# SKILL: Code Review & Refinement — Self-Review Before Output

---

## ⚡ AUTO-TRIGGER (Hybrid — reads automatically, no prompt needed)

This skill MUST be loaded when ANY of the following match:

**By task keywords:**
- endpoint, router, migration, schema, RLS, policy
- component, hook, page, cart, billing, barcode, scan
- price, GST, paise, loyalty, ledger, tally, voucher
- bug, fix, refine, review, broken, error, issue, wrong

**By output type:**
- You are about to write content under `### 3. Code`
- You just wrote a Python function, async def, or SQLAlchemy model
- You just wrote a `.tsx`, `.ts`, React component, or React Query hook
- You just wrote a SQL `CREATE TABLE`, `ALTER TABLE`, or `INSERT`
- User says "fix this", "something is wrong", "not working", "bug hai"

**By phase:**
- Any Phase 2 FastAPI/SQLAlchemy work
- Any Phase 4 Shoper9 module work (Item, Customer, Catalog, Price Groups, Barcode)
- Any billing terminal UI change

**Rule:** When in doubt — load this skill. Cost is near zero. Missing a paise float bug costs real money.

---

## What this skill does

This is a **self-review skill for agents reviewing their own output** — not AGENT-QA's PR review role.

Run the 4-phase checklist below on your own code BEFORE presenting it in Section 3.
Fix all 🔴 BLOCKING issues. Note 🟡 IMPORTANT issues in Section 5 if not fixed.

---

## Severity Labels

| Label | Meaning | Required Action |
|-------|---------|----------------|
| 🔴 BLOCKING | Data corruption, security breach, wrong financial output | FIX before output — zero exceptions |
| 🟡 IMPORTANT | Bugs, test failures, UX breakage | Fix if < 5 lines; else flag in Notes |
| 🔵 NIT | Style, readability, minor improvements | Fix opportunistically or skip |
| ✅ PASS | Correct and well-structured | Note it — don't second-guess good code |

---

## Phase 1 — PrimeSetu Non-Negotiables (ALWAYS check first)

Violation here = 🔴 BLOCKING, always.

### Money & GST
- [ ] 🔴 All monetary values are `INTEGER` (paise). Zero `float`, `Decimal`, `Numeric`.
- [ ] 🔴 GST rate validated server-side against `{0, 5, 12, 18, 28}` on every write.
- [ ] 🔴 Paise arithmetic uses `//` not `/` in Python — no accidental float.
- [ ] 🔴 Tally XML uses `paise_to_rupees()` helper — never raw division.
- [ ] 🔴 Frontend: no `.reduce()` or `.map()` that produces float from price * qty.

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

## Phase 2 — Backend Deep Check (FastAPI + SQLAlchemy 2 async)

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
- [ ] 🔵 Response schemas use `model_config = {"from_attributes": True}` — not old `class Config`.
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

## Phase 3 — Frontend Deep Check (React 18 + TypeScript + Tailwind)

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

## Phase 4 — Bug Pattern Scan (mental checklist)

Always scan for these — most common AI code bugs:

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

## Self-Correction Loop

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

## Section 5 Output Template

Add this to every Section 5 (Notes) when this skill was run:

```
### Self-Review (code-review-and-refine)
- Phase 1 — Non-Negotiables : ✅ PASS  /  ❌ [issue fixed: ...]
- Phase 2 — Backend         : ✅ PASS  /  ⚠️ NOTED — [issue: ...]
- Phase 3 — Frontend        : ✅ PASS  /  N/A (backend-only task)
- Phase 4 — Bug Patterns    : ✅ PASS  /  ❌ [bug found and fixed: ...]
- Corrections made          : [list what was fixed before output, or "none needed"]
```

---

## Shoper9 Parity Checklist (for UI changes)

Before any UI output, validate against `primesetu-shoper9-ui.html`:

- [ ] Item name max 40 chars enforced in form + DB constraint
- [ ] Item code max 20 chars enforced
- [ ] Size × colour matrix renders correctly (not virtualised — max ~100 cells)
- [ ] Stock: qty=0 → gray, qty≤3 → amber, qty>3 → green
- [ ] Price group badge shown in billing (`STAFF PRICE`, `10% OFF MRP`)
- [ ] Customer outstanding > 0 → amber warning in billing customer panel
- [ ] Suspended bills: max 9 per till, bills > 2hrs → amber row

---

## Skill Self-Check

- [ ] This skill was loaded before Section 3 code was written
- [ ] All 🔴 BLOCKING items checked — none skipped
- [ ] Self-review result documented in Section 5
- [ ] No new items from CLAUDE.md banned list introduced
- [ ] If frontend changed: `npm run build` will pass with 0 TypeScript errors



--------------------------------------------------------------------------------
## SKILL: code-review-and-refine1.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: code-review-and-refine
 * ============================================================ */

# SKILL: Code Review & Refinement — Self-Review Before Output

Read this file completely before presenting ANY code to the user.
This skill is for AGENTS reviewing their OWN output, not AGENT-QA's PR review role.

Trigger: Before finalising any code in Section 3 (Code) of the mandatory output format.

---

## When to use this skill

Load this skill whenever you are about to output code that:
- Adds or modifies a FastAPI endpoint
- Adds or modifies a React/TypeScript component or hook
- Writes a Supabase migration SQL
- Changes any business logic (pricing, GST, billing cart, loyalty)

Run the 4-phase checklist below. Fix all BLOCKING issues before output.
IMPORTANT and NIT issues: fix if trivial, else note in Section 5 (Notes).

---

## Severity labels

| Label | Meaning | Required action |
|-------|---------|----------------|
| 🔴 BLOCKING | Will cause data corruption, security breach, or wrong financial output | FIX before output — no exceptions |
| 🟡 IMPORTANT | Will cause bugs, test failures, or UX breakage | FIX if < 5 lines change; else flag in Notes |
| 🔵 NIT | Style, readability, minor improvements | Fix opportunistically or note |
| ✅ PRAISE | Code is correct and well-structured | Note it — don't second-guess good code |

---

## Phase 1 — PrimeSetu Non-Negotiables (check FIRST, always)

These are project-wide rules from CLAUDE.md and AGENTS.md.
A violation here is always 🔴 BLOCKING.

### Money
- [ ] 🔴 All monetary values are `INTEGER` (paise). No `float`, `Decimal`, `Numeric` anywhere.
- [ ] 🔴 GST rate must be in `{0, 5, 12, 18, 28}` — validated server-side on every write.
- [ ] 🔴 No arithmetic on paise that could produce float: use `//` not `/` in Python.
- [ ] 🔴 Tally: `paise_to_rupees()` used for all XML output — never raw division.

### Auth & Multi-tenancy
- [ ] 🔴 `store_id` is derived from JWT auth context ONLY. Never from request body, path param, or query string.
- [ ] 🔴 No hardcoded store UUIDs anywhere in code.
- [ ] 🔴 `service_role` key is never referenced in frontend code.
- [ ] 🔴 No auth tokens in `localStorage` or `sessionStorage`.

### Database
- [ ] 🔴 Every new table has `ENABLE ROW LEVEL SECURITY` + store isolation policy.
- [ ] 🔴 RLS policy references `store_users` table for `auth.uid()` resolution.
- [ ] 🔴 Audit/ledger tables: SELECT + INSERT only. No UPDATE or DELETE policies.
- [ ] 🔴 No existing migration files modified — always create a new one.
- [ ] 🔴 Money columns: `INTEGER`. Quantity columns: `INTEGER`. Never float.

### TypeScript
- [ ] 🔴 Zero `any` types. Use `unknown` + type guard, or proper interface.
- [ ] 🔴 Permission-based UI: `user.hasPermission('x.y')` — never `user.role === 'admin'`.
- [ ] 🔴 Static menu arrays banned — all navigation is DB-driven.

---

## Phase 2 — Backend Deep Check (FastAPI + SQLAlchemy 2)

### Async correctness
- [ ] 🟡 All DB calls use `await` — no sync SQLAlchemy calls in async routes.
- [ ] 🟡 `await db.commit()` followed by `await db.refresh(obj)` for newly created records.
- [ ] 🟡 `await db.rollback()` inside the `except` block on commit failures.
- [ ] 🔵 Use `text()` with named params `{"key": val}` — no f-string SQL (SQL injection risk).

### Error handling
- [ ] 🟡 All `HTTPException` calls have a descriptive `detail` string prefixed with `[PrimeSetu]`.
- [ ] 🟡 No bare `except:` — catch specific exceptions.
- [ ] 🔵 422 for validation failures, 409 for conflicts, 500 for unexpected DB errors.

### Pydantic v2
- [ ] 🔵 Use `model_config = {"from_attributes": True}` on response schemas (not `class Config`).
- [ ] 🔵 All Optional fields have explicit `= None` default.
- [ ] 🟡 Response schemas never expose internal fields (`store_id`, `created_at` unless required).

### Performance targets (check if new query added)
- [ ] 🟡 Barcode scan: single query via UNIQUE index. Verify `LIMIT 1` present.
- [ ] 🟡 Customer phone lookup: indexed column used. No full table scan.
- [ ] 🟡 Item search: `ILIKE` query uses trigram index (`gin_trgm_ops`). Not `LIKE '%x%'` on unindexed column.
- [ ] 🟡 Batch price resolution: single query for all items, not N individual queries (N+1 bug).

### Business logic
- [ ] 🔴 Price resolution order: price_level → discount_pct → MRP fallback. Never returns 0.
- [ ] 🟡 Loyalty redemption: cannot exceed available balance AND cannot exceed configurable % of invoice.
- [ ] 🟡 Tally XML: voucher total validated to be zero-sum before generating XML.
- [ ] 🔵 Customer code auto-generate: uses DB-level ordering, not Python `max()`.

---

## Phase 3 — Frontend Deep Check (React 18 + TypeScript + Tailwind)

### React Query
- [ ] 🟡 All API calls go through hooks in `hooks/` — never raw `fetch()` in component body.
- [ ] 🟡 `onError` handler present in every `useMutation`.
- [ ] 🔵 `queryKey` arrays are specific enough to invalidate correctly — not just `['items']`.

### Offline + UX
- [ ] 🟡 `useOfflineFallback` used for any structural data fetch (menus, config, lookup data).
- [ ] 🟡 Offline banner shown when `isOffline = true`.
- [ ] 🟡 Destructive actions (void, delete) disabled when offline.

### Hotkeys
- [ ] 🔴 F2 / F5 / F8 / F10 / Esc not repurposed for anything other than their Shoper9 meanings.
- [ ] 🟡 All `useHotkeys` calls have `{ enableOnFormTags: true }`.
- [ ] 🔵 New hotkeys added to HotkeyBar component for visibility.

### Design tokens
- [ ] 🟡 No hardcoded hex colours in `.tsx` — use `brand-navy`, `brand-saffron`, `brand-gold`, `brand-cream`.
- [ ] 🟡 All prices, quantities, item codes, barcodes use `font-mono`.
- [ ] 🔵 No `font-sans` on monetary values.

### Billing terminal specific
- [ ] 🔴 Running total always visible — never in a scroll container, never animated away.
- [ ] 🟡 Voided lines: strikethrough display, NOT removed from DOM (audit trail).
- [ ] 🟡 Barcode scan adds to cart with ZERO confirmation dialog.
- [ ] 🔵 Payment screen is full-screen overlay, not a modal.

### Indian context
- [ ] 🔵 Large amounts shown in lakh/crore format — `₹3.2L` not `₹3,20,000`.
- [ ] 🔵 GST breakdown shows CGST+SGST (not single "Tax" line).
- [ ] 🔵 No hardcoded English label strings — use `useLanguage()` hook.

---

## Phase 4 — Self-Correction Loop

After running Phases 1–3:

```
If BLOCKING issues found:
  → Fix all of them NOW, before outputting code
  → Re-run Phase 1 check on the fixed code

If IMPORTANT issues found and fix is > 5 lines:
  → Note in Section 5 (Notes) with: "KNOWN ISSUE: <description> — fix in next iteration"

If NIT issues found:
  → Fix inline if trivial (rename a variable, add a comment)
  → Skip if it would distract from the main output

If ZERO issues found:
  → Note "Self-review passed all phases" in Section 5
```

---

## Bug categories to always mentally scan (from research)

These are the bug types most commonly missed in AI-generated code:

| Category | What to look for |
|----------|-----------------|
| Off-by-one | Loop bounds, array indexes, pagination offsets |
| Race condition | Concurrent cart updates, loyalty point double-redeem |
| Missing null check | Customer lookup returns `None` → code assumes object |
| N+1 query | Fetching price for each item in a loop instead of batch |
| Float money | `total = items.reduce((s, i) => s + i.price * i.qty, 0)` — float accumulation |
| Missing await | `db.execute(...)` without `await` in async function |
| Stale closure | `useEffect` depending on value not in dependency array |
| Permission bypass | UI shows button based on role, not permission |
| store_id leak | store_id accepted from frontend, not derived from JWT |
| RLS gap | New table created but RLS not enabled |

---

## Output format for self-review (add to Section 5)

```
### Self-Review Results
- Phase 1 (Non-Negotiables): ✅ PASS / ❌ FAIL — [list blocking issues fixed]
- Phase 2 (Backend): ✅ PASS / ⚠️ NOTED — [list important issues noted]
- Phase 3 (Frontend): ✅ PASS / ⚠️ NOTED — [list important issues noted]
- Phase 4 (Corrections made): [list what was fixed before output]
```



--------------------------------------------------------------------------------
## SKILL: shoper9-barcode.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-barcode
 * ============================================================ */

# SKILL: Shoper9 Barcode / GTIN Studio — Full Parity

Read this file completely before writing any barcode code.

---

## What Shoper9 Barcode module does (parity target)

| Shoper9 Feature | PrimeSetu | Phase |
|----------------|-----------|-------|
| EAN-13 barcode per SKU | ✅ Required | GS1-compliant check digit |
| Internal barcode (non-GS1) | ✅ Required | Store-defined prefix |
| Multiple barcodes per item | ✅ Required | E.g. brand barcode + internal |
| Barcode → item lookup at POS | ✅ Required | < 50ms, called on every scan |
| Barcode printing (ESC/POS) | ✅ Required | 80mm thermal, CODE128 or EAN-13 |
| GTIN generation (GS1 EAN-13) | ✅ Required | Phase 7 GTINStudio module |
| Barcode audit via PDT / CSV | ✅ Required | Bulk import/export |
| Size-colour-specific barcodes | ✅ Required | One barcode per size+colour variant |

---

## DB Schema

```sql
/* ============================================================
 * PrimeSetu — Barcode Schema
 * ============================================================ */

CREATE TABLE IF NOT EXISTS public.item_barcodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    barcode         TEXT NOT NULL,
    barcode_type    TEXT NOT NULL CHECK (barcode_type IN ('EAN13','CODE128','QR','INTERNAL')),
    size            TEXT,           -- NULL = applies to all sizes of this item
    colour          TEXT,           -- NULL = applies to all colours of this item
    is_primary      BOOLEAN NOT NULL DEFAULT false,  -- one primary per item
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, barcode)      -- barcode must be globally unique per store
);

ALTER TABLE public.item_barcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.item_barcodes
    FOR ALL USING (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

-- CRITICAL: this index is the hot path for every POS scan
CREATE UNIQUE INDEX idx_barcodes_store_barcode
    ON public.item_barcodes(store_id, barcode);

CREATE INDEX idx_barcodes_item
    ON public.item_barcodes(item_id, store_id);
```

---

## EAN-13 check digit calculation

GS1 EAN-13 is 12 digits + 1 check digit. The check digit is mandatory.
Every generated barcode MUST be validated before saving.

```python
# backend/app/services/barcode.py

def calculate_ean13_check_digit(digits_12: str) -> str:
    """
    Calculate EAN-13 check digit from first 12 digits.
    GS1 standard: alternating weights 1 and 3, modulo 10.
    """
    if len(digits_12) != 12 or not digits_12.isdigit():
        raise ValueError(f"EAN-13 base must be exactly 12 digits, got: {digits_12!r}")

    total = sum(
        int(d) * (3 if i % 2 else 1)
        for i, d in enumerate(digits_12)
    )
    check = (10 - (total % 10)) % 10
    return str(check)


def generate_ean13(digits_12: str) -> str:
    """Return full 13-digit EAN-13 barcode string."""
    return digits_12 + calculate_ean13_check_digit(digits_12)


def validate_ean13(barcode: str) -> bool:
    """Validate a complete 13-digit EAN-13 barcode."""
    if len(barcode) != 13 or not barcode.isdigit():
        return False
    expected = calculate_ean13_check_digit(barcode[:12])
    return barcode[12] == expected


def generate_internal_barcode(store_prefix: str, item_seq: int, size_code: str = "") -> str:
    """
    Generate a store-internal CODE128 barcode.
    Format: {store_prefix}{item_seq:06d}{size_code}
    Example: PS000042L (PS = PrimeSetu prefix, 000042 = item seq, L = size)
    """
    if not store_prefix:
        store_prefix = "PS"
    base = f"{store_prefix}{item_seq:06d}{size_code}"
    return base.upper()
```

---

## GTIN Studio — bulk generation (Phase 7)

The implementation plan specifies: "Implement GTIN generation and validation logic" and "GTINStudio module for barcode management."

```python
# backend/app/routers/barcodes.py

@router.post("/barcodes/generate-ean13")
async def generate_ean13_for_item(
    item_id: UUID,
    gs1_company_prefix: str,        # 7-9 digit GS1 company prefix
    size: str | None = None,
    colour: str | None = None,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a GS1-compliant EAN-13 for an item/variant.

    GS1 EAN-13 structure:
    [Company prefix: 7-9 digits] + [Item ref: 3-5 digits] + [Check digit: 1 digit]
    Total must be exactly 13 digits.

    Uniqueness: check against item_barcodes before saving.
    If barcode already exists for this item+size+colour, return existing.
    """
    # Get next item reference number for this company prefix
    next_ref = await get_next_item_ref(db, store_ctx["store_id"], gs1_company_prefix)

    # Pad to 12 digits total
    digits_12 = (gs1_company_prefix + str(next_ref).zfill(13 - len(gs1_company_prefix) - 1))[:12]
    barcode = generate_ean13(digits_12)

    # Verify uniqueness across the store
    existing = await check_barcode_exists(db, store_ctx["store_id"], barcode)
    if existing:
        raise HTTPException(409, f"Barcode {barcode} already assigned to another item")

    new_barcode = ItemBarcode(
        store_id=store_ctx["store_id"],
        item_id=item_id,
        barcode=barcode,
        barcode_type="EAN13",
        size=size,
        colour=colour,
        is_primary=True,
    )
    db.add(new_barcode)
    await db.commit()
    return {"barcode": barcode, "valid": True}


@router.get("/barcodes/scan/{barcode}")
async def scan_barcode(
    barcode: str,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    HOT PATH — called on every barcode scan at POS terminal.
    Must return in < 50ms.

    Returns: item details + resolved size + colour + current stock qty.
    """
    result = await db.execute(
        text("""
            SELECT
                ib.barcode, ib.size, ib.colour,
                i.id AS item_id, i.item_code, i.item_name,
                i.mrp_paise, i.gst_rate, i.hsn_code,
                COALESCE(s.qty_on_hand, 0) AS qty_on_hand
            FROM public.item_barcodes ib
            JOIN public.items i ON i.id = ib.item_id
            LEFT JOIN public.item_stock s
                ON s.item_id = ib.item_id
                AND s.store_id = ib.store_id
                AND (ib.size IS NULL OR s.size = ib.size)
                AND (ib.colour IS NULL OR s.colour = ib.colour)
            WHERE ib.store_id = :store_id
              AND ib.barcode = :barcode
              AND ib.is_active = true
            LIMIT 1
        """),
        {"store_id": store_ctx["store_id"], "barcode": barcode}
    )
    item = result.mappings().first()
    if not item:
        raise HTTPException(404, f"Barcode not found: {barcode}")
    return dict(item)


@router.post("/barcodes/bulk-import")
async def bulk_import_barcodes(
    file: UploadFile,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    PDT / CSV bulk import.
    Expected CSV columns: item_code, barcode, barcode_type, size, colour
    Validates EAN-13 check digits before inserting.
    Skips duplicates (logs warning, does not fail).
    Returns: {imported: N, skipped: N, errors: [...]}
    """
```

---

## Barcode printing — ESC/POS (80mm thermal)

```python
# backend/app/services/escpos_print.py

def print_barcode_label(
    barcode: str,
    barcode_type: str,          # "EAN13" | "CODE128"
    item_name: str,
    mrp_paise: int,
    size: str | None,
    printer_ip: str,
    printer_port: int = 9100,
) -> None:
    """
    Print a barcode label to an ESC/POS thermal printer via TCP.
    Label format (80mm):
        ┌──────────────────────────────────┐
        │  ITEM NAME (max 40 chars)        │
        │  Size: L  Colour: Navy           │
        │  ||||||||||||||||||||||||||||    │
        │  4 7 1 2 3 4 5 6 7 8 9 0 1     │
        │  MRP: ₹1,299                    │
        └──────────────────────────────────┘

    ESC/POS commands used:
    - ESC @ : Initialize printer
    - GS k  : Print barcode (EAN-13 = m=2, CODE128 = m=73)
    - ESC a : Alignment (center = 1)
    - ESC E : Bold on/off
    - GS V  : Paper cut
    """
    import socket

    mrp_rupees = f"₹{mrp_paise // 100:,}"
    size_line = f"Size: {size}" if size else ""

    commands = bytearray()
    commands += b'\x1b\x40'                     # ESC @ init
    commands += b'\x1b\x61\x01'                 # center align
    commands += b'\x1b\x45\x01'                 # bold on
    commands += item_name[:40].encode() + b'\n'
    commands += b'\x1b\x45\x00'                 # bold off
    if size_line:
        commands += size_line.encode() + b'\n'

    if barcode_type == "EAN13" and len(barcode) == 13:
        commands += b'\x1d\x48\x02'             # HRI below barcode
        commands += b'\x1d\x68\x50'             # barcode height 80 dots
        commands += b'\x1d\x6b\x02'             # EAN-13 barcode
        commands += barcode.encode() + b'\x00'
    elif barcode_type == "CODE128":
        commands += b'\x1d\x6b\x49'             # CODE128
        data = barcode.encode()
        commands += bytes([len(data)]) + data

    commands += b'\n'
    commands += mrp_rupees.encode() + b'\n'
    commands += b'\x1d\x56\x41\x03'             # partial cut

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(3)
        s.connect((printer_ip, printer_port))
        s.sendall(commands)


@router.post("/barcodes/print")
async def print_barcode(
    barcode: str,
    copies: int = Query(default=1, ge=1, le=100),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """Print barcode label to store's configured ESC/POS printer."""
    item = await get_item_by_barcode(db, store_ctx["store_id"], barcode)
    printer = await get_store_printer_config(db, store_ctx["store_id"])

    for _ in range(copies):
        print_barcode_label(
            barcode=barcode,
            barcode_type=item.barcode_type,
            item_name=item.item_name,
            mrp_paise=item.mrp_paise,
            size=item.size,
            printer_ip=printer.ip_address,
        )
    return {"printed": copies, "barcode": barcode}
```

---

## Frontend — GTINStudio page structure

```
frontend/src/pages/GTINStudio/
├── index.tsx                  ← barcode browser: search by barcode or item
├── BarcodeGenerator.tsx       ← generate EAN-13 / internal barcodes per item
├── BarcodePrintQueue.tsx      ← select items → print batch labels
├── BarcodeAudit.tsx           ← CSV upload for PDT bulk import
├── BarcodeValidator.tsx       ← paste/scan barcode → validate check digit
└── hooks/
    ├── useBarcodes.ts
    ├── useBarcodeGenerate.ts
    └── useBarcodePrint.ts
```

**Hotkeys on GTINStudio page:**

| Key | Action |
|-----|--------|
| F3 | Focus barcode scan/search input |
| F4 | Generate new barcode for selected item |
| F6 | Open print queue |
| Ctrl+P | Print selected barcodes |

---

## POS scanner integration

The billing terminal must handle barcode scanner input seamlessly:

```typescript
// frontend/src/pages/Billing/components/BarcodeScanner.tsx

/**
 * Barcode scanners send keystrokes ending in Enter.
 * Typical scan speed: 40-100 chars in < 100ms.
 * We detect scans by measuring keystroke velocity.
 */

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const SCAN_THRESHOLD_MS = 50  // keystrokes faster than this = scanner, not keyboard

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      const timeSinceLast = now - lastKeyTimeRef.current
      lastKeyTimeRef.current = now

      if (e.key === 'Enter' && bufferRef.current.length >= 6) {
        onScan(bufferRef.current)
        bufferRef.current = ''
        e.preventDefault()
        return
      }

      // If keystrokes are very fast → scanner input, accumulate
      if (timeSinceLast < SCAN_THRESHOLD_MS || bufferRef.current.length > 0) {
        if (e.key.length === 1) {
          bufferRef.current += e.key
        }
      } else {
        // Slow keystrokes → normal keyboard, clear buffer
        bufferRef.current = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onScan])
}

// Usage in billing terminal:
useBarcodeScanner(async (barcode) => {
  const item = await apiClient.get(`/barcodes/scan/${barcode}`)
  addToCart(item)   // resolves size+colour automatically from barcode
})
```

---

## CSV format for PDT bulk import

```
item_code,barcode,barcode_type,size,colour
IT0042,4711234567890,EAN13,L,Navy Blue
IT0042,4711234567906,EAN13,XL,Navy Blue
IT0042,PS000042S,CODE128,S,Black
IT0043,4719876543210,EAN13,,
```

Rules:
- `barcode_type`: EAN13 | CODE128 | QR | INTERNAL
- `size` and `colour`: optional (blank = applies to all variants)
- EAN-13 barcodes: validate check digit on import, reject invalid
- Duplicate barcodes: skip with warning, do not fail the whole import

---

## Shoper9 parity checklist

- [ ] EAN-13 check digit calculated correctly (GS1 standard)
- [ ] Barcode uniqueness enforced per store (UNIQUE index)
- [ ] Multiple barcodes per item supported (brand + internal)
- [ ] Size+colour-specific barcodes resolve correct stock entry
- [ ] POS scan lookup < 50ms (UNIQUE index on barcode column)
- [ ] Scanner input detection (velocity-based keystroke detection)
- [ ] Internal barcode generation (store prefix + item seq + size code)
- [ ] ESC/POS label printing: EAN-13 and CODE128 on 80mm thermal
- [ ] Batch label printing (print queue with copy count)
- [ ] PDT CSV import: validates EAN-13 check digits, skips duplicates
- [ ] GTINStudio page with F3/F4/F6/Ctrl+P hotkeys
- [ ] `validate_ean13()` unit tested with known-good and known-bad barcodes
- [ ] RLS active on item_barcodes



--------------------------------------------------------------------------------
## SKILL: shoper9-catalog.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-catalog
 * ============================================================ */

# SKILL: Shoper9 Catalog (Master Registry) — Full Parity

Read this file completely before writing any Catalog/Registry code.

---

## What Shoper9 Catalog does (parity target)

The Catalog (called "Master Registry" in Phase 4 plan) is the unified command
centre for all master data. In Shoper9, this covers:

| Shoper9 Module | PrimeSetu Entity | Phase |
|---------------|-----------------|-------|
| Item Catalogue | `items` table | Phase 4 ✅ |
| Customer Master | `partners` (type=customer) | Phase 4 ✅ |
| Vendor / Supplier | `partners` (type=vendor) | Phase 4 ✅ |
| Salesperson | `partners` (type=salesperson) | Phase 4 ✅ |
| Department / Category | `departments` table | Phase 4 ✅ |
| Size Groups | `size_groups` table | Phase 4 ✅ |
| Payment Modes | `general_lookup` | Phase 4 ✅ |
| Tax Categories | `general_lookup` | Phase 4 ✅ |
| Colour Master | `general_lookup` | Phase 4 ✅ |
| Season / Collection | `general_lookup` | Phase 4 ✅ |

---

## DB Schema — Partner (unified entity)

```sql
/* ============================================================
 * PrimeSetu — Partner / Catalog Schema
 * ============================================================ */

-- Single table for Customers, Vendors, Salespersons (Shoper9 "Partner" model)
CREATE TABLE IF NOT EXISTS public.partners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_type    TEXT NOT NULL CHECK (partner_type IN ('customer','vendor','salesperson','both')),
    code            TEXT NOT NULL,                  -- Shoper9-style short code, e.g. "C0001"
    name            TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    gstin           TEXT,                           -- 15-char GSTIN for B2B customers
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    state_code      TEXT,                           -- 2-char state code for GST (e.g. "27" = Maharashtra)
    pincode         TEXT,
    credit_limit_paise INTEGER DEFAULT 0,
    credit_days     SMALLINT DEFAULT 0,
    price_group_id  UUID REFERENCES public.customer_price_groups(id),
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- GeneralLookup: dynamic system constants (replaces hardcoded enums)
CREATE TABLE IF NOT EXISTS public.general_lookup (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID REFERENCES public.stores(id) ON DELETE CASCADE,  -- NULL = system-wide
    category    TEXT NOT NULL,      -- 'payment_mode' | 'colour' | 'season' | 'size_group' | 'tax_category'
    code        TEXT NOT NULL,      -- short key, e.g. "UPI", "NVY", "SS26"
    label       TEXT NOT NULL,      -- display name, e.g. "UPI Payment", "Navy Blue"
    sort_order  SMALLINT DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    meta        JSONB,              -- extra props (e.g. colour_hex for colour entries)
    UNIQUE (store_id, category, code)
);

-- RLS
ALTER TABLE public.partners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_lookup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.partners
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation_or_system" ON public.general_lookup
    FOR SELECT USING (
        store_id IS NULL OR
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );
CREATE POLICY "store_isolation_write" ON public.general_lookup
    FOR INSERT WITH CHECK (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

-- Indexes
CREATE INDEX idx_partners_store_type   ON public.partners(store_id, partner_type);
CREATE INDEX idx_partners_store_code   ON public.partners(store_id, code);
CREATE INDEX idx_partners_phone        ON public.partners(store_id, phone);
CREATE INDEX idx_general_lookup_cat    ON public.general_lookup(store_id, category);
```

---

## Universal Search — the Catalog's killer feature

Phase 4 plan specifies: "Universal Search that spans all master data types."
This is the `Ctrl+K` Omnisearch + the catalogue search bar.

```python
# backend/app/routers/catalogue.py

@router.get("/catalogue/search")
async def universal_search(
    q: str = Query(min_length=2, max_length=50),
    types: list[str] = Query(default=["item", "customer", "vendor"]),
    limit: int = Query(default=10, le=50),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Searches across items (code + name), partners (name + phone + code).
    Returns mixed results grouped by type.
    Used by: Billing terminal item lookup, Ctrl+K command bar, Catalogue page.

    Performance target: < 150ms for stores with 50,000 items + 10,000 customers.
    Achieved via: PostgreSQL trigram indexes (pg_trgm extension).
    """
    store_id = store_ctx["store_id"]
    results = {"items": [], "customers": [], "vendors": []}

    if "item" in types:
        items = await db.execute(
            text("""
                SELECT id, item_code, item_name, mrp_paise, gst_rate
                FROM public.items
                WHERE store_id = :store_id
                  AND is_active = true
                  AND (item_code ILIKE :q OR item_name ILIKE :q)
                ORDER BY similarity(item_name, :raw_q) DESC
                LIMIT :limit
            """),
            {"store_id": store_id, "q": f"%{q}%", "raw_q": q, "limit": limit}
        )
        results["items"] = items.mappings().all()

    if "customer" in types:
        customers = await db.execute(
            text("""
                SELECT id, code, name, phone, loyalty_points
                FROM public.partners
                WHERE store_id = :store_id
                  AND partner_type IN ('customer', 'both')
                  AND is_active = true
                  AND (name ILIKE :q OR phone ILIKE :q OR code ILIKE :q)
                LIMIT :limit
            """),
            {"store_id": store_id, "q": f"%{q}%", "limit": limit}
        )
        results["customers"] = customers.mappings().all()

    return results
```

**Trigram index for performance (add to migration):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_items_name_trgm   ON public.items   USING GIN (item_name gin_trgm_ops);
CREATE INDEX idx_partners_name_trgm ON public.partners USING GIN (name gin_trgm_ops);
```

---

## Frontend — MasterRegistry page structure

```
frontend/src/pages/MasterRegistry/
├── index.tsx                  ← unified registry with tab/entity switcher
├── tabs/
│   ├── ItemsTab.tsx           ← links to ItemMaster page
│   ├── CustomersTab.tsx       ← links to Customer page
│   ├── VendorsTab.tsx
│   └── LookupTab.tsx          ← GeneralLookup editor (colours, seasons, payment modes)
├── components/
│   ├── UniversalSearchBar.tsx ← real-time search across all entity types
│   ├── RelationshipMatrix.tsx ← customer behaviour insights panel
│   └── InlineBulkEdit.tsx     ← spreadsheet-style price/tax revisions
└── hooks/
    └── useCatalogueSearch.ts  ← debounced universal search hook
```

**Hotkeys on MasterRegistry page:**

| Key | Action |
|-----|--------|
| Ctrl+K | Open Omnisearch (global command bar) |
| F3 | Focus universal search bar |
| F4 | New entity (context-aware: new item / new customer) |
| Tab | Switch between entity tabs |

---

## Relationship Matrix (Phase 4 intelligence layer)

Per the implementation plan: "Show stock velocity in Item Catalogue and loyalty insights in Customer Catalogue."

```python
@router.get("/catalogue/partners/{partner_id}/matrix")
async def get_partner_matrix(partner_id: UUID, ...):
    """
    Returns behavioural insights for a customer:
    - total_spend_paise (last 90 days)
    - visit_count (last 90 days)
    - favourite_category
    - loyalty_points
    - last_visit_date
    - average_basket_paise
    """

@router.get("/catalogue/items/{item_id}/velocity")
async def get_item_velocity(item_id: UUID, ...):
    """
    Returns stock velocity metrics:
    - avg_daily_sales (last 30 days)
    - days_of_cover = qty_on_hand / avg_daily_sales
    - last_sold_date
    - reorder_suggested: bool
    """
```

---

## GeneralLookup — seed data for new stores

When a new store is onboarded, seed these system-wide lookup values:

```sql
-- Payment modes
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'payment_mode', 'CASH', 'Cash',        1),
  (NULL, 'payment_mode', 'UPI',  'UPI',          2),
  (NULL, 'payment_mode', 'CARD', 'Card',         3),
  (NULL, 'payment_mode', 'CRED', 'Store Credit', 4);

-- GST tax categories
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'tax_category', 'GST0',  'GST Exempt (0%)',   1),
  (NULL, 'tax_category', 'GST5',  'GST 5%',            2),
  (NULL, 'tax_category', 'GST12', 'GST 12%',           3),
  (NULL, 'tax_category', 'GST18', 'GST 18%',           4),
  (NULL, 'tax_category', 'GST28', 'GST 28%',           5);
```

---

## Inline bulk edit (spreadsheet mode)

The implementation plan specifies "spreadsheet-like updates for price revisions."
Use `@tanstack/react-table` with editable cells:

```typescript
// InlineBulkEdit.tsx
// - Renders items as editable table rows
// - Changed cells highlight in amber
// - "Save All" button fires PATCH /items/bulk-price-update
// - Optimistic UI update via React Query mutation
// - Escape key discards unsaved changes
```

---

## Shoper9 parity checklist

- [ ] Partner model covers customer + vendor + salesperson in one table
- [ ] GeneralLookup provides all dynamic system constants (no hardcoded enums in code)
- [ ] Universal search spans items + customers + vendors
- [ ] Trigram indexes added for search performance (pg_trgm)
- [ ] Relationship matrix API returns customer behavioural insights
- [ ] Item velocity API returns days-of-cover prediction
- [ ] Inline bulk edit for price revisions
- [ ] Ctrl+K Omnisearch wired to universal search endpoint
- [ ] New store onboarding seeds GeneralLookup with default payment modes + GST categories
- [ ] RLS active on all catalog tables



--------------------------------------------------------------------------------
## SKILL: shoper9-customer-price-group.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-customer-price-group
 * ============================================================ */

# SKILL: Shoper9 Customer Price Groups — Full Parity

Read this file completely before writing any price group code.

---

## What Shoper9 Customer Price Groups does (parity target)

Price groups allow different customers to see different prices for the same item.
This is one of Shoper9's most-used features in apparel retail (trade, wholesale, staff discounts).

| Shoper9 Feature | PrimeSetu | Notes |
|----------------|-----------|-------|
| Named price groups | ✅ Required | "Retail", "Wholesale", "Staff", "VIP" etc. |
| Price group → price level mapping | ✅ Required | Each group uses one of the item_price_levels |
| Customer assigned to price group | ✅ Required | FK on partners table |
| Billing auto-resolves price from group | ✅ Required | Critical path in billing terminal |
| Fallback to MRP if no group | ✅ Required | Default behaviour |
| Discount % override per group | ✅ Required | Alternatively: fixed % off MRP |
| Time-bound price groups | ⏳ Phase 5 | Seasonal promotions |

---

## DB Schema

```sql
/* ============================================================
 * PrimeSetu — Customer Price Groups Schema
 * ============================================================ */

CREATE TABLE IF NOT EXISTS public.customer_price_groups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,              -- "Wholesale", "Staff", "VIP"
    code                TEXT NOT NULL,              -- short code, e.g. "WHL", "STF", "VIP"
    price_level         TEXT CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    discount_pct        NUMERIC(5,2) DEFAULT 0,     -- flat % off MRP, e.g. 10.00 = 10% off
    -- priority: if price_level is set, use that. if discount_pct > 0, apply % off MRP.
    -- price_level takes precedence over discount_pct.
    is_taxable          BOOLEAN NOT NULL DEFAULT true,  -- some groups may be tax-exempt
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

ALTER TABLE public.customer_price_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.customer_price_groups
    FOR ALL USING (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

CREATE INDEX idx_price_groups_store ON public.customer_price_groups(store_id);
```

---

## Price resolution logic — the billing critical path

This function is called every time a line item is added to the billing cart.
It must be fast (in-memory once data is loaded) and deterministic.

```python
# backend/app/services/pricing.py

from uuid import UUID

async def resolve_item_price(
    item_id: UUID,
    price_group_id: UUID | None,
    db: AsyncSession,
    store_id: UUID,
) -> int:
    """
    Resolve the correct price for an item given a customer's price group.
    Returns price in PAISE (integer). Never float.

    Resolution order:
    1. If price_group has a price_level → look up item_price_levels for that level
    2. If price_group has discount_pct → apply % off MRP
    3. If no price_group or fallback → return MRP

    Always returns MRP if no specific price is found (never returns 0).
    """

    if price_group_id is None:
        # Walk-in customer or no group → MRP
        item = await get_item_mrp(db, item_id, store_id)
        return item.mrp_paise

    pg = await get_price_group(db, price_group_id, store_id)
    item = await get_item_with_prices(db, item_id, store_id)

    # Strategy 1: named price level
    if pg.price_level:
        level_price = next(
            (p.price_paise for p in item.price_levels if p.price_level == pg.price_level),
            None
        )
        if level_price:
            return level_price

    # Strategy 2: discount % off MRP
    if pg.discount_pct and pg.discount_pct > 0:
        discount_paise = int(item.mrp_paise * pg.discount_pct / 100)
        return item.mrp_paise - discount_paise

    # Fallback: MRP
    return item.mrp_paise
```

---

## Frontend — billing cart integration

The price group is loaded when a customer is selected at POS.
The cart must re-price all existing line items when the customer changes.

```typescript
// frontend/src/pages/Billing/hooks/useBillingCart.ts

function applyPriceGroup(
  cartItems: CartItem[],
  priceGroupId: string | null,
  itemPrices: Record<string, ItemPriceData>
): CartItem[] {
  return cartItems.map(item => ({
    ...item,
    unit_price_paise: resolvePrice(item.item_id, priceGroupId, itemPrices),
  }))
}

// When customer is selected:
// 1. Fetch customer price group from lookup result
// 2. Re-resolve price for all items already in cart
// 3. Show price change notification if any item price changed
```

**Price display in billing terminal:**
- Show the resolved price prominently
- Show "MRP: ₹XXX" in smaller text if a discount is applied
- If price group = "Staff", show "STAFF PRICE" badge in amber

---

## Pydantic schemas

```python
# backend/app/schemas/price_group.py

from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal
from typing import Optional, Literal

class PriceGroupCreate(BaseModel):
    name: str = Field(max_length=50)
    code: str = Field(max_length=10, pattern=r'^[A-Z0-9_]+$')
    price_level: Optional[Literal['mrp','wholesale','staff','custom_1','custom_2']] = None
    discount_pct: Decimal = Field(default=Decimal('0'), ge=0, le=100)
    is_taxable: bool = True

class PriceGroupResponse(BaseModel):
    id: UUID
    name: str
    code: str
    price_level: Optional[str]
    discount_pct: Decimal
    is_taxable: bool
    model_config = {"from_attributes": True}

class ItemPriceResolutionRequest(BaseModel):
    item_ids: list[UUID]            # batch resolve for efficiency
    price_group_id: Optional[UUID] = None

class ItemPriceResolutionResponse(BaseModel):
    item_id: UUID
    resolved_price_paise: int
    price_source: str               # "price_level:wholesale" | "discount_pct:10%" | "mrp"
```

---

## FastAPI endpoints

```python
# backend/app/routers/price_groups.py

@router.get("/price-groups", response_model=list[PriceGroupResponse])
async def list_price_groups(...):
    """List all active price groups for the store. Used in customer form + billing setup."""

@router.post("/price-groups", response_model=PriceGroupResponse, status_code=201)
async def create_price_group(payload: PriceGroupCreate, ...):
    """
    Create a new price group.
    Validate: cannot have BOTH price_level AND discount_pct > 0 simultaneously.
    """

@router.post("/price-groups/resolve-prices", response_model=list[ItemPriceResolutionResponse])
async def resolve_prices_batch(payload: ItemPriceResolutionRequest, ...):
    """
    Batch price resolution for billing cart.
    Takes a list of item_ids + price_group_id → returns resolved price per item.
    Called when: customer is selected, items are added to cart.
    Performance target: < 50ms for up to 50 items.
    """
```

---

## Seed data for new stores

Every store should start with these default price groups:

```sql
INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
VALUES
  (:store_id, 'Retail MRP',  'MRP',  'mrp',       0),
  (:store_id, 'Wholesale',   'WHL',  'wholesale',  0),
  (:store_id, 'Staff',       'STF',  'staff',      0),
  (:store_id, 'VIP 10% Off', 'VIP',  NULL,        10.00);
```

---

## Frontend — PriceGroups management page

```
frontend/src/pages/PriceGroups/
├── index.tsx          ← list all groups with customer count per group
├── PriceGroupForm.tsx ← create/edit: name, code, strategy selector
└── hooks/
    └── usePriceGroups.ts
```

**Hotkeys:**

| Key | Action |
|-----|--------|
| F4 | New price group |
| F3 | Search price groups |

---

## Shoper9 parity checklist

- [ ] Named price groups with code (MRP, WHL, STF, VIP etc.)
- [ ] Two pricing strategies: named price level OR discount % off MRP
- [ ] Cannot have both strategies active simultaneously (validated server-side)
- [ ] Customer assigned price group (FK on partners)
- [ ] Billing terminal resolves price in < 50ms (batch endpoint)
- [ ] Cart re-prices all items when customer / price group changes
- [ ] Price source shown in billing ("Staff Price", "10% Off MRP")
- [ ] Fallback to MRP when no price group or no matching level
- [ ] Default price groups seeded on store onboarding
- [ ] `is_taxable` flag for tax-exempt groups (e.g. export sales)
- [ ] RLS active on customer_price_groups



--------------------------------------------------------------------------------
## SKILL: shoper9-customer.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-customer
 * ============================================================ */

# SKILL: Shoper9 Customer Master — Full Parity

Read this file completely before writing any Customer module code.

---

## What Shoper9 Customer Master does (parity target)

| Shoper9 Feature | PrimeSetu | Notes |
|----------------|-----------|-------|
| Customer Code (unique) | ✅ Required | Auto-generate: C + 4-digit seq, e.g. C0042 |
| Name, Phone, Address | ✅ Required | Phone is primary lookup key at POS |
| GSTIN (B2B customers) | ✅ Required | Validate 15-char format |
| Credit limit + credit days | ✅ Required | Stored as paise |
| Price group assignment | ✅ Required | FK to customer_price_groups |
| Loyalty points balance | ✅ Required | Earned on purchase, redeemed at billing |
| Account statement | ✅ Required | Outstanding / payment history |
| Walk-in customer (no record) | ✅ Required | Special partner_id = NULL in sales |
| Customer search at POS by phone | ✅ Required | Must work in < 100ms |
| State code for interstate GST | ✅ Required | 2-digit state code for IGST routing |

---

## DB Schema

The `partners` table (from `shoper9-catalog.md`) covers core customer fields.
These additional tables complete the customer module:

```sql
/* ============================================================
 * PrimeSetu — Customer Module Additional Tables
 * ============================================================ */

-- Customer account ledger (credit/payment tracking)
CREATE TABLE IF NOT EXISTS public.customer_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id),
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('invoice','payment','credit_note','adjustment')),
    txn_ref         TEXT NOT NULL,          -- invoice_no or payment ref
    amount_paise    INTEGER NOT NULL,       -- positive = charge, negative = payment/CN
    balance_paise   INTEGER NOT NULL,       -- running balance after this entry
    txn_date        DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loyalty points ledger
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_id      UUID NOT NULL REFERENCES public.partners(id),
    txn_type        TEXT NOT NULL CHECK (txn_type IN ('earn','redeem','expire','adjust')),
    points          INTEGER NOT NULL,       -- positive = earn, negative = redeem/expire
    balance         INTEGER NOT NULL,       -- running balance
    sale_id         UUID REFERENCES public.sales(id),
    txn_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.customer_ledger
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.loyalty_ledger
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE INDEX idx_customer_ledger_partner ON public.customer_ledger(store_id, partner_id, txn_date DESC);
CREATE INDEX idx_loyalty_ledger_partner  ON public.loyalty_ledger(store_id, partner_id, txn_date DESC);
```

---

## Customer code auto-generation

Shoper9 uses sequential codes like C0001, C0042. PrimeSetu must do the same:

```python
# backend/app/routers/customer.py

async def generate_customer_code(db: AsyncSession, store_id: UUID) -> str:
    """
    Generate next sequential customer code for the store.
    Format: C + zero-padded 4-digit number. E.g. C0001, C0042, C1337.
    Thread-safe via DB-level locking.
    """
    result = await db.execute(
        text("""
            SELECT code FROM public.partners
            WHERE store_id = :store_id
              AND partner_type IN ('customer', 'both')
              AND code ~ '^C[0-9]{4}$'
            ORDER BY code DESC
            LIMIT 1
        """),
        {"store_id": store_id}
    )
    last = result.scalar_one_or_none()
    if last:
        next_num = int(last[1:]) + 1
    else:
        next_num = 1
    return f"C{next_num:04d}"
```

---

## POS customer lookup — the critical path

At billing terminal, cashier searches customer by phone number.
This must resolve in < 100ms. Pattern:

```python
@router.get("/customers/lookup")
async def lookup_customer_at_pos(
    phone: str = Query(min_length=6),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Fast phone lookup for POS billing terminal.
    Returns: customer name, code, loyalty_points, price_group_id, outstanding_balance.
    Used when cashier types/scans a phone number during billing.
    """
    result = await db.execute(
        text("""
            SELECT
                p.id, p.code, p.name, p.phone,
                p.loyalty_points, p.price_group_id, p.credit_limit_paise,
                COALESCE(SUM(cl.amount_paise), 0) AS outstanding_paise
            FROM public.partners p
            LEFT JOIN public.customer_ledger cl
                ON cl.partner_id = p.id AND cl.store_id = :store_id
            WHERE p.store_id = :store_id
              AND p.phone = :phone
              AND p.partner_type IN ('customer','both')
              AND p.is_active = true
            GROUP BY p.id
            LIMIT 1
        """),
        {"store_id": store_ctx["store_id"], "phone": phone}
    )
    customer = result.mappings().first()
    if not customer:
        return {"found": False}
    return {"found": True, **dict(customer)}
```

**Frontend billing integration:**
```typescript
// In billing terminal: when phone input loses focus or Enter pressed
const { data } = useQuery({
  queryKey: ['customer-lookup', phone],
  queryFn: () => apiClient.get(`/customers/lookup?phone=${phone}`),
  enabled: phone.length >= 6,
  staleTime: 30_000,
})

// If found → populate customer panel, apply price group
// If not found → offer "Add New Customer" quick-form inline
```

---

## Loyalty points — earn and redeem rules

Rules must be configurable per store via `store_config` table:

```python
# Earning: default = 1 point per ₹100 spent (configurable)
def calculate_points_earned(total_paise: int, rate: float = 0.01) -> int:
    """rate = points per paise. Default 0.01 = 1pt per ₹100."""
    return int(total_paise * rate)

# Redemption: default = 1 point = ₹1 discount (configurable)
def calculate_redemption_value(points: int, value_per_point_paise: int = 100) -> int:
    """Returns discount in paise."""
    return points * value_per_point_paise

# Validation: cannot redeem more than available balance
# Validation: cannot redeem more than X% of invoice value (configurable, default 50%)
```

**Loyalty ledger write — always atomic with sale:**
```python
# In create_sale(), after committing the sale record:
if payload.loyalty_points_redeemed > 0:
    await write_loyalty_entry(db, partner_id, 'redeem', -payload.loyalty_points_redeemed, sale.id)

points_earned = calculate_points_earned(sale.total_paise, store_config.loyalty_rate)
await write_loyalty_entry(db, partner_id, 'earn', points_earned, sale.id)

# Also update partners.loyalty_points (denormalized for fast POS lookup)
await db.execute(
    text("UPDATE public.partners SET loyalty_points = loyalty_points + :delta WHERE id = :pid"),
    {"delta": points_earned - payload.loyalty_points_redeemed, "pid": partner_id}
)
```

---

## GSTIN validation (B2B customers)

```python
import re

GSTIN_PATTERN = re.compile(
    r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
)

def validate_gstin(gstin: str) -> bool:
    """Validate 15-character Indian GSTIN format."""
    return bool(GSTIN_PATTERN.match(gstin.upper()))

def extract_state_code(gstin: str) -> str:
    """First 2 digits of GSTIN = state code for GST routing."""
    return gstin[:2]
```

---

## Frontend — Customer page structure

```
frontend/src/pages/Customer/
├── index.tsx              ← customer list with search by name/phone/code
├── CustomerForm.tsx       ← create/edit (phone, GSTIN, price group, credit)
├── CustomerProfile.tsx    ← full profile: ledger + loyalty + purchase history
├── LoyaltyPanel.tsx       ← points balance, earn/redeem history
└── hooks/
    ├── useCustomers.ts
    ├── useCustomerLookup.ts   ← fast POS phone lookup
    └── useCustomerLedger.ts   ← account statement
```

**Hotkeys:**

| Key | Action |
|-----|--------|
| F4 | New customer |
| F3 | Search customers |
| Enter (phone field in billing) | Trigger customer lookup |

---

## Shoper9 parity checklist

- [ ] Auto-generate customer code in format C0001
- [ ] Phone number is primary POS lookup key (< 100ms)
- [ ] GSTIN validated with 15-char regex
- [ ] State code extracted from GSTIN for interstate GST routing
- [ ] Credit limit and credit days stored and enforced at billing
- [ ] Price group assignment (FK to customer_price_groups)
- [ ] Loyalty points: earn on purchase, redeem at billing, running ledger
- [ ] Loyalty rules (rate, max redemption %) configurable per store
- [ ] Customer account ledger: invoices + payments + credit notes
- [ ] Walk-in customer (no partner_id) handled gracefully in sales
- [ ] Customer outstanding balance shown at POS lookup
- [ ] RLS active on customer_ledger and loyalty_ledger



--------------------------------------------------------------------------------
## SKILL: shoper9-item-master.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-item-master
 * ============================================================ */

# SKILL: Shoper9 Item Master (ItemMaster) — Full Parity

Read this file completely before writing any Item Master code.

---

## What Shoper9 Item Master does (parity target)

Shoper9's Item Master is the central product registry. Every SKU in the store
lives here. Key capabilities to match:

| Shoper9 Feature | PrimeSetu Status | Notes |
|----------------|-----------------|-------|
| Item Code (unique per store) | ✅ Required | Alphanumeric, max 20 chars |
| Item Name | ✅ Required | Max 40 chars (thermal printer constraint) |
| Department / Category / Sub-category | ✅ Required | 3-level hierarchy |
| Size group + size matrix | ✅ Required | E.g. "S/M/L/XL" or "28/30/32/34" |
| Colour attribute | ✅ Required | Free text + optional colour code |
| MRP (Maximum Retail Price) | ✅ Required | Stored as paise integer |
| Multiple price levels | ✅ Required | MRP, Wholesale, Staff, Custom |
| GST rate + HSN code | ✅ Required | GST: 0/5/12/18/28 only |
| Barcode (EAN-13 / internal) | ✅ Required | One item can have multiple barcodes |
| Supplier / Brand | ✅ Required | FK to Partner table |
| Stock opening balance | ✅ Required | Per size per colour per store |
| Item image | ⏳ Phase 5 | Cloudflare Images |
| Alternate units (pcs/set/dozen) | ⏳ Phase 5 | |

---

## DB Schema

Migration file: `supabase/migrations/<timestamp>_add_item_master.sql`

```sql
/* ============================================================
 * PrimeSetu — Item Master Schema
 * ============================================================ */

-- Department hierarchy
CREATE TABLE IF NOT EXISTS public.departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT NOT NULL,
    parent_id   UUID REFERENCES public.departments(id),  -- NULL = top level
    level       SMALLINT NOT NULL CHECK (level IN (1,2,3)),  -- 1=dept, 2=cat, 3=subcat
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- Size groups (e.g. "Apparel S/M/L", "Footwear 6-11")
CREATE TABLE IF NOT EXISTS public.size_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,                          -- "UK Footwear"
    sizes       TEXT[] NOT NULL,                        -- ["6","7","8","9","10","11"]
    UNIQUE (store_id, name)
);

-- Core item / product master
CREATE TABLE IF NOT EXISTS public.items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_code       TEXT NOT NULL,                      -- user-defined, unique per store
    item_name       TEXT NOT NULL CHECK (char_length(item_name) <= 40),
    department_id   UUID NOT NULL REFERENCES public.departments(id),
    brand           TEXT,
    supplier_id     UUID REFERENCES public.partners(id),
    size_group_id   UUID REFERENCES public.size_groups(id),
    colour          TEXT,                               -- e.g. "Navy Blue"
    colour_code     TEXT,                               -- e.g. "NVY"
    mrp_paise       INTEGER NOT NULL CHECK (mrp_paise > 0),
    cost_paise      INTEGER CHECK (cost_paise > 0),
    gst_rate        SMALLINT NOT NULL CHECK (gst_rate IN (0,5,12,18,28)),
    hsn_code        TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, item_code)
);

-- Price levels per item (MRP, Wholesale, Staff, etc.)
CREATE TABLE IF NOT EXISTS public.item_price_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    price_level     TEXT NOT NULL CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    price_paise     INTEGER NOT NULL CHECK (price_paise > 0),
    valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to        DATE,
    UNIQUE (item_id, price_level, valid_from)
);

-- Stock matrix: quantity per size per colour per location
CREATE TABLE IF NOT EXISTS public.item_stock (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    size            TEXT NOT NULL,                      -- must be in size_group.sizes array
    colour          TEXT NOT NULL,
    qty_on_hand     INTEGER NOT NULL DEFAULT 0,
    qty_reserved    INTEGER NOT NULL DEFAULT 0,         -- in open orders
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, store_id, size, colour)
);

-- RLS
ALTER TABLE public.departments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.size_groups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_price_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_stock        ENABLE ROW LEVEL SECURITY;

-- Store isolation policy (apply to all 5 tables)
CREATE POLICY "store_isolation" ON public.departments
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.size_groups
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.items
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.item_price_levels
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.item_stock
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

-- Indexes
CREATE INDEX idx_items_store_code     ON public.items(store_id, item_code);
CREATE INDEX idx_items_department     ON public.items(department_id);
CREATE INDEX idx_item_stock_item      ON public.item_stock(item_id, store_id);
CREATE INDEX idx_item_price_item      ON public.item_price_levels(item_id, price_level);
```

---

## Pydantic schemas

```python
# backend/app/schemas/item_master.py

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class SizeGroupCreate(BaseModel):
    name: str
    sizes: list[str] = Field(min_length=1)

class ItemCreate(BaseModel):
    item_code: str = Field(max_length=20)
    item_name: str = Field(max_length=40)
    department_id: UUID
    brand: Optional[str] = None
    supplier_id: Optional[UUID] = None
    size_group_id: Optional[UUID] = None
    colour: Optional[str] = None
    colour_code: Optional[str] = None
    mrp_paise: int = Field(gt=0)
    cost_paise: Optional[int] = Field(default=None, gt=0)
    gst_rate: int = Field(..., description="Must be 0, 5, 12, 18, or 28")
    hsn_code: str

class StockMatrixEntry(BaseModel):
    size: str
    colour: str
    qty_on_hand: int = Field(ge=0)

class ItemWithStock(ItemCreate):
    stock_matrix: list[StockMatrixEntry] = []

class ItemResponse(BaseModel):
    id: UUID
    item_code: str
    item_name: str
    mrp_paise: int
    gst_rate: int
    hsn_code: str
    total_stock: int           # sum across all sizes/colours
    model_config = {"from_attributes": True}
```

---

## FastAPI router — key endpoints

```python
# backend/app/routers/item_master.py

@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(payload: ItemWithStock, ...):
    """
    Create item + optional opening stock matrix in one atomic transaction.
    Validates: GST rate, HSN format, item_code uniqueness per store.
    """

@router.get("/items", response_model=list[ItemResponse])
async def list_items(
    department_id: UUID | None = None,
    search: str | None = None,      # searches item_code AND item_name
    is_active: bool = True,
    limit: int = 50,
    offset: int = 0,
    ...
):
    """
    Paginated item list. Powers the billing item search and catalogue grid.
    MUST return results in < 200ms for up to 50,000 items.
    """

@router.get("/items/{item_id}/stock-matrix")
async def get_stock_matrix(item_id: UUID, ...):
    """
    Returns size × colour grid with qty_on_hand and qty_reserved.
    This is the Shoper9 'Size-wise Stock' view.
    """

@router.patch("/items/{item_id}/price")
async def update_price_level(item_id: UUID, price_level: str, price_paise: int, ...):
    """
    Update a specific price level. Creates a new row with valid_from = today.
    Previous price row gets valid_to = yesterday (price history preserved).
    """

@router.post("/items/bulk-import")
async def bulk_import_from_pdt(file: UploadFile, ...):
    """
    PDT CSV import. Expected columns: item_code, item_name, mrp, gst_rate, hsn_code.
    See skills/shoper9-barcode.md for barcode column handling.
    """
```

---

## Frontend — ItemMaster page structure

```
frontend/src/pages/ItemMaster/
├── index.tsx              ← master list with universal search
├── ItemForm.tsx           ← create/edit form
├── StockMatrix.tsx        ← size × colour grid component
├── PriceLevels.tsx        ← price level manager
└── hooks/
    ├── useItems.ts        ← React Query: list + search
    ├── useItemMutations.ts← create / update / deactivate
    └── useStockMatrix.ts  ← size/colour grid data
```

**Hotkeys on ItemMaster page:**

| Key | Action |
|-----|--------|
| F3 | Open item search / new item |
| F4 | Edit selected item |
| Ctrl+K | Omnisearch (global command bar) |
| Esc | Cancel / close form |

**Item search in billing terminal:**
- Cashier types partial item code or name → debounced 300ms → hits `GET /items?search=`
- Must support barcode scan: scanner fires Enter after barcode → resolved via `GET /items?barcode=`
- Result populated into billing cart immediately

---

## Size × colour matrix UI

The stock matrix is a 2D grid: rows = sizes (from size_group), columns = colours.
Each cell shows `qty_on_hand`. Cells with 0 stock are greyed. Cells with < 3 are amber.

```typescript
// StockMatrix.tsx
interface MatrixCell {
  size: string
  colour: string
  qty_on_hand: number
  qty_reserved: number
}

// Render as HTML table — NOT a virtualised grid (max ~100 cells per item)
// Tailwind classes:
// qty === 0  → 'bg-gray-100 text-gray-400'
// qty <= 3   → 'bg-amber-50 text-amber-700'
// qty > 3    → 'bg-green-50 text-green-800'
```

---

## Shoper9 parity checklist

- [ ] Item code max 20 chars, unique per store
- [ ] Item name max 40 chars (fits 80mm thermal receipt)
- [ ] 3-level department hierarchy (dept → category → sub-category)
- [ ] Size group defines valid sizes; stock matrix validates against it
- [ ] MRP stored as paise integer
- [ ] Multiple price levels with date-range validity
- [ ] GST rate in `{0,5,12,18,28}` with HSN code
- [ ] Size × colour stock matrix with qty_on_hand + qty_reserved
- [ ] Billing terminal item search < 200ms
- [ ] PDT CSV import for bulk item creation
- [ ] Item deactivation (never delete — preserve sales history)
- [ ] RLS active on all 5 tables
- [ ] `npm run build` passes



--------------------------------------------------------------------------------
## SKILL: shoper9-module-index.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-module-index
 * ============================================================ */

# SKILL: Shoper9 Module Index — Load This First

This is the entry point for all Shoper9-parity work.
Read this file, then load the specific skill file for your task.

---

## Which skill to load

| Task involves... | Load this skill file |
|-----------------|---------------------|
| Items, SKUs, stock matrix, size groups, HSN codes | `skills/shoper9-item-master.md` |
| Catalog, departments, universal search, GeneralLookup, Partner model | `skills/shoper9-catalog.md` |
| Customers, loyalty points, credit, account ledger, GSTIN | `skills/shoper9-customer.md` |
| Price groups, wholesale pricing, staff pricing, discount % | `skills/shoper9-customer-price-group.md` |
| Barcodes, EAN-13, GTIN, scanner, label printing, PDT import | `skills/shoper9-barcode.md` |
| Billing terminal, cart, F2/F5/F8/F10 hotkeys, payment | `skills/add-react-page.md` + `skills/tally-voucher.md` |
| New FastAPI endpoint | `skills/add-api-endpoint.md` |
| New DB table / migration | `skills/add-db-migration.md` |
| New React page | `skills/add-react-page.md` |

---

## Shoper9 parity status — master tracker

| Module | DB Schema | Backend API | Frontend | Phase |
|--------|-----------|------------|----------|-------|
| Billing Terminal | ✅ | ✅ | ✅ | 2 Active |
| Item Master | 🔄 Skill defined | 🔄 Skill defined | ⏳ | 4 |
| Catalog / Master Registry | 🔄 Skill defined | 🔄 Skill defined | ⏳ | 4 |
| Customer Master | 🔄 Skill defined | 🔄 Skill defined | ⏳ | 4 |
| Customer Price Groups | 🔄 Skill defined | 🔄 Skill defined | ⏳ | 4 |
| Barcode / GTIN Studio | 🔄 Skill defined | 🔄 Skill defined | ⏳ | 7 |
| Tally Bridge | ✅ | ✅ | ⏳ | 3 |
| Till Management | ⏳ | ⏳ | ⏳ | 7 |
| MIS Reports | ⏳ | ⏳ | ⏳ | 7 |
| PDT Integration | ⏳ | ⏳ | ⏳ | 7 |
| Multi-store HO Sync | ⏳ | ⏳ | ⏳ | 3 |
| Predictive / DOC | ✅ logic | ⏳ | ✅ Dashboard | 5 |

---

## Cross-module data flows

Understanding how the modules connect prevents broken integrations.

```
GeneralLookup (shoper9-catalog)
    ↓ provides: payment modes, colours, seasons
    ↓ consumed by: Billing, Item Master, Customer forms

SizeGroups (shoper9-item-master)
    ↓ defines valid sizes for items
    ↓ consumed by: StockMatrix, Barcodes (size-specific), Billing cart

Items (shoper9-item-master)
    ↓ item_id is FK in:
        → item_stock (qty per size/colour)
        → item_price_levels (price per level)
        → item_barcodes (one-to-many)
        → sale_line_items (billing)

Partners (shoper9-catalog)
    ↓ partner_id is FK in:
        → items.supplier_id (vendor)
        → sales.partner_id (customer)
        → customer_ledger
        → loyalty_ledger

CustomerPriceGroups (shoper9-customer-price-group)
    ↓ price_group_id is FK in:
        → partners.price_group_id (customer assignment)
    ↓ consumed by: Billing (resolve_item_price)
    ↓ depends on: item_price_levels in item-master

ItemBarcodes (shoper9-barcode)
    ↓ barcode scan → resolves item_id + size + colour
    ↓ consumed by: Billing terminal (hot path: < 50ms)
    ↓ depends on: items (FK), item_stock (stock lookup after scan)
```

---

## Non-negotiable rules across ALL Shoper9 modules

These apply to every module without exception.
Do not re-read these in every skill file — they are inherited from this index.

**Money:**
- All monetary values stored as `INTEGER` (paise). Never float, Decimal, or Numeric.
- Display only: divide by 100 to show rupees. `₹{paise // 100:,}`
- GST rates: `{0, 5, 12, 18, 28}` only. Validate server-side on every write.

**IDs:**
- All PKs: `UUID DEFAULT gen_random_uuid()`
- `store_id` always derived from JWT auth context. Never from request body.
- Never hardcode a store_id.

**Soft deletes:**
- Items, Customers, Price Groups: use `is_active = false`. Never `DELETE`.
- Preserves sales history integrity.
- Audit tables (ledgers): append-only. No UPDATE. No DELETE.

**RLS:**
- Every new table: `ENABLE ROW LEVEL SECURITY` + store isolation policy.
- Test policy before merging (see `skills/add-db-migration.md`).

**Performance targets:**
- Barcode scan lookup: < 50ms
- Customer phone lookup at POS: < 100ms
- Item search (50k items): < 200ms
- Price resolution (batch 50 items): < 50ms
- All targets achievable via proper indexing — see individual skill files.

**Shoper9 UI parity:**
- Validate all UI changes against `primesetu-shoper9-ui.html`
- Item name max 40 chars (thermal printer constraint — hard limit)
- Item code max 20 chars
- Hotkeys must work when input fields are focused (`enableOnFormTags: true`)

---

## Recommended implementation order

Follow this order to avoid FK dependency failures:

```
1. GeneralLookup seed data         (shoper9-catalog)
2. SizeGroups table                (shoper9-item-master)
3. Departments table               (shoper9-item-master)
4. CustomerPriceGroups table       (shoper9-customer-price-group)
5. Partners table                  (shoper9-catalog / shoper9-customer)
6. Items table                     (shoper9-item-master)
7. ItemPriceLevels table           (shoper9-item-master)
8. ItemStock table                 (shoper9-item-master)
9. ItemBarcodes table              (shoper9-barcode)
10. CustomerLedger table           (shoper9-customer)
11. LoyaltyLedger table            (shoper9-customer)
```

Each step depends on the previous. AGENT-DB must apply migrations in this order.

---

## Commit message convention for Shoper9 work

```
feat(item-master): add size group and stock matrix tables + RLS
feat(catalog): implement universal search with trigram indexes
feat(customer): add loyalty ledger and earn/redeem endpoints
feat(price-group): add batch price resolution endpoint
feat(barcode): implement EAN-13 generator + POS scan hot path
feat(gtin-studio): add GTINStudio page with F3/F4/F6 hotkeys
```

Format: `feat(<module>): <what was done>`
Module names: `item-master`, `catalog`, `customer`, `price-group`, `barcode`, `gtin-studio`, `billing`, `tally`, `reports`



--------------------------------------------------------------------------------
## SKILL: tally-voucher.md
--------------------------------------------------------------------------------

/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: tally-voucher
 * ============================================================ */

# SKILL: Tally XML Voucher Generation

Read this file completely before writing any Tally integration code.

---

## When to use this skill

Any time you need to generate or modify the Tally ERP 9 / TallyPrime XML export.
This covers: sales vouchers, return (CN) vouchers, GST ledger mapping.

---

## Tally XML structure — Sales Voucher (GST compliant)

This is the canonical structure for a PrimeSetu → Tally sync.
Every field marked MANDATORY must be present or Tally will silently reject the voucher.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>{{ company_name }}</SVCURRENTCOMPANY>  <!-- MANDATORY -->
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">

            <!-- MANDATORY: Date in YYYYMMDD format -->
            <DATE>{{ sale_date | format_tally_date }}</DATE>

            <!-- MANDATORY: Unique voucher number — use PrimeSetu invoice_no -->
            <VOUCHERNUMBER>{{ invoice_no }}</VOUCHERNUMBER>

            <VCHTYPE>Sales</VCHTYPE>
            <NARRATION>PrimeSetu Sale — Store: {{ store_name }}</NARRATION>

            <!-- Party ledger (customer) -->
            <PARTYLEDGERNAME>Cash</PARTYLEDGERNAME>  <!-- or customer GSTIN if B2B -->

            <!-- MANDATORY: Ledger entries — must balance to zero -->
            <ALLLEDGERENTRIES.LIST>

              <!-- Debit: cash/bank received -->
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-{{ total_paise | paise_to_rupees }}</AMOUNT>  <!-- negative = debit in Tally -->

            </ALLLEDGERENTRIES.LIST>

            <!-- Sales ledger credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ subtotal_paise | paise_to_rupees }}</AMOUNT>

              <!-- INVENTORY ENTRIES — one per line item -->
              <INVENTORYENTRIES.LIST>
                <STOCKITEMNAME>{{ item.product_name }}</STOCKITEMNAME>
                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                <RATE>{{ item.unit_price_paise | paise_to_rupees }}/Nos</RATE>
                <AMOUNT>{{ item.line_total_paise | paise_to_rupees }}</AMOUNT>
                <ACTUALQTY>{{ item.qty }} Nos</ACTUALQTY>
                <BILLEDQTY>{{ item.qty }} Nos</BILLEDQTY>

                <!-- GST details per line item -->
                <ACCOUNTINGALLOCATIONS.LIST>
                  <LEDGERNAME>Sales</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>{{ item.line_total_paise | paise_to_rupees }}</AMOUNT>
                </ACCOUNTINGALLOCATIONS.LIST>
              </INVENTORYENTRIES.LIST>

            </ALLLEDGERENTRIES.LIST>

            <!-- CGST ledger (intrastate) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST @{{ item.gst_rate // 2 }}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ cgst_paise | paise_to_rupees }}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- SGST ledger (intrastate) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST @{{ item.gst_rate // 2 }}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{{ sgst_paise | paise_to_rupees }}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
```

---

## Python helper — generate_tally_voucher()

```python
# backend/app/tally/voucher.py

from datetime import date
from decimal import Decimal

def paise_to_rupees(paise: int) -> str:
    """Convert paise integer to Tally-format rupee string. Never use float."""
    rupees = paise // 100
    paisa = paise % 100
    return f"{rupees}.{paisa:02d}"

def format_tally_date(d: date) -> str:
    """Tally requires YYYYMMDD format."""
    return d.strftime("%Y%m%d")

def generate_sales_voucher(sale: dict) -> str:
    """
    Generate a Tally-importable XML string for a PrimeSetu sale.

    Args:
        sale: dict with keys:
            invoice_no, sale_date, store_name, company_name,
            items: list of {product_name, qty, unit_price_paise, gst_rate, line_total_paise}
            total_paise, subtotal_paise, cgst_paise, sgst_paise
            payment_mode: 'cash' | 'upi' | 'card'
    """
    # Validate totals balance (must be zero-sum in Tally)
    computed_total = sale['subtotal_paise'] + sale['cgst_paise'] + sale['sgst_paise']
    if computed_total != sale['total_paise']:
        raise ValueError(
            f"[PrimeSetu Tally] Voucher imbalance: "
            f"subtotal+gst={computed_total} != total={sale['total_paise']}"
        )

    # Validate GST rates
    valid_rates = {0, 5, 12, 18, 28}
    for item in sale['items']:
        if item['gst_rate'] not in valid_rates:
            raise ValueError(f"Invalid GST rate: {item['gst_rate']}")

    # Map payment mode to Tally ledger name
    payment_ledger_map = {
        'cash': 'Cash',
        'upi': 'UPI Receipts',
        'card': 'Card Receipts',
    }
    payment_ledger = payment_ledger_map.get(sale['payment_mode'], 'Cash')

    # Build XML (use a template engine in production — this is illustrative)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  ...
  <DATE>{format_tally_date(sale['sale_date'])}</DATE>
  <VOUCHERNUMBER>{sale['invoice_no']}</VOUCHERNUMBER>
  ...
</ENVELOPE>"""

    return xml
```

---

## GST ledger naming convention in Tally

PrimeSetu uses these exact ledger names. If the customer's Tally company uses different names, they must be configurable per store — never hardcoded.

| GST Rate | CGST Ledger | SGST Ledger | IGST Ledger |
|----------|------------|------------|------------|
| 5% | `CGST @2.5%` | `SGST @2.5%` | `IGST @5%` |
| 12% | `CGST @6%` | `SGST @6%` | `IGST @12%` |
| 18% | `CGST @9%` | `SGST @9%` | `IGST @18%` |
| 28% | `CGST @14%` | `SGST @14%` | `IGST @28%` |

These names must be stored in the `store_tally_config` table and fetched at sync time.

---

## Credit Note (Return) voucher

For returns, use `VCHTYPE="Credit Note"` and reverse the signs:
- Inventory quantities become negative
- The cash/UPI ledger becomes a credit (positive in Tally convention)
- Attach original invoice number in `<NARRATION>`

---

## Sync endpoint pattern

```python
@router.post("/tally/sync/{sale_id}")
async def sync_to_tally(
    sale_id: UUID,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate Tally XML for a sale and either:
    - Return it as a downloadable .xml file (manual import mode)
    - POST it to Tally's local HTTP server if configured (auto-sync mode)
    """
    sale = await get_sale_with_items(db, sale_id, store_ctx["store_id"])
    xml = generate_sales_voucher(sale)

    tally_config = await get_tally_config(db, store_ctx["store_id"])

    if tally_config and tally_config.auto_sync_url:
        # Auto-sync to Tally's local HTTP server (port 9000 by default)
        response = await http_post(tally_config.auto_sync_url, xml)
        return {"status": "synced", "tally_response": response}
    else:
        # Return as downloadable XML
        return Response(
            content=xml,
            media_type="application/xml",
            headers={"Content-Disposition": f"attachment; filename={sale.invoice_no}.xml"}
        )
```

---

## Checklist before committing

- [ ] All money values converted via `paise_to_rupees()` — never raw floats
- [ ] Voucher total validated to be zero-sum before generating XML
- [ ] GST rates validated against `{0, 5, 12, 18, 28}`
- [ ] Tally ledger names are configurable per store — not hardcoded
- [ ] `VOUCHERNUMBER` uses PrimeSetu `invoice_no` — no duplicates
- [ ] Credit Note returns use `VCHTYPE="Credit Note"` with negative quantities
- [ ] Test case: generate voucher → import to local Tally → verify no errors



--------------------------------------------------------------------------------
## SKILL: ux-backoffice-patterns.md
--------------------------------------------------------------------------------

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



--------------------------------------------------------------------------------
## SKILL: ux-billing-terminal.md
--------------------------------------------------------------------------------

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



--------------------------------------------------------------------------------
## SKILL: ux-design-system.md
--------------------------------------------------------------------------------

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



--------------------------------------------------------------------------------
## SKILL: ux-index.md
--------------------------------------------------------------------------------

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

## Suggested future UX improvements (not yet in skills)

These are identified gaps worth building skills for in Phase 5+:

1. **Touch/tablet mode** — Phase 5 mobile POS. Larger tap targets (56px min),
   swipe to void, pinch-zoom on stock matrix.

2. **Dark mode** — For night shift retail. Navy becomes the background,
   cream becomes text. Token-based system makes this achievable.

3. **Accessibility audit** — Screen reader support (ARIA labels on all
   interactive elements, particularly the hotkey bar).

4. **Print preview** — Before committing to thermal print, show a modal
   preview of what the receipt will look like.

5. **Cashier performance dashboard** — Per-session stats (bills processed,
   avg basket, voids). Visible to manager only. Discourages misconduct.

6. **Customer-facing display** — Second screen mode showing the cart total
   to the customer. Common in Indian retail setups.

