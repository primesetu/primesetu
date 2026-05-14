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
 * System Architect : Jawahar R Mallah
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
