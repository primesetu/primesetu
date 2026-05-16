# Smriti Retail OS — Runtime & API Governance
# Authoritative Source: Engineering Rules v1.2

## 1. RUNTIME CONFIG GOVERNANCE
- **Dynamic Resolution**: All runtime endpoints MUST resolve dynamically via `RuntimeConfigStore`.
- **No Hardcoding**: Hardcoding API URLs, node addresses, or environment-specific URLs is STRICTLY FORBIDDEN.
- **Environment Isolation**: Using `process.env` directly for API URLs is forbidden to ensure build-time independence.

## 2. API CLIENT GOVERNANCE
- **Centralized Boundary**: All API access MUST flow through the centralized `apiClient`.
- **Binding Rule**: The client MUST be bound to `RuntimeConfigStore` resolution.
- **DTO Integrity**: All requests/responses MUST align with FastAPI DTO contracts.

## 3. TYPE SAFETY GOVERNANCE
- **Authoritative Source**: All API types MUST originate from `@/api/schema.d.ts` (OpenAPI-generated).
- **No Shadow Types**: Manual interface duplication or shadow DTO definitions are strictly forbidden.
- **Semantic Lineage**: Preserve field names (e.g., `STOCKNO`, `MRP`) across the API-Frontend boundary.

## 4. RUNTIME SOVEREIGNTY
- **Local Priority**: The system MUST prioritize local node connectivity over cloud sinks.
- **Fallback Logic**: API clients MUST support deterministic fallback to local offline proxies when cloud connectivity is severed.
