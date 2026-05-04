"""
shoper9_tracer.py
══════════════════════════════════════════════════════════════════════════════
SHOPER 9 FULL-ACTIVITY AUTO-TRACER  |  Target: AITDL Hyper-V MSSQL
══════════════════════════════════════════════════════════════════════════════

What it captures:
  ▸ ALL SQL queries executed against Shoper9 databases (via dm_exec_requests)
  ▸ Active sessions / logins (program name, host, login)
  ▸ Row-count deltas on every key Shoper9 table
  ▸ INSERT / UPDATE / DELETE counts per table (sys.dm_db_index_usage_stats)
  ▸ Server-side sp_trace (.trc file) for complete event capture if SA role

Logs written to:  shoper9trace/
  ├── YYYYMMDD_activity.log   ← main rolling daily log (human readable)
  ├── YYYYMMDD_queries.tsv    ← tab-separated query dump
  ├── YYYYMMDD_changes.tsv    ← row-change events
  └── session_HHMMSS.log      ← this run's console mirror

Run:
    python shoper9_tracer.py
    python shoper9_tracer.py 2          # poll every 2 seconds
"""

import os, sys, time, pyodbc, signal, traceback
from datetime import datetime, date
from pathlib import Path
from dotenv import load_dotenv

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT   = Path(__file__).parent               # d:\IMP\GitHub\primesetu\shoper9trace
DOTENV = ROOT.parent / "backend" / ".env"   # primesetu\backend\.env
load_dotenv(DOTENV)

# ── Connection settings ───────────────────────────────────────────────────────
SERVER   = os.getenv("MSSQL_SERVER",   "AITDL")
USER     = os.getenv("MSSQL_USER",     "sa")
PASSWORD = os.getenv("MSSQL_PASSWORD", "netmanthan@123")
DRIVER   = os.getenv("MSSQL_DRIVER",   "SQL Server")

DATABASES = ["Shoper9X01", "tspsysdb9"]

# All critical Shoper9 tables to watch
TABLES = [
    "StkTrnHdr", "StkTrnDtl",
    "POSCashTrn", "POSCashTrnDtl",
    "SaleTrnHdr", "SaleTrnDtl",
    "ItemMaster", "ItemCategory",
    "AccTrnHdr",  "AccTrnDtl",
    "CashTrn",    "StockLdgr",
    "VchDtls",    "BrkgDtls",
    "PartyMaster","SalesMan",
    "StkAdjHdr",  "StkAdjDtl",
    "PurOrdHdr",  "PurOrdDtl",
    "GrnHdr",     "GrnDtl",
    "TaxTrnDtl",  "ExpectedTrnHdr",
    "PromoMnHeader", "SysParam",
]

POLL_SEC = int(sys.argv[1]) if len(sys.argv) > 1 else 1
RUNNING  = True

# ── Logging ───────────────────────────────────────────────────────────────────
_session_tag = datetime.now().strftime("%H%M%S")

def _log_path(suffix: str, ext: str) -> Path:
    return ROOT / f"{date.today().strftime('%Y%m%d')}_{suffix}.{ext}"

def _session_log() -> Path:
    return ROOT / f"session_{_session_tag}.log"

def log(msg: str, category: str = "INFO"):
    ts   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}][{category:<8}] {msg}"
    print(line)
    # main activity log
    with open(_log_path("activity", "log"), "a", encoding="utf-8") as f:
        f.write(line + "\n")
    # session mirror
    with open(_session_log(), "a", encoding="utf-8") as f:
        f.write(line + "\n")

