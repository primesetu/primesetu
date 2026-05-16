# Smriti Retail OS — Event & Observability Governance
# Authoritative Source: Engineering Rules v1.2

## 1. DETERMINISTIC TRANSITIONS
- **Explicit Transitions**: Operational state transitions MUST be explicit, traceable, and module-scoped.
- **No Hidden Effects**: Hidden global event buses or implicit state mutation chains are strictly forbidden.

## 2. OBSERVABILITY SEPARATION
- **Passive Logging**: The `SovereignLogger` is strictly passive and non-authoritative.
- **No Side Effects**: Logging systems MUST NOT control workflow execution or mutate operational state.
- **Structured Tracing**: Critical workflows MUST emit structured events (e.g., `traceWorkflow`) with explicit metadata.

## 3. ANTI-SILENT FAILURES
- **Mandatory Visibility**: Silent failures or hidden retries are forbidden.
- **Traceable Events**: All critical transitions (e.g., `BILLING_SETTLEMENT`) MUST be observable via the logger.
