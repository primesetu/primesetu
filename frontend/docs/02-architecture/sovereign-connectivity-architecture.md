# Sovereign Connectivity Architecture (Smriti-OS v3.2)

## 1. Overview
The Sovereign Connectivity layer manages the handshake between the Smriti-OS frontend and distributed backend nodes (Local, Cloud, or Tunnel). It is designed for **offline-first resilience**, **transactional integrity**, and **institutional security**.

## 2. Core Layers

### 2.1 Domain Layer (`src/domain/connectivity/`)
- **Stateless Policies**: Pure logic for node validation and risk assessment.
- **Node Manager**: Validates node identity (`service === "smriti-os"`) and negotiates capabilities.
- **Risk Assessment**: Classifies the sync backlog (LOW to CRITICAL) to prevent data mismatch during node switching.
- **Audit Logger**: Generates structured event logs with Correlation IDs for institutional compliance.

### 2.2 Orchestration Hooks (`src/hooks/connectivity/`)
- **`useNodeHealth`**: Manages parallel pings to known node presets with `AbortController` cleanup.
- **`useNodeSwitch`**: Manages the multi-step workflow: `Validation -> Risk Check -> Security Override -> State Migration`.

### 2.3 Component Layer (`src/components/connectivity/`)
- **Orchestrator**: `ConnectivityGuard.tsx` acts as a slim shell.
- **Status Views**: Decoupled UI for "Disconnected" alerts and "Connection Hub" management.
- **Security Override**: Decoupled PIN challenge UI.

## 3. Security Model (RBAC)
- **Manager PIN**: Elevated node-switch operations require a Manager PIN.
- **Service Isolation**: Verification is performed by a dedicated service (`verifyManagerPin`), decoupling the UI from the security implementation.
- **Correlation IDs**: Every switch flow generates a unique `SW-XXXXXX` ID used to correlate UI events with audit logs.

## 4. Operational Governance
- **Sync Backlog Guard**: Users are warned of the risk level based on pending transactions before a node switch is applied.
- **Capability Negotiation**: Nodes are validated for:
    - HTTPS (for remote nodes).
    - Service Identity (`smriti-os`).
    - Version/Phase compatibility.

## 5. State Machine
| State | Description |
|---|---|
| `idle` | System is operating normally or awaiting user input. |
| `checking` | Heartbeat pulse active on current node. |
| `validating` | New node candidate is being assessed for capabilities. |
| `awaiting_auth` | Manager PIN entry required. |
| `switching` | Applying node URL to API client and flushing sync state. |
| `error` | Validation or switch failure. |

---
*© 2026 AITDL Network · Sovereign Stack Phase 2*
