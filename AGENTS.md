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
