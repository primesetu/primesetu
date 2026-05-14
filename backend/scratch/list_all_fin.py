import pyodbc
import asyncio
import os

async def list_all_tables(database="shoper9x01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = [row[0] for row in cursor.fetchall()]
        print("--- All Tables ---")
        for t in tables:
            if any(p in t.lower() for p in ['person', 'staff', 'sales', 'promo']):
                print(t)
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_all_tables("shoper9x01"))
