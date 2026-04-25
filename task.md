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

# MenuManager Engine — Protocol Audit & Task Tracker

This file documents every protocol violation, bug, and missing piece in the current codebase regarding the newly enforced **Sovereign Navigation & Access Control Protocol** defined in `AGENTS.md`.

## 🚨 Protocol Violations

- [x] BUG-001: Hardcoded Menu Array | File: `frontend/src/lib/ModuleRegistry.tsx` | Severity: HIGH
  - **Violation**: Rule 1 (NO HARDCODED MENUS). 
  - **Details**: Navigation relies on `export const MODULE_REGISTRY = [...]`. It must be deleted and replaced with a dynamic API call to FastAPI.

- [x] BUG-002: Role-Based Binding Instead of Permissions | File: `frontend/src/lib/ModuleRegistry.tsx` & `Sidebar.tsx` | Severity: HIGH
  - **Violation**: Rule 3 (PERMISSIONS OVER ROLES).
  - **Details**: UI visibility is currently gated by arrays like `roles: ['OWNER', 'MANAGER']`. This will cause role explosion. Must be refactored to check `required_permission`.

- [x] BUG-003: Missing Sovereign Offline Fallback | File: `frontend/src/App.tsx` | Severity: HIGH
  - **Violation**: Rule 2 (SOVEREIGN OFFLINE FALLBACK).
  - **Details**: Because the menu is currently static, there is no `try/catch` network fetch mechanism wrapping `IndexedDB` (`idb`) to ensure offline survival of the layout.

- [x] BUG-004: Incomplete Terminal Mode Hotkeys | File: `frontend/src/lib/ModuleRegistry.tsx` | Severity: MED
  - **Violation**: Rule 4 (TERMINAL MODE HOTKEYS).
  - **Details**: Several modules (e.g., Vendors, Procurement) lack the required `shortcut` property (e.g., `F1`, `F9`), forcing users to rely on mouse navigation.

## 🧩 Missing Architectural Pieces

- [x] MISS-001: Missing Database Schema (PostgreSQL) | File: `supabase/migrations/005_menumanager.sql` | Severity: HIGH
  - **Details**: Requires a SQL migration to construct the `menu_items` table with columns: `id`, `label`, `route`, `shortcut`, `required_permission`, `category`, and `parent_id`.

- [x] MISS-002: Missing FastAPI Resolver Engine | File: `main.py` | Severity: HIGH
  - **Details**: Requires a `GET /api/v1/menu` endpoint that securely intersects the authenticated user's permissions with the active `menu_items` in the database.

- [x] MISS-003: Missing Frontend Cache Manager | File: `frontend/src/api/menuService.ts` | Severity: HIGH
  - **Details**: Needs a dedicated service utilizing `openDB('PrimeSetuDB')` to intercept the FastAPI menu response and save it locally for Sovereign Offline execution.

- [x] MISS-004: Missing Global Hotkey Registrar | File: `frontend/src/components/layout/Sidebar.tsx` | Severity: MED
  - **Details**: Frontend lacks a dynamic parser to iterate over the `shortcut` property of the fetched menu and instantly bind them using `react-hotkeys-hook`.