def log_query(db: str, spid: int, prog: str, login: str, host: str, sql: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(_log_path("queries", "tsv"), "a", encoding="utf-8") as f:
        safe_sql = sql.replace("\t", " ").replace("\n", " ").strip()[:1000]
        f.write(f"{ts}\t{db}\t{spid}\t{prog}\t{login}\t{host}\t{safe_sql}\n")

def log_change(db: str, table: str, event: str, delta: int, total: int, row_dump: dict):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(_log_path("changes", "tsv"), "a", encoding="utf-8") as f:
        dump = str(row_dump)[:500].replace("\t", " ")
        f.write(f"{ts}\t{db}\t{table}\t{event}\t{delta}\t{total}\t{dump}\n")

# ── Connection factory ────────────────────────────────────────────────────────
def make_conn(database: str, timeout: int = 8) -> pyodbc.Connection:
    cs = (
        f"DRIVER={{{DRIVER}}};"
        f"SERVER={SERVER};"
        f"DATABASE={database};"
        f"UID={USER};"
        f"PWD={PASSWORD};"
    )
    return pyodbc.connect(cs, timeout=timeout)

# ── Server-side sp_trace setup (best-effort, needs sysadmin) ─────────────────
def try_start_server_trace(conn: pyodbc.Connection) -> int:
    """
    Attempt to create a SQL Server side-trace (.trc) that captures ALL events.
    Returns trace_id (int) or 0 if failed.
    The .trc file is written to AITDL's temp folder — use SQL Server Profiler
    or fn_trace_gettable to read it later.
    """
    try:
        cur  = conn.cursor()
        trc  = f"C:\\Shoper9Trace\\s9trace_{date.today().strftime('%Y%m%d')}"

        # Create trace
        cur.execute("""
            DECLARE @tid INT, @opts INT = 2, @maxsz BIGINT = 500, @stop DATETIME = NULL
            EXEC sp_trace_create @tid OUTPUT, @opts, N'""" + trc + """', @maxsz, @stop
            SELECT @tid
        """)
        tid = cur.fetchone()[0]
        conn.commit()

        # Events to capture:  10=RPC:Completed, 12=SQL:BatchCompleted,
        #   14=Audit Login, 15=Audit Logout, 40=SQL:StmtStarting,
        #   41=SQL:StmtCompleted, 45=SP:Completed
        events = [10, 12, 14, 15, 41, 45]
        cols   = [1, 2, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18]  # std cols

        for ev in events:
            for col in cols:
                try:
                    cur.execute("EXEC sp_trace_setevent ?, ?, ?, 1", tid, ev, col)
                except Exception:
                    pass

        # Filter: only Shoper9 databases
        # (AppName LIKE 'Shoper%' OR DBName IN our list — use TextData filter)
        # Start trace
        cur.execute("EXEC sp_trace_setstatus ?, 1", tid)
        conn.commit()
        log(f"Server-side sp_trace started  id={tid}  file={trc}.trc", "TRACE")
        return tid
    except Exception as e:
        log(f"sp_trace not available (need sysadmin): {e}", "WARN")
        return 0

def stop_server_trace(conn: pyodbc.Connection, tid: int):
    if not tid:
        return
    try:
        cur = conn.cursor()
        cur.execute("EXEC sp_trace_setstatus ?, 0", tid)  # stop
        cur.execute("EXEC sp_trace_setstatus ?, 2", tid)  # close
        conn.commit()
        log(f"Server-side trace {tid} stopped & closed.", "TRACE")
    except Exception as e:
        log(f"Could not stop trace {tid}: {e}", "WARN")

# ── Main tracer ───────────────────────────────────────────────────────────────
def run():
    global RUNNING

    # Header
    log("=" * 70, "START")
    log(f"SHOPER9 AUTO-TRACER  |  Server: {SERVER}", "START")
    log(f"Databases : {', '.join(DATABASES)}", "START")
    log(f"Poll      : {POLL_SEC}s", "START")
    log(f"Log dir   : {ROOT}", "START")
    log("=" * 70, "START")

    # Write TSV headers
    if not _log_path("queries", "tsv").exists():
        with open(_log_path("queries", "tsv"), "w", encoding="utf-8") as f:
            f.write("timestamp\tdb\tspid\tprogram\tlogin\thost\tsql\n")
    if not _log_path("changes", "tsv").exists():
        with open(_log_path("changes", "tsv"), "w", encoding="utf-8") as f:
            f.write("timestamp\tdb\ttable\tevent\tdelta\ttotal\trow_dump\n")

    # ── Connect to all databases ──────────────────────────────────────────────
    connections  : dict[str, pyodbc.Connection] = {}
    last_counts  : dict[str, int]  = {}
    my_spids     : dict[str, int]  = {}
    seen_queries : set = set()
    trace_ids    : dict[str, int]  = {}

    for db in DATABASES:
        try:
            conn = make_conn(db)
            connections[db] = conn
            cur  = conn.cursor()
            cur.execute("SELECT @@SPID")
            my_spids[db] = cur.fetchone()[0]
            log(f"Connected : {db}  (my SPID={my_spids[db]})", "CONN")

            # Baseline row counts
            for tbl in TABLES:
                try:
                    cur.execute(f"SELECT COUNT(*) FROM [{tbl}]")
                    n = cur.fetchone()[0]
                    last_counts[f"{db}.{tbl}"] = n
                    log(f"  Baseline  {db}.{tbl:<24} = {n:>8} rows", "INIT")
                except Exception:
                    pass  # table may not exist in this DB

            # Try server-side trace on first (main) DB only — avoids dup .trc
            if db == DATABASES[0]:
                trace_ids[db] = try_start_server_trace(conn)

        except Exception as e:
            log(f"SKIP {db}: {e}", "ERR")

    if not connections:
        log("No databases reachable. Ensure SQL TCP/Firewall is open on AITDL.", "FATAL")
        log("Run on AITDL: netsh advfirewall firewall add rule name='SQL1433' dir=in action=allow protocol=TCP localport=1433", "HINT")
        return

    log("\n>>> LIVE MONITORING ACTIVE — Ctrl+C to stop <<<\n", "START")

    def _signal_handler(sig, frame):
        global RUNNING
        RUNNING = False
    signal.signal(signal.SIGINT,  _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    # ── Poll loop ─────────────────────────────────────────────────────────────
    cycle = 0
    while RUNNING:
        cycle += 1
        today_tag = date.today().strftime("%Y%m%d")  # handle midnight rollover

        for db, conn in list(connections.items()):
            try:
                cur = conn.cursor()

                # ── 1. Active queries (all sessions except ours) ──────────────
                try:
                    cur.execute("""
                        SELECT
                            r.session_id,
                            r.command,
                            s.program_name,
                            s.login_name,
                            s.host_name,
                            st.text
                        FROM   sys.dm_exec_requests r
                        CROSS  APPLY sys.dm_exec_sql_text(r.sql_handle) st
                        JOIN   sys.dm_exec_sessions s ON r.session_id = s.session_id
                        WHERE  r.database_id = DB_ID(?)
                          AND  r.session_id  <> ?
                          AND  st.text NOT LIKE '%dm_exec_requests%'
                    """, db, my_spids[db])

                    for spid, cmd, prog, login, host, sql in cur.fetchall():
                        h = hash(f"{db}|{sql.strip()[:300]}")
                        if h not in seen_queries:
                            log(f"[QUERY] {db} SPID={spid} prog={prog} login={login}@{host}", "SQL")
                            log(f"        {sql.strip()[:500]}", "SQL")
                            log_query(db, spid, prog, login, host, sql)
                            seen_queries.add(h)
                            if len(seen_queries) > 5000:
                                seen_queries.clear()
                except Exception:
                    pass

                # ── 2. Idle Shoper9 sessions (logged in but not running) ──────
                if cycle % 30 == 0:  # every 30 cycles
                    try:
                        cur.execute("""
                            SELECT session_id, program_name, login_name, host_name,
                                   status, last_request_start_time
                            FROM   sys.dm_exec_sessions
                            WHERE  database_id = DB_ID(?)
                              AND  session_id   <> ?
                              AND  program_name LIKE '%Shoper%'
                        """, db, my_spids[db])
                        sessions = cur.fetchall()
                        if sessions:
                            log(f"[SESSION] {db}: {len(sessions)} Shoper session(s) active", "SESS")
                            for sid, prog, login, host, status, last_req in sessions:
                                log(f"  SPID={sid} {prog} {login}@{host} [{status}] last={last_req}", "SESS")
                    except Exception:
                        pass

                # ── 3. DML counts from index usage stats ─────────────────────
                if cycle % 10 == 1:
                    try:
                        cur.execute("""
                            SELECT
                                OBJECT_NAME(i.object_id) AS tbl,
                                SUM(s.user_inserts)  AS ins,
                                SUM(s.user_updates)  AS upd,
                                SUM(s.user_deletes)  AS del
                            FROM   sys.dm_db_index_usage_stats s
                            JOIN   sys.indexes i
                                ON i.object_id = s.object_id
                               AND i.index_id  = s.index_id
                            WHERE  s.database_id = DB_ID(?)
                              AND  OBJECT_NAME(i.object_id) IN ({})
                            GROUP BY OBJECT_NAME(i.object_id)
                        """.format(",".join(f"'{t}'" for t in TABLES)), db)
                        for tbl, ins, upd, dlt in cur.fetchall():
                            key_ins = f"dml.{db}.{tbl}.ins"
                            key_upd = f"dml.{db}.{tbl}.upd"
                            key_del = f"dml.{db}.{tbl}.del"
                            prev_ins = last_counts.get(key_ins, 0)
                            prev_upd = last_counts.get(key_upd, 0)
                            prev_del = last_counts.get(key_del, 0)

                            if ins  > prev_ins:
                                log(f"[INSERT] {db}.{tbl}  +{ins-prev_ins} inserts (cumulative={ins})", "DML")
                                last_counts[key_ins] = ins
                            if upd > prev_upd:
                                log(f"[UPDATE] {db}.{tbl}  +{upd-prev_upd} updates (cumulative={upd})", "DML")
                                last_counts[key_upd] = upd
                            if dlt  > prev_del:
                                log(f"[DELETE] {db}.{tbl}  +{dlt-prev_del} deletes (cumulative={dlt})", "DML")
                                last_counts[key_del] = dlt
                    except Exception:
                        pass

                # ── 4. Row-count delta (primary change detector) ──────────────
                for tbl in TABLES:
                    key = f"{db}.{tbl}"
                    if key not in last_counts:
                        continue
                    try:
                        cur.execute(f"SELECT COUNT(*) FROM [{tbl}]")
                        now  = cur.fetchone()[0]
                        diff = now - last_counts[key]

                        if diff != 0:
                            event = "INSERT" if diff > 0 else "DELETE"
                            log(f"[{event}] {db}.{tbl}  delta={diff:+}  total={now}", "DELTA")

                            # Dump latest/oldest row
                            row_dump = {}
                            try:
                                order = "DESC" if diff > 0 else "ASC"
                                cur.execute(f"SELECT TOP 1 * FROM [{tbl}] ORDER BY 1 {order}")
                                row = cur.fetchone()
                                if row:
                                    cols = [c[0] for c in cur.description]
                                    row_dump = {
                                        k: v for k, v in zip(cols, row)
                                        if v is not None and str(v).strip()
                                    }
                                    for k, v in row_dump.items():
                                        log(f"         {k:<24}: {v}", "ROW")
                            except Exception:
                                pass

                            log("-" * 60, "---")
                            log_change(db, tbl, event, diff, now, row_dump)
                            last_counts[key] = now

                    except Exception:
                        pass

            except pyodbc.Error as e:
                log(f"[ERR] {db}: {e}", "ERR")
                # Reconnect attempt
                try:
                    connections[db] = make_conn(db)
                    log(f"[RECONNECT] {db} OK", "CONN")
                except Exception:
                    pass

        time.sleep(POLL_SEC)

    # ── Cleanup ───────────────────────────────────────────────────────────────
    log("\n" + "=" * 70, "STOP")
    log("Tracer stopping...", "STOP")
    for db, tid in trace_ids.items():
        stop_server_trace(connections.get(db), tid)
    for c in connections.values():
        try:
            c.close()
        except Exception:
            pass
    log("All connections closed. Goodbye.", "STOP")
    log("=" * 70, "STOP")


if __name__ == "__main__":
    try:
        run()
    except Exception:
        traceback.print_exc()
