# ==============================================================================
# SMRITI RETAIL OS — MULTI-COMPANY CREATION WIZARD & ROUTING ARCHITECTURE
# Deep Research, Industry Blueprints, and Production-Grade Implementation Examples
# ==============================================================================

This document provides a highly researched, production-ready implementation blueprint for running multiple independent companies under Smriti Retail OS using the **Database-per-Company (Multi-Database Isolation)** paradigm.

---

## 1. Deep Research: Architecture Comparison (Shared vs. Isolated)

When designing a multi-company retail system, three main patterns exist:

| Architectural Metric | Pattern A: Single DB + Shared Tables (`tenant_id`) | Pattern B: Single DB + Separate Schemas | Pattern C: Database-per-Company (Multi-Database) |
| :--- | :--- | :--- | :--- |
| **Data Isolation** | ⚠️ Weak. Accidental leaks possible via missing `WHERE` clauses. | 🟡 Medium. Namespaces isolated, but in same catalog. | ✅ **Absolute**. Separate physical catalogs. No leakage possible. |
| **Backup & Restore** | ❌ Complex. Hard to backup just one store's sales to move elsewhere. | 🟡 Moderate. Requires schema-filtered `pg_dump`. | ✅ **Instant**. Simple `pg_dump -d company_db` and restore. |
| **Zero-Downtime Migration** | ⚠️ Hard. Column updates lock tables for all tenants. | ✅ Easy. Migrations run namespace-by-namespace. | ✅ **Best**. Database schemas are migrated individually. |
| **Compliance & Audits** | ⚠️ Medium. Hard to isolate a single entity's log. | ✅ Good. | ✅ **Excellent**. Clean database hand-overs. |
| **POS Performance** | ⚠️ Degrades as total store rows grow globally. | ✅ Good. | ✅ **Outstanding**. Maximum database index speed per store. |

**Deep-Research Verdict:** 
For an offline/LAN-based sovereign POS system, **Pattern C (Database-per-Company)** is the undisputed gold standard. It mimics the familiar, robust database handling of Tally Prime and Shoper9.

---

## 2. Technical Blueprint: Registry & Routing

To implement Pattern C, we need two components in the database layer:

1. **`smriti_registry` Database**: A small, light system database that stores the registered companies, their database catalogs, and credentials.
2. **Dynamic Session Selector**: FastAPI intercepts the incoming HTTP requests, reads the selected company header (e.g. `X-Company-Db`), and routes SQL queries to the corresponding PostgreSQL database connection pool.

```mermaid
graph TD
    A[Vite React PWA] -- "Request with Header 'X-Company-Db: smriti_co_aitdl'" --> B[FastAPI Engine]
    B --> C{Connection Pool Cache}
    C -- "Engine Exists?" -->|Yes| D[Reuse Connection Pool]
    C -- "No" --> E[Create Async Engine for 'smriti_co_aitdl']
    E --> F[Cache & Open Session]
    D --> G[Execute Query on smriti_co_aitdl]
    F --> G
```

---

## 3. Working Example: Dynamic Connection Router (FastAPI)

Here is the exact production-ready Python code to swap database connections dynamically on the fly based on client requests:

```python
# app/core/database.py
import asyncio
from typing import Dict
from contextlib import asynccontextmanager
from fastapi import Request, Header, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Master connection string to default postgres database
REGISTRY_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

# Cache of active database engines to avoid recreating pools
_engines: Dict[str, any] = {}
_session_makers: Dict[str, any] = {}

def get_engine_for_db(db_name: str):
    """Dynamically fetch or create a connection pool for a specific company database."""
    if db_name not in _engines:
        connection_url = f"postgresql+asyncpg://postgres:postgres@localhost:5432/{db_name}"
        _engines[db_name] = create_async_engine(
            connection_url,
            pool_size=5,
            max_overflow=2,
            pool_recycle=3600
        )
        _session_makers[db_name] = async_sessionmaker(
            bind=_engines[db_name],
            class_=AsyncSession,
            expire_on_commit=False
        )
    return _session_makers[db_name]

# FastAPI Dependency for Dynamic Database Routing
async def get_db(x_company_db: str = Header(default="smriti_local")):
    """
    FastAPI dependency injection. Reads 'X-Company-Db' HTTP header
    and provides a scoped session to that specific database.
    """
    # Sanitize database name to avoid SQL injection
    safe_db_name = "".join(c for c in x_company_db if c.isalnum() or c == "_")
    
    session_maker = get_engine_for_db(safe_db_name)
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

---

## 4. Working Example: Database Provisioner & Seeder

When the Company Creation Wizard is submitted, this service executes a dynamic administrative `CREATE DATABASE` and applies all Smriti schemas and tables:

```python
# app/services/company_wizard.py
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.base import Base
import app.models.sovereign  # Register all retail/inventory schemas
import app.models.config
import app.models.schemes

# default system params to seed in every new company
DEFAULT_PARAMS = [
    ("STORE_MODE", "Active data storage", "LOCAL_POSTGRES", "SYSTEM"),
    ("STRICT_MASTER_MODE", "Enforce pre-defined masters", "true", "LOGIC"),
    ("AUTO_CREATE_STOCK", "Auto stock row creation", "true", "LOGIC"),
]

