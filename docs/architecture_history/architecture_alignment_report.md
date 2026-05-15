# Smriti Retail OS — Architecture Alignment Report
**Governance Mode: AUDIT ONLY — No Code Changed**
**Audit Performed Against:** Engineering Rules v1.2 + Architecture Handbook v1.1
**Auditor:** Antigravity AI Agent
**Date:** 2026-05-15

---

## Executive Summary

The codebase is a **Phase 2 operational system** with significant governance debt. The core domain logic (billing, inventory) exists and works, but is built in a **monolithic router pattern** that violates the service-layer architecture mandate. Several CRITICAL risks exist in the billing path that require mandatory human review before any further feature work.

---

## FINDING INVENTORY

| ID | Severity | Domain | Short Title |
|---|---|---|---|
| A-001 | 🔴 CRITICAL | Backend/Billing | Business logic in router — no service layer |
| A-002 | 🔴 CRITICAL | Backend/Billing | Missing transaction atomicity — multiple `await db.commit()` in billing finalize |
| A-003 | 🔴 CRITICAL | Backend/Billing | No idempotency key enforcement on `/billing/finalize` |
| A-004 | 🔴 CRITICAL | Backend/Security | LOCAL_POSTGRES mode bypasses ALL authentication |
| A-005 | 🔴 CRITICAL | Backend/Security | EC JWK private key material hardcoded in source code |
| A-006 | 🔴 CRITICAL | Backend/Inventory | Audit finalize mutates Stockmaster without row-level locking |
| A-007 | 🔴 CRITICAL | Backend/Sync | Sync engine uses `asyncio.create_task` — not Celery — violates queue persistence mandate |
| A-008 | 🔴 CRITICAL | Backend/Queue | No `smriti.dlq` dead-letter queue |
| A-009 | 🔴 CRITICAL | Backend/Billing | Print/sync/loyalty ALL inside or immediately after `db.commit()` — wrong transaction boundary |
| B-001 | 🟠 HIGH | Backend/Structure | No domain-driven folder structure — all business logic inside `routers/` |
| B-002 | 🟠 HIGH | Backend/Billing | Tax calculation happens inside router, not an isolated tax service |
| B-003 | 🟠 HIGH | Backend/Routing | 47 router files, 10+ registered without consistent `api_prefix` |
| B-004 | 🟠 HIGH | Backend/Migrations | No Alembic — raw SQL migrations in `migrations/` folder |
| B-005 | 🟠 HIGH | Backend/Logging | No structlog — using bare `print()` for operational logging |
| B-006 | 🟠 HIGH | Backend/Main | `Base.metadata.create_all` on startup — dangerous in production |
| B-007 | 🟠 HIGH | Frontend/API | API base URL falls back to hardcoded `VITE_BACKEND_URL` env var + `127.0.0.1:8000` |
| B-008 | 🟠 HIGH | Frontend/Auth | No `runtime-config.json` loading — config comes from `import.meta.env` (build-time) |
| B-009 | 🟠 HIGH | Backend/Health | `/api/v1/health` is minimal — no Redis, no Celery, no schema version check |
| B-010 | 🟠 HIGH | Backend/Inventory | `random.randint` mock data returned in `/network-stock` — production path |
| B-011 | 🟠 HIGH | Frontend/Billing | Billing screen uses both local draft (DB) AND in-memory state — dual-state conflict risk |
| B-012 | 🟠 HIGH | Frontend/State | `useSovereignStore` owns both connectivity state AND API routing — violates SoC |
| C-001 | 🟡 MEDIUM | Backend/Billing | `stock_action == "Warn"` path only uses `print()` — no audit trail |
| C-002 | 🟡 MEDIUM | Backend/Billing | Loyalty accrual runs twice: once in finalize loop, once post-commit via `LoyaltyEngine` |
| C-003 | 🟡 MEDIUM | Backend/Billing | Day-end Z-seal writes to `SmritiParam` table — incorrect table for audit records |
| C-004 | 🟡 MEDIUM | Backend/Celery | Only 2 Celery tasks exist (`loyalty_tasks`, `tally_sync`) — no billing/print/sync tasks |
| C-005 | 🟡 MEDIUM | Backend/Celery | Celery `result_backend` and `broker` share the same Redis DB (`redis/0`) |
| C-006 | 🟡 MEDIUM | Backend/Models | `legacy_s9.py` is 721KB — single file, impossible to review, maintain, or safely import |
| C-007 | 🟡 MEDIUM | Frontend/API | `api.legacy.bulkUpsert` mocks a successful response on 403 — silent data loss |
| C-008 | 🟡 MEDIUM | Backend/App | `App.tsx` uses a `switch/case` router — no `React.lazy()` for any module |
| C-009 | 🟡 MEDIUM | Backend/App | `SOVEREIGN` storage mode uses synchronous SQLAlchemy inside async FastAPI handlers |
| C-010 | 🟡 MEDIUM | Backend/Routing | Some routers registered without `prefix=api_prefix` (billing, returns, loyalty, etc.) |
| C-011 | 🟡 MEDIUM | Backend/Inventory | `tax_rate: 18` hardcoded in inventory search response — ignores actual item tax config |
| C-012 | 🟡 MEDIUM | Frontend/API | `apiClient.interceptors.response.use` swallows 403 on GET during offline — masks errors |
| D-001 | 🔵 LOW | Backend/Scratch | `check_db_conn.py`, `db_check.py`, `db_check_raw.py` — debug scripts in production dir |
| D-002 | 🔵 LOW | Frontend/Misc | `walkthrough.md` in `src/` directory — documentation in source tree |
| D-003 | 🔵 LOW | Frontend/Module | `modules/usrInterfcae-jawahar/` — typo directory, likely experimental, should be removed |
| D-004 | 🔵 LOW | Backend/Tasks | Tasks directory has only 3 files — `billing_tasks`, `print_tasks`, `sync_tasks` are absent |
| D-005 | 🔵 LOW | Backend/Brain | `brain/` directory in backend — unclear purpose, should not be in production path |

