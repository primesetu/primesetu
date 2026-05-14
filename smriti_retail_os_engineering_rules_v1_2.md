**SMRITI RETAIL OS**

Engineering Rules & Policies

**Version 1.2**

**ERPnBOOK**

System Architect: Jawahar Ramkripal Mallah

---

**Version 1.2 Change Summary** Added seven new governance sections based on architectural review of v1.1: Transaction Boundary Policy · Event Logging Architecture · Disaster Recovery Policy · Version Compatibility Matrix · Observability Policy · Master Data Governance · Licensing & Node Activation Policy. All existing v1.1 content is preserved without modification.

---

# **Purpose of This Document**

*This document defines the official engineering rules, architectural policies, modernization principles, workflow standards, and development boundaries for Smriti Retail OS under the ERPnBOOK ecosystem.*

The purpose of these rules is to:

* protect the operational core and maintain retail stability  
    
* avoid destructive redesign mistakes and modernize safely  
    
* standardize development direction and accelerate AI-assisted development  
    
* maintain long-term scalability and preserve proven retail intelligence

**All AI agents, developers, and contributors must treat this document as the authoritative source of architectural truth.**

# **Core Engineering Philosophy**

### **Principle 1 — Operational Stability First**

Never sacrifice stable retail operations for unnecessary architectural experimentation.

### **Principle 2 — Modernize Around the Core**

The operational schema and business logic already represent decades of retail learning. Do NOT rewrite proven operational systems without documented justification and explicit architect sign-off.

### **Principle 3 — User Workflow Over Technical Fashion**

Retail users care about speed, reliability, simplicity, operational continuity, keyboard efficiency, and minimal interruptions. Not architectural hype.

### **Principle 4 — Transactions Are Local**

All critical operational workflows must remain locally executable: billing, stock deduction, returns, printing, inventory transactions, cashier operations.

### **Principle 5 — Intelligence Belongs in the Cloud**

Cloud infrastructure should primarily handle analytics, dashboards, reporting, notifications, owner visibility, AI insights, and centralized monitoring.

### **Principle 6 — Operational Continuity Is Sacred**

Billing downtime tolerance is zero during store hours. The system must keep running regardless of network state, cloud availability, or peripheral failures.

# **Development Priority Order**

When trade-offs arise, resolve them in this order:

| Priority | Domain |
| :---- | :---- |
| Priority 1 | Operational stability |
| Priority 2 | Billing speed and reliability |
| Priority 3 | Offline continuity |
| Priority 4 | Workflow optimization |
| Priority 5 | Setup simplicity |
| Priority 6 | Cloud intelligence |
| Priority 7 | Advanced AI features |

# **Development Roadmap**

| Phase | Goal |
| :---- | :---- |
| Phase 1 | Stable local billing runtime |
| Phase 2 | Modern API abstraction layer |
| Phase 3 | Connection and Setup Wizard |
| Phase 4 | Cloud reporting system |
| Phase 5 | Offline queue and sync stabilization |
| Phase 6 | AI-enhanced analytics |
| Phase 7 | Advanced multi-store ecosystem |

# **Operational Core Protection Policy**

## **Definition**

The Operational Core includes: billing flows, stock flows, taxation behavior, inventory movement, transaction sequencing, document numbering, operational tables, cashier logic, and accounting relationships.

## **Philosophy**

*This core represents decades of accumulated retail intelligence. Preservation comes first. Modernization wraps around the core — it does not replace it.*

## **Rules**

**RULE 1** — Do NOT redesign operational tables without documented justification and explicit architect sign-off.

**RULE 2** — Do NOT casually rename legacy operational fields. Any field rename requires a migration plan and backward compatibility assessment.

**RULE 3** — Do NOT expose operational tables directly to frontend systems. All frontend communication must pass through APIs.

Correct:   Frontend → FastAPI → PostgreSQL

Incorrect: Frontend → Database

**RULE 4** — Do NOT destroy proven retail workflows in pursuit of clean architecture. Operational maturity is more valuable than theoretical purity.

**RULE 5** — Always preserve backward operational compatibility whenever possible.

**RULE 6** — All schema changes to operational tables must go through versioned Alembic migrations. Direct ALTER TABLE on production without a migration file is forbidden.

**RULE 7** — Every migration must include a rollback script. Migrations must be tested against a copy of production data before deployment.

## **Guidelines**

* *Prefer additive schema changes (new columns, new tables) over destructive ones.*  
    
* *When a legacy field name is misleading, add a documented alias in the API layer rather than renaming the column.*

# **Concurrency & Race Condition Policy**

## **Philosophy**

*Multi-cashier billing environments create concurrent access to shared stock records. Application-level checks are insufficient. Database-level enforcement is mandatory.*

## **Rules**

**RULE 1** — Stock deduction must use database-level locking. SELECT FOR UPDATE or optimistic concurrency with a version column is required. Application-level checks alone are explicitly forbidden as the sole guard.

**RULE 2** — Cashier sessions must be isolated. One cashier's in-progress bill must not be visible to or modifiable by another session until saved or cancelled.

**RULE 3** — Concurrent bill saves on the same item must serialize at the database level, not the application level.

**RULE 4** — Optimistic concurrency failures must return a user-friendly retry prompt. Never silently fail or silently overwrite.

## **Guidelines**

* *Use PostgreSQL advisory locks for workflows spanning multiple tables that cannot be handled by row-level locking alone.*  
    
* *Log all lock contention events for operational monitoring.*

# **Transaction Boundary Policy** *(new in v1.2)*

## **Philosophy**

*A billing transaction is not complete until all its components — bill record, stock deduction, payment record, and audit log — have committed atomically. Partial commits create financial inconsistency and are worse than a clean failure.*

## **Atomic Boundary Definitions**

The following operation groups must commit as a single atomic unit. Partial success within a group is not acceptable.

