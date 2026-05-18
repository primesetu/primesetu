"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  SMRITI GOLDEN SEED — Backfill Migration Script                             ║
║  Run once on existing tenants to provision Phase 1-3 tables.                ║
║                                                                              ║
║  Safe to run on NEW stores too — fully idempotent (ON CONFLICT DO NOTHING). ║
║                                                                              ║
║  Usage:                                                                      ║
║    python seeds/backfill_golden_seeds.py                  # all tenants      ║
║    python seeds/backfill_golden_seeds.py --dry-run        # list only        ║
║    python seeds/backfill_golden_seeds.py --tenant gkp     # one store        ║
║    python seeds/backfill_golden_seeds.py --tenant gkp --dry-run              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
import asyncio
import argparse
import logging
import sys
import os
import time

# ── Path setup so we can import app modules ───────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("backfill")


# ── Config ────────────────────────────────────────────────────────────────────
def get_base_url() -> str:
    """Pull the DB base URL from app config."""
    try:
        from app.core.config import settings
        return settings.local_database_url.rsplit("/", 1)[0]
    except Exception:
        # Fallback for running outside app context
        return os.environ.get(
            "SMRITI_DB_BASE",
            "postgresql+asyncpg://postgres:postgres@localhost:5432"
        )


# ── Fetch all tenants from registry ──────────────────────────────────────────
async def fetch_tenants(base_url: str, prefix_filter: str | None = None) -> list[dict]:
    registry_url = f"{base_url}/smriti_registry"
    engine = create_async_engine(registry_url)
    try:
        async with engine.connect() as conn:
            if prefix_filter:
                res = await conn.execute(
                    text("SELECT tenant_id, company_name, invoice_prefix, gstin, owner_mobile, db_name, status "
                         "FROM company_registry WHERE invoice_prefix = :p ORDER BY created_at"),
                    {"p": prefix_filter.lower()}
                )
            else:
                res = await conn.execute(
                    text("SELECT tenant_id, company_name, invoice_prefix, gstin, owner_mobile, db_name, status "
                         "FROM company_registry ORDER BY created_at")
                )
            rows = res.mappings().all()
            return [dict(r) for r in rows]
    except Exception as e:
        log.error(f"Cannot read company_registry: {e}")
        return []
    finally:
        await engine.dispose()


# ── Backfill a single tenant ──────────────────────────────────────────────────
async def backfill_tenant(base_url: str, tenant: dict, dry_run: bool) -> dict:
    db_name  = tenant["db_name"]
    tid      = str(tenant["tenant_id"])
    name     = tenant["company_name"]
    prefix   = tenant["invoice_prefix"]
    gstin    = tenant.get("gstin") or ""
    mobile   = tenant.get("owner_mobile") or ""
    status   = tenant.get("status", "?")

    result = {
        "tenant_id": tid,
        "db_name":   db_name,
        "company":   name,
        "status":    "skipped",
        "rows":      0,
        "tables":    0,
        "error":     None,
    }

    if status == "PROVISIONING":
        log.warning(f"  [{db_name}] Status=PROVISIONING — skipping (not yet fully created)")
        result["status"] = "skipped_provisioning"
        return result

    if dry_run:
        log.info(f"  [{db_name}] DRY-RUN — would backfill '{name}' (prefix={prefix})")
        result["status"] = "dry_run"
        return result

    target_url = f"{base_url}/{db_name}"
    engine = create_async_engine(target_url)

    try:
        t0 = time.time()
        from seeds.golden_seed_engine import GoldenSeedEngine, ensure_sysparam_golden
        ensure_sysparam_golden()

        async with engine.begin() as conn:
            summary = await GoldenSeedEngine.provision(
                conn         = conn,
                tenant_id    = tid,
                company_info = {
                    "company_name":   name,
                    "invoice_prefix": prefix,
                    "gstin":          gstin,
                    "owner_mobile":   mobile,
                },
            )

        total_rows   = sum(v for v in summary.values() if isinstance(v, int))
        total_tables = len(summary)
        elapsed      = time.time() - t0

        log.info(f"  [{db_name}] OK — {total_rows:,} rows across {total_tables} tables in {elapsed:.1f}s")
        result.update({"status": "ok", "rows": total_rows, "tables": total_tables})

    except Exception as e:
        log.error(f"  [{db_name}] FAILED — {e}")
        result.update({"status": "failed", "error": str(e)})

    finally:
        await engine.dispose()

    return result


# ── Main ──────────────────────────────────────────────────────────────────────
async def main(prefix_filter: str | None, dry_run: bool):
    base_url = get_base_url()
    log.info("=" * 70)
    log.info("  SMRITI Golden Seed — Backfill Migration")
    log.info(f"  DB base : {base_url}")
    log.info(f"  Filter  : {prefix_filter or 'ALL tenants'}")
    log.info(f"  Mode    : {'DRY-RUN (no changes)' if dry_run else 'LIVE (writing to DB)'}")
    log.info("=" * 70)

    tenants = await fetch_tenants(base_url, prefix_filter)

    if not tenants:
        log.warning("No tenants found in company_registry. Nothing to do.")
        return

    log.info(f"\nFound {len(tenants)} tenant(s) in registry:\n")
    for i, t in enumerate(tenants, 1):
        log.info(f"  {i:2}. {t['db_name']:<30}  {t['company_name']:<35}  [{t['status']}]")

    log.info("")

    results = []
    for i, tenant in enumerate(tenants, 1):
        log.info(f"[{i}/{len(tenants)}] Processing: {tenant['db_name']} — {tenant['company_name']}")
        r = await backfill_tenant(base_url, tenant, dry_run)
        results.append(r)

    # ── Summary report ────────────────────────────────────────────────────────
    log.info("")
    log.info("=" * 70)
    log.info("  BACKFILL SUMMARY")
    log.info("=" * 70)

    ok       = [r for r in results if r["status"] == "ok"]
    failed   = [r for r in results if r["status"] == "failed"]
    skipped  = [r for r in results if r["status"].startswith("skip")]
    dry      = [r for r in results if r["status"] == "dry_run"]

    log.info(f"  Total tenants : {len(results)}")
    log.info(f"  Succeeded     : {len(ok)}")
    log.info(f"  Failed        : {len(failed)}")
    log.info(f"  Skipped       : {len(skipped)}")
    if dry_run:
        log.info(f"  Dry-run only  : {len(dry)} (no changes made)")

    if ok:
        total_rows = sum(r["rows"] for r in ok)
        log.info(f"\n  Total rows seeded across all stores: {total_rows:,}")

    if failed:
        log.info("\n  FAILED TENANTS:")
        for r in failed:
            log.error(f"    {r['db_name']}: {r['error']}")

    log.info("=" * 70)

    if failed:
        sys.exit(1)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Backfill Golden Seed Engine for existing SMRITI tenants"
    )
    parser.add_argument(
        "--tenant",
        metavar="PREFIX",
        help="Backfill only this specific store (invoice_prefix, e.g. 'gkp')",
        default=None,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List tenants that would be backfilled without making any changes",
    )
    args = parser.parse_args()
    asyncio.run(main(prefix_filter=args.tenant, dry_run=args.dry_run))
