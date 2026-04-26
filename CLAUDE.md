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

## MANDATORY SELF-REVIEW (PROTOCOL v2)

| Requirement | Action | Target Skill |
|-------------|--------|--------------|
| New Backend Code | Auto-Trigger | `skills/code-review-and-refine.md` |
| New Frontend UI | Auto-Trigger | `skills/code-review-and-refine.md` |
| DB Migration | Auto-Trigger | `skills/code-review-and-refine.md` |

> Every code output MUST pass the 4-phase self-review before Section 3 is finalized.

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

---

## AVAILABLE SKILLS (AUTO-TRIGGER)

<available_skills>
  <skill name="code-review-and-refine" trigger="code, logic, migration, schema, billing">
    Mandatory self-review protocol for PrimeSetu. Run this BEFORE presenting any code to ensure 
    Paise integers, RLS, store isolation, and zero-float compliance.
  </skill>
</available_skills>
