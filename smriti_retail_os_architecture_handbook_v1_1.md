# Smriti Retail OS — Frontend & Backend Architecture Handbook

## Brand: ERPnBOOK

### System Architect: Jawahar Ramkripal Mallah

### Version: 1.1

---

**Version 1.1 Change Summary** This version resolves all structural ambiguities identified in v1.0. Key decisions made: domain-driven backend structure · Celery \+ Redis queue stack · Dexie.js IndexedDB abstraction · SSE for real-time transport · OpenAPI-to-TypeScript contract sharing · environment detection strategy · middleware chain formalized · sync conflict resolution defined · service worker caching strategy added. All implementation sections upgraded from intent-level to rule-level specificity.

---

# Purpose of This Handbook

This document defines the detailed implementation architecture for:

- Frontend engineering  
- Backend engineering  
- API governance  
- Runtime structure  
- Folder organization  
- State management  
- Synchronization systems  
- Queue systems  
- Security boundaries  
- Operational workflow architecture  
- Offline-first infrastructure  
- Deployment patterns

This handbook converts the high-level governance philosophy of the Engineering Rules document into actionable, enforceable engineering implementation standards. Where the Engineering Rules define policy, this handbook defines the mechanism that enforces it.

**All implementation decisions in this handbook are final unless explicitly overridden by the System Architect. When a developer faces a choice not covered here, the Engineering Rules document is the deciding authority.**

---

# Architectural Philosophy

## Core Principle

Stable Operational Core \+ Modern Experience Layer

Smriti Retail OS does NOT attempt to reinvent proven retail operational logic.

Instead:

- Operational intelligence remains preserved in the PostgreSQL schema  
- FastAPI APIs modernize access and enforce business rules  
- React PWA modernizes workflow experience  
- Cloud systems provide owner intelligence and HQ visibility  
- Local runtime guarantees operational continuity independent of cloud availability

## The Split Runtime Model

This is the defining architectural characteristic of Smriti Retail OS. Every implementation decision must account for it.

┌─────────────────────────────────────────────────┐

│               CLOUDFLARE (PUBLIC)                │

│   React PWA (static assets, served globally)    │

│   Cloud Dashboard APIs (reporting, analytics)   │

│   HQ Admin Panel                                 │

│   Notification Services                          │

└────────────────────┬────────────────────────────┘

                     │ HTTPS (authenticated)

                     │ SSE (real-time HO commands)

                     │

┌────────────────────▼────────────────────────────┐

│               LOCAL STORE NODE                   │

│   Local FastAPI Runtime (port 8000\)              │

│   Service Layer (business rules)                 │

│   Repository Layer (DB access)                   │

│   PostgreSQL Operational DB                      │

│   Redis (queue broker \+ idempotency cache)       │

│   Celery Workers (sync, print, audit, analytics) │

└─────────────────────────────────────────────────┘

The PWA is served from Cloudflare but connects to the local FastAPI runtime for all operational work. Cloud APIs are only used for reporting, owner dashboards, and HO governance. Billing, stock, returns, and cashier operations are always local.

---

# ENVIRONMENT DETECTION & RUNTIME CONFIGURATION

This section is foundational. Every other section depends on the PWA knowing which environment it is running against.

## The Problem

The React PWA is a static bundle served from Cloudflare. It needs to know the address of the local FastAPI server, which varies per installation. This cannot be hardcoded into the build.

## The Solution: Setup-Written Runtime Config

The setup wizard writes a `runtime-config.json` file to a well-known local path during installation. The PWA fetches this file at startup before rendering anything.

/public/runtime-config.json   ← written by setup wizard, not version controlled

{

  "local\_api\_url": "http://localhost:8000",

  "cloud\_api\_url": "https://api.smriti.erpnbook.com",

  "node\_id": "MUM01",

  "store\_name": "Main Store Mumbai",

  "schema\_version": "1.2.0",

  "license\_token": "\<signed JWT\>",

  "environment": "production"

}

## Rules

**RULE 1** — The PWA must fetch `runtime-config.json` on startup and store it in a `RuntimeConfigStore` (Zustand). No API call may proceed until this config is loaded.

**RULE 2** — If `runtime-config.json` is missing or malformed, the PWA must render the Setup Wizard, not an error screen.

**RULE 3** — `runtime-config.json` must never be committed to version control. `.gitignore` must include this file.

**RULE 4** — All API service modules must read base URLs from `RuntimeConfigStore`, never from `import.meta.env` or hardcoded strings.

**RULE 5** — The setup wizard is the only process authorized to write `runtime-config.json`. No other component may modify it directly.

## Offline Mode Detection

// src/services/connectivity.ts

export function useConnectivityMode() {

  const localApiUrl \= useRuntimeConfig().local\_api\_url;

  // Two-signal detection: browser navigator.onLine \+ actual local ping

  const \[localReachable, setLocalReachable\] \= useState(true);

  const \[cloudReachable, setCloudReachable\] \= useState(true);

  // Ping local API every 30s; ping cloud every 60s

  // Mode: 'full' | 'local-only' | 'offline'

}

---

# FRONTEND ARCHITECTURE

## Frontend Philosophy

Frontend exists to:

- simplify operations  
- accelerate workflows  
- reduce cashier friction  
- improve operator productivity  
- provide operational visibility  
- modernize experience without disrupting proven flows

Frontend is an operational productivity tool, not a visual showcase.

---

## Frontend Technology Stack

