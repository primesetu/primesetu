# Smriti Retail OS: Deployment SOP

**Phase:** Pilot Stabilization
**Scope:** Standard Operating Procedure for all frontend and backend deployments to pilot store environments.

> [!WARNING]
> **Pilot Freeze Window Active:** No non-SEV-1 deployments are permitted during active retail business hours. All scheduled updates must occur during End-of-Day (EOD) or Shift-Close maintenance windows.

---

## 1. Pre-Deployment Checklist

Before initiating any deployment to a live pilot store, the following conditions must be met:
1. **Pilot Freeze Window Verified:** Current local time is outside active billing hours.
2. **Telemetry Stable:** No active SEV-1 or SEV-2 incidents are currently open for the target `NODE_ID`.
3. **Queue Health:** The `celery_outbox` (SQLite) is empty and Redis `q_sync_delta` backlog is at zero. 
4. **Offline Sync Status:** All offline POS packets have been successfully synced to the Head Office.

---

## 2. Deployment Execution Steps

### Step 2.1: Backend Deployment
1. Halt Celery workers gracefully: `celery multi stopwait worker1`
2. Pull latest release branch.
3. Activate virtual environment: `source venv/bin/activate` (or `.\venv\Scripts\Activate.ps1`)
4. Install dependencies: `pip install -r requirements.txt`
5. Apply database migrations (if any, though schema changes are restricted): `alembic upgrade head`
6. Restart FastAPI service (via systemd or process manager).
7. Restart Celery workers: `celery multi start worker1 -A app.core.celery_app -l INFO`

### Step 2.2: Frontend (PWA) Deployment
1. Pull latest release branch.
2. Build static assets: `npm run build`
3. Verify build size governance (`scripts/build_size_check.js` will auto-run).
4. Deploy `dist/` to the static hosting provider or Nginx `www` directory.

---

## 3. Post-Deployment Verification

1. **Cold Boot Validation:** Open the POS route (`/billing`) in a fresh Incognito window to verify instant load and `__RUNTIME_CONFIG__` injection.
2. **Stale Chunk Verification:** Open an existing active browser session and attempt to navigate to a lazy-loaded route (e.g., `/dashboard`). Verify the Error Boundary gracefully triggers an app reload without a white screen of death.
3. **Hardware Health:** Verify thermal printer connection and barcode scanner focus retention.

---

## 4. Emergency Rollback Procedure

> [!IMPORTANT]
> **Rollback Sovereignty:** Store operators are authorized to execute this rollback immediately if checkout continuity is threatened, without waiting for engineering approval.

1. **Revert Frontend:** Immediately point Nginx/Host back to the previous known-good `dist_backup/` directory.
2. **Revert Backend:** `git checkout <previous_stable_tag>` and restart FastAPI. (Note: Because schema redesigns are frozen, DB rollbacks are not necessary during the pilot phase).
3. **Clear Caches:** Instruct cashiers to perform a hard refresh (`Ctrl + F5`) if the Service Worker does not automatically update.
4. **Log Incident:** File an RCA report via the Incident Governance Protocol detailing the exact operational failure that triggered the rollback.