| Transaction | Atomic Components |
| :---- | :---- |
| Bill save | Bill record \+ line items \+ stock deduction \+ payment record \+ audit log entry |
| GRN entry | GRN header \+ line items \+ stock increment \+ supplier ledger update \+ audit log entry |
| Return processing | Return record \+ bill reference update \+ stock restoration \+ payment reversal \+ audit log entry |
| Stock adjustment | Adjustment record \+ stock balance update \+ audit log entry |
| HO command execution | Command state update \+ data change \+ audit log entry |

## **Rules**

**RULE 1** — Bill save, stock deduction, payment record, and audit log entry must commit atomically within a single database transaction. A bill must never exist in the database without its corresponding stock deduction, and vice versa.

**RULE 2** — If any component of an atomic transaction fails, the entire transaction must roll back. The system must return to a clean pre-transaction state.

**RULE 3** — Print job initiation must happen after the database transaction commits — never inside it. Print failure must never cause a transaction rollback.

**RULE 4** — Stock reservation for an in-progress bill must be handled via a soft-reserve mechanism (reserved\_qty column), not by pre-deducting stock before bill save.

**RULE 5** — Soft stock reservations must expire automatically after a configurable timeout (SmritiParam: BILL\_RESERVATION\_TIMEOUT\_MINUTES, default: 30). Expired reservations must release stock and notify the cashier.

**RULE 6** — Partial bill failure (e.g., one line item fails tax validation) must reject the entire bill. Partial saves are forbidden.

**RULE 7** — Transaction rollback events must be logged to the operational event log with the failure reason, cashier ID, and bill state at time of failure.

## **Guidelines**

* *Use PostgreSQL savepoints for nested operations where you need partial rollback within a larger workflow.*  
    
* *Never use application-level compensation logic (manual undo) as a substitute for database transaction rollback.*  
    
* *Test rollback behavior explicitly: simulate failures at each stage of the atomic boundary to confirm clean rollback.*

# **Idempotency Policy**

## **Philosophy**

*Retry logic exists at multiple layers: offline queue replay, network retries, cashier re-submission, HO command re-delivery. Without idempotency, retries create duplicate bills and duplicate stock movements — both financially destructive.*

## **Rules**

**RULE 1** — Every mutation operation that can be retried must be idempotent: bill save, GRN entry, stock adjustment, return processing, offline sync packet replay, and HO command execution.

**RULE 2** — Every mutation must accept a client-generated idempotency\_key. The backend must deduplicate within a minimum 24-hour window for billing operations.

**RULE 3** — Duplicate detection must happen at the database level (unique constraint on idempotency\_key), not application logic alone.

**RULE 4** — A duplicate request must return the original successful response — not an error, and not a second execution.

**RULE 5** — HO governance commands must be idempotent. The same command\_id delivered twice must execute only once.

## **Guidelines**

* *Use UUIDs as idempotency keys, generated client-side before the request is sent.*  
    
* *Store idempotency keys in a dedicated table with TTL-based cleanup.*

# **Database Governance Policy**

## **Philosophy**

*The migrated Shoper9 PostgreSQL schema is the operational foundation. It contains retail intelligence, historical operational patterns, proven transaction logic, and validated business behavior built over decades.*

## **Rules**

**RULE 1** — Operational tables are the source of truth for store operations.

**RULE 2** — Frontend applications must never directly depend on raw table structures. All access must use DTOs and API models.

**RULE 3** — All database access must pass through service and business layers.

**RULE 4** — Analytics and reporting schemas must remain separate from operational schemas.

**RULE 5** — Reporting queries must execute against a read replica, materialized view, or pre-aggregated reporting table. Direct reporting queries against the primary operational connection are forbidden.

**RULE 6** — Heavy analytics must never directly hit the operational transaction tables.

**RULE 7** — PostgreSQL must never be exposed directly to the public internet.

## **Guidelines**

* *Use separate database connections or connection pools for operational vs. reporting workloads.*  
    
* *Schedule heavy analytical queries during off-peak hours where possible.*  
    
* *Pre-aggregate daily summaries at end-of-day rather than computing them on demand.*

# **Data Retention & Archival Policy**

## **Philosophy**

*GST compliance mandates minimum 7-year retention of financial records. Unmanaged data growth degrades operational query performance. Archival must be non-disruptive.*

## **Rules**

**RULE 1** — Financial transaction records must be retained for a minimum of 7 years to satisfy GST and income tax audit requirements.

**RULE 2** — Archival must never delete operational records. Archived records must remain queryable through a reporting interface.

**RULE 3** — Operational tables should only contain recent active data. Records older than a configurable window (default: 2 years) should move to archival tables.

**RULE 4** — Archival operations must run asynchronously and must never block billing or stock operations.

**RULE 5** — The archival boundary (date cutoff) must be a SmritiParam configurable by HQ — not hardcoded.

## **Guidelines**

* *Use PostgreSQL RANGE partitioning on transaction date to make archival efficient and non-disruptive.*  
    
* *Test archival scripts against production-sized data before scheduling.*

# **API Architecture Policy**

## **Philosophy**

*FastAPI acts as the abstraction layer, modernization gateway, validation engine, workflow orchestrator, security boundary, and compatibility layer between the modern frontend and the operational legacy core.*

## **Rules**

**RULE 1** — Frontend communicates only through APIs. No exceptions.

**RULE 2** — API contracts must remain stable even when the internal schema evolves. Breaking changes require versioning (/api/v2/...), not silent modification.

**RULE 3** — Never expose legacy table complexity directly to the frontend.

**RULE 4** — Business rules belong in service layers: tax validation, stock validation, duplicate prevention, workflow approvals, discount authorization.

**RULE 5** — All APIs must return standardized response structures with consistent error formats.

**RULE 6** — All external communication must use authenticated APIs. Operational credentials must never exist inside frontend code.

