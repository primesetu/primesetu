# Smriti Retail OS — Schema & Data Governance
# Authoritative Source: Shoper9 Legacy Parity (v1.2)

## 1. SHOPER9 SCHEMA IMMUTABILITY
- **Forbidden Actions**: Creating new PostgreSQL tables, modifying operational schemas, or renaming legacy Shoper9 fields is STRICTLY FORBIDDEN.
- **Source of Truth**: The migrated Shoper9 operational tables are sacred. Preserve all existing relationships and sequences.
- **Field Lineage**: UI components and stores MUST bind strictly to legacy field names (e.g., `stockno`, `itemdesc`, `retail_price`).

## 2. OFFLINE VAULT GOVERNANCE
- **Authoritative Vault**: Exactly ONE authoritative offline vault exists: `src/lib/dexie.ts`.
- **Forbidden Persistence**: Fragmentation into raw IndexedDB, `localStorage`, or shadow systems is forbidden.
- **Data Consistency**: All offline billing drafts and sync queues MUST reside within the Dexie vault.

## 3. DATA RECOVERY
- **Idempotency**: All data mutation triggers (e.g., cart additions, payments) MUST be idempotent.
- **Audit Ledger**: Critical data transitions MUST be recorded in the `offline_ledger` before execution.
- **Sync Integrity**: Payloads in the sync queue MUST remain immutable until successfully acknowledged by the destination node.
