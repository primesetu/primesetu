# Smriti Retail OS — Failure Recovery Governance
# Authoritative Source: Engineering Rules v1.2

## 1. DETERMINISTIC RECOVERY
- **Recoverable States**: Critical workflows MUST expose recoverable states to support clean interruption handling.
- **Interruption Handling**: Browser refreshes or network drops during a transaction MUST NOT lead to inconsistent data states.

## 2. IDEMPOTENCY
- **Operation Idempotency**: All billing and settlement paths MUST expose idempotency protections.
- **Replay Protection**: Duplicate interaction triggers (e.g., rapid double-tapping a key) MUST be neutralized.

## 3. RECOVERY OBSERVABILITY
- **Rollback Visibility**: Failed transactions MUST expose deterministic rollback/error states.
- **Audit Trails**: Recovery operations MUST be logged in the `offline_ledger` with the original `transactionId`.
