<!-- 
  ============================================================
  * PrimeSetu — Shoper9-Based Retail OS
  * Zero Cloud · Sovereign · AI-Governed
  * ============================================================
  * System Architect   :  Jawahar R. M.
  * Organisation       :  AITDL Network
  * Project            :  PrimeSetu
  * © 2026 — All Rights Reserved
  * "Memory, Not Code."
  * ============================================================ 
-->

# 🛡️ PrimeSetu: The Sovereign Retail OS

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)

**PrimeSetu** is a high-performance, institutional-grade Retail Operating System designed to achieve 100% operational parity with legacy systems like Shoper9, while providing modern "Zero Cloud" data sovereignty and AI-governed intelligence.

---

## 🚀 Key Operational Pillars

### 1. ⌨️ Frontline "Fast-Billing" Engine
*   **Terminal Mode:** 100% keyboard-driven interface using Shoper9 muscle-memory hotkeys (`F2`, `F5`, `F8`, `F10`, `Alt+1`).
*   **Queue Management:** Instant "Suspend/Recall" logic for high-volume environments.
*   **Forensic Returns:** Ledger-linked return system with automated Credit Note (CN) issuance and tax reconciliation.

### 2. 🖨️ Native Hardware Integration
*   **Thermal Precision:** Print-optimized `ESC/POS` receipt generation for 80mm thermal printers.
*   **Zero-UI Printing:** Seamless background printing using browser-native `@media print` directives for latency-free checkout.

### 3. 📊 MIS Intelligence & Audit
*   **Institutional Analytics:** Real-time Gross Revenue, Stock Valuation, and Category-wise distribution.
*   **7-Day Trailing Trends:** Daily revenue monitoring grouped by sovereign date signatures.
*   **Audit-Ready:** Every transaction is cryptographically tied to a store node and user session.

### 4. 🌉 Corporate Bridges
*   **Tally.ERP 9 / TallyPrime:** Native XML voucher generation for seamless accounting synchronization.
*   **PDT Integration:** High-speed bulk inventory import via Portable Data Terminals.
*   **HO Telemetry:** Secure, JWT-authorized synchronization with Corporate Head Office (HQ).

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Sovereign Terminal UI |
| **Backend** | Python 3.12 + FastAPI | Asynchronous Business Logic |
| **Database** | PostgreSQL (Supabase) | Atomic Data Persistence |
| **Security** | JWT + Supabase Auth | RBAC & Identity Management |
| **Styling** | Vanilla CSS + Framer Motion | Premium Aesthetics & Micro-animations |
| **Shortcuts** | `react-hotkeys-hook` | Keyboard-Only Efficiency |

---

## ⚙️ Quick Start

### 1. Prerequisites
*   Node.js (LTS)
*   Python 3.12+
*   Supabase Account (for DB/Auth)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
# Configure .env with SUPABASE_URL, SUPABASE_KEY, and JWT_SECRET
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure .env.local with VITE_API_URL and VITE_SUPABASE keys
npm run dev
```

---

## 📜 AI Protocol & Governance
PrimeSetu is built under strict **AI-Governed Development Protocols**. Every contribution must adhere to:
*   `AGENTS.md` (Role Definition)
*   `aiprotocol.md` (Structural Rules)
*   `AI_GUIDELINES.md` (Coding Standards)

**© 2026 AITDL Network · All Rights Reserved**  
*"Memory, Not Code."*
