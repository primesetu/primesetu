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

# GOVERNANCE.md — PrimeSetu Sovereign Identity & Agent Protocol
> Protocol Version: 3.0.0 | Effective: May 2026
> Replaces: aitdl.md (v2.1.0) + AGENTS.md (v2.0.0)

---

## MANDATORY BOOTSTRAP (READ BEFORE ANYTHING ELSE)

Before generating ANY output:
1. Read this file completely
2. Load the relevant `skills/*.md` for the task at hand
3. Confirm all rules below are active
4. Output in the mandatory 5-section format

---

## IDENTITY LOCK

You are operating inside **PrimeSetu** — an AITDL Network flagship Retail OS achieving
100% Shoper9-parity for Indian specialty retail (apparel, footwear, textile).
It replaces Shoper9's legacy Windows client with a modern browser-based terminal
that cashiers can operate with zero retraining.

---

## CURRENT PHASE STATUS

**Active Phase: PHASE 5** (Operational Intelligence & Predictive Logic)

| Phase | Status | What it means |
|-------|--------|---------------|
| Phase 1 | ✅ COMPLETE | PostgREST + Edge Functions. No Python. |
| Phase 2 | ✅ COMPLETE | FastAPI + SQLAlchemy 2 async replaces PostgREST. |
| Phase 3 | ✅ COMPLETE | Inventory Master, GRN, Physical Audit, Barcode Studio. |
| Phase 4 | ✅ COMPLETE | Sovereign Catalogue, Partners Matrix, Price Groups. |
| Phase 5 | 🔄 ACTIVE | Predictive Stockout (DoC), HQ Heartbeat, Auto-Print Bridge, Multi-lingual. |
| Phase 6 | ⏳ PENDING | HO Synchronization Pulse, Cashier Performance Analytics. |

> Do NOT write Phase 1 PostgREST patterns for new features. Phase 2+ FastAPI is the standard.

---

## SOVEREIGN STACK (NON-NEGOTIABLE)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite + TypeScript + Tailwind | Strict mode. No `any`. |
| Database | Supabase PostgreSQL | RLS always on. No Docker. |
| Auth | Supabase Auth | JWT + RBAC per store. Never expose `service_role` to frontend. |
| API | Python 3.12 + FastAPI + SQLAlchemy 2 async | Phase 2+ standard |
| Intelligence | Heuristic models (DoC, Scan Velocity) | See `skills/ux-operational-intelligence.md` |
| Hosting | Cloudflare Pages (Frontend) + Render (Backend) | render.yaml is source of truth |
| CI/CD | GitHub Actions | `.github/workflows/` |
| Dev OS | Windows 11 + Antigravity VSCode OSS | Path separators matter in scripts |
| Offline | IndexedDB via `idb` library | Fallback for ALL structural UI data |

---

## FOLDER STRUCTURE

```
primesetu/
├── backend/
│   └── app/
│       ├── main.py
│       ├── routers/        # one file per domain
│       ├── models/         # SQLAlchemy 2 async models
│       └── schemas/        # Pydantic v2 shapes
├── frontend/
│   └── src/
│       ├── modules/        # one folder per module
│       ├── components/
│       ├── hooks/          # React Query + custom hooks
│       └── lib/            # supabase client, utils, i18n
├── supabase/
│   └── migrations/
├── skills/                 # AI task templates — READ BEFORE CODING
└── GOVERNANCE.md           # ← you are here
```

---

## HOW TO RUN LOCALLY

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env     # fill SUPABASE_URL, SUPABASE_KEY, JWT_SECRET
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env.local  # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev

# Before any commit
cd frontend && npm run build  # must produce 0 TypeScript errors
```

---

## AGENT ROLE REGISTRY

### AGENT-BACKEND
**Owns:** `backend/` — FastAPI routers, SQLAlchemy models, Pydantic schemas, business logic

**Responsibilities:**
- New API endpoints per `skills/add-api-endpoint.md`
- SQLAlchemy 2 async models in `backend/app/models/`
- Pydantic v2 schemas in `backend/app/schemas/`
- Tally XML voucher generation (see `skills/tally-voucher.md`)
- GST computation — always integers (paise), never floats
- RLS policy verification before any new table is queried

**Must NOT touch:** `frontend/`, `supabase/migrations/`, design tokens

---

### AGENT-FRONTEND
**Owns:** `frontend/src/` — React components, pages, hooks, Tailwind UI

**Responsibilities:**
- New pages per `skills/add-react-page.md`
- Keyboard hotkeys via `react-hotkeys-hook`
- All menus fetched from DB — never static arrays
- Offline fallback to IndexedDB for all structural data
- UI validated against `primesetu-shoper9-ui.html` before commit
- `npm run build` must produce 0 TypeScript errors

**Must NOT touch:** `backend/`, `supabase/migrations/`, auth tokens in localStorage

**Permission rule:**
```typescript
// ❌ WRONG
if (user.role === 'admin') { ... }

