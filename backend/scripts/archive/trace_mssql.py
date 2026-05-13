import pyodbc
import time
import sys
from datetime import datetime

def trace_mssql():
    databases = ["SHOPER9WH1", "SHOPER9X01", "Shoper9CSW"]
    print(f"Connecting to Local MSSQL Server (Multi-DB Trace)...")
    
    connections = {}
    last_counts = {}
    
    tables_to_watch = ["StkTrnHdr", "POSCashTrn", "SaleTrnHdr"]
    
    for db in databases:
        try:
            conn_str = f"DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;"
            conn = pyodbc.connect(conn_str)
            connections[db] = conn
            print(f"Connected to {db}")
            
            cursor = conn.cursor()
            for table in tables_to_watch:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
                    count = cursor.fetchone()[0]
                    last_counts[f"{db}.{table}"] = count
                    print(f"  [{db}] {table}: {count} rows")
                except:
                    pass
        except Exception as e:
            print(f"Could not connect to {db}: {e}")

    print("\n--- MULTI-DB LIVE TRACER ACTIVATED ---")
    print("Waiting for activity in any Shoper9 database...\n")
    
    try:
        while True:
            for db, conn in connections.items():
                cursor = conn.cursor()
                for table in tables_to_watch:
                    key = f"{db}.{table}"
                    if key not in last_counts: continue
                    
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
                        current_count = cursor.fetchone()[0]
                        
                        if current_count > last_counts[key]:
                            diff = current_count - last_counts[key]
                            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] NEW ACTIVITY in {db} -> {table.upper()}! (+{diff} rows)")
                            
                            # Fetch Detail
                            try:
                                cursor.execute(f"SELECT TOP 1 * FROM [{table}] ORDER BY docdt DESC, entrytime DESC")
                            except:
                                cursor.execute(f"SELECT TOP 1 * FROM [{table}]")
                                
                            row = cursor.fetchone()
                            if row:
                                columns = [column[0] for column in cursor.description]
                                row_dict = dict(zip(columns, row))
                                print(f"--- {table} RECORD DUMP ---")
                                for k, v in row_dict.items():
                                    if v is not None and str(v).strip() != "":
                                        print(f"  {k:20}: {v}")
                                print("-" * 50)
                            
                            last_counts[key] = current_count
                    except:
                        pass
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Trace...")
    except Exception as e:
        print(f"Fatal Error: {e}")
    finally:
        for conn in connections.values():
            try:
                conn.close()
            except:
                pass

if __name__ == "__main__":
    trace_mssql()