**RULE 7** — Role-based access control is mandatory on all API endpoints. Permission checks must happen in middleware — not inside individual handlers.

## **Guidelines**

* *Use Pydantic models for all request and response validation.*  
    
* *Separate read DTOs from write DTOs to avoid accidental exposure of internal fields.*  
    
* *API response envelopes should include: success, data, error, timestamp, request\_id.*

# **GST & Taxation Compliance Policy**

## **Philosophy**

*Indian GST compliance is non-negotiable. Taxation errors create legal liability for store owners. Tax logic must be centralized, server-side, and validated before any bill is saved.*

## **Rules**

**RULE 1** — Tax calculation must happen server-side, inside the business service layer. Client-side tax calculation is forbidden.

**RULE 2** — HSN/SAC code validation is mandatory before a bill can be saved. Bills with missing or invalid HSN codes must be rejected at the API layer.

**RULE 3** — GSTIN format must be validated on entry (15-character: 2-digit state code \+ 10-char PAN \+ 1 entity code \+ 1 check digit).

**RULE 4** — Tax rounding must happen at the paise level (integer). Float-based tax values are forbidden. All monetary values are stored and transmitted as integer paise.

**RULE 5** — Reverse charge applicability must be evaluated by the service layer — it cannot be a manual cashier toggle without manager authorization.

**RULE 6** — Tax rate changes must be applied through SmritiParam config updates via the HO governance protocol — not through direct database edits or code changes.

**RULE 7** — Every bill must store the tax rates applicable at time of billing. Rate changes must not retroactively alter historical records.

## **Guidelines**

* *Maintain a tax rate audit trail: every rate change records who changed it, when, and the previous value.*  
    
* *Test tax calculation against known GST council examples before deploying rate changes.*  
    
* *Separate CGST, SGST, IGST, and CESS as distinct columns in billing records — never combine them.*

# **Security Governance Policy**

## **Philosophy**

*Security must protect operational continuity, store data, financial integrity, user access, and infrastructure stability.*

## **Rules**

**RULE 1** — Never expose PostgreSQL directly to the public internet.

**RULE 2** — All external communication must use authenticated APIs with secure token-based systems.

**RULE 3** — Role-based access control is mandatory. Minimum roles: Cashier, Manager, Owner, HQ Admin.

**RULE 4** — Manager PIN policies: minimum 4 digits, lockout after 5 consecutive failures, minimum 15-minute lockout. PINs must be stored hashed — never plaintext.

**RULE 5** — Cashier sessions must auto-expire after configurable inactivity (default: 30 minutes).

**RULE 6** — Operational credentials must never exist inside frontend code or version control.

**RULE 7** — Audit logging is mandatory for: bill save/cancel/modify, stock adjustment, price override, discount override, GRN entry, config changes, HO command execution, user login events.

**RULE 8** — Audit logs must be retained for a minimum of 1 year. Audit logs are append-only — no UPDATE or DELETE operations permitted on audit tables.

**RULE 9** — Data encryption at rest must be enabled for the local PostgreSQL instance on all production deployments.

## **Guidelines**

* *Use JWT with short expiry (max 8 hours) for session tokens.*  
    
* *Log all failed authentication attempts with IP and timestamp.*  
    
* *Separate audit log storage from operational storage to prevent audit growth from impacting billing performance.*

# **Event Logging Architecture** *(new in v1.2)*

## **Philosophy**

*Retail systems generate three fundamentally different types of events: operational audit events (who did what for compliance), business events (what happened commercially for analytics), and system telemetry events (how the system is performing for operations). These must not be mixed. Mixing them makes compliance reporting unreliable, analytics incorrect, and operational monitoring noisy.*

## **Event Classification**

| Class | Purpose | Examples | Retention | Destination |
| :---- | :---- | :---- | :---- | :---- |
| Audit events | Legal compliance, non-repudiation | Bill save, discount override, PIN auth, config change | 7 years | append-only audit table |
| Business events | Analytics, owner intelligence | Bill closed, item sold, GRN received, return processed | 2 years active, 7 years archive | reporting schema / cloud |
| Sync events | Cloud delivery tracking | Packet enqueued, delivered, failed, retried | 90 days | sync\_log table |
| System telemetry | Operational health monitoring | API latency, print failure, DB latency, lock contention | 30 days | telemetry table or log sink |

## **Rules**

**RULE 1** — Audit events and business events must be stored in separate tables. Audit tables are append-only. Business event tables may be aggregated and archived.

**RULE 2** — Audit events must be written inside the same database transaction as the action they record. An audit event that commits after its parent action is not reliable.

**RULE 3** — Business events must be emitted asynchronously after the transaction commits. Business event emission must never block billing.

**RULE 4** — Every event record must carry at minimum: event\_id (UUID), event\_type, entity\_id, entity\_type, actor\_id, actor\_role, node\_id, occurred\_at (UTC), and payload (JSONB).

**RULE 5** — Audit events must never be updated or deleted. The audit tables must have a database-level trigger preventing UPDATE and DELETE operations.

**RULE 6** — System telemetry must never write to operational or audit tables. Telemetry must have its own isolated storage path and must never interfere with billing throughput.

**RULE 7** — HO command execution must produce both an audit event (for compliance) and a business event (for HQ visibility) as separate records.

## **Guidelines**

* *Use a background task queue (Celery or asyncio worker) for business event emission to prevent billing latency.*  
    
* *Design the event payload as JSONB for forward compatibility — avoid narrow column schemas for event data.*  
    
* *Build a log viewer in the owner dashboard consuming business events — not direct queries against operational tables.*  
    
* *Define a canonical event type registry (enum or constants file) — never use freeform strings for event\_type.*

# **Offline-First Policy**

## **Philosophy**

*The store must continue functioning during internet failures. Indian retail environments experience intermittent connectivity. Billing must never depend on internet availability.*