---

## DETAILED FINDINGS

---

### 🔴 A-001 — Business Logic in Router (CRITICAL)

**File:** `backend/app/routers/billing.py`
**Lines:** 216–497 (`finalize_transaction`)
**Rule Violated:** Architecture Handbook v1.1 — Domain Structure RULE 1, RULE 2

**Finding:**
The `finalize_transaction` function is **791 lines inside `billing.py` router**. It performs:
- Idempotency check (should be service layer)
- Counter number resolution
- Item lookup from Shoper9 Itemmaster
- Stock availability check
- GST tax calculation
- Transaction header creation
- Line item persistence
- S9 ledger writes (`Stktrndtls`)
- Payment settlement rows (`Stktrnaddldtls`)
- Loyalty accrual
- WhatsApp receipt firing

**Governance mandate:** `router.py` must contain ONLY request parsing, calling one service method, and returning the response. Business logic inside a router is forbidden.

**Risk:** Impossible to unit-test. Any error in any step can leave the system in an inconsistent state. Future modifications are high-blast-radius.

---

### 🔴 A-002 — Broken Transaction Atomicity (CRITICAL)

**File:** `backend/app/routers/billing.py`
**Lines:** 406, 447, 461
**Rule Violated:** Handbook v1.1 — Transaction Management RULE 1

**Finding:**
The `finalize_transaction` function calls `await db.commit()` **three times**:
1. Line 406: After bill + line items + S9 ledger
2. Line 447: After payment settlement rows
3. Line 461: After loyalty accrual (inside try/except)

**Governance mandate:** Steps 1–7 must be inside a **single** `async with db.begin()` block. The current pattern means:
- Bill can commit, but payment rows can fail → bill exists without payment audit trail
- Loyalty can fail silently → points inconsistency
- Any rollback only covers the most recent segment

---

### 🔴 A-003 — No Idempotency Key on Billing Finalize (CRITICAL)

**File:** `backend/app/routers/billing.py`
**Rule Violated:** Engineering Rules v1.2 — Idempotency Policy; Handbook v1.1 — Transaction RULE 3

