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
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)](https://web.dev/progressive-web-apps/)

**PrimeSetu** is an institutional-grade Retail Operating System designed to achieve 100% operational parity with Shoper9. It combines modern aesthetics with "Zero Cloud" data sovereignty, providing a high-speed, AI-governed environment for high-volume retail.

---

## 🚀 Key Operational Pillars

### 1. ⌨️ Frontline "Fast-Billing" Engine
*   **Terminal Mode:** 100% keyboard-driven interface using Shoper9 muscle-memory hotkeys (`F2`, `F5`, `F8`, `F10`, `Alt+1`).
*   **Queue Management:** Instant "Suspend/Recall" logic for high-volume environments.
*   **Sovereign Shortcut Guard:** Native browser protection against accidental navigation during POS operations.

### 2. 📑 Advanced Inventory & Reconciliation
*   **Day-End (EOD) Module:** Automated reconciliation of cash, card, and digital payments with institutional audit trails.
*   **Post-Audit Adjustments:** Seamless inventory correction and bill-reprint functionalities with forensic logging.
*   **PDT Integration:** High-speed bulk inventory import via Portable Data Terminals.

### 3. 📊 MIS & Profitability Intelligence
*   **Real-Time Margin Tracking:** Live profitability analysis at the bill level.
*   **7-Day Trailing Trends:** Revenue monitoring grouped by sovereign date signatures.
*   **HQ Pulse Engine:** Live heartbeat synchronization with Corporate Head Office for multi-store telemetry.

### 4. 🌉 Institutional Bridges
*   **Tally.ERP 9 / TallyPrime:** Native XML voucher generation for seamless accounting.
*   **Native Hardware:** Thermal precision `ESC/POS` printing with zero-latency background execution.

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TS + Tailwind | Sovereign Terminal UI (PWA Ready) |
| **Backend** | Python 3.12 + FastAPI | Async Business Logic & Tally Integration |
| **Database** | PostgreSQL (Supabase) | Atomic Data Persistence with RLS |
| **Offline** | IndexedDB (`idb`) | Sovereign Fallback for Network Instability |
| **Shortcuts** | `react-hotkeys-hook` | POS "Muscle Memory" Keyboard Logic |
| **Analytics** | Recharts | Institutional MIS Visualizations |

---

## ⚙️ Quick Start

### 1. Prerequisites
*   **Node.js** (LTS) & **Python 3.12+**
*   **Supabase** Account (for Database & Auth)

### 2. Unified Development Environment
PrimeSetu uses a unified command to launch both the Sovereign Frontend and the FastAPI Backend:

```bash
# Install dependencies (Root)
npm install

# Install Backend dependencies
cd backend
python -m venv venv
source venv/bin/activate # venv\Scripts\activate on Windows
pip install -r requirements.txt
cd ..

# Launch Integrated Environment
npm run dev
```

### 3. Environment Configuration (`.env`)
Ensure your `.env` file in the root/backend contains:
*   `SUPABASE_URL`: Your Supabase project URL.
*   `SUPABASE_KEY`: Your Supabase Anon/Service Key.
*   `JWT_SECRET`: Secret for backend verification.

---

## 📜 AI Protocol & Governance
PrimeSetu is built under strict **AI-Governed Development Protocols**. Every contribution must adhere to:
*   `AGENTS.md` (Sovereign Role Definitions)
*   `aiprotocol.md` (Structural Laws)
*   `AI_GUIDELINES.md` (Zero-Defect Coding Standards)

**© 2026 AITDL Network · All Rights Reserved**  
*"Memory, Not Code."*
