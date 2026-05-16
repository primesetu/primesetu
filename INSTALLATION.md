# 🛡️ SMRITI-OS: Installation & Deployment Guide

This guide covers the installation and configuration of **SMRITI-OS (Smriti Retail OS)**, an institutional-grade Retail Operating System designed for terminal sovereignty and offline-first reliability.

---

## 📋 System Requirements

*   **Operating System**: Windows 10 or 11 (64-bit).
*   **Memory**: 8 GB RAM (Minimum).
*   **Disk Space**: 1 GB (App + Runtimes) + Data storage.
*   **Permissions**: Administrator access required for installation and service registration.

---

## 🚀 Option 1: Standard Production Installation (Recommended)

This is the fastest way to deploy Smriti Retail OS for live store operations using the pre-compiled Windows Installer.

### 1. Run the Setup Wizard
1.  Locate `SmritiRetailOS_Setup_v1.exe` (generated via `build_retail_os.ps1`).
2.  **Right-click** and select **Run as Administrator**.
3.  Follow the standard installation wizard:
    *   Accept the License Agreement.
    *   Choose installation path (Default: `C:\SmritiOS`).
    *   Click **Install**.

### 2. The Bootstrap Process
During installation, a PowerShell console will appear. This is the **SMRITI-OS Bootstrap Wizard**. It will:
*   Verify all payload integrity (Python, Postgres, Redis, Caddy).
*   Extract application components.
*   Register and start core Windows Services (Redis, API, Frontend).

### 3. Launching the OS
1.  Once the installer finishes, a "Smriti POS" shortcut will be created on your **Desktop**.
2.  Double-click the shortcut to open the POS in your default browser.
3.  **Default URL**: `http://localhost:3000`

---

## 🛠️ Option 2: Developer / Manual Setup

Use this method if you are contributing to the codebase or need a custom setup.

### 1. Prerequisites
Ensure you have the following installed:
*   **Node.js 22.x** (LTS)
*   **Python 3.12+**
*   **Git**
*   **PostgreSQL** (Local) or **Supabase Account** (Cloud)

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in DATABASE_URL
uvicorn app.main:app --reload
```

---

## 🏗️ Option 3: Manual Production Installation (No Installer)

If you cannot use the `.exe` installer (e.g., on a headless server or custom environment), follow these manual deployment steps.

### Step 1: Database Initialization (PostgreSQL)
1.  Install **PostgreSQL 15+** on the local machine.
2.  Open `psql` or pgAdmin and create the database:
    ```sql
    CREATE DATABASE smriti_local;
    ```
3.  Configure `backend/.env`:
    ```env
    STORAGE_MODE=LOCAL_POSTGRES
    LOCAL_DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/smriti_local
    ```
4.  Run the bootstrap script:
    ```bash
    cd backend
    python scripts/init_local_db.py
    ```

### Step 2: Build & Host Frontend
1.  Compile the React app:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
2.  The production files are now in `frontend/dist`. These should be served via **Nginx** or **Caddy**.

### Step 3: Register Windows Services (Sovereign Mode)
To ensure the system starts automatically on boot, use **NSSM** (Non-Sucking Service Manager):

1.  **Backend Service**:
    ```powershell
    nssm install SmritiAPI "C:\Python311\python.exe"
    nssm set SmritiAPI AppParameters "-m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    nssm set SmritiAPI AppDirectory "C:\SmritiOS\backend"
    nssm start SmritiAPI
    ```

2.  **Web Server (Nginx)**:
    Install Nginx and point its `root` to the `frontend/dist` directory. Use the template in `deploy/deploy-local.ps1` for the reverse proxy configuration.

### Step 4: Firewall Configuration
Open the ports for store-wide access:
```powershell
netsh advfirewall firewall add rule name="SMRITI-OS Web" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="SMRITI-OS API" dir=in action=allow protocol=TCP localport=8000
```

---

## 🌐 Deployment Modes (Terminal Sovereignty)

SMRITI-OS supports three operational modes, configurable via the `deploy\switch-mode.ps1` script.

| Mode | Connectivity | Best For |
| :--- | :--- | :--- |
| **LOCAL** | 100% Offline | Maximum privacy, no internet stores. |
| **CLOUD** | Connected | Small stores using Supabase Cloud directly. |
| **HYBRID** | Sync-Enabled | Recommended. Local speed + Cloud backup/reports. |

### Switching Modes
To switch modes, run the following in an Administrator PowerShell:
```powershell
cd deploy
.\switch-mode.ps1 -Mode HYBRID
```

---

## 📡 Network & Access Configuration

### Local Network Access
To allow other machines in the same store to access the POS:
1.  Run the local deployment script:
    ```powershell
    .\deploy\deploy-local.ps1 -ServerIP "192.168.1.XXX"
    ```
2.  Ensure port `3000` (Web) and `8000` (API) are open in Windows Firewall.

### Hybrid Access (Cloudflare/FRP)
For remote management or mobile reporting:
```powershell
.\deploy\deploy-hybrid.ps1 -Mode CLOUDFLARE -Domain "yourstore.com"
```

---

## 🔍 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **POS won't load** | Check if `SmritiFrontend` and `SmritiAPI` services are running in `services.msc`. |
| **Database Error** | Verify `DATABASE_URL` in `backend/.env` is correct. |
| **Installer Fails** | Check logs at `C:\SmritiOS\logs\install_*.log`. |
| **Port Conflicts** | Ensure no other app is using port 3000 or 8000. |

---

## 📞 Support & Branding

*   **Brand**: ERPnBOOK
*   **Project**: SMRITI-OS (PrimeSetu)
*   **Support**: Siddharth M | +91-9323023007
*   **Email**: erpnbook@outlook.com
*   **Web**: [erpnbook.com](https://erpnbook.com)

© 2026 AITDL Network · All Rights Reserved