**Finding:**
The `/billing/finalize` endpoint accepts a `TransactionCreate` payload. There is no `idempotency_key` field validated or stored. A network retry from the frontend will create a **duplicate bill** with a duplicate stock deduction. This is the single highest-risk gap in the system.

**Required:** Every mutation must accept and validate a UUID idempotency key. Duplicate keys must return the original response, never re-execute.

---

### 🔴 A-004 — LOCAL_POSTGRES Mode Bypasses ALL Auth (CRITICAL)

**File:** `backend/app/core/security.py`
**Lines:** 172–180
**Rule Violated:** Engineering Rules v1.2 — Security Policy; Handbook v1.1 Security RULE 1, RULE 2

**Finding:**
```python
if settings.storage_mode == "LOCAL_POSTGRES":
    return CurrentUser(
        user_id="00000000-0000-0000-0000-000000000000",
        store_id="11",
        email="offline@smriti.local",
        role="admin",   # ← ALL routes get admin
        ...
    )
```
In offline/LAN node mode (the PRIMARY deployment mode for Smriti Retail OS), **every API call is unauthenticated admin**. There is no cashier identity, no role enforcement, no audit actor. This violates the security boundary completely.

**Required:** Local mode must use local JWT signed with the node's own secret (generated during setup wizard), not a bypass.

---

### 🔴 A-005 — EC JWK Private Key Material in Source Code (CRITICAL)

**File:** `backend/app/core/security.py`
**Lines:** 87–95
**Rule Violated:** Engineering Rules v1.2 — Security Policy

**Finding:**
A project-specific EC JWK (x, y coordinates for a P-256 key) is hardcoded directly in source code. This key is committed to the git repository. If this is the actual Supabase project key, it is a **security breach** — the public component is exposed, enabling token forgery analysis.

**Required:** JWK must be fetched dynamically from the Supabase JWKS endpoint (`/.well-known/jwks.json`) or stored in environment variables. Never committed to source.

---

### 🔴 A-006 — Audit Finalize Mutates Stockmaster Without Locking (CRITICAL)

**File:** `backend/app/routers/inventory.py`
**Lines:** 618–637
**Rule Violated:** Handbook v1.1 — Transaction Management RULE 2; Engineering Rules v1.2 — Concurrency Policy

**Finding:**
`finalize_audit_session` performs a read-modify-write on `Stockmaster.curbalqty` without `SELECT FOR UPDATE`. In a multi-cashier environment, a sale that happens during audit finalization will lose the stock deduction — the audit write overwrites the concurrent sale's deduction.

---

### 🔴 A-007 — Sync Engine Uses asyncio.create_task, Not Celery (CRITICAL)

**File:** `backend/app/main.py`
**Lines:** 152–156
**Rule Violated:** Engineering Rules v1.2 — Queue Architecture; Handbook v1.1 — Queue RULE 1, RULE 2

**Finding:**
```python
asyncio.create_task(SyncEngine.run_push_worker())
asyncio.create_task(OmnichannelSyncEngine.run_marketplace_worker())
```
These in-process tasks:
- Do NOT survive a server restart (queue is lost)
- Are not observable (no Flower, no dead-letter)
- Cannot retry with exponential backoff independently
- Share the same process as billing — a sync backlog can affect billing latency

The `OfflineSyncEngine` is the only one using a proper persistent queue approach (PostgreSQL table), but it still runs as a background `asyncio.Task`.

---

### 🔴 A-008 — No Dead-Letter Queue (CRITICAL)

**Files:** `backend/app/core/celery_app.py`, `backend/app/tasks/`
**Rule Violated:** Handbook v1.1 — Queue RULE 3

**Finding:**
There is no `smriti.dlq` dead-letter queue configured. The Celery app has only 2 scheduled tasks. There are no `billing`, `printing`, `sync`, `audit`, or `analytics` Celery queues defined. Failed tasks have no observable failure surface.

---

### 🔴 A-009 — Wrong Transaction Boundary: Post-Commit Side Effects (CRITICAL)

**File:** `backend/app/routers/billing.py`
**Lines:** 406–492
**Rule Violated:** Handbook v1.1 — Transaction RULE 1

