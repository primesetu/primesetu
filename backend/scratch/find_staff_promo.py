import pyodbc
import asyncio
import os

async def find_tables(database="shoper9x01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("--- Searching for SalesPerson/SalesMan ---")
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Sales%'")
        for row in cursor.fetchall():
            print(row[0])
            
        print("\n--- Searching for Promo ---")
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'Promo%'")
        for row in cursor.fetchall():
            print(row[0])
            
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(find_tables("shoper9x01"))
