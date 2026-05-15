# Smriti Retail OS: Operational Incident Governance Protocol

**Phase:** Pilot Stabilization
**Scope:** Real-world incident tracking, telemetry monitoring, and Root Cause Analysis (RCA).

During the Pilot Phase, architecture changes are frozen. The focus shifts entirely to observing the system under physical retail duress. All operational anomalies, cash register friction, and queue bottlenecks must be formally tracked through this protocol before any code is touched.

---

## 1. Incident Severity Tiers

| Tier | Definition | Response Protocol |
| :--- | :--- | :--- |
| **SEV-1** | **Operational Halting** (e.g., POS offline and Workbox failed, barcode scanner stops responding, duplicate billing). | Immediate mitigation. Hotfix permitted if telemetry confirms core logic failure. |
| **SEV-2** | **Degraded Recovery** (e.g., Redis down and Outbox failing to sweep, printers jamming UI). | Logged for daily review. No immediate code changes unless cumulative impact stalls checkout lines. |
| **SEV-3** | **Telemetry / Latency Drift** (e.g., `q_sync_delta` backlog building up, DB CPU > 70%). | Monitored. Addressed in scheduled maintenance windows only. |

---

## 2. Deployment & Rollback Governance

### Pilot Freeze Window
**Rule:** No non-SEV-1 deployments permitted during active retail business hours.
**Rationale:** Retail deployments during billing hours lead to immediate operational suicide and cashier confusion. All scheduled updates must occur during End-of-Day (EOD) or Shift-Close maintenance windows.

### Rollback Sovereignty
**Rule:** Store operators are authorized to rollback to the previous stable build immediately if checkout continuity is threatened.
**Rationale:** This ensures absolute operational sovereignty without waiting for engineering approval.

### Incident Pattern Escalation Rule
**Rule:** A single incident does not justify architectural change. Repeated incidents across multiple pilot stores may escalate into governance review.
**Rationale:** This prevents reactive architecture churn and enforces data-driven evolution based on telemetry rather than panic.

---

## 3. Root Cause Analysis (RCA) Template

Whenever a SEV-1 or SEV-2 incident occurs in a pilot store, this RCA template must be completed before any architecture refactor is proposed.

### Incident Overview
* **Incident ID:** `INC-YYYYMMDD-###`
* **Date & Time:** 
* **Store Node ID:**
* **Severity:**
* **Symptoms:** (e.g., "Cashier reported 5-second delay before receipt printed.")

### Telemetry Forensics
* **Trace ID / Correlation ID:**
* **Structlog Output:** (Attach relevant JSON log traces)
* **Queue Status:** (e.g., "DLQ contained 4 poison pills; Outbox had 12 pending tasks")

### The "5 Whys" Analysis
1. *Why did it fail?*
2. *Why did that happen?*
3. *Why did that happen?*
4. *Why did that happen?*
5. *Why did the safeguard fail?*

### Mitigation & Resolution
* **Immediate Fix Applied:** (e.g., "Swept SQLite outbox manually via Admin API.")
* **Long-Term Corrective Action:** (Must be justified against the "No Architecture Rewrite" rule. e.g., "Increase `q_notifications` soft timeout from 10s to 30s to handle rural WhatsApp API latency.")

---

## 4. Telemetry Retention Governance

To maintain a balance between database/storage health and auditability, the following retention limits apply to all pilot telemetry:

| Data Type | Retention Period | Action Post-Retention |
| :--- | :--- | :--- |
| **Structlog Traces** | 30 Days | Purged from Loki/Datadog to preserve storage. |
| **DLQ Payloads** | 90 Days | Archived to cold storage for long-term integration debugging. |
| **Outbox Snapshots** | 14 Days | Auto-vacuumed from local SQLite once successfully dispatched. |
| **RCA Reports** | Permanent | Stored in institutional knowledge base for architecture evolution. |

---

## 5. Key Telemetry Watch-points

Store operators and monitoring tools must actively track these specific metrics during the Pilot Phase:

1. **Cashier Friction (UX Latency):** Time elapsed between pressing "Pay" and focus returning to the barcode scanner. Target: < 300ms.
2. **Offline Recovery Drop-offs:** Instances where the Workbox Service Worker fails to intercept `/billing` during an ISP drop.
3. **Outbox Accumulation:** If `celery_outbox` in SQLite grows beyond 100 rows, Redis connectivity at the edge node is critically unstable.
4. **DLQ Poison Pills:** Tasks entering `dlq_smriti_unresolved` indicate legacy data structures that the new R4 tasks cannot parse. Do not delete them; use the admin API to inspect the exact legacy `shoper9` malformed payloads.
5. **Slow Query Warnings:** Any `structlog` entry flagging `request_latency_ms > 1000` must be aggregated to identify missing PostgreSQL indexes before altering `legacy_s9.py`.

---

## 6. Protected Runtime Files

The following files constitute the operational bedrock of the Smriti-OS pilot architecture. **They must not be casually refactored, "modernized," or cleaned up without extensive governance review.**

* `backend/app/routers/billing.py`
* `backend/app/core/security.py`
* `backend/app/core/celery_app.py`
* `backend/app/core/queue_dispatcher.py`
* `backend/app/db/legacy_s9.py`
* `frontend/public/runtime-config.json`
* `frontend/src/main.tsx`
* `frontend/src/api/client.ts`
* `frontend/public/sw.js` (Workbox Service Worker)

---

> [!WARNING]
> **Strict Governance:** Under no circumstances should `legacy_s9.py` be refactored or modernized in response to a single incident. The stable legacy schema will only be modified if telemetry consistently proves an unrecoverable operational bottleneck across multiple pilot stores.
