import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def check_aitdl():
    server = 'AITDL'
    database = 'SHOPER9GKP'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    print(f"Connecting to MSSQL: {server} -> {database}")
    
    try:
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()
        
        # List tables
        print("\nTables in SHOPER9GKP:")
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = cursor.fetchall()
        for t in tables[:10]: # Show first 10
            print(f"  {t[0]}")
        print(f"\nTotal tables: {len(tables)}")
        
        # Check AcceptDisplayDtls
        print("\nChecking AcceptDisplayDtls:")
        try:
            cursor.execute("SELECT COUNT(*) FROM AcceptDisplayDtls")
            count = cursor.fetchone()[0]
            print(f"  Count: {count}")
        except Exception as e:
            print(f"  Error: {e}")
            
        conn.close()
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    check_aitdl()