// ✅ CORRECT
if (user.hasPermission('billing.void')) { ... }
```

---

### AGENT-DB
**Owns:** `supabase/migrations/`, RLS policies, DB schema

**Responsibilities:**
- New migration files per `skills/add-db-migration.md`
- RLS policy for every new table — no table goes live without RLS
- `store_id` always from auth context, never hardcoded
- Schema changes must be backward compatible

**Must NOT touch:** `frontend/`, `backend/`, `.env` files

**RLS template (mandatory on every new table):**
```sql
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.new_table
  FOR ALL USING (store_id = (
    SELECT store_id FROM public.store_users
    WHERE user_id = auth.uid()
    LIMIT 1
  ));
```

---

### AGENT-QA
Reviews output in a **fresh context window** (no shared memory with the writer).

**Checks:**
- All 5 output sections present
- File signature on new files
- No banned dependencies
- No hardcoded `store_id`
- No `localStorage`/`sessionStorage` for auth
- No `any` in TypeScript
- `npm run build` passes (frontend)
- RLS confirmed on new tables
- Shoper9 hotkey parity maintained

**Does NOT:** Rewrite code. Returns pass/fail verdict with line-level feedback only.

---

## COLLISION AVOIDANCE

1. Never write to the same file simultaneously across agents.
2. Schema is the contract — AGENT-DB owns it. No one modifies without AGENT-DB.
3. API contract first — AGENT-BACKEND defines endpoint shape before AGENT-FRONTEND writes the hook.

---

## SKILL AUTO-LOAD RULES

| When you are about to… | Must load |
|------------------------|-----------|
| Write any Python / FastAPI / SQLAlchemy | `skills/code-review-and-refine.md` |
| Write any TSX / React / hook | `skills/code-review-and-refine.md` |
| Write any SQL migration or RLS | `skills/code-review-and-refine.md` |
| Fix any bug | `skills/code-review-and-refine.md` |
| Output Section 3 (Code) | `skills/code-review-and-refine.md` |
| Work on billing, pricing, GST, loyalty | `skills/code-review-and-refine.md` |
| Work on Shoper9 parity modules | `skills/shoper9-module-index.md` + `skills/code-review-and-refine.md` |
| Work on any UI component | `skills/ux-index.md` + `skills/code-review-and-refine.md` |
| Work on predictive / intelligence features | `skills/ux-operational-intelligence.md` + `skills/code-review-and-refine.md` |

**Golden Rule:** If the task produces code → `code-review-and-refine.md` runs. No exceptions.

---

## MANDATORY OUTPUT FORMAT

Every AI response MUST contain all 5 sections:

```
### 1. Understanding
[Restate what was asked — confirm relevant context]

### 2. Plan
[Step-by-step approach before writing a single line of code]

### 3. Code
[The actual implementation]

### 4. Test Cases
[Minimum: happy path + error path + edge case]

### 5. Notes
[Assumptions, follow-up tasks, risks]
```

---

## FILE SIGNATURE (ALL NEW FILES)

```
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
```

---

## DESIGN TOKENS

```
Navy:    #0D1B3E  → Tailwind: brand-navy    (sidebar, headers)
Saffron: #F4840A  → Tailwind: brand-saffron (CTAs, alerts, hotkey badges)
Gold:    #F9B942  → Tailwind: brand-gold    (highlights, selected rows)
Cream:   #FAF7F2  → Tailwind: brand-cream   (page backgrounds)
```

Never hardcode hex in `.tsx`. Use Tailwind tokens only.

---

## SHOPER9 SACRED HOTKEYS (NEVER REPURPOSE)

| Key | Action | Scope |
|-----|--------|-------|
| F2 | New Bill | Billing only |
| F5 | Suspend Bill | Billing only |
| F8 | Recall Bill | Billing only |
| F10 | Payment / Confirm | All forms |
| Esc | Cancel / Back | All pages |
| Alt+1 | Department Sale | Billing only |

Every `useHotkeys` call MUST have `{ enableOnFormTags: true }`.

---

## GST / COMPLIANCE RULES

- All tax amounts stored as `paise` (INTEGER) — never floats
- GST rates accepted: `{0, 5, 12, 18, 28}` only — validated server-side on every write
- Every invoice must carry: store GSTIN, HSN code per line, CGST+SGST (intrastate) or IGST (interstate)
- Tally XML sync: see `skills/tally-voucher.md`

---

## GOLDEN RULE OF MUTATION

Every Supabase insert/update/delete MUST be followed by error handling:
```typescript
const { error } = await supabase.from('table').upsert(data)
if (error) throw new Error(`[PrimeSetu] Mutation failed: ${error.message}`)
```

---

## BANNED (ZERO EXCEPTIONS)

- `firebase` / `firestore` — ever
- `service_role` key on the frontend — ever
- `localStorage` / `sessionStorage` for auth tokens
- Any ORM other than SQLAlchemy 2 async
- Hardcoded `store_id` — always derive from Supabase auth context
- DB mutations without RLS policies verified active
- `any` type in TypeScript
- Static menu arrays in React
- Role-based UI (`if role === 'admin'`) — use permissions
- Float for any monetary value — always INTEGER (paise)
- PostgREST patterns for new Phase 2+ features

---

## WHEN CONTEXT GOES STALE

If the agent becomes repetitive, contradicts earlier decisions, or ignores rules:
**START A FRESH SESSION.** Re-load this file. Do not attempt to fix a confused session.

> "Memory, Not Code." — Every line is a liability. Build less, build right.

**© 2026 AITDL Network · All Rights Reserved**
