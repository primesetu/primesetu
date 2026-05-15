# Smriti Retail OS: Backup & Recovery SOP

**Phase:** Pilot Stabilization
**Scope:** Standard Operating Procedure for securing and recovering operational data across all active Pilot Nodes.

> [!CAUTION]
> **Data Sovereignty is Absolute.** Retail databases contain transactional truth. A failure to execute this protocol during a crisis will result in irrecoverable loss of accounting integrity.

---

## 1. Automated Snapshot Governance

During the Pilot Phase, the following automated backup procedures must be active:

| Resource | Frequency | Retention | Destination |
| :--- | :--- | :--- | :--- |
| **PostgreSQL (`smriti_db`)** | Every 4 Hours | 30 Days | Encrypted S3 Bucket |
| **SQLite Outbox (`outbox.sqlite3`)** | Daily (EOD) | 14 Days | Local Encrypted Storage |
| **Redis Memory Dump (`dump.rdb`)** | Daily (EOD) | 7 Days | Local Encrypted Storage |
| **Workbox IndexedDB (PWA)** | Local Only | Persistent | Device Storage |

---

## 2. Manual Backup Execution (Pre-Hotfix)

If a SEV-1 emergency requires a hotfix, operators must manually snapshot the database before any code is deployed.

### Step 2.1: PostgreSQL Dump
Execute the following from the edge node terminal:
```bash
pg_dump -U smriti_admin -h localhost -d smriti_db -F c -f /backups/smriti_hotfix_$(date +%Y%m%d_%H%M%S).dump
```

### Step 2.2: SQLite Outbox Preservation
If the queue architecture is experiencing a Redis blackout, the SQLite outbox holds untransmitted transactions. **Never overwrite this file during a deployment.**
```bash
cp /app/backend/outbox.sqlite3 /backups/outbox_hotfix_$(date +%Y%m%d_%H%M%S).sqlite3
```

---

## 3. Catastrophic Recovery Protocol

In the event of complete container failure or database corruption:

1. **Halt Operations:** Immediately inform cashiers to switch to manual/paper billing if the PWA Offline Mode fails.
2. **Stop Services:** Halt FastAPI and Celery to prevent partial writes.
3. **Restore Database:**
   ```bash
   pg_restore -U smriti_admin -h localhost -d smriti_db -1 /backups/<LATEST_STABLE_DUMP>.dump
   ```
4. **Queue Reconciliation:** 
   * Before restarting workers, verify the restored database state.
   * If transactions are missing, sweep the `outbox.sqlite3` via the admin API once the system is online.
5. **Resume Operations:** Restart services and verify the `/billing` route.