## **Rules**

**RULE 1** — Billing must never depend entirely on internet availability.

**RULE 2** — Operational data (item master, tax rates, stock levels, customer records) must always be locally available and cached.

**RULE 3** — Synchronization failures must never block billing.

**RULE 4** — Offline queues must support retry behavior with idempotency.

**RULE 5** — Cloud failure must not stop store operations.

**RULE 6** — The system must define explicit degraded mode behavior:

* Items not in local cache cannot be added until connectivity is restored  
    
* Returns can be processed offline for bills present in local history  
    
* Discounts beyond threshold require local manager PIN — no cloud authorization check  
    
* Stock levels shown during offline mode are clearly marked as 'last known' with timestamp  
    
* HO governance commands received offline are queued, subject to expiry checks on reconnection

**RULE 7** — Maximum acceptable sync delay before owner alert: 4 hours.

## **Guidelines**

* *Maintain a local sync status indicator visible to the cashier at all times.*  
    
* *On reconnection, process the offline queue in chronological order.*  
    
* *Provide a manual 'force sync' option accessible to the manager.*

# **Approval Workflow Policy**

## **Philosophy**

*High-value and potentially destructive retail actions require authorization chains. Without defined approval workflows, developers implement these inconsistently or skip them entirely.*

## **Rules**

**RULE 1** — Bill cancellation after printing requires manager PIN. Unprinted bill cancellation is cashier-level.

**RULE 2** — Discounts beyond the configured threshold (SmritiParam: MAX\_CASHIER\_DISCOUNT\_PCT) require manager PIN authorization before the discount is applied.

**RULE 3** — Price override on any item requires manager PIN and must be logged to the audit trail.

**RULE 4** — Stock adjustments require manager PIN. Adjustments above a configurable quantity threshold require dual authorization (manager PIN \+ owner notification).

**RULE 5** — HO governance commands classified as destructive require manager PIN through the two-step confirm \+ execute protocol.

**RULE 6** — Approval actions must be non-repudiable. The authorizing manager's ID, timestamp, and action must be written to the audit log before the authorized action executes.

## **Guidelines**

* *Show a non-dismissible confirmation dialog for all destructive or high-value actions.*  
    
* *Include specific action details in the confirmation dialog — not just a generic 'Are you sure?'*  
    
* *Log both approval and subsequent execution as separate audit events.*

# **Print & Hardware Abstraction Policy**

## **Philosophy**

*Hardware failures are inevitable in retail environments. The billing system must never become unavailable because a printer or peripheral is malfunctioning.*

## **Rules**

**RULE 1** — Billing must not block on print failure. A bill is saved when the database transaction commits — not when the print job completes.

**RULE 2** — Print jobs must queue independently from billing. Failed jobs must retry automatically and be retriable manually by the cashier.

**RULE 3** — The system must support at minimum three output targets: thermal printer (58mm/80mm), A4 printer, and PDF/screen. These are interchangeable output targets — not hardcoded assumptions.

**RULE 4** — Hardware failure must never roll back a completed bill.

**RULE 5** — Printer configuration must be a SmritiParam — not hardcoded in source files.

## **Guidelines**

* *Implement a print queue with status visibility: pending, printing, completed, failed.*  
    
* *Provide a 'reprint last bill' shortcut accessible to the cashier.*  
    
* *Log all print failures with bill ID and timestamp for operational review.*

# **Synchronization Policy**

## **Philosophy**

*Synchronization exists to support visibility and intelligence. It must never slow or block retail operations.*

## **Rules**

**RULE 1** — All synchronization must be asynchronous. Billing must never wait for cloud acknowledgment.

**RULE 2** — Retry mechanisms must exist for all failed syncs.

**RULE 3** — Sync engines must prevent duplicate processing. All sync packets must carry an idempotency key.

**RULE 4** — Cloud reporting must tolerate temporary sync delays. Real-time perfection is less important than operational stability.

**RULE 5** — Sync must operate in the background without consuming cashier-visible UI thread or perceptible system resources.

## **Guidelines**

* *Use a dedicated sync worker process — not the main billing API process.*  
    
* *Sync queue must be persistent (database table or file-backed) — not an in-memory queue that loses state on restart.*  
    
* *Surface sync health to the owner dashboard: last sync time, queue depth, failed packet count.*

# **Cloud Architecture Policy**

## **Philosophy**

*Cloud infrastructure enhances the system. It does not replace local operational continuity.*

## **Rules**

**RULE 1** — Cloud reporting databases must not become primary operational billing databases.

**RULE 2** — Cloud APIs must focus on analytics, dashboards, reporting, centralized visibility, and notifications.

**RULE 3** — Cloud infrastructure must remain modular and independently scalable.

**RULE 4** — All cloud communication must use authenticated APIs over HTTPS.

**RULE 5** — HQ-to-node communication must use the typed governance command protocol. Raw SQL execution from HQ to nodes is permanently deprecated.

## **Guidelines**

* *Design cloud APIs to be stateless and horizontally scalable.*  
    
* *Separate cloud read endpoints (dashboards) from cloud write endpoints (command delivery) at the router level.*

# **HO Governance Protocol Policy**

## **Philosophy**

*The Head Office governance protocol enables HQ to observe and control sovereign nodes without compromising node-level security. Security enforcement happens at the node — HQ cannot override node-side policy.*

## **Rules**

**RULE 1** — Node-side command policy (\_COMMAND\_POLICY) is the authoritative source for is\_destructive and approval\_required. HQ payload cannot override these flags.

**RULE 2** — The SQL command type is permanently deprecated. HQ may never push raw SQL strings to nodes. All data operations must use typed handlers in governance.py.

**RULE 3** — Destructive commands require manager PIN confirmation through the two-step confirmation protocol before execution.

**RULE 4** — Commands must carry an expiry timestamp. Expired commands must be rejected without execution.