async def create_new_company_database(company_name: str, db_name: str):
    """
    1. Connects to Postgres root database.
    2. Provisions new database container.
    3. Triggers dynamic tables creation.
    4. Seeds sovereign default values.
    """
    # Sanitize inputs
    clean_db_name = "".join(c for c in db_name.lower() if c.isalnum() or c == "_")
    admin_url = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    
    # STEP 1: Connect to Postgres root to execute database creation
    # NOTE: PostgreSQL does not allow CREATE DATABASE inside active transaction blocks,
    # so we must run it in autocommit mode.
    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    async with admin_engine.connect() as conn:
        print(f"Creating database {clean_db_name}...")
        await conn.execute(text(f"CREATE DATABASE {clean_db_name}"))
    await admin_engine.dispose()
    
    # STEP 2: Instantly spin up a temporary pool to target database to run migrations
    target_url = f"postgresql+asyncpg://postgres:postgres@localhost:5432/{clean_db_name}"
    target_engine = create_async_engine(target_url)
    
    print(f"Applying schemas and base tables to {clean_db_name}...")
    async with target_engine.begin() as conn:
        # Create namespaces
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS shoper9"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS s9"))
        
        # Build all models defined in metadata
        await conn.run_sync(Base.metadata.create_all)
        
        # Build core sync queue DDL
        sync_queue_ddl = """
        CREATE TABLE IF NOT EXISTS smriti_sync_queue (
            id          BIGSERIAL PRIMARY KEY,
            table_name  TEXT        NOT NULL,
            operation   TEXT        NOT NULL,
            record_json JSONB       NOT NULL,
            status      TEXT        NOT NULL DEFAULT 'PENDING',
            retry_count INT         NOT NULL DEFAULT 0,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            synced_at   TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON smriti_sync_queue (status, id);
        """
        for stmt in sync_queue_ddl.strip().split(";"):
            if stmt.strip():
                await conn.execute(text(stmt.strip()))
                
        # Seed system params
        for param, descr, val, cat in DEFAULT_PARAMS:
            await conn.execute(text("""
                INSERT INTO smriti_param (tenant_id, param_code, descr, value_txt, category, value_bool, value_int, disp_order, last_sync)
                VALUES ('SYSTEM', :c, :d, :v, :cat, false, 0, 0, NOW())
            """), {"c": param, "d": descr, "v": val, "cat": cat})
            
    await target_engine.dispose()
    print(f"Database {clean_db_name} fully provisioned and seeded successfully!")
    return True
```

---

## 5. UI Mockup: Company Creation Wizard (React + Tailwind/Vanilla CSS)

Below is the design structure for the beautiful launcher screen where the user either selects an existing company or creates a new one through our wizard:

```javascript
// frontend/src/components/CompanySelector.jsx
import React, { useState, useEffect } from 'react';

export default function CompanySelector() {
  const [companies, setCompanies] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({ name: '', dbName: '', state: 'Delhi', gst: '' });

  // Load existing companies on launch
  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data));
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/companies/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (response.ok) {
      alert("Company Database Created Successfully!");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      {!showWizard ? (
        <div className="w-full max-w-md bg-slate-800 rounded-lg p-6 shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Select Company</h2>
          <div className="space-y-3 mb-6">
            {companies.map(co => (
              <button 
                key={co.db_name}
                onClick={() => {
                  localStorage.setItem("X-Company-Db", co.db_name);
                  window.location.href = "/dashboard";
                }}
                className="w-full text-left p-4 rounded bg-slate-700 hover:bg-slate-600 transition border-l-4 border-cyan-500 font-semibold"
              >
                {co.name} <span className="block text-xs text-slate-400">Database: {co.db_name}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowWizard(true)}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded text-center font-bold hover:scale-105 transition"
          >
            + Create New Company
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-slate-800 rounded-lg p-6 shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Company Creation Wizard</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400">Company Name (e.g., Aitdl Retailers)</label>
              <input 
                type="text" 
                required 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">Database Name (must be lowercase, no spaces)</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. smriti_aitdl_retail"
                onChange={e => setFormData({...formData, dbName: e.target.value.toLowerCase().replace(/ /g, '_')})}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white" 
              />
            </div>
            <div className="flex gap-4">
              <button 
                type="submit"
                className="flex-1 py-3 bg-cyan-500 rounded font-bold hover:bg-cyan-600"
              >
                Provision Database
              </button>
              <button 
                type="button" 
                onClick={() => setShowWizard(false)}
                className="flex-1 py-3 bg-slate-700 rounded font-bold hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
```

---

## 6. How it Integrates with the Standalone Installer

When shipping the app to standard pilot stores, the installer can:
1. **Pre-populate the Registry** with a default firm database (like `smriti_local`).
2. When the user launches **`OpenPOS.vbs`** for the first time, it routes to `/company-select` (rather than going straight to the dashboard).
3. If only one company exists in the registry, it **auto-bypasses** the screen and logs the user straight into the default company for maximum user convenience!

---

### SUMMARY
By adopting the **Database-per-Company** model, we get the absolute best of both worlds:
* Complete audit, data isolation, and crash resistance.
* Single client app that dynamically points its requests to the right engine catalog!
* 100% compliant with professional standards used by Tally and Shoper9.
