import pyodbc
import time
from datetime import datetime

def monitor_all_activity():
    conn_str = "DRIVER={SQL Server};SERVER=.;DATABASE=master;Trusted_Connection=yes;"
    print(f"Connecting to MSSQL (Master) for Global Trace...")
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("\n--- MSSQL GLOBAL QUERY TRACE ACTIVATED ---")
        print("Monitoring all active sessions and requests...\n")
        
        # We will ignore our own session
        cursor.execute("SELECT @@SPID")
        my_spid = cursor.fetchone()[0]
        
        print(f"Waiting for activity... (Excluding SPID {my_spid})\n")
        
        seen_queries = set()
        
        while True:
            # Query sys.dm_exec_requests to see what's running
            query = """
            SELECT 
                r.session_id,
                r.status,
                r.command,
                SUBSTRING(st.text, (r.statement_start_offset/2)+1,   
                    ((CASE r.statement_end_offset  
                        WHEN -1 THEN DATALENGTH(st.text)  
                        ELSE r.statement_end_offset END   
                            - r.statement_start_offset)/2) + 1) AS [StatementText],
                DB_NAME(r.database_id) AS [DatabaseName],
                s.login_name,
                s.host_name,
                s.program_name,
                r.wait_type,
                r.wait_time,
                r.cpu_time,
                r.total_elapsed_time,
                r.reads,
                r.writes,
                r.logical_reads,
                r.blocking_session_id
            FROM sys.dm_exec_requests r
            CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
            JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
            WHERE r.session_id <> ?
            """
            
            cursor.execute(query, my_spid)
            rows = cursor.fetchall()
            
            for row in rows:
                spid, status, command, text, db, login, host, prog, wait, wait_t, cpu, elapsed, reads, writes, l_reads, blocking = row
                query_key = f"{spid}-{text[:100]}"
                
                if query_key not in seen_queries:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] --- DETAILED TRACE EVENT ---")
                    print(f"SESSION ID: {spid} | DATABASE: {db} | LOGIN: {login}")
                    print(f"HOST      : {host}")
                    print(f"PROGRAM   : {prog}")
                    print(f"COMMAND   : {command} | STATUS: {status}")
                    
                    if blocking:
                        print(f"!!! BLOCKED BY SESSION ID: {blocking} !!!")
                    
                    if wait:
                        print(f"WAIT TYPE : {wait} ({wait_t}ms)")
                    
                    print(f"STATS     : CPU={cpu}ms | ELAPSED={elapsed}ms | READS={reads} | WRITES={writes}")
                    print(f"SQL TEXT  :\n{text.strip()}")
                    print("-" * 60)
                    seen_queries.add(query_key)
            
            # Clean up seen_queries to keep it fresh
            if len(seen_queries) > 100:
                seen_queries.clear()
                
            time.sleep(1)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

if __name__ == "__main__":
    monitor_all_activity()
