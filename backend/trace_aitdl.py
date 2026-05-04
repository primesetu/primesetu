"""
trace_aitdl.py
─────────────────────────────────────────────────────────────
Live activity tracer for Shoper9 on Hyper-V machine AITDL.
Uses mssql_connect.py for env-based credentials.

Usage:
    python trace_aitdl.py
    python trace_aitdl.py SHOPER9WH1          # single DB
    python trace_aitdl.py SHOPER9WH1 2        # 2-sec poll
"""

import sys
import time
import os
from datetime import datetime
import pyodbc
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Config ────────────────────────────────────────────────────────────────────
SERVER   = os.getenv("MSSQL_SERVER",   "AITDL")
USER     = os.getenv("MSSQL_USER",     "sa")
PASSWORD = os.getenv("MSSQL_PASSWORD", "netmanthan@123")
DRIVER   = os.getenv("MSSQL_DRIVER",   "SQL Server")

# Databases to probe (override with CLI arg)
DATABASES = sys.argv[1].split(",") if len(sys.argv) > 1 else [
    "SHOPER9WH1", "SHOPER9X01", "Shoper9CSW"
]
POLL_SEC  = int(sys.argv[2]) if len(sys.argv) > 2 else 1

TABLES = ["StkTrnHdr", "POSCashTrn", "SaleTrnHdr", "ItemMaster", "AccTrnHdr"]
LOG_FILE = os.path.join(os.path.dirname(__file__), "trace_output.txt")

# ── Helpers ───────────────────────────────────────────────────────────────────
def ts():
    return datetime.now().strftime("%H:%M:%S")

def log(msg):
    line = f"[{ts()}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def make_conn(database: str) -> pyodbc.Connection:
    cs = (
        f"DRIVER={{{DRIVER}}};"
        f"SERVER={SERVER};"
        f"DATABASE={database};"
        f"UID={USER};"
        f"PWD={PASSWORD};"
    )
    return pyodbc.connect(cs, timeout=8)

# ── Main ──────────────────────────────────────────────────────────────────────
def run():
    log("=" * 60)
    log(f"SHOPER9 LIVE TRACER  |  Server: {SERVER}")
    log(f"Databases : {', '.join(DATABASES)}")
    log(f"Tables    : {', '.join(TABLES)}")
    log(f"Poll      : {POLL_SEC}s  |  Log: trace_output.txt")
    log("=" * 60)

    connections  = {}
    last_counts  = {}
    my_spids     = {}
    seen_hashes  = set()

    # ── Connect & baseline ───────────────────────────────────────────────────
    for db in DATABASES:
        try:
            conn = make_conn(db)
            connections[db] = conn
            cur = conn.cursor()
            cur.execute("SELECT @@SPID")
            my_spids[db] = cur.fetchone()[0]
            log(f"  Connected  : {db}  (SPID {my_spids[db]})")

            for tbl in TABLES:
                try:
                    cur.execute(f"SELECT COUNT(*) FROM [{tbl}]")
                    n = cur.fetchone()[0]
                    last_counts[f"{db}.{tbl}"] = n
                    log(f"    {db}.{tbl:<20} : {n:>8} rows")
                except Exception:
                    pass
        except Exception as e:
            log(f"  SKIP {db} : {e}")

    if not connections:
        log("No databases reachable. Check MSSQL_SERVER in .env and SQL TCP/Firewall on AITDL.")
        return

    log("\n>>> MONITORING LIVE — Ctrl+C to stop <<<\n")

    # ── Poll loop ─────────────────────────────────────────────────────────────
    try:
        while True:
            for db, conn in connections.items():
                try:
                    cur = conn.cursor()

                    # 1. Active queries (dm_exec_requests)
                    try:
                        cur.execute("""
                            SELECT r.session_id, r.command, st.text, s.program_name
                            FROM   sys.dm_exec_requests r
                            CROSS  APPLY sys.dm_exec_sql_text(r.sql_handle) st
                            JOIN   sys.dm_exec_sessions s ON r.session_id = s.session_id
                            WHERE  r.database_id = DB_ID(?) AND r.session_id <> ?
                        """, db, my_spids[db])
                        for spid, cmd, sql, prog in cur.fetchall():
                            h = hash(f"{db}{sql}")
                            if h not in seen_hashes:
                                log(f"[QUERY] {db}  SPID={spid}  prog={prog}")
                                log(f"        SQL: {sql.strip()[:400]}")
                                log("-" * 55)
                                seen_hashes.add(h)
                                if len(seen_hashes) > 2000:
                                    seen_hashes.clear()
                    except Exception:
                        pass

                    # 2. Row-count delta
                    for tbl in TABLES:
                        key = f"{db}.{tbl}"
                        if key not in last_counts:
                            continue
                        try:
                            cur.execute(f"SELECT COUNT(*) FROM [{tbl}]")
                            now = cur.fetchone()[0]
                            diff = now - last_counts[key]

                            if diff > 0:
                                log(f"[CHANGE] {db}.{tbl}  +{diff} row(s)  total={now}")
                                # Dump latest row
                                try:
                                    cur.execute(
                                        f"SELECT TOP 1 * FROM [{tbl}] ORDER BY 1 DESC"
                                    )
                                    row = cur.fetchone()
                                    if row:
                                        cols = [c[0] for c in cur.description]
                                        for k, v in zip(cols, row):
                                            if v is not None and str(v).strip():
                                                log(f"         {k:<22}: {v}")
                                except Exception:
                                    pass
                                log("-" * 55)
                                last_counts[key] = now

                            elif diff < 0:
                                log(f"[DELETE] {db}.{tbl}  {diff} row(s)  total={now}")
                                last_counts[key] = now

                        except Exception:
                            pass

                except pyodbc.Error as e:
                    log(f"[ERR] {db} connection lost: {e}")
                    # Try reconnect once
                    try:
                        connections[db] = make_conn(db)
                        log(f"[RECONNECT] {db} OK")
                    except Exception:
                        pass

            time.sleep(POLL_SEC)

    except KeyboardInterrupt:
        log("\nTrace stopped by user.")
    finally:
        for c in connections.values():
            try:
                c.close()
            except Exception:
                pass
        log("Connections closed.")


if __name__ == "__main__":
    run()