**RULE 5** — Every command execution must produce an audit log entry: command ID, type, issuing HQ identity, confirming manager ID, execution timestamp, and result.

**RULE 6** — PulseResponse must carry a schema\_version. Nodes must reject commands from incompatible schema versions.

**RULE 7** — The pending command store must be persistent (database-backed or Redis). In-memory command stores are not acceptable in production.

## **Guidelines**

* *The frontend policy mirror (APPROVAL\_REQUIRED\_TYPES) must be kept in sync with \_COMMAND\_POLICY. Add a comment linking to the backend source.*  
    
* *Consider a /api/v1/ho/command-policy endpoint that the frontend fetches at startup to eliminate mirror drift risk.*

# **Version Compatibility Matrix** *(new in v1.2)*

## **Philosophy**

*In a multi-node, offline-capable retail system, version mismatches between frontend, API, node schema, and HQ cloud can silently corrupt data or break sync. Compatibility must be declared explicitly, enforced at runtime, and never left to chance.*

## **Version Domains**

| Domain | Version Owner | Where Declared | Checked By |
| :---- | :---- | :---- | :---- |
| Frontend app | Frontend build | package.json / build manifest | API on first connect |
| API server | Backend | API /health response | Frontend on startup |
| Node DB schema | Alembic | alembic\_version table | API on startup |
| HQ sync protocol | HO system | PulseResponse schema\_version | Node on every pulse |
| SmritiParam config | HQ Admin | params table version column | Node on config apply |

## **Rules**

**RULE 1** — The API server must expose its current schema\_version in the /health or /pulse endpoint. This version must match the deployed Alembic migration head.

**RULE 2** — The frontend must check API schema\_version on startup. If the declared frontend-compatible version range does not include the connected API version, the frontend must display a version mismatch warning and restrict access to read-only operations.

**RULE 3** — Node software must reject HO governance commands carrying an incompatible schema\_version. Rejection must produce an audit log entry explaining the version conflict.

**RULE 4** — Alembic migrations must be tagged with a human-readable label in addition to the hex revision ID. Example: `rev: 3a1f9c / "add_stock_reservation_column"`.

**RULE 5** — Breaking API changes (field removal, type change, endpoint rename) must result in a major version increment (/api/v2/...). Minor additions that preserve backward compatibility use a minor version increment in the header only.

**RULE 6** — A compatibility matrix document must be maintained alongside this file, mapping which frontend versions are compatible with which API versions and which DB schema revisions.

**RULE 7** — Deploying a node schema migration and a frontend update must be coordinated. Never deploy a schema migration that a running frontend is not yet compatible with. Use the expand-contract migration pattern for zero-downtime changes.

## **Guidelines**

* *Use semantic versioning: MAJOR.MINOR.PATCH for all version domains.*  
    
* *Automate version compatibility checks in CI: a pull request that changes API response shape must include a frontend compatibility check.*  
    
* *Add a version matrix table to the setup wizard: display current versions of all components and their compatibility status during installation and upgrade.*

# **Reporting Policy**

## **Philosophy**

*Reporting must provide owner and HQ visibility without affecting billing performance.*

## **Rules**

**RULE 1** — Reporting queries must never slow operational billing systems.

**RULE 2** — Reporting queries must execute against a read replica, materialized view, or pre-aggregated table. Direct queries against the primary operational connection are forbidden.

**RULE 3** — Analytics structures may evolve independently from operational schemas.

**RULE 4** — Dashboard systems must prioritize summarized data. Row-level queries against full transaction history must not power live dashboards.

**RULE 5** — Operational and reporting workloads must remain logically and physically separated.

## **Guidelines**

* *Pre-aggregate daily, weekly, and monthly summaries at the end of each period.*  
    
* *Cloud reporting must tolerate sync delays of up to 24 hours without triggering alerts.*

# **Multi-Store & Multi-Node Policy**

## **Philosophy**

*Architectural decisions made today must not create barriers to multi-node operation. Node identity and data scoping must be correct from the beginning — retrofitting is expensive.*

## **Rules**

**RULE 1** — Every node must have a globally unique node\_id, established during setup and immutable after first billing.

**RULE 2** — All stock queries, billing records, and sync packets must be scoped to node\_id by default. Cross-node access requires explicit intention.

**RULE 3** — Cross-node stock transfers must use a defined transfer workflow — not ad hoc direct database queries between nodes.

**RULE 4** — HQ reporting must aggregate from node sync data — it must never directly query individual node databases.

**RULE 5** — Document number sequences (bill numbers, GRN numbers) must be node-scoped to prevent collisions in multi-node aggregated reporting.

## **Guidelines**

* *Prefix all document numbers with the node identifier (e.g., MUM01-BL-00001).*  
    
* *Design sync payloads with node\_id as a top-level field from the beginning.*

# **Master Data Governance** *(new in v1.2)*

## **Philosophy**

*Master data — item master, customer records, tax rates, supplier records, HSN codes — is the foundation all transactions are built on. In a multi-node system, inconsistent master data creates pricing discrepancies, GST mismatches, and inventory errors across stores. Ownership and update authority must be formally declared.*

## **Master Data Ownership**

| Data Domain | Primary Owner | Can Nodes Override? | Conflict Resolution |
| :---- | :---- | :---- | :---- |
| Item master (SKU, HSN, MRP) | HQ | No — read only at node | HQ version always wins |
| Tax rates (GST slabs, cess) | HQ | No | HQ version always wins |
| Customer records | Node (originating) | Node can update own customers | Last-write-wins with timestamp |
| Supplier records | HQ | No | HQ version always wins |
| Store-specific pricing | Node (HQ must authorize) | Yes — with approval workflow | Node version applies locally |
| SmritiParams (config) | HQ | No — HO governance command required | HQ version always wins |

## **Rules**