| Layer | Technology | Decision Rationale |
| :---- | :---- | :---- |
| Framework | React 18 | Component model suits module isolation |
| Runtime | PWA (Vite PWA plugin) | Offline capability, installable on store hardware |
| Routing | React Router v6 | File-based route config, lazy loading support |
| Global State | Zustand | Lightweight, no boilerplate, slice-friendly |
| Server Cache | TanStack Query v5 | Stale-while-revalidate, offline persistence adapter |
| UI Components | shadcn/ui | Headless, fully owned, not a black-box library |
| Styling | Tailwind CSS | Utility-first, no CSS drift across modules |
| Forms | React Hook Form | Uncontrolled for performance in high-freq billing inputs |
| Validation | Zod | Schema-first, shared with OpenAPI contract |
| Offline Storage | Dexie.js (IndexedDB) | Typed, migration-capable, Promise-based |
| API Client | Axios with interceptors | Centralized auth headers, error normalization |
| Schema Contracts | openapi-typescript | Auto-generated from FastAPI OpenAPI spec |
| Build Tool | Vite | Fast HMR, PWA plugin support |
| Service Worker | Workbox (via Vite PWA) | Declarative cache strategies |

---

## Frontend Folder Structure

src/

 ├── app/                      ← App entry, providers, global wrappers

 │    ├── App.tsx

 │    ├── Providers.tsx

 │    └── Router.tsx

 │

 ├── modules/                  ← Domain modules (self-contained)

 │    ├── billing/

 │    │    ├── components/     ← BillingScreen, ItemRow, PaymentPanel

 │    │    ├── hooks/          ← useBillingSession, useItemSearch

 │    │    ├── stores/         ← billingStore.ts (Zustand slice)

 │    │    ├── services/       ← billingApi.ts (API calls)

 │    │    ├── schemas/        ← billingSchemas.ts (Zod)

 │    │    ├── offline/        ← offlineBillingQueue.ts

 │    │    └── index.ts

 │    ├── inventory/

 │    ├── purchase/

 │    ├── returns/

 │    ├── customers/

 │    ├── suppliers/

 │    ├── reports/

 │    ├── sync/

 │    └── settings/

 │

 ├── core/                     ← Shared infrastructure (not domain logic)

 │    ├── api/                 ← axiosClient.ts, apiError.ts

 │    ├── auth/                ← authStore.ts, useAuth.ts

 │    ├── offline/             ← db.ts (Dexie instance), queueProcessor.ts

 │    ├── runtime/             ← runtimeConfig.ts, useRuntimeConfig.ts

 │    ├── connectivity/        ← ConnectivityGuard.tsx, useConnectivity.ts

 │    └── sync/                ← syncEngine.ts, useSyncStatus.ts

 │

 ├── components/               ← Shared UI components (not domain-specific)

 │    ├── common/              ← Button, Modal, Badge, Toast

 │    ├── layout/              ← AppShell, Sidebar, TopBar

 │    └── feedback/            ← SyncStatusBadge, OfflineBanner, PrintQueue

 │

 ├── pages/                    ← Route-level page components (thin wrappers)

 │    ├── BillingPage.tsx

 │    ├── InventoryPage.tsx

 │    └── ...

 │

 ├── routes/                   ← Route definitions and guards

 │    ├── routes.tsx

 │    └── guards/              ← AuthGuard.tsx, RoleGuard.tsx, SetupGuard.tsx

 │

 ├── hooks/                    ← Global non-domain hooks

 │    ├── useKeyboardShortcuts.ts

 │    └── usePageTitle.ts

 │

 ├── types/                    ← Generated types from OpenAPI \+ manual globals

 │    ├── api.ts               ← Auto-generated by openapi-typescript

 │    └── global.ts

 │

 ├── config/                   ← Constants, feature flags, route maps

 │    └── constants.ts

 │

 └── styles/                   ← Global CSS, Tailwind config overrides

      └── globals.css

### Module Isolation Rules

**RULE 1** — A module must never import from another module's internal paths. Correct: `import { useBillingSession } from '@/modules/billing'` (via index.ts) Incorrect: `import { useBillingSession } from '@/modules/billing/hooks/useBillingSession'`

**RULE 2** — Shared logic used by more than one module must live in `core/` or `components/`. Never duplicate logic across modules.

**RULE 3** — Each module owns its Zustand slice, API service file, and Zod schemas. These must not leak into other modules.

---

## Zod / Pydantic / OpenAPI Contract Strategy

This resolves the schema drift problem between frontend and backend.

### The Contract Chain

FastAPI (Pydantic models)

       ↓  generates

OpenAPI spec (/openapi.json)

       ↓  processed by

openapi-typescript (CI step)

       ↓  produces

src/types/api.ts (auto-generated, never hand-edited)

       ↓  imported by

Zod schemas in each module (wrap generated types with runtime validation)

### Rules

**RULE 1** — `src/types/api.ts` is auto-generated. Never manually edit it. It is regenerated on every backend deploy via a CI step: `npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts`

**RULE 2** — Frontend Zod schemas must be derived from the generated API types, not written independently. This prevents the Zod schema and the actual API response shape from diverging silently.

// Example: derive Zod schema from generated type

import type { components } from '@/types/api';

type BillResponse \= components\['schemas'\]\['BillResponse'\];

// Zod schema mirrors the generated type

export const BillResponseSchema: z.ZodType\<BillResponse\> \= z.object({

  bill\_id: z.string().uuid(),

  bill\_number: z.string(),

  total\_amount\_paise: z.number().int(),

  // ...

});

**RULE 3** — When a backend response fails Zod validation in production, it must log an error to the telemetry system and fall back gracefully. It must never crash the billing screen.

---

## State Management Strategy

### Zustand: What It Owns

Use Zustand for **operational UI state** that needs to persist across component unmounts or be shared across the module:

| Store | Owns |
| :---- | :---- |
| `runtimeConfigStore` | Node ID, API URLs, license token |
| `authStore` | Current user, role, JWT token, expiry |
| `billingStore` | Active bill, line items, selected customer, payment state |
| `printStore` | Print queue, printer status, last print result |
| `syncStore` | Sync status, queue depth, last sync timestamp |
| `connectivityStore` | `localReachable`, `cloudReachable`, current mode |

**What Zustand must NOT own:** server data (item details, stock levels, customer records). That belongs to TanStack Query.

### TanStack Query: What It Owns

Use TanStack Query for all **server-derived data**:

