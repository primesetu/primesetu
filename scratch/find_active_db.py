import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_databases():
    server = 'AITDL'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};UID={user};PWD={password};'
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sys.databases WHERE database_id > 4")
        dbs = [r[0] for r in cursor.fetchall()]
        
        for db in dbs:
            print(f"\n--- Database: {db} ---")
            try:
                cursor.execute(f"USE [{db}]")
                cursor.execute("SELECT TOP 5 t.name, p.rows FROM sys.tables t INNER JOIN sys.partitions p ON t.object_id = p.object_id WHERE p.index_id IN (0,1) ORDER BY p.rows DESC")
                rows = cursor.fetchall()
                for r in rows:
                    print(f"  {r[0].ljust(30)} : {r[1]} rows")
            except Exception as e:
                print(f"  Error accessing {db}: {e}")
        
        conn.close()
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    get_databases()
