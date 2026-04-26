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
