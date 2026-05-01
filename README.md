<!-- 
  ============================================================
  * SMRITI-OS — Shoper9-Based Retail OS
  * Zero Cloud · Sovereign · AI-Governed
  * ============================================================
  * System Architect   :  Jawahar R Mallah
  * Organisation       :  AITDL Network
  * Project            :  SMRITI-OS (PrimeSetu)
  * © 2026 — All Rights Reserved
  * "Memory, Not Code."
  * ============================================================ 
-->

# 🛡️ SMRITI-OS: The Sovereign Retail Platform

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![AG Grid](https://img.shields.io/badge/AG_Grid-0035A0?style=for-the-badge&logo=ag-grid&logoColor=white)](https://www.ag-grid.com/)

**SMRITI-OS** is an institutional-grade Retail Operating System designed to achieve 100% operational parity with Shoper9 while establishing a new standard for **Terminal Sovereignty**. It is no longer just a "project"; it is a hardened, metadata-driven **Retail Execution Engine**.

---

## 🚀 Architectural Sovereignty (The UTS Protocol)

The system has been transformed into a fully autonomous platform via the **Universal Transaction Shell (UTS)**. Every interaction is governed by metadata, not code.

### 🏛️ Core Governance Rules (SMRITI-OS Laws)
*   **RULE-016 (Metadata Sovereignty):** All UI elements (Grids, Forms, Columns) are driven by `AcceptDisplayDtls` from the database. No hardcoded JSX.
*   **RULE-017 (Behavioral Controls):** Field properties (editable, required, validation) are dynamically applied at runtime based on the transaction mask.
*   **RULE-021 (Validation Sovereignty):** Business rules live in the database. The UI enforces them using the `useValidator` engine but never invents them.
*   **RULE-023 (Action-Based Permissions):** Sensitive operations (Voids, High Discounts) are PIN-gated via a thin-client auth pattern.
*   **RULE-024 (Write Sovereignty):** Every transaction is vaulted in IndexedDB *before* network transmission, ensuring zero data loss during outages.
*   **RULE-025 (Design Governance):** Visual standards are governed by the **Sovereign Design System** via Stitch MCP, ensuring institutional parity across all modules.

---

## 🧱 Stabilized Modules (Phase 1-10.5)

### 1. ⌨️ Sovereign Billing Terminal (UTS-1300)
*   **Unified AI Grid (LOCKED):** AG Grid (Quartz Standard) is now the universal data interface across Billing, Search, and Intelligence modules.
*   **Hardened Hotkey Engine:** Refactored to a stable, event-driven listener system, eliminating React "Rules of Hooks" violations and ensuring 100% keyboard reliability.
*   **Dynamic Entry Engine:** A barcode-first entry row that adapts its fields (Qty, Staff, Disc%) based on the active transaction mask.
*   **Institutional Handshake:** Parallel fetching of all structural masks (Entry, Grid, Zone C, Hotkeys) with robust fallback for offline scenarios.

### 2. 🗄️ The Offline Vault & Audit Ledger
*   **IndexedDB Durability:** Automatic cart session persistence for seamless crash recovery.
*   **Asynchronous Sync Queue:** A background FIFO resolver that synchronizes vaulted bills once the network connection is restored.
*   **Immutable Audit Ledger:** A forensic-grade event log tracking every cashier interaction with millisecond precision.
*   **Legacy Data Access:** 25 core stored procedures extracted from `Shoper9x01` for deep logic analysis and migration validation.

### 3. 🔐 Security Gatekeeper
*   **Manager Override Engine:** A PIN-gated authorization modal for high-risk actions.
*   **Audit-Ready Architecture:** All overrides and sensitive mutations are attributed, timestamped, and logged to the institutional ledger.

---

## 🛠️ Technical Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Grid Engine** | AG Grid React | Sovereign AI Grid (Quartz Standard) |
| **Durability** | IndexedDB (`idb`) | Sovereign Vault & Audit Ledger |
| **Hydration** | TanStack Query | Parallel metadata & mask fetching |
| **Logic** | React 18 + TS | Sovereign Terminal logic with strict type parity |
| **Backend** | FastAPI + Supabase | Async business logic & PostgreSQL persistence |
| **Design** | Stitch MCP | Institutional Design System & Screen Governance |

---

## ⚙️ Quick Start

### 1. Prerequisites
*   **Node.js (LTS)** & **Python 3.12+**
*   **MSSQL Server** (Shoper9 Legacy Bridge)
*   **Supabase Project** (Database & Auth)

### 2. Launch Integrated Environment
```bash
# Install dependencies
npm install

# Setup backend (one-time)
cd backend && python -m venv venv && pip install -r requirements.txt && cd ..

# Start Dev Server (Integrated)
npm run dev
```

---

## 🗺️ Roadmap
*   **Phase 11 — Tally Bridge:** Native XML voucher generation for TallyPrime integration.
*   **Phase 12 — Thermal ESC/POS:** Byte-level printer control for high-speed receipts.
*   **Phase 13 — Cashier Intel:** Real-time performance tracking (IPS, Void rates, Latency).

---

**© 2026 AITDL Network · All Rights Reserved**  
*"Memory, Not Code."*