**RULE 1** — HQ owns the item master. Nodes must not directly modify item master records for items they did not originate. Item additions at the node level are flagged as local-pending until HQ acknowledges.

**RULE 2** — Tax rates are HQ-only master data. No node may modify GST slabs, CESS rates, or HSN mappings without an authorized HO governance command.

**RULE 3** — Master data updates from HQ must carry a version\_timestamp. Nodes must reject updates with a version\_timestamp older than the currently stored record.

**RULE 4** — When a node detects a conflict between local master data and an incoming HQ update, it must log the conflict, apply the HQ version, and surface a conflict notification in the owner dashboard.

**RULE 5** — Deleting master data is forbidden at both node and HQ level if active transaction references exist. Records must be deactivated (is\_active \= false), not deleted.

**RULE 6** — All master data changes — at HQ or node — must produce an audit event recording what changed, who changed it, and the previous value.

**RULE 7** — The item master sync must be prioritized in the sync queue above business event sync. An item master inconsistency has immediate billing impact; a delayed sales report does not.

## **Guidelines**

* *Implement a master data version hash in PulseResponse so nodes can detect drift without downloading full master data on every pulse.*  
    
* *Provide a 'master data sync status' view in the owner dashboard: last sync time, version hash, any pending conflicts.*  
    
* *For store-specific pricing, use a price\_override table at the node level — never modify the HQ item master MRP directly.*

# **Performance Engineering Policy**

## **Philosophy**

*Retail performance is measured by perceived operational speed — not benchmark screenshots. A cashier's experience during peak billing hours is the benchmark.*

## **Rules**

**RULE 1** — Billing response must feel instant. Target: under 300ms for bill item addition from barcode scan to visual confirmation.

**RULE 2** — Heavy frontend rendering is forbidden during active billing.

**RULE 3** — Operational APIs must prioritize low latency. Analytics must never share API worker threads with billing endpoints.

**RULE 4** — Heavy analytics must run separately — separate process, separate database connection, separate scheduling.

**RULE 5** — Printer operations must support retry handling and must never block the billing API response.

## **Guidelines**

* *Profile billing endpoint response time on target hardware before release.*  
    
* *Set performance budgets: item addition \< 300ms, bill save \< 500ms, receipt print queue \< 100ms.*  
    
* *Monitor and alert on p95 latency — not just average latency.*

# **Observability Policy** *(new in v1.2)*

## **Philosophy**

*A retail system you cannot observe is a system you cannot reliably operate. Billing failures must be visible before the cashier calls for help. Sync failures must be visible before the owner notices missing reports. Observability is not a post-launch feature — it is a production requirement.*

## **Metric Domains**

| Domain | Key Metrics | Alert Threshold |
| :---- | :---- | :---- |
| Billing | p95 response time, bill save error rate, failed bill count | p95 \> 500ms or error rate \> 0.1% |
| Sync | Queue depth, failed packet count, last successful sync timestamp | Queue \> 100 or last sync \> 4 hours |
| Print | Print failure rate, queue depth, unprinted bill count | Any unprinted bill \> 5 minutes |
| DB | Query latency (p95), active connections, lock contention count | p95 \> 200ms or lock wait \> 1s |
| Auth | Failed login attempts, session expiry events, PIN lockout events | \> 5 failed PINs in 10 minutes |
| HO commands | Pending command count, expired command count, rejection count | Any expired command not acknowledged |

## **Rules**

**RULE 1** — The system must expose a /health endpoint returning: API status, DB connectivity, sync queue depth, last sync timestamp, and disk space remaining. This endpoint must be callable without authentication.

**RULE 2** — Billing endpoint latency must be tracked at p50, p95, and p99. Alerting must trigger on p95 — not just average or p50.

**RULE 3** — Sync queue depth and failed sync packet count must be surfaced in the owner dashboard in near-real-time (refresh interval: ≤ 60 seconds).

**RULE 4** — Print failures must trigger a visible in-UI notification to the cashier within 30 seconds of failure. Silent print failures are forbidden.

**RULE 5** — Database lock contention events must be logged and counted. If lock contention exceeds 10 events per minute, an operational alert must be raised to the system administrator.

**RULE 6** — All alert thresholds must be SmritiParam-configurable by HQ. Hardcoded alert thresholds are forbidden.

**RULE 7** — Observability data must never be stored in the same tables as operational or audit data. Use a dedicated telemetry schema or external log sink.

## **Guidelines**

* *Use structured JSON logging for all system events — not freeform strings — to enable future log aggregation.*  
    
* *Expose a metrics endpoint (/metrics) compatible with Prometheus scraping format for future cloud monitoring integration.*  
    
* *Build an operational health panel into the owner dashboard: a single screen showing all green/amber/red status indicators across all monitored domains.*  
    
* *Test observability in degraded conditions: simulate DB slowdown, sync failure, and print failure to verify that alerts fire correctly.*

# **Error Budget & Downtime Tolerance Policy**

## **Philosophy**

*'Operational continuity is sacred' must be expressed as concrete tolerances — not just intent. These targets guide resilience decisions during architecture and implementation.*

## **Defined Tolerances**

| System | Downtime Tolerance |
| :---- | :---- |
| Billing (store hours) | Zero. Any billing downtime during store hours is a critical incident. |
| Billing (non-store hours) | Up to 30 minutes for planned maintenance. |
| Sync to cloud | Up to 4 hours delay before owner alert. |
| Cloud reporting | Up to 24 hours delay acceptable. |
| HO connectivity | Up to 72 hours offline before HQ alert. |
| Print subsystem | Print failure must not block billing. Unprinted bill recovery within 5 minutes. |

## **Rules**

**RULE 1** — Any planned maintenance that affects billing must be scheduled outside store hours and communicated to store owners in advance.

**RULE 2** — Unplanned billing downtime must trigger an automatic alert to the store owner and HQ within 5 minutes.