- Item search results  
- Stock levels  
- Customer lookup  
- Report data  
- HO command status

**Offline persistence adapter:** Configure TanStack Query's `persister` to use the Dexie-backed query cache. This means item master data fetched while online is still available during offline mode.

// core/api/queryClient.ts

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister \= createAsyncStoragePersister({

  storage: dexieStorage,       // Dexie adapter, not localStorage

  key: 'smriti-query-cache',

});

export const queryClient \= new QueryClient({

  defaultOptions: {

    queries: {

      staleTime: 1000 \* 60 \* 5,        // 5 minutes

      gcTime: 1000 \* 60 \* 60 \* 24,     // 24 hours (for offline access)

      networkMode: 'offlineFirst',

    },

  },

});

---

## IndexedDB Architecture (Dexie.js)

### Why Dexie.js

Raw IndexedDB is verbose, callback-based, and has no schema migration support. Dexie.js provides: typed tables, versioned schema migrations, Promise API, transaction support, and reactive live queries.

### Database Definition

// core/offline/db.ts

import Dexie, { type Table } from 'dexie';

export interface OfflineQueueEntry {

  id?: number;

  idempotency\_key: string;

  type: 'bill\_save' | 'stock\_adjustment' | 'grn\_entry' | 'return' | 'sync\_packet';

  payload: unknown;

  retry\_count: number;

  max\_retries: number;

  created\_at: string;        // ISO UTC

  next\_retry\_at: string;     // ISO UTC (exponential backoff)

  sync\_status: 'pending' | 'processing' | 'failed' | 'completed';

  error\_log: string | null;

  node\_id: string;

}

export interface CachedItemMaster {

  item\_code: string;

  item\_name: string;

  mrp\_paise: number;

  hsn\_code: string;

  gst\_rate: number;

  is\_active: boolean;

  master\_version\_timestamp: string;

  cached\_at: string;

}

export interface BillingDraft {

  draft\_id: string;

  cashier\_id: string;

  line\_items: unknown;

  created\_at: string;

  last\_modified\_at: string;

}

class SmritiDB extends Dexie {

  offline\_queue\!: Table\<OfflineQueueEntry\>;

  item\_master\_cache\!: Table\<CachedItemMaster\>;

  billing\_drafts\!: Table\<BillingDraft\>;

  query\_cache\!: Table\<{ key: string; value: string; updated\_at: string }\>;

  constructor() {

    super('SmritiRetailOS');

    // Version history must be append-only. Never modify a past version.

    this.version(1).stores({

      offline\_queue: '++id, idempotency\_key, type, sync\_status, created\_at',

      item\_master\_cache: 'item\_code, hsn\_code, is\_active',

      billing\_drafts: 'draft\_id, cashier\_id',

      query\_cache: 'key',

    });

    // Example of additive migration in v2:

    // this.version(2).stores({

    //   offline\_queue: '++id, idempotency\_key, type, sync\_status, created\_at, node\_id',

    // }).upgrade(tx \=\> {

    //   return tx.offline\_queue.toCollection().modify(entry \=\> {

    //     entry.node\_id \= 'UNKNOWN';

    //   });

    // });

  }

}

export const db \= new SmritiDB();

### IndexedDB Migration Rules

**RULE 1** — Dexie version history is append-only. Never modify or delete a past `this.version(N)` block. Doing so corrupts existing user databases.

**RULE 2** — Every schema change requires a new version number with an upgrade function that migrates existing data. Silent schema changes are forbidden.

**RULE 3** — Offline queue entries use `idempotency_key` as their deduplication anchor. The same key may never produce two entries with `sync_status: 'completed'`.

**RULE 4** — Item master cache entries carry `master_version_timestamp`. On cache refresh, only entries with a newer timestamp from the server replace existing ones.

---

## Service Worker & PWA Caching Strategy

### Caching Decisions by Resource Type

| Resource Type | Strategy | Rationale |
| :---- | :---- | :---- |
| JS/CSS/font bundles | Cache-first (cache-busted by hash) | Static, never changes for a given build |
| App shell HTML | Network-first with offline fallback | Ensure users get latest shell |
| Item master data | StaleWhileRevalidate | Fast display, background refresh |
| Billing API calls | Network-only, no service worker cache | Financial operations must hit the DB |
| Images/icons | Cache-first, 30-day TTL | Rarely change, safe to cache |
| `/runtime-config.json` | Network-first | Must reflect latest setup wizard config |

### Rules

**RULE 1** — Billing API calls (`/api/v1/billing/*`) must never be served from the service worker cache. These must always hit the local FastAPI server directly.

**RULE 2** — The offline app shell must be pre-cached during service worker installation. The cashier must be able to open the billing screen without a network request.

**RULE 3** — When the service worker intercepts a navigation request while offline, it must serve the pre-cached app shell and let the React app handle the offline state. It must never show a browser "no internet" error page.

**RULE 4** — Service worker updates must use the `skipWaiting + clientsClaim` pattern so the new worker activates immediately after installation without requiring a tab close. A toast notification must inform the cashier when an update has been applied.

// vite.config.ts (Vite PWA plugin config)

VitePWA({

  registerType: 'autoUpdate',

  workbox: {

    globPatterns: \['\*\*/\*.{js,css,html,ico,png,svg,woff2}'\],

    runtimeCaching: \[

      {

        urlPattern: /\\/api\\/v1\\/billing\\//,

        handler: 'NetworkOnly',   // RULE 1: billing always network

      },

      {

        urlPattern: /\\/api\\/v1\\/items\\//,

        handler: 'StaleWhileRevalidate',

        options: { cacheName: 'item-master-cache', expiration: { maxAgeSeconds: 86400 } },

      },

    \],

  },

})

---

## Routing Architecture

### Route Structure

// routes/routes.tsx