**Finding:**
After `await db.commit()` on line 406 (committing the bill), the handler then:
1. Runs `DELETE DraftBillItem` (a separate unbounded write without commit check)
2. Writes payment rows and commits again (line 447)
3. Runs loyalty accrual with `await db.commit()` (line 461)
4. Fires WhatsApp as `asyncio.create_task` (not Celery queue)

The correct pattern is: single `async with db.begin()` for all transactional work, then fire Celery tasks outside for print/sync/notifications.

---

### 🟠 B-001 — No Domain-Driven Folder Structure (HIGH)

**Finding:**
The backend uses `app/routers/` (47 files) and `app/services/` (23 files) but no domain isolation. There is no `billing/`, `inventory/`, `purchase/` domain folder with its own service/repository/schema. This makes it impossible to enforce the cross-domain access rules (domains must go through each other's service, not repositories directly).

---

### 🟠 B-004 — No Alembic — Raw SQL Migrations (HIGH)

**Files:** `backend/migrations/20260503_create_draft_billing.sql`, `backend/migrations/20260512_v3_sovereign_stabilization.sql`
**Rule Violated:** Engineering Rules v1.2 — Schema Migration Policy; Handbook v1.1 — Setup RULE 2

**Finding:**
Migrations are raw `.sql` files, not Alembic. There is no `alembic.ini`, no `env.py`, no migration head tracking. The startup `create_all` pattern means schema is auto-created from models, not from controlled migration scripts. This makes it impossible to:
- Track schema version in the health endpoint
- Run `alembic upgrade head` during setup wizard
- Safely roll back a bad migration

---

### 🟠 B-005 — No structlog — Bare print() Statements (HIGH)

**Files:** `backend/app/main.py`, `backend/app/routers/billing.py`, `backend/app/core/security.py`
**Rule Violated:** Handbook v1.1 — Logging Architecture RULE 1, RULE 2

**Finding:**
The codebase uses `print()` for all operational logging. There is no structured JSON logging, no request_id correlation, no `node_id` field, no `actor_id` field. The 6 required log files (`operational.log`, `audit.log`, `sync.log`, etc.) do not exist.

---

### 🟠 B-007 — Hardcoded API URL Fallback (HIGH)

**File:** `frontend/src/api/client.ts`
**Lines:** 14–16
**Rule Violated:** Handbook v1.1 — PWA Runtime Config RULE 1; Engineering Rules — Runtime Rules

**Finding:**
```typescript
const CLOUD_API = import.meta.env.VITE_BACKEND_URL ?? 'https://smriti-api.primesetu.com'
const LOCAL_API = 'http://127.0.0.1:8000'
```
API URLs are resolved from `import.meta.env` (baked into the build bundle) or hardcoded constants. There is no `runtime-config.json` loading. The governance mandate is that `runtime-config.json` must be loaded before any API interaction. This is a **build-time vs runtime config violation** — the deployed PWA bundle cannot be reconfigured without a rebuild.

---

### 🟠 B-008 — No runtime-config.json (HIGH)

**File:** `frontend/src/main.tsx`
**Rule Violated:** Handbook v1.1 — Runtime Configuration; PWA RULE 1

**Finding:**
`main.tsx` does not load a `runtime-config.json` before rendering the app. The `QueryClient` is created, the app renders, and all API calls begin immediately using build-time env vars. The setup wizard step that "writes all configuration to `runtime-config.json`" (Handbook Step 6) has no corresponding frontend reader.

---

### 🟠 B-010 — Mock Data in Production Network Stock Endpoint (HIGH)

**File:** `backend/app/routers/inventory.py`
**Lines:** 436–449

**Finding:**
```python
import random
qty = random.randint(0, 50)
doc = random.uniform(5, 45)
```
The `/inventory/{sku}/network-stock` endpoint returns random data. This is committed and accessible via the API. Any frontend component calling this endpoint will display meaningless random numbers.

---

### 🟠 B-011 — Billing Dual-State Conflict (HIGH)

**Finding:**
The billing system maintains state in two places simultaneously:
1. **Backend `DraftBillItem` table** — DB-persisted draft per user
2. **Frontend `useCartStore` / component state** — in-memory Zustand/useState

These are not kept in sync. If the browser refreshes mid-bill, the draft can be inconsistent. The "clear draft" operation (line 410 in billing.py) fires AFTER the commit, meaning a crash between commit and clear leaves orphaned draft rows.

---

### 🟡 C-001 to C-012 — Medium Findings

**C-004:** Only 2 Celery tasks exist (`loyalty_tasks.py`, `tally_sync.py`). The 6 required queues (`billing`, `printing`, `sync`, `audit`, `analytics`, `notifications`) have no corresponding task implementations. Celery is wired but non-functional for the primary operational queues.

**C-006:** `backend/app/models/legacy_s9.py` is **721KB** — a single Python file. It is unreviewable, causes slow import times, and violates any principle of modular architecture. A single mistake anywhere in this file affects the entire model layer.

**C-007:** `api.legacy.bulkUpsert` in `client.ts` mocks a successful response (`{ success: true, mocked: true }`) on a 403 error. Any bulk save of master data when auth expires silently succeeds on the frontend while no data was actually saved — **silent data loss**.

**C-008:** `App.tsx` uses a `switch/case` with eager imports for all modules. No `React.lazy()` is used anywhere. This means the billing screen is NOT eagerly loaded (contrary to Handbook mandate) and ALL modules load on initial bundle.

**C-009:** The `SOVEREIGN` (MSSQL) storage mode creates a **synchronous** `sessionmaker` and yields a sync `Session` from an `async def get_db()`. FastAPI's async event loop will block when this session is used in any async handler that calls a synchronous SQLAlchemy operation.

**C-011:** The inventory search response hardcodes `"tax_rate": 18` for every item regardless of the item's actual GST slab. This is a frontend tax calculation assumption that violates the "never perform frontend tax calculation" rule.

---

## Summary by Category

| Category | Critical | High | Medium | Low |
|---|---|---|---|---|
| Transaction Safety | 3 | 0 | 1 | 0 |
| Security/Auth | 2 | 0 | 0 | 0 |
| Architecture/Structure | 1 | 3 | 3 | 1 |
| Queue/Sync | 2 | 1 | 1 | 1 |
| Frontend Config | 0 | 2 | 2 | 1 |
| Migrations/Schema | 0 | 1 | 0 | 0 |
| Logging/Observability | 0 | 1 | 0 | 0 |
| Data Integrity | 1 | 1 | 2 | 1 |
| **TOTAL** | **9** | **9** | **9** | **4** |

---

## STEP 2 — Proposed Refactor Phases

> **Philosophy:** Stabilize → Govern → Modernize. No greenfield rewrites.

---

### Phase R1 — Security Hardening *(1–2 days, Mandatory Human Review)*

**Priority: Before any new feature work.**

1. **[R1-A]** Remove hardcoded JWK from `security.py` → fetch from JWKS endpoint or env var
2. **[R1-B]** Replace LOCAL_POSTGRES auth bypass with local JWT (node-signed) — implement a minimal `POST /auth/login` endpoint that issues a local JWT using the setup-wizard-generated secret
3. **[R1-C]** Fix `api.legacy.bulkUpsert` 403-mocking in `client.ts` — never mock data loss

**Files:**
- `backend/app/core/security.py`
- `frontend/src/api/client.ts`

---

### Phase R2 — Transaction Atomicity Fix *(2–3 days, Mandatory Human Review)*

**Priority: Before any billing feature work.**

1. **[R2-A]** Extract `finalize_transaction` logic into `billing/service.py`
2. **[R2-B]** Consolidate all transactional writes into single `async with db.begin()` block (bill + items + S9 dtls + S9 addl + audit event)
3. **[R2-C]** Move print/sync/loyalty/WhatsApp to post-transaction Celery tasks
4. **[R2-D]** Add `idempotency_key: UUID` to `TransactionCreate` schema + idempotency check table

**Files (new):**
- `backend/billing/service.py`
- `backend/billing/repository.py`
- `backend/billing/schemas.py`

---

### Phase R3 — runtime-config.json + Auth *(1 day)*

1. **[R3-A]** Create `frontend/public/runtime-config.json` with configurable API URL
2. **[R3-B]** Add `runtimeConfigStore` in Zustand — loads config before first render in `main.tsx`
3. **[R3-C]** Remove `VITE_BACKEND_URL` hardcoded fallbacks from `client.ts`

**Files:**
- `frontend/public/runtime-config.json`
- `frontend/src/store/useRuntimeConfigStore.ts`
- `frontend/src/main.tsx`
- `frontend/src/api/client.ts`

---

### Phase R4 — Queue Infrastructure *(2–3 days)*

1. **[R4-A]** Define 6 Celery queues in `celery_app.py` with task routing
2. **[R4-B]** Create `backend/app/tasks/billing_tasks.py`, `print_tasks.py`, `sync_tasks.py`
3. **[R4-C]** Configure `smriti.dlq` dead-letter queue
4. **[R4-D]** Replace `asyncio.create_task(SyncEngine...)` in startup with Celery Beat schedule
5. **[R4-E]** Separate Celery `broker_db=0` and `result_backend_db=1` (Redis DB separation)

---

### Phase R5 — structlog + Health Endpoint *(1 day)*

1. **[R5-A]** Install structlog, configure JSON renderer
2. **[R5-B]** Replace all `print()` statements with `logger.info/error/warning`
3. **[R5-C]** Expand `/api/v1/health` to include: DB, Redis, Celery worker, schema version
4. **[R5-D]** Add `X-Request-ID` middleware injection

---

### Phase R6 — Frontend Module Isolation + Lazy Loading *(2–3 days)*

1. **[R6-A]** Convert `App.tsx` switch/case to React Router with `React.lazy()` for all non-billing modules
2. **[R6-B]** Eagerly load billing module (per handbook mandate)
3. **[R6-C]** Move `useHoPulse` out of `App.tsx` into layout level
4. **[R6-D]** Split `useSovereignStore` into `useConnectivityStore` + `useNodeConfigStore`

---

### Phase R7 — Alembic Migration Setup *(1–2 days, Human Review)*

1. **[R7-A]** Initialize Alembic: `alembic init migrations`
2. **[R7-B]** Convert `migrations/*.sql` files to Alembic revision scripts
3. **[R7-C]** Remove `create_all` from startup — replace with `alembic upgrade head` validation
4. **[R7-D]** Add schema version check to `/api/v1/health`

---

### Phase R8 — Model Decomposition *(3–5 days, Low Risk)*

1. **[R8-A]** Split `legacy_s9.py` (721KB) into domain-grouped files:
   - `legacy_s9_billing.py` — `Stktrndtls`, `Stktrnaddldtls`, `Stktrnhdr`
   - `legacy_s9_inventory.py` — `Itemmaster`, `Stockmaster`
   - `legacy_s9_masters.py` — `Genlookup`, `GenTable`, etc.
   - `legacy_s9_purchase.py` — GRN, supplier models
2. **[R8-B]** Remove mock data from `/inventory/{sku}/network-stock`

---

## Human Review Requirements Per Phase

| Phase | Mandatory Human Review |
|---|---|
| R1 | `security.py` — auth bypass removal |
| R2 | `billing/service.py` — entire file |
| R2 | `billing/repository.py` — stock locking queries |
| R4 | Celery task implementations for billing, sync |
| R7 | Every Alembic migration script |

---

## What Should NOT Be Changed

- Existing Shoper9 compatibility layer (s9 schema queries) — proven and operational
- `offline_sync.py` queue design — this is the best-implemented piece of the system (SKIP_LOCKED, exponential backoff, status tracking are correct)
- `OfflineSyncEngine.initialize()` / `enqueue()` / `_flush_queue()` patterns — keep as-is
- The core CORS regex pattern — appropriate for the multi-origin deployment
- Pydantic schema definitions in `app/schemas/` — well-structured

---

*End of Architecture Alignment Report — STEP 2 Approval Required Before Execution*
