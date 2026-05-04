# ============================================================
# SMRITI-OS — Schema Studio API
# Shoper9 MSSQL Introspection + SmritiSetu Provisioning
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import logging

from app.core.database import get_db
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/schema", tags=["Schema Studio"])


# ── MSSQL Column Type → PostgreSQL Type Map ──────────────────
MSSQL_TO_PG = {
    "int":            "INTEGER",
    "bigint":         "BIGINT",
    "smallint":       "SMALLINT",
    "tinyint":        "SMALLINT",
    "bit":            "BOOLEAN",
    "decimal":        "NUMERIC",
    "numeric":        "NUMERIC",
    "float":          "DOUBLE PRECISION",
    "real":           "REAL",
    "money":          "NUMERIC(19,4)",
    "smallmoney":     "NUMERIC(10,4)",
    "char":           "CHAR",
    "varchar":        "VARCHAR",
    "nvarchar":       "TEXT",
    "text":           "TEXT",
    "ntext":          "TEXT",
    "datetime":       "TIMESTAMP",
    "datetime2":      "TIMESTAMP",
    "smalldatetime":  "TIMESTAMP",
    "date":           "DATE",
    "time":           "TIME",
    "uniqueidentifier":"UUID",
    "image":          "BYTEA",
    "binary":         "BYTEA",
    "varbinary":      "BYTEA",
}

# ── ARCHITECTURAL RULE ───────────────────────────────────────
# SmritiSetu IS the Shoper9 schema.
# We do NOT create new tables or rename columns.
# All tables use EXACT original Shoper9 names and column names.
# The only schema difference: MSSQL 'dbo' → PostgreSQL 'shoper9'
# ─────────────────────────────────────────────────────────────

SMRITI_ENHANCEMENTS = """  -- SmritiSetu Standard Columns (optional, disabled by default)
    -- smriti_id         BIGSERIAL,
    -- store_id          VARCHAR(20)  DEFAULT 'X01',
    -- sync_status       VARCHAR(20)  DEFAULT 'LOCAL',
    -- sync_at           TIMESTAMP,
    -- created_at        TIMESTAMP    DEFAULT NOW(),
    -- updated_at        TIMESTAMP    DEFAULT NOW(),
    -- is_deleted        BOOLEAN      DEFAULT FALSE,
    -- source            VARCHAR(20)  DEFAULT 'SHOPER9'
"""


def pg_type(mssql_type: str, max_len: Optional[int]) -> str:
    """Convert MSSQL type to PostgreSQL type."""
    base = MSSQL_TO_PG.get(mssql_type.lower(), "TEXT")
    if base in ("VARCHAR", "CHAR") and max_len and max_len > 0:
        if max_len >= 8000:
            return "TEXT"
        return f"{base}({max_len})"
    return base


