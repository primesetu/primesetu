import pyodbc
import asyncio
import os

async def check_counts(database="shoper9x01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        for table in ['Customers', 'SaleTrnHdr']:
            cursor.execute(f"SELECT count(*) FROM {table}")
            print(f"{table}: {cursor.fetchone()[0]}")
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_counts("shoper9x01"))
