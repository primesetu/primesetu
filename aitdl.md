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
