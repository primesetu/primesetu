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

# AI AGENT RULES — PrimeSetu (STRICT MODE)

## MANDATORY RULE
Follow aiprotocol.md and AI_GUIDELINES.md WITHOUT EXCEPTION.

## BEFORE ANY RESPONSE
1. Read aiprotocol.md  2. Apply ALL rules  3. Output 5-section format

## DO NOT (EVER)
- Give code without Understanding + Plan sections first
- Skip Test Cases section
- Use localStorage for auth tokens
- Call service_role key from frontend
- Hardcode store_id
- Use any DB other than Supabase PostgreSQL

## PHASE AWARENESS
- Phase 1: PostgREST + Edge Functions only. No Python/FastAPI code.
- Phase 2+: FastAPI replaces PostgREST. Same DB schema — zero migration.

## FILE SIGNATURE
Every new file MUST start with the PrimeSetu signature block (see CLAUDE.md).
