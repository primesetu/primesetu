# Walkthrough: Sovereign Connectivity Hub Refactor

Objective: Refactored the monolithic `ConnectivityGuard` into a modular, enterprise-grade architecture with domain-driven orchestration, security isolation, and operational governance.

## Changes Made

### 1. Domain Layer (`src/domain/connectivity/`)
- **Policy Engine**: Created `nodeManager.ts` with strict transition guards and concurrency protection.
- **Risk Assessment**: Created `riskAssessment.ts` to classify sync backlog into risk levels (LOW/MEDIUM/HIGH/CRITICAL).
- **Audit Logging**: Created `auditLogger.ts` with dual-destination (Console + LocalStorage) persistence.
- **Types**: Formalized `ConnectivityState` machine: `idle -> confirming -> entering_pin -> validating -> switching -> idle`.

### 2. Security Separation
- **PIN Verification Service**: Created `src/domain/auth/__mocks__/verifyManagerPin.ts` with a strict interface contract and production warnings.
- **Security Override UI**: PIN challenge decoupled from orchestration logic.

### 3. Custom Hooks (Orchestration Adapters)
- **`useNodeHealth`**: Lifecycle management for parallel node pings with `AbortController` cleanup.
- **`useNodeSwitch`**: Hardened state machine with **Rollback logic** (reverts on failure) and double-click protection.

### 4. Component Decomposition (Status)
- **`ConnectivityGuard.tsx`**: slim orchestrator managing high-level UI phases.
- **`ConnectivityStatusView.tsx`**: Decoupled "Disconnected" screen.
- **`ConnectivityHub.tsx`**: Settings and node selection dashboard.
- **`ConfirmationDialog.tsx`**: Shared, design-system compliant modal for operational warnings.

### 5. API Client Hardening
- **`client.ts`**: Added a centralized `healthCheck` method to standardise node validation.

### 6. Documentation
- Created `docs/02-architecture/sovereign-connectivity-architecture.md` defining the infrastructure governance policies.

## Verification Results

### Automated Tests
- **Logic Validation**: Verified `nodeManager` transition policy and `riskAssessment` thresholds via logic tests.
- **Full Build Check**: Successfully passed `tsc -b && vite build` (Verified via `npm run build`).

### Operational Verification
- **Rollback Safety**: Confirmed that the system reverts to `idle` without changing the URL if node validation fails.
- **Audit Trace**: Verified that `localStorage` correctly persists the `SW-XXXXXX` correlation ID and risk level.
- **Double-Click Protection**: Verified that concurrent switch attempts are blocked while `isBusy` is active.

### 6. Sovereign Configuration Engine
- **Type-Aware Editing**: `SystemParameters.tsx` now dynamically renders inputs (Toggle for Boolean, Number for Integer/Float) based on `opt_type`.
- **Category Sidebar**: Implemented a dynamic category sidebar that fetches and counts parameters from the sovereign database.
- **Multi-Tenant Isolation**: Updated `SmritiParam` to use a composite primary key `(tenant_id, param_code)` to ensure strict data isolation in shared environments.

### 7. Secure HQ Governance Protocol
- **RCE Mitigation**: Completely removed raw SQL execution from the HO pulse. Commands are now routed through a typed dispatcher with hardcoded handlers.
- **Operator-in-the-Loop**: Implemented `GovernanceGuard` UI, requiring local manager authorization before executing destructive remote commands.
- **Health Telemetry**: Added `useHoPulse` hook for periodic node heartbeat with built-in command retrieval.

### 8. Hardening Refinements
- **Security Gates**: Added `import.meta.env.PROD` check to `verifyManagerPin.ts` to block mock auth in production.
- **Monetary Integrity**: Updated `update_sovereign_sysparam` to store currency ('C') as integer paise in the backend.
- **Performance Optimization**: Implemented local category caching in `SystemParameters.tsx` to reduce API chatter.
- **Audit Resilience**: Formalized the 100-event ring-buffer for `localStorage` audit traces.
