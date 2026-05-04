import pyodbc
import time
import os
from datetime import datetime

# Configuration
DATABASES = ["SHOPER9WH1", "SHOPER9X01", "Shoper9CSW"]
LOG_FILE = "shoper9_activity_log.txt"
POLL_INTERVAL = 1

def log_event(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    formatted_msg = f"[{timestamp}] {message}"
    print(formatted_msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(formatted_msg + "\n")

def start_recorder():
    log_event("--- SHOPER 9 ACTIVITY RECORDER STARTING ---")
    log_event(f"Logging to: {os.path.abspath(LOG_FILE)}")
    
    connections = {}
    last_counts = {}
    tables_to_watch = ["StkTrnHdr", "POSCashTrn", "SaleTrnHdr", "ItemMaster"]
    
    # 1. Connect to all DBs
    for db in DATABASES:
        try:
            conn_str = f"DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;"
            conn = pyodbc.connect(conn_str)
            connections[db] = conn
            log_event(f"Connected to Database: {db}")
            
            cursor = conn.cursor()
            for table in tables_to_watch:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
                    count = cursor.fetchone()[0]
                    last_counts[f"{db}.{table}"] = count
                    log_event(f"  Initial Count [{db}.{table}]: {count}")
                except:
                    pass
        except Exception as e:
            log_event(f"Could not connect to {db}: {e}")

    # 2. Setup Global Query SPID for each DB connection to ignore self
    my_spids = {}
    for db, conn in connections.items():
        cursor = conn.cursor()
        cursor.execute("SELECT @@SPID")
        my_spids[db] = cursor.fetchone()[0]

    log_event("\n--- MONITORING ACTIVE ---")
    
    seen_query_hashes = set()

    try:
        while True:
            for db, conn in connections.items():
                cursor = conn.cursor()
                
                # Check for Global Queries first
                query_trace = """
                SELECT r.session_id, r.command, st.text, s.program_name
                FROM sys.dm_exec_requests r
                CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
                JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
                WHERE r.database_id = DB_ID(?) AND r.session_id <> ?
                """
                try:
                    cursor.execute(query_trace, db, my_spids[db])
                    requests = cursor.fetchall()
                    for req in requests:
                        spid, cmd, sql, prog = req
                        q_hash = hash(f"{db}{sql}")
                        if q_hash not in seen_query_hashes:
                            log_event(f"QUERY in {db} (SPID {spid}): {prog}")
                            log_event(f"SQL: {sql.strip()[:500]}...") # Log first 500 chars
                            log_event("-" * 30)
                            seen_query_hashes.add(q_hash)
                except:
                    pass

                # Check for Table Changes
                for table in tables_to_watch:
                    key = f"{db}.{table}"
                    if key not in last_counts: continue
                    
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
                        current_count = cursor.fetchone()[0]
                        
                        if current_count > last_counts[key]:
                            diff = current_count - last_counts[key]
                            log_event(f"!!! DATA CHANGE in {db}.{table} !!! (+{diff} rows)")
                            
                            # Get Row Details
                            try:
                                cursor.execute(f"SELECT TOP 1 * FROM [{table}] ORDER BY 1 DESC") # Order by first col (usually ID)
                                row = cursor.fetchone()
                                if row:
                                    columns = [c[0] for c in cursor.description]
                                    details = dict(zip(columns, row))
                                    log_event(f"Row Details: {details}")
                            except:
                                pass
                            
                            last_counts[key] = current_count
                            log_event("-" * 50)
                    except:
                        pass
            
            # Maintenance: periodically clear query hashes to avoid memory growth
            if len(seen_query_hashes) > 1000:
                seen_query_hashes.clear()
                
            time.sleep(POLL_INTERVAL)
            
    except KeyboardInterrupt:
        log_event("Recorder stopped by user.")
    finally:
        for conn in connections.values():
            conn.close()

if __name__ == "__main__":
    start_recorder()