const routes \= \[

  {

    path: '/',

    element: \<SetupGuard /\>,        // Redirect to setup if not configured

    children: \[

      {

        path: '/',

        element: \<AuthGuard /\>,     // Redirect to login if not authenticated

        children: \[

          { path: '/billing',   element: \<BillingPage /\>,   handle: { roles: \['cashier', 'manager', 'owner'\] } },

          { path: '/inventory', element: \<InventoryPage /\>, handle: { roles: \['manager', 'owner'\] } },

          { path: '/reports',   element: \<ReportsPage /\>,   handle: { roles: \['owner'\] } },

          { path: '/admin',     element: \<AdminPage /\>,     handle: { roles: \['owner', 'hq\_admin'\] } },

          { path: '/settings',  element: \<SettingsPage /\>,  handle: { roles: \['manager', 'owner'\] } },

        \],

      },

    \],

  },

  { path: '/setup',  element: \<SetupWizardPage /\> },

  { path: '/login',  element: \<LoginPage /\> },

\];

### Guard Chain

Request arrives at route

         ↓

SetupGuard:   Is runtime-config.json present and valid?

              No  → render SetupWizard

         ↓

AuthGuard:    Is there a valid non-expired JWT in authStore?

              No  → redirect to /login

         ↓

RoleGuard:    Does the user's role satisfy route.handle.roles?

              No  → render AccessDenied (never redirect silently)

         ↓

Route renders

**RULE 1** — Route guards must compose as wrappers, not as logic inside page components. No page component may contain its own auth or role check.

**RULE 2** — A role check failure must render an explicit AccessDenied screen, not redirect to login. A cashier who tries to access /admin should see "Access denied", not be logged out.

---

## Real-Time Transport: SSE Decision

### Decision: Server-Sent Events (SSE), not WebSocket

| Concern | SSE | WebSocket |
| :---- | :---- | :---- |
| HO command delivery (server → client) | ✓ Native fit | Overkill (bidirectional not needed) |
| Sync status updates | ✓ | Overkill |
| Print job status | ✓ | Overkill |
| Cashier session conflicts | ✓ | Could use either |
| Implementation complexity | Low | Higher |
| Cloudflare compatibility | ✓ Native | Requires additional config |
| Reconnect on network drop | ✓ Built-in | Manual |

SSE is sufficient for all current real-time requirements. Every identified use case is server-to-client only. WebSocket adds bidirectional complexity without benefit. This decision may be revisited if cashier-to-cashier real-time collaboration is added.

### SSE Endpoint Architecture

FastAPI SSE endpoint: GET /api/v1/events/stream

  ↓ Authenticated by JWT (passed as query param or header)

  ↓ Streams events as:

    data: {"type": "ho\_command", "payload": {...}}\\n\\n

    data: {"type": "sync\_status", "payload": {...}}\\n\\n

    data: {"type": "print\_result", "payload": {...}}\\n\\n

    data: {"type": "stock\_alert", "payload": {...}}\\n\\n

    data: {"type": "heartbeat"}\\n\\n    ← every 30s to keep connection alive

### Frontend SSE Client

// core/sync/useSseStream.ts