**RULE 3** — A post-incident summary must be produced for any billing downtime exceeding 10 minutes.

# **Disaster Recovery Policy** *(new in v1.2)*

## **Philosophy**

*Retail environments face power failures, hardware failures, accidental data corruption, and ransomware. A system with no tested recovery procedure is effectively unrecoverable in a crisis. Recovery must be documented, tested, and achievable by a non-developer.*

## **Backup Architecture**

| Backup Type | Frequency | Retention | Storage Target |
| :---- | :---- | :---- | :---- |
| Full DB backup | Daily (end of business) | 30 days local, 1 year cloud | Local \+ encrypted cloud |
| Incremental WAL archiving | Continuous | 7 days | Local NAS or cloud |
| Config backup (SmritiParams) | On every change | 90 days | Cloud |
| Audit log backup | Weekly | 7 years | Encrypted cold storage |
| Item master snapshot | Daily | 90 days | Cloud |

## **Rules**

**RULE 1** — Daily automated backups of the operational PostgreSQL database are mandatory on all production nodes. Backups must be encrypted at rest.

**RULE 2** — Backups must be stored in at least two locations: local (fast recovery) and offsite/cloud (disaster recovery). A backup that exists only on the same machine as the database is not a backup.

**RULE 3** — Backup integrity must be verified weekly through an automated restore-and-validate test against a separate test instance. A backup that has never been tested is an untested assumption — not a safety net.

**RULE 4** — The system must define and document Recovery Time Objective (RTO) and Recovery Point Objective (RPO):

* Billing RTO: under 2 hours from failure to billing resumption  
* Billing RPO: maximum 1 transaction lost (WAL-level recovery target)

**RULE 5** — Power interruption during an active billing transaction must not corrupt the database. PostgreSQL WAL must be enabled and verified on all production deployments.

**RULE 6** — A store node recovery procedure document must exist and be accessible to the store owner without requiring developer intervention. The recovery steps must be executable by a technically literate but non-developer store owner.

**RULE 7** — Audit log tables must be included in backup but stored separately from operational tables to ensure corruption of operational data does not affect audit integrity.

## **Corruption Recovery Procedure**

When database corruption is detected:

1. Immediately stop the billing API server to prevent further writes.  
2. Take a forensic copy of the corrupted database before any recovery attempt.  
3. Restore from the most recent verified backup.  
4. Apply WAL archives to recover transactions since the last backup.  
5. Verify transaction counts and financial totals against the last known good state.  
6. Produce an incident report documenting the corruption cause, data loss window, and recovery actions.

## **Guidelines**

* *Use pg\_dump with \--format=custom for compressed, parallel-restorable backups.*  
    
* *Automate backup verification: after each backup, run pg\_restore \--list and check row counts on critical tables.*  
    
* *Notify the store owner and HQ automatically if a scheduled backup fails.*  
    
* *Document the backup storage encryption key separately from the backup itself — losing the key is as bad as losing the backup.*

# **Frontend Governance Policy**

## **Philosophy**

*Frontend exists to simplify operations. Retail UI is an operational tool — not a decorative website. Every design decision must be evaluated against cashier speed and workflow clarity.*

## **Rules**

**RULE 1** — Avoid excessive UI complexity. Retail systems must reduce cognitive load, not increase it.

**RULE 2** — Minimize clicks in critical workflows: billing, returns, stock entry, GRN.

**RULE 3** — Keyboard-driven workflows are mandatory for billing operations. Mouse dependency in the billing screen is a regression.

**RULE 4** — Billing screens must remain lightweight and ultra-fast. Heavy component rendering during active billing is forbidden.

**RULE 5** — Critical operations must provide immediate visual feedback. Target: under 100ms perceived response.

**RULE 6** — Do NOT prioritize animation over operational speed. Animations must never slow workflow execution.

**RULE 7** — Error messages must be operationally understandable. Bad: 'Foreign key violation.' Good: 'Stock unavailable for selected item.'

**RULE 8** — Dark mode must be operationally comfortable for long-duration use. Dark mode is not optional.

## **Guidelines**

* *Barcode scan to item-added feedback must complete within 100–300ms perceived time.*  
    
* *The cursor must always return to the billing search/input area after any action.*  
    
* *Every major billing action must have a keyboard shortcut: save, hold, payment mode, quantity change, discount entry, item removal.*  
    
* *Avoid modal popups during active billing. Use inline feedback where possible.*

# **Workflow Engineering Policy**

## **Philosophy**

*Retail systems succeed through workflow optimization, not visual complexity. Workflows must reflect real cashier behavior and real operational interruptions — not idealized software models.*

## **Rules**

**RULE 1** — Every workflow must minimize operational friction.

**RULE 2** — Every workflow must support real-world edge cases: partial payments, split payments, item exchange, bill hold and resume, power interruption recovery.

**RULE 3** — Design workflows around actual cashier and store behavior, not idealized assumptions.

**RULE 4** — Operational interruptions must be minimized. The system must recover gracefully without data loss.

**RULE 5** — Error recovery must always be simple and accessible to a non-technical cashier.

## **Guidelines**

* *Test workflows with actual cashiers in real store conditions before finalizing design.*  
    
* *'Hold bill' must be accessible in under 2 keystrokes from any billing state.*  
    
* *Power interruption recovery must restore the last in-progress bill state automatically on restart.*

# **Setup Wizard Policy**

## **Philosophy**

*Deployment simplicity is a competitive advantage. A store owner should be able to complete initial setup without developer assistance.*

## **Rules**

**RULE 1** — Non-technical deployment must be achievable through the setup wizard.

**RULE 2** — Database connectivity must be tested and confirmed automatically during setup.

**RULE 3** — Runtime detection must be automated wherever possible.

**RULE 4** — Configuration mistakes must be minimized through guided, validated input — not manual .env file editing.

