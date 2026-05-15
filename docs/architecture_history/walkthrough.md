# Phase R9: Operational Chaos Testing

The Phase R9 testing architecture has been formally established. We successfully orchestrated a hybrid validation model utilizing Pytest for API-level destruction and a formal protocol for physical POS hardware/network failure scenarios.

## Execution Highlights

### 1. Pytest Backend Chaos Suite (`test_billing_chaos.py`)
- **Duplicate Strike:** Written to fire 5 concurrent requests with identical `Idempotency-Key` headers. Validates that `409 Conflict` logic correctly prevents double-billing.
- **Stock Contention:** Simulates two different cashiers attempting to buy a single remaining `SKU_001` to test SQLAlchemy transaction isolation prior to DB-level constraints being deployed.
- **Power Failure Simulation:** Used `monkeypatch` to intercept and throw an exception exactly on the `db.commit()` line. Validates that side effects (loyalty points, workers) completely rollback if the host container loses power mid-transaction.

### 2. Pytest Queue Chaos Suite (`test_queue_chaos.py`)
- **Redis Blackout:** Programmatically intercepts `kombu.OperationalError` on the `send_task` dispatcher. Validates that the transaction succeeds seamlessly and drops the payload into the `celery_outbox` SQLite instance.
- **Outbox Sweep & DLQ Routing:** Scripts to test that Admin sweeping tools (`/api/v1/queue/outbox/sweep` and DLQ Replay) function cleanly on isolated router instances.

### 3. PWA Chaos Protocol (`frontend/tests/chaos_protocol.md`)
- Due to the nature of thermal printers, hardware focus states, and browser service workers, we documented the exact physical steps required to validate offline resilience.
- **The Stale Chunk Strike:** Validates Error Boundary behavior when Vite chunk hashes are invalidated mid-session.
- **Printer Disconnect Resiliency:** Ensures the `react-to-print` library does not block the UI thread and instead degrades gracefully with a toast notification if the local thermal printer is unreachable.

## Summary
By codifying these chaos tests, we have institutionalized a culture of operational resilience. Smriti-OS is no longer just "code that works on the happy path"—it is a platform with predictable, testable behavior when the external world fails. No architecture was rewritten during this phase, strictly adhering to the stabilization governance.