export function useSseStream() {

  const { local\_api\_url } \= useRuntimeConfig();

  const token \= useAuthStore(s \=\> s.token);

  useEffect(() \=\> {

    const url \= \`${local\_api\_url}/api/v1/events/stream?token=${token}\`;

    const source \= new EventSource(url);

    source.onmessage \= (event) \=\> {

      const msg \= JSON.parse(event.data);

      sseDispatch(msg);   // route to appropriate store handler

    };

    source.onerror \= () \=\> {

      // EventSource auto-reconnects. Log but don't crash.

      console.warn('SSE connection lost, browser will retry');

    };

    return () \=\> source.close();

  }, \[local\_api\_url, token\]);

}

**RULE 1** — SSE connection must be established in the app shell, not inside individual screens. The cashier must receive HO commands regardless of which screen they are on.

**RULE 2** — SSE disconnection must not alert the cashier unless it persists for more than 60 seconds. Brief reconnects during sync are normal and must be silent.

**RULE 3** — Every SSE event must be idempotent at the handler level. The same event delivered twice must produce the same result as if delivered once.

---

## Billing Screen Engineering Standards

### Philosophy

Billing is the heart of the system. Perceived performance here defines the product's reputation.

### Rules

**RULE 1** — The barcode input field must maintain focus at all times on the billing screen. After every action (item add, quantity change, discount entry), focus must return to the input field automatically.

**RULE 2** — Mouse dependency during active billing is a regression. Every billing operation must be completable with keyboard only.

**RULE 3** — Mandatory keyboard shortcuts:

| Action | Shortcut |
| :---- | :---- |
| Save bill | F8 |
| Hold bill | F5 |
| Open payment panel | F9 |
| Increase quantity | \+ |
| Decrease quantity | \- |
| Remove last item | Delete |
| Apply discount | F6 |
| Customer search | F3 |
| Open held bills | F4 |

**RULE 4** — Target latencies:

| Operation | Target |
| :---- | :---- |
| Barcode scan to item displayed | ≤ 300ms perceived |
| Bill save (network commit) | ≤ 500ms |
| Print job queued (not printed) | ≤ 100ms after bill save |
| Payment panel open | ≤ 100ms |

**RULE 5** — The billing screen must never trigger a full-page re-render during item addition. Only the line item list and the total panel may re-render.

**RULE 6** — Avoid modals during active billing. Use inline panels (bottom drawer or side panel) for payment, discount, and customer selection. Reserve modals only for destructive confirmations (bill cancel, large discount override).

**RULE 7** — Stock level display during billing must use the `last known` value from TanStack Query cache. The cache must be refreshed in the background. Never block item addition on a live stock check — flag low stock after addition, not before.

---

## Frontend Performance Standards

**RULE 1** — Initial app shell must load under 2 seconds on target hardware (assume: entry-level Windows POS terminal, 8GB RAM, wired network).

**RULE 2** — Billing module must be eagerly loaded. All other modules must lazy-load via `React.lazy()`.

**RULE 3** — Item search results list must use virtualization (`react-virtual`) when the result count exceeds 50 items.

**RULE 4** — Avoid subscribing billing store components to sync state, print state, or connectivity state. These must be separate components at the layout level, not inside the billing tree.

**RULE 5** — The Zustand billingStore must never hold TanStack Query data. Never copy API responses into Zustand. Query cache is the source of truth for server data. Zustand holds only ephemeral session state (in-progress bill).

---

# BACKEND ARCHITECTURE

## Backend Philosophy

The backend owns all business truth. No business rule may be enforced only on the frontend. Every rule that matters must be enforced in the service layer.

---

## Backend Technology Stack

| Layer | Technology | Decision Rationale |
| :---- | :---- | :---- |
| Framework | FastAPI | Async, typed, auto-generates OpenAPI spec |
| ORM | SQLAlchemy 2.x (async) | Async support, explicit session management |
| Validation | Pydantic v2 | Fast, strict, integrates with FastAPI |
| Database | PostgreSQL 15+ | Proven, transactional, RANGE partitioning |
| Queue Broker | Redis 7 | Persistent, fast, supports Celery \+ caching |
| Task Queue | Celery 5 | Persistent, retry-capable, scheduled tasks |
| Auth | JWT (python-jose) | Stateless, role-embedded |
| WSGI Server | Uvicorn \+ Gunicorn | Production-grade async serving |
| Migrations | Alembic | Version-controlled schema changes |
| Logging | structlog | Structured JSON logs, telemetry-compatible |
| Process Manager | Supervisor | Manages API \+ Celery worker processes |

### Queue Technology Decision: Celery \+ Redis

The v1.0 handbook listed "Celery/RQ/FastAPI Tasks" without deciding. This is resolved here.

**Chosen: Celery 5 with Redis 7 as broker and result backend.**

Rationale:

- FastAPI background tasks are in-process and do not survive server restarts. This violates the Engineering Rules requirement that queues be persistent.  
- RQ (Redis Queue) is simpler but has limited scheduling, monitoring, and retry configurability compared to Celery.  
- Celery \+ Redis provides: persistent queue (Redis AOF), retry with exponential backoff, scheduled tasks (Celery Beat), task monitoring (Flower), and dead letter queue support.

---

## Backend Folder Structure

### Decision: Domain-Driven Organization

The v1.0 handbook mixed layered (services/, repositories/) and domain (billing/, inventory/) patterns in the same structure. This is resolved here.

**Chosen: Domain-driven, with a shared core.**

Each domain owns its own router, service, repository, models, and schemas. Cross-cutting infrastructure lives in core/.

backend/

 ├── billing/

 │    ├── router.py          ← FastAPI router, thin (validation \+ delegation only)

 │    ├── service.py         ← Business logic, transaction orchestration

 │    ├── repository.py      ← DB queries, SELECT FOR UPDATE, locking

 │    ├── schemas.py         ← Pydantic request/response DTOs

 │    ├── models.py          ← SQLAlchemy ORM models (if domain-specific tables)

 │    └── events.py          ← Audit and business event emission

 │

 ├── inventory/

 │    ├── router.py

 │    ├── service.py

 │    ├── repository.py

 │    ├── schemas.py

 │    └── events.py

 │

 ├── purchase/               ← GRN, supplier orders

 ├── returns/

 ├── customers/

 ├── sync/                   ← Sync packet assembly, cloud delivery, conflict resolution

 ├── ho\_governance/          ← HO command receipt, validation, execution

 ├── reports/                ← Pre-aggregation, read-only queries

 ├── printing/               ← Print queue, spool management

 ├── setup/                  ← Setup wizard, node activation, health checks

 ├── notifications/          ← SSE event stream, alert delivery

 │

 └── core/                   ← Shared infrastructure

      ├── db.py              ← SQLAlchemy engine, session factory, get\_db()

      ├── redis.py           ← Redis client singleton

      ├── celery\_app.py      ← Celery app instance, queue definitions

      ├── auth/

      │    ├── jwt.py        ← Token creation, validation

      │    ├── middleware.py ← JWT middleware (attaches user to request state)

      │    └── permissions.py ← Role decorators, permission checks

      ├── middleware/

      │    ├── request\_id.py ← Injects request\_id into every request

      │    ├── audit.py      ← Extracts actor info for audit logging

      │    └── rate\_limit.py ← Per-IP rate limiting for auth endpoints

      ├── events/

      │    ├── audit.py      ← AuditEvent writer (inside-transaction)

      │    └── business.py   ← BusinessEvent emitter (post-transaction, async)

      ├── exceptions.py      ← Domain exception hierarchy

      ├── responses.py       ← Standardized response envelope

      └── config.py          ← Settings (reads from env vars / config file)

### Domain Structure Rules

**RULE 1** — `router.py` must contain only: request parsing, calling one service method, and returning the response. Business logic inside a router is forbidden.

**RULE 2** — `service.py` owns all business rules and transaction coordination. Services may call other domain services for cross-domain workflows. Services must never call routers.

**RULE 3** — `repository.py` contains only database queries. No business logic. No validation. Just SQL / ORM operations.

**RULE 4** — Domains must not directly import from each other's repositories. Cross-domain data access must go through the other domain's service.

**RULE 5** — `events.py` per domain emits audit and business events. This keeps event emission close to the domain that understands the event semantics.

---

## Middleware Chain

Every request passes through this chain in order:

Incoming HTTP request

         ↓

1\. RequestIDMiddleware

   Injects X-Request-ID (UUID) into request.state and response headers.

   All logs for this request carry this ID.

         ↓

2\. RateLimitMiddleware

   Applied only to /auth/\* endpoints. Limits per IP.

   Returns 429 on breach. Does not apply to billing endpoints.

         ↓

3\. JWTAuthMiddleware

   Extracts Bearer token from Authorization header.

   Validates signature and expiry.

   Attaches decoded user (user\_id, role, node\_id, cashier\_id) to request.state.

   Returns 401 if token missing on protected routes.

   Public routes (/health, /setup/\*, /auth/login) bypass this middleware.

         ↓

4\. AuditContextMiddleware

   Reads user info from request.state (set by JWT middleware).

   Attaches audit context (actor\_id, actor\_role, node\_id) to request.state.

   This context is used by event emitters without passing it through function args.

         ↓

5\. Route Handler (router.py)

         ↓

6\. Permission decorator (@require\_role)

   Checked inside the route handler via dependency injection.

   Returns 403 if role is insufficient.

         ↓

7\. Service Layer

### Rules

**RULE 1** — Permission checks happen in step 6 via FastAPI dependency injection, not inside service methods. Service methods assume the caller is already authorized.

\# core/auth/permissions.py

def require\_role(\*roles: str):

    def dependency(request: Request):

        user \= request.state.user

        if user.role not in roles:

            raise HTTPException(status\_code=403, detail="Insufficient role")

        return user

    return Depends(dependency)

\# billing/router.py

@router.post("/bills/save")

async def save\_bill(

    payload: BillSaveRequest,

    user: User \= require\_role("cashier", "manager", "owner"),

    service: BillingService \= Depends(),

):

    return await service.save\_bill(payload, user)

**RULE 2** — The JWT middleware must attach the full user context to `request.state` in a single pass. No downstream component may re-query the database to find the current user — the token carries all necessary identity information.

**RULE 3** — `X-Request-ID` must appear in every API response header. Log aggregation depends on this for tracing request chains.

---

## API Response Standards

### Success Response

{

  "success": true,

  "data": { },

  "meta": {

    "request\_id": "uuid",

    "timestamp": "2024-01-15T10:30:00Z",

    "node\_id": "MUM01"

  }

}

### Error Response

{

  "success": false,

  "error\_code": "STOCK\_UNAVAILABLE",

  "message": "Item 'Colgate 100g' has insufficient stock. Available: 2, Requested: 5.",

  "meta": {

    "request\_id": "uuid",

    "timestamp": "2024-01-15T10:30:00Z"

  }

}

### Error Code Registry

Error codes must be defined as constants, never as freeform strings:

\# core/exceptions.py

class ErrorCode(str, Enum):

    STOCK\_UNAVAILABLE       \= "STOCK\_UNAVAILABLE"

    BILL\_ALREADY\_CANCELLED  \= "BILL\_ALREADY\_CANCELLED"

    HSN\_CODE\_MISSING        \= "HSN\_CODE\_MISSING"

    MANAGER\_PIN\_REQUIRED    \= "MANAGER\_PIN\_REQUIRED"

    IDEMPOTENCY\_DUPLICATE   \= "IDEMPOTENCY\_DUPLICATE"

    SCHEMA\_VERSION\_MISMATCH \= "SCHEMA\_VERSION\_MISMATCH"

    LICENSE\_EXPIRED         \= "LICENSE\_EXPIRED"

    COMMAND\_EXPIRED         \= "COMMAND\_EXPIRED"

**RULE 1** — Error messages must be operationally understandable. Bad: `"IntegrityError: foreign key constraint"` Good: `"Item code 'XYZ123' does not exist in item master."`

**RULE 2** — The `error_code` field must be a registered constant from `ErrorCode`. Freeform error code strings are forbidden — frontend relies on these for routing error-specific UI behavior.

---

## Transaction Management

### Atomic Boundary Implementation

\# billing/service.py

async def save\_bill(

    self,

    payload: BillSaveRequest,

    user: User,

    db: AsyncSession,

) \-\> BillSaveResponse:

    async with db.begin():              \# Single transaction opens here

        \# 1\. Validate idempotency

        await self.\_check\_idempotency(payload.idempotency\_key, db)

        \# 2\. Lock stock rows (SELECT FOR UPDATE)

        stock\_rows \= await self.inventory\_repo.lock\_stock\_rows(

            \[item.item\_code for item in payload.line\_items\], db

        )

        \# 3\. Validate stock availability

        self.\_validate\_stock(payload.line\_items, stock\_rows)

        \# 4\. Run server-side tax calculation

        tax\_result \= self.tax\_service.calculate(payload.line\_items)

        \# 5\. Save bill record

        bill \= await self.billing\_repo.create\_bill(payload, tax\_result, user, db)

        \# 6\. Deduct stock

        await self.inventory\_repo.deduct\_stock(payload.line\_items, db)

        \# 7\. Write audit event (inside same transaction — guaranteed)

        await self.audit\_events.bill\_saved(bill, user, db)

        \# Transaction commits here ↑

        \# If any step raises, entire transaction rolls back automatically

    \# 8\. Queue print job (outside transaction — print failure cannot rollback bill)

    await self.print\_queue.enqueue(bill.bill\_id)

    \# 9\. Emit business event (outside transaction — async, non-blocking)

    await self.business\_events.bill\_created(bill)

    \# 10\. Enqueue sync packet (outside transaction — sync failure cannot rollback bill)

    await self.sync\_queue.enqueue\_bill(bill.bill\_id)

    return BillSaveResponse.from\_orm(bill)

**RULE 1** — Steps 1–7 must be inside a single `async with db.begin()` block. Steps 8–10 must be outside it.

**RULE 2** — Stock locking (step 2\) must use `SELECT FOR UPDATE SKIP LOCKED` for concurrent cashier environments. SKIP LOCKED prevents blocking when two cashiers are billing different items simultaneously.

**RULE 3** — If the idempotency check (step 1\) detects a duplicate key, return the original successful response directly. Never raise an error for a duplicate. Never execute the transaction a second time.

---

## Queue Architecture

### Celery Queue Definitions

\# core/celery\_app.py

from celery import Celery

celery\_app \= Celery(

    'smriti',

    broker='redis://localhost:6379/0',

    backend='redis://localhost:6379/1',

)

celery\_app.conf.task\_routes \= {

    'billing.tasks.\*':      {'queue': 'billing'},

    'printing.tasks.\*':     {'queue': 'printing'},

    'sync.tasks.\*':         {'queue': 'sync'},

    'audit.tasks.\*':        {'queue': 'audit'},

    'analytics.tasks.\*':    {'queue': 'analytics'},

    'notifications.tasks.\*': {'queue': 'notifications'},

}

celery\_app.conf.task\_serializer \= 'json'

celery\_app.conf.result\_expires \= 3600

celery\_app.conf.broker\_transport\_options \= {

    'visibility\_timeout': 3600,

}

### Queue Responsibilities

| Queue | Handles | Max Retries | Retry Backoff |
| :---- | :---- | :---- | :---- |
| `billing` | Idempotency key TTL cleanup | 3 | 60s |
| `printing` | Print job execution, reprint | 5 | 30s, 60s, 120s |
| `sync` | Cloud packet delivery | 10 | Exponential (max 1 hour) |
| `audit` | Audit event persistence (fallback) | 3 | 10s |
| `analytics` | Pre-aggregation, summary tables | 3 | 300s |
| `notifications` | Owner alerts, SSE push | 3 | 30s |

### Queue Rules

**RULE 1** — Redis must be configured with AOF (Append-Only File) persistence. In-memory-only Redis is not acceptable in production — queue contents must survive a Redis restart.

\# redis.conf

appendonly yes

appendfsync everysec

**RULE 2** — Every Celery task must be idempotent. A task re-executed due to a worker crash must produce the same result as the first execution.

**RULE 3** — Tasks that fail beyond max retries must move to a dead-letter queue (`smriti.dlq`) with the full error context. Dead-letter queue must be visible in the owner dashboard.

**RULE 4** — The `sync` queue must be processed by a dedicated Celery worker process. It must never share a worker with the `printing` queue to prevent a sync backlog from blocking print jobs.

---

## Synchronization Architecture

### Conflict Resolution Strategy

This resolves the gap in v1.0 where "conflict prevention" was listed without definition.

#### Master Data Conflicts (HQ update vs. local state)

These follow the Master Data Governance policy in Engineering Rules v1.2. HQ always wins for item master, tax rates, and SmritiParams.

\# sync/conflict\_resolution.py

async def apply\_item\_master\_update(update: ItemMasterUpdate, db: AsyncSession):

    existing \= await item\_repo.get(update.item\_code, db)

    if existing is None:

        \# New item — apply directly

        await item\_repo.create(update, db)

        return

    if update.master\_version\_timestamp \<= existing.master\_version\_timestamp:

        \# Stale update — reject silently, log it

        await audit\_events.stale\_master\_update\_rejected(update)

        return

    \# HQ version is newer — apply and log the diff

    diff \= compute\_diff(existing, update)

    await item\_repo.update(update, db)

    await audit\_events.master\_data\_updated(update, diff, source='HQ')

#### Transaction Data Conflicts (offline bills syncing to cloud)

Offline bills generated while disconnected sync to the cloud after reconnection. These are additive — they do not conflict with cloud state because the cloud reporting DB has no billing authority. The node DB is the billing source of truth.

Conflict scenario: Two nodes sell the same item simultaneously while disconnected.

Resolution: Both bills are valid. Stock reconciliation is a reporting concern,

not a sync conflict. The cloud reporting DB aggregates both and shows the variance.

HQ is alerted when aggregate stock drops below reorder level.

**RULE 1** — Sync packets for billing transactions are additive. A bill generated offline is always valid and must be accepted by the cloud. The cloud DB never rejects a bill record from a node.

**RULE 2** — Item master conflicts follow HQ-wins-always. A node must never push item master changes to the cloud. Item master sync is unidirectional: HQ → Node only.

**RULE 3** — Customer record conflicts use last-write-wins with `updated_at` timestamp comparison. The record with the newer `updated_at` is kept.

**RULE 4** — Sync conflict events must be logged and surfaced in the HQ dashboard. Silent conflict resolution is forbidden.

### Sync Packet Structure

class SyncPacket(BaseModel):

    packet\_id: str                  \# UUID, idempotency key for the packet

    node\_id: str

    schema\_version: str

    generated\_at: str               \# UTC ISO

    payload\_type: Literal\[

        'bill\_batch',

        'stock\_movement\_batch',

        'customer\_update',

        'audit\_event\_batch',

        'business\_event\_batch',

    \]

    payload: dict                   \# Type-specific payload

    sequence\_number: int            \# Monotonically increasing per node

    checksum: str                   \# SHA256 of payload for integrity verification

**RULE 1** — Sync packets must carry `sequence_number`. The cloud API must reject packets with a sequence number older than the last acknowledged sequence. This prevents replay attacks and detects lost packets.

**RULE 2** — The cloud API must return the last acknowledged sequence number in its response. The node uses this to determine what to include in the next packet.

---

## Security Architecture

### Security Boundary Summary

Public internet

      │

      │ HTTPS only

      ▼

Cloudflare WAF

      │

      │ Authenticated HTTPS

      ▼

Cloud API (Cloudflare Workers or Cloud VM)

      │

      │ Authenticated HTTPS (Cloudflare Tunnel or VPN)

      ▼

Local FastAPI (localhost:8000)

      │

      │ Unix socket or localhost only

      ▼

PostgreSQL (never exposed beyond localhost)

Redis     (never exposed beyond localhost)

### JWT Structure

\# Token payload

{

  "sub": "user\_uuid",

  "role": "cashier",           \# cashier | manager | owner | hq\_admin

  "node\_id": "MUM01",

  "cashier\_id": "CSH001",

  "store\_name": "Main Store",

  "iat": 1705312200,

  "exp": 1705340400,           \# 8-hour expiry

  "jti": "token\_uuid"          \# For future revocation support

}

**RULE 1** — The JWT secret key must be generated during the setup wizard and stored in the local environment, not shipped with the application.

**RULE 2** — JWT tokens must never be stored in `localStorage`. Use an in-memory store (Zustand authStore) with refresh via a short-lived `httpOnly` cookie as a backup for page refresh recovery.

**RULE 3** — Manager PIN must be stored as a bcrypt hash with a cost factor ≥ 12\. PINs must be re-hashed on change. The hash must never appear in API responses.

---

## Logging Architecture

### Structured Log Format

All logs must be structured JSON. Freeform string logs are forbidden in production.

\# core/logging\_config.py

import structlog

structlog.configure(

    processors=\[

        structlog.stdlib.add\_log\_level,

        structlog.stdlib.add\_logger\_name,

        structlog.processors.TimeStamper(fmt="iso"),

        structlog.processors.JSONRenderer(),

    \]

)

### Log Fields (mandatory on every log entry)

| Field | Source |
| :---- | :---- |
| `timestamp` | Auto (structlog) |
| `level` | Auto (structlog) |
| `request_id` | RequestIDMiddleware |
| `node_id` | RuntimeConfig |
| `actor_id` | JWT middleware |
| `event` | Log call site |
| `domain` | Log call site |

### Log File Organization

logs/

 ├── operational.log    ← billing, stock, GRN, returns (structured JSON)

 ├── audit.log          ← append-only, all audit events

 ├── sync.log           ← sync packets, delivery status, conflicts

 ├── security.log       ← auth events, PIN failures, lockouts

 ├── print.log          ← print jobs, failures, reprints

 └── telemetry.log      ← latency, lock contention, queue depths

**RULE 1** — `audit.log` must be write-only from the application. The application process must not have permission to read or delete this file after writing.

**RULE 2** — Log rotation must be configured with a maximum file size of 50MB and a maximum of 30 rotated files. Total log retention per node must not exceed 5GB.

---

## Setup Wizard Architecture

### Wizard Steps

Step 1: Runtime detection

   ├── Detect Python version

   ├── Detect PostgreSQL service (pg\_isready)

   ├── Detect Redis service (redis-cli ping)

   └── Detect available COM/USB ports (printer detection)

Step 2: Database configuration

   ├── Input: PostgreSQL host, port, database, user, password

   ├── Test connection

   ├── Run Alembic migrations (alembic upgrade head)

   └── Verify migration head matches expected schema\_version

Step 3: Node registration

   ├── Input: store name, node\_id (auto-suggested, editable)

   ├── Cloud registration (POST to HQ API with store details)

   ├── Receive and store license\_token

   └── Verify license\_token signature locally

Step 4: Printer setup

   ├── Select printer type (thermal 58/80mm, A4, PDF)

   ├── Select printer port

   └── Print test receipt

Step 5: Admin user creation

   ├── Create owner account (name, PIN)

   └── Generate JWT secret

Step 6: Write runtime-config.json

   └── Write all configuration to runtime-config.json

Step 7: Health validation

   ├── /health endpoint must return all green

   ├── Display version matrix (API version, schema version, license expiry)

   └── Setup complete

**RULE 1** — The setup wizard must be re-runnable. Running it a second time must detect existing configuration, allow selective updates, and never destroy operational data.

**RULE 2** — If Alembic migrations fail during setup, the wizard must halt and display the migration error with recovery instructions. It must never continue to Step 3 with a mismatched schema.

---

# AI-Assisted Development Implementation Guide

This section replaces the v1.0 AI section with implementation-specific guidance.

## Safe Zones for AI Generation (Low Review Burden)

These areas may be AI-generated with standard code review:

| Area | Why Safe |
| :---- | :---- |
| CRUD API endpoints for non-financial entities (customers, suppliers) | No financial state |
| Report screen components | Read-only, no mutations |
| Setup wizard steps | No production data involvement |
| Form components with Zod validation | Logic is explicit in schema |
| Pydantic schemas for request/response DTOs | Structural, not behavioral |
| Celery task boilerplate | Retry config, not business logic |
| Unit tests for utility functions | No operational side effects |

## Mandatory Human Review Zones

These areas require explicit architect or senior developer sign-off before merge, regardless of test coverage:

| Area | Risk |
| :---- | :---- |
| Billing service (`billing/service.py`) | Financial correctness, atomicity |
| Tax calculation logic | GST compliance, legal liability |
| Stock deduction and reservation | Inventory integrity |
| Idempotency key handling | Duplicate transaction prevention |
| JWT middleware and role permissions | Security boundary |
| Sync conflict resolution | Data consistency across nodes |
| Alembic migration scripts | Schema irreversibility risk |
| HO governance command handlers | Destructive action enforcement |

## AI Agent Instructions

When starting an implementation session with an AI agent, provide:

1. This handbook (full document)  
2. Engineering Rules v1.2 (full document)  
3. The specific domain context (e.g., "you are working in the `inventory` domain")  
4. The task with explicit boundary: "implement `get_stock_levels` in `inventory/repository.py`. This is a read-only query. No transaction management required."

Require the AI agent to state at the beginning of its response:

- Which handbook rules apply to the code being generated  
- Which safe zone or mandatory review zone the code falls into

---

# Long-Term Technical Vision

Smriti Retail OS is intended to evolve into:

- Hybrid Retail Infrastructure  
- Edge Commerce Platform  
- AI-Assisted Retail Intelligence System  
- Offline-First Commerce Ecosystem  
- Multi-Store Operational Platform

Architectural decisions made today must not create barriers to this evolution. Specifically: the domain-driven structure must remain extensible as new domains are added, the SSE transport decision must be revisited when cashier-to-cashier real-time features are needed, and the sync architecture must be hardened as node count grows beyond single-digit deployments.

---

# Final Engineering Principle

Preserve operational intelligence. Modernize experience. Protect continuity. Scale carefully.

---

# Credits

System Architect: Jawahar Ramkripal Mallah Brand: ERPnBOOK Product: Smriti Retail OS Version: 1.1

---

*End of Handbook*  