**RULE 5** — Printer testing must be built into the setup wizard.

## **Guidelines**

* *Provide guided troubleshooting: 'PostgreSQL service not detected. Try: sudo systemctl start postgresql'*  
    
* *Auto-detect local PostgreSQL instances and pre-populate connection parameters.*  
    
* *Validate all configuration before marking setup as complete.*

# **Licensing & Node Activation Policy** *(new in v1.2)*

## **Philosophy**

*Every deployed node represents a commercial relationship. Activation, licensing, and subscription enforcement must be architecturally sound from the beginning — retrofitting licensing into a live system is expensive and disruptive. The license model must also be resilient to connectivity loss: billing continuity cannot depend on a license server being reachable.*

## **Rules**

**RULE 1** — Every node must complete an activation flow before first billing. Unactivated nodes must operate in a restricted demo mode — they must not be able to save billable transactions.

**RULE 2** — The activation flow must generate a unique node\_id, associate the node with a store record in HQ, and store a locally-cached license token. The license token must be verifiable offline.

**RULE 3** — License verification must be performable locally against the cached token. A license server being unreachable must not block billing.

**RULE 4** — License tokens must carry an expiry timestamp and a grace period window (SmritiParam: LICENSE\_GRACE\_PERIOD\_DAYS, default: 7). During the grace period, billing continues but the owner is alerted. After the grace period, the node enters restricted mode.

**RULE 5** — Restricted mode must still allow: read access to historical bills, printing of previously saved bills, and read-only inventory queries. Restricted mode must never destroy data.

**RULE 6** — Node deactivation (transfer, termination) must follow a formal transfer workflow: all pending sync must flush, local data must be exported, and the node\_id must be retired in HQ. A retired node\_id must never be reused.

**RULE 7** — Subscription enforcement logic must reside in the API service layer — never in the frontend. Frontend must never be the sole enforcer of licensing rules.

## **Guidelines**

* *Use asymmetric cryptography for license token signing: HQ signs the token, nodes verify using the embedded public key.*  
    
* *Display license status and expiry date visibly in the owner dashboard and the setup wizard.*  
    
* *Automate license renewal check during the daily sync cycle — do not wait for manual renewal.*  
    
* *Log all activation, renewal, expiry, and grace-period events to the audit trail.*

# **AI-Assisted Development Policy**

## **Philosophy**

*AI accelerates implementation. Human expertise defines architecture, business correctness, and operational logic. AI-generated code is a starting point — not a finished product for critical workflows.*

## **Rules**

**RULE 1** — AI-generated code touching billing, stock deduction, taxation, transaction sequencing, or accounting rules requires explicit human review and sign-off before merge. A passing test suite alone is not sufficient approval.

**RULE 2** — Operational retail logic must never be blindly autogenerated.

**RULE 3** — AI should be used heavily for repetitive implementation: CRUD APIs, forms, validations, setup flows, reporting UIs, dashboard components.

**RULE 4** — Business logic authority remains with domain expertise. When AI output conflicts with operational experience, operational experience wins.

**RULE 5** — AI-generated code must follow the architectural policies in this document. Output that violates these rules must be rejected and regenerated with corrective guidance.

## **Guidelines**

* *Provide AI agents with this document as context before starting any implementation session.*  
    
* *Require AI agents to explicitly state which rules apply to the code they are generating.*  
    
* *For complex business logic, generate tests first (human-reviewed), then use AI to implement against those tests.*

# **Operational Intelligence Preservation Strategy**

## **Why Preservation Matters**

The migrated Shoper9 schema represents more than database tables. It represents decades of operational retail evolution, edge-case handling, real-world cashier behavior, taxation handling maturity, stock movement intelligence, and transaction sequencing stability.

This accumulated operational maturity is a strategic asset. Rewriting it from zero introduces hidden workflow failures, inventory inconsistencies, taxation mismatches, and regression bugs.

**The modernization strategy of Smriti Retail OS prioritizes preservation first, modernization second.**

## **Evolution Layer Model**

### **Layer 1 — Operational Legacy Core**

Contains migrated operational tables, proven retail flows, existing transactional intelligence, stock relationships, and billing dependencies. This layer must remain highly stable.

### **Layer 2 — Modern API Layer**

FastAPI becomes the workflow abstraction layer, business validation layer, modernization gateway, compatibility layer, and orchestration engine. Protects frontend from legacy complexity.

### **Layer 3 — Workflow Optimization Layer**

Focuses on reducing clicks, faster billing flow, keyboard navigation, intelligent search, and operator efficiency. This is where major UX improvements occur.

### **Layer 4 — Intelligence Layer**

Includes reporting, dashboards, AI insights, analytics, forecasting, and centralized visibility. This layer evolves independently from operational transaction systems.

# **Product Identity Protection Policy**

## **Product Positioning**

Smriti Retail OS is NOT merely a billing software, a generic POS, or a simple SaaS app.

It is intended to evolve into a retail operating platform, a hybrid commerce infrastructure, an edge-enabled retail system, and a scalable multi-store ecosystem.

**All architectural decisions must be evaluated against this long-term identity — not just immediate feature requirements.**

# **Final Engineering Principles**

|  | Principle |
| :---- | :---- |
| Principle 1 | Protect operational intelligence. |
| Principle 2 | Modernize incrementally — never destructively. |
| Principle 3 | Prioritize real retail behavior over theoretical software models. |
| Principle 4 | Avoid unnecessary architectural ego. |
| Principle 5 | Operational continuity is sacred. |
| Principle 6 | Security and compliance are non-negotiable in a financial system. |
| Principle 7 | Every rule exists because someone, somewhere, paid the price for not following it. |

---

**System Architect: Jawahar Ramkripal Mallah**

ERPnBOOK  |  Smriti Retail OS  |  Version 1.2  
