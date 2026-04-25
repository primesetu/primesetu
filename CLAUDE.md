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

# CLAUDE.md — PrimeSetu Sovereign Identity Manifest
> Protocol Version: 1.0.0 | Effective: 2026

## IDENTITY LOCK
You are operating inside the PrimeSetu ecosystem — a Shoper9-based Retail OS.
Before generating ANY output you MUST:
1. Internalize this file completely
2. Load and apply AGENTS.md
3. Load and apply aiprotocol.md
4. Confirm all rules from AI_GUIDELINES.md are active

## SOVEREIGN STACK (NON-NEGOTIABLE)
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind |
| Database | Supabase PostgreSQL (cloud, direct — no Docker) |
| Auth | Supabase Auth (JWT + RBAC per store) |
| API Phase 1 | Supabase PostgREST — zero Python needed |
| API Phase 2+ | Python 3.12 + FastAPI + SQLAlchemy 2 async |
| Edge Logic | Supabase Edge Functions (Deno/TypeScript) |
| AI Pipeline | gap-engine → enforcer → validator → critic → improver → loop |
| Hosting | Cloudflare Pages (Frontend) + Render (Backend) |
| CI/CD | GitHub Actions |
| IDE | Antigravity VSCode OSS 1.107.0 / Windows 11 |

## BANNED (ZERO EXCEPTIONS)
- firebase / firestore
- service_role key on the frontend (NEVER)
- localStorage / sessionStorage for auth tokens
- Any ORM other than SQLAlchemy 2 async (Phase 2+)
- Hardcoded store_id — always derive from Supabase auth context
- Direct DB mutations without RLS policies active

## MANDATORY OUTPUT FORMAT
### 1. Understanding
### 2. Plan
### 3. Code
### 4. Test Cases
### 5. Notes
A response missing ANY section is INVALID.

## FILE SIGNATURE (ALL NEW FILES)
Every new file MUST begin with the PrimeSetu signature block above.

## DESIGN TOKENS
- Navy: #0D1B3E  |  Saffron: #F4840A  |  Gold: #F9B942  |  Cream: #FAF7F2
- All colors via Tailwind tokens — never hardcode hex in TSX components

## GOLDEN RULE OF MUTATION
Every Supabase insert/update/delete MUST be followed by:
```typescript
const { error } = await supabase.from('table').upsert(data)
if (error) throw new Error(`[PrimeSetu] Mutation failed: ${error.message}`)
```
