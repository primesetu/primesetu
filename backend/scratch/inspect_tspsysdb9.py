import pyodbc
import sys
import os
sys.path.append(os.getcwd())
from mssql_connect import build_conn_str

def inspect_sysdb():
    print("--- Inspecting TSPSYSDB9 ---")
    base_conn = build_conn_str()
    # Replace the database name in the connection string
    # Assuming connection string contains 'DATABASE=Shoper9X01' or similar
    # We'll try to find the database part
    parts = base_conn.split(';')
    new_parts = []
    for p in parts:
        if p.upper().startswith('DATABASE='):
            new_parts.append('DATABASE=tspsysdb9')
        else:
            new_parts.append(p)
    
    conn_str = ';'.join(new_parts)
    
    try:
        conn = pyodbc.connect(conn_str)
        cur = conn.cursor()
        cur.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME")
        tables = [r[0] for r in cur.fetchall()]
        print(f"Found {len(tables)} tables in TSPSYSDB9:")
        for t in tables:
            print(f"  - {t}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_sysdb()
