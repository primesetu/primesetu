# Smriti Retail OS — Sync & Offline Runtime Governance
# Authoritative Source: Phase 4 Distributed Runtime (v1.2)

## 1. QUEUE ORCHESTRATION
- **Async Outbox**: All cloud synchronization MUST follow the Async Outbox pattern via the `write_queue`.
- **Order Preservation**: Payloads MUST be synchronized in the exact order of creation to preserve ledger integrity.

## 2. REPLAY & RETRY
- **Deterministic Retries**: Retry sequencing MUST use exponential backoff logic.
- **Dead-Letter Protocol**: Permanently failing payloads MUST be moved to a Dead-Letter Queue (DLQ) for manual audit.
- **Idempotency Keys**: All sync payloads MUST include a persistent idempotency key to prevent double-processing.

## 3. CONFLICT RESOLUTION
- **Node Authority**: The Local Retail Node is the authoritative source for billing sequences.
- **Cloud Reconciliation**: In the event of a conflict, the Local node state overrides Cloud sinks unless an audit lock is active.
- **Reconciliation Rules**: Reconciliation MUST remain observable and produce a deterministic audit trail in the `offline_ledger`.
