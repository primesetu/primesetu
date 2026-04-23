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
- Always use design tokens from CLAUDE.md for UI work

## FAILURE CONDITIONS → REGENERATE RESPONSE
- Missing any of the 5 output sections
- Missing file signature on new files
- Using banned dependencies
- Skipping test cases