# ══════════════════════════════════════════════════════════════
# 1. LIST ALL SHOPER9 TABLES
# ══════════════════════════════════════════════════════════════
@router.get("/shoper9/tables")
async def list_shoper9_tables(db: AsyncSession = Depends(get_db)):
    """List all tables in the shoper9 schema with row counts."""
    try:
        result = await db.execute(text("""
            SELECT 
                t.table_name,
                COALESCE(s.n_live_tup, 0) AS row_count
            FROM information_schema.tables t
            LEFT JOIN pg_stat_user_tables s 
                ON s.schemaname = 'shoper9' AND s.relname = t.table_name
            WHERE t.table_schema = 'shoper9'
              AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_name
        """))
        rows = result.all()
        return {
            "schema": "shoper9",
            "total": len(rows),
            "tables": [{"name": r[0], "rows": r[1]} for r in rows]
        }
    except Exception as e:
        logger.error(f"Error listing shoper9 tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════
# 2. GET TABLE STRUCTURE (Columns, Types, PKs)
# ══════════════════════════════════════════════════════════════
@router.get("/shoper9/tables/{table_name}")
async def get_table_structure(table_name: str, db: AsyncSession = Depends(get_db)):
    """Get full column structure of a Shoper9 table."""
    try:
        result = await db.execute(text("""
            SELECT 
                c.column_name,
                c.data_type,
                c.character_maximum_length,
                c.numeric_precision,
                c.numeric_scale,
                c.is_nullable,
                c.column_default,
                CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary_key
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT ku.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage ku
                    ON tc.constraint_name = ku.constraint_name
                    AND tc.table_schema = ku.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_schema = 'shoper9'
                  AND tc.table_name = :table
            ) pk ON pk.column_name = c.column_name
            WHERE c.table_schema = 'shoper9' AND c.table_name = :table
            ORDER BY c.ordinal_position
        """), {"table": table_name})
        
        cols = result.all()
        if not cols:
            raise HTTPException(status_code=404, detail=f"Table 'shoper9.{table_name}' not found")
        
        columns = []
        for col in cols:
            columns.append({
                "name":       col[0],
                "mssql_type": col[1],
                "pg_type":    pg_type(col[1], col[2]),
                "max_length": col[2],
                "precision":  col[3],
                "scale":      col[4],
                "nullable":   col[5] == "YES",
                "default":    col[6],
                "is_pk":      col[7],
            })
        
        return {"table": table_name, "schema": "shoper9", "columns": columns}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════
# 3. GENERATE DDL — Shoper9 table → SmritiSetu PostgreSQL DDL
# ══════════════════════════════════════════════════════════════
@router.get("/generate-ddl/{table_name}")
async def generate_ddl(
    table_name: str,
    target_schema: str = "shoper9",      # Default: exact Shoper9 schema name
    add_enhancements: bool = False,       # Default: NO additions, exact 1:1 mirror
    db: AsyncSession = Depends(get_db)
):
    """Generate PostgreSQL CREATE TABLE DDL from a Shoper9 table.
    
    By default produces an EXACT 1:1 copy of the Shoper9 table structure.
    SmritiSetu = Shoper9 schema, same table names, same column names.
    """
    structure = await get_table_structure(table_name, db)
    cols = structure["columns"]
    
    lines = []
    pk_cols = []
    
    for col in cols:
        nullable = "" if col["nullable"] else " NOT NULL"
        default  = f" DEFAULT {col['default']}" if col["default"] else ""
        lines.append(f"    {col['name'].lower():<30} {col['pg_type']}{nullable}{default}")
        if col["is_pk"]:
            pk_cols.append(col["name"].lower())
    
    ddl = f"""-- ============================================================
-- SmritiSetu DDL: {target_schema}.{table_name.lower()}
-- Source: shoper9.{table_name}
-- Generated by SMRITI Schema Studio
-- ============================================================
CREATE TABLE IF NOT EXISTS {target_schema}.{table_name.lower()} (
{chr(10).join(lines)}"""
    
    if add_enhancements:
        ddl += f""",
{SMRITI_ENHANCEMENTS}"""
    
    if pk_cols:
        ddl += f""",
    PRIMARY KEY ({', '.join(pk_cols)})"""
    
    ddl += f"""
);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER trg_{table_name.lower()}_updated
    BEFORE UPDATE ON {target_schema}.{table_name.lower()}
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
"""
    return {"table": table_name, "ddl": ddl}


# ══════════════════════════════════════════════════════════════
# 4. BULK GENERATE — All Shoper9 tables at once
# ══════════════════════════════════════════════════════════════
@router.post("/generate-all-ddl")
async def generate_all_ddl(
    tables: list[str],
    target_schema: str = "shoper9",      # Exact Shoper9 schema
    db: AsyncSession = Depends(get_db)
):
    """Generate DDL for multiple tables — exact 1:1 Shoper9 structure."""
    results = []
    errors  = []
    
    for table in tables:
        try:
            ddl_result = await generate_ddl(table, target_schema, True, db)
            results.append({"table": table, "ddl": ddl_result["ddl"], "status": "OK"})
        except Exception as e:
            errors.append({"table": table, "error": str(e)})
    
    # Combine into one migration file
    combined = f"""-- ============================================================
-- SmritiSetu Full Schema Migration
-- Generated by SMRITI Schema Studio
-- Tables: {len(results)} | Errors: {len(errors)}
-- ============================================================

CREATE SCHEMA IF NOT EXISTS {target_schema};
SET search_path TO {target_schema}, public;

"""
    for r in results:
        combined += r["ddl"] + "\n\n"
    
    return {
        "schema": target_schema,
        "total": len(tables),
        "success": len(results),
        "failed": len(errors),
        "errors": errors,
        "migration_sql": combined,
        "tables": results
    }


# ══════════════════════════════════════════════════════════════
# 5. PROVISION NEW CLIENT — One-click full DB creation
# ══════════════════════════════════════════════════════════════
@router.post("/provision")
async def provision_client(
    client_id: str,
    client_name: str,
    schema_name: str = "shoper9",        # Default: exact Shoper9 schema
    include_seed: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Provision a complete SmritiSetu database for a new client.
    
    ARCHITECTURAL RULE: Uses exact Shoper9 table names and column names.
    No new tables, no renamed columns. SmritiSetu IS the Shoper9 schema in PostgreSQL.
    Creates schema, all tables (exact Shoper9 structure), seed data.
    """
    log = []
    
    try:
        # 1. Create client schema
        await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
        log.append(f"✓ Schema '{schema_name}' created")
        
        # 2. Get all shoper9 tables
        tables_result = await list_shoper9_tables(db)
        tables = [t["name"] for t in tables_result["tables"]]
        log.append(f"✓ Found {len(tables)} Shoper9 reference tables")
        
        # 3. Generate and execute DDL for each table
        created = []
        failed  = []
        for table in tables:
            try:
                ddl_r = await generate_ddl(table, schema_name, True, db)
                await db.execute(text(ddl_r["ddl"]))
                created.append(table)
            except Exception as e:
                failed.append({"table": table, "error": str(e)})
        
        log.append(f"✓ Created {len(created)} tables, {len(failed)} skipped")
        
        # 4. Seed essential data
        if include_seed:
            await db.execute(text(f"""
                INSERT INTO public.stores (id, name, schema_name, is_active, created_at)
                VALUES (:id, :name, :schema, TRUE, NOW())
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
            """), {"id": client_id, "name": client_name, "schema": schema_name})
            log.append(f"✓ Store '{client_name}' registered in public.stores")
        
        await db.commit()
        log.append("✓ Commit successful — Client DB ready!")
        
        return {
            "status": "SUCCESS",
            "client_id":    client_id,
            "client_name":  client_name,
            "schema":       schema_name,
            "tables_created": len(created),
            "tables_failed":  len(failed),
            "failed_tables":  failed,
            "log":          log
        }
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail={"error": str(e), "log": log})


# ══════════════════════════════════════════════════════════════
# 6. HEALTH CHECK — Compare Shoper9 vs SmritiSetu tables
# ══════════════════════════════════════════════════════════════
@router.get("/health/{schema_name}")
async def schema_health(schema_name: str, db: AsyncSession = Depends(get_db)):
    """Compare table counts between shoper9 and a SmritiSetu schema."""
    try:
        # Shoper9 tables
        s9 = await db.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'shoper9' AND table_type = 'BASE TABLE'
        """))
        s9_tables = {r[0] for r in s9.all()}
        
        # SmritiSetu schema tables
        sm = await db.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = :schema AND table_type = 'BASE TABLE'
        """), {"schema": schema_name})
        sm_tables = {r[0] for r in sm.all()}
        
        return {
            "shoper9_tables":    len(s9_tables),
            "smriti_tables":     len(sm_tables),
            "mirrored":          len(s9_tables & sm_tables),
            "missing_in_smriti": list(s9_tables - sm_tables),
            "smriti_only":       list(sm_tables - s9_tables),
            "parity_pct":        round(len(s9_tables & sm_tables) / max(len(s9_tables), 1) * 100, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════
# 6. PROVISION MSSQL DATABASE — Full Sovereign Local DB
# ══════════════════════════════════════════════════════════════
@router.post("/provision-mssql")
async def provision_mssql(
    store_code: str,
):
    """
    Creates a new MSSQL Database 'SMRITISETU{store_code}' and deploys 
    the complete Shoper9 schema structure (579+ tables) into it.
    """
    log = []
    db_name = f"SMRITISETU{store_code}"
    log.append(f"⏳ Starting MSSQL provisioning for: {db_name}")
    
    try:
        import pyodbc
        from sqlalchemy import create_engine
        from app.models.legacy_s9 import Base
        
        # 1. Connect to master to create DB
        # Autocommit must be true for CREATE DATABASE
        master_conn_str = f"DRIVER={{{settings.mssql_driver}}};SERVER={settings.mssql_server};DATABASE=master;UID={settings.mssql_user};PWD={settings.mssql_password};"
        conn = pyodbc.connect(master_conn_str, autocommit=True)
        cursor = conn.cursor()
        
        # Check if DB exists
        cursor.execute("SELECT name FROM sys.databases WHERE name = ?", db_name)
        if cursor.fetchone():
            log.append(f"⚠️ Database '{db_name}' already exists.")
        else:
            log.append(f"⚙️ Creating MSSQL database: {db_name}...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            log.append(f"✓ Database '{db_name}' created successfully.")
            
        cursor.close()
        conn.close()
        
        # 2. Connect to the new DB and apply schema
        log.append(f"⚙️ Connecting to {db_name} to generate schema...")
        target_conn_str = f"mssql+pyodbc:///?odbc_connect=DRIVER={{{settings.mssql_driver}}};SERVER={settings.mssql_server};DATABASE={db_name};UID={settings.mssql_user};PWD={settings.mssql_password};"
        engine = create_engine(target_conn_str)
        
        log.append(f"⏳ Deploying 579+ Shoper9 tables... (This may take a minute)")
        Base.metadata.create_all(bind=engine)
        log.append(f"✓ Full Shoper9 schema deployed successfully to {db_name}!")
        
        log.append("✅ MSSQL Provisioning Complete.")
        
        return {
            "success": True,
            "database": db_name,
            "log": log
        }
        
    except Exception as e:
        logger.error(f"MSSQL Provisioning error: {str(e)}")
        log.append(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "log": log
        }
