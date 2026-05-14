import pyodbc
import asyncio
import os

async def check_columns(database="shoper9x01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        for table in ['Customers', 'SaleTrnHdr', 'POSMODEDATADTLS']:
            print(f"--- Columns in {table} ---")
            cursor.execute(f"SELECT TOP 0 * FROM {table}")
            cols = [column[0] for column in cursor.description]
            print(cols)
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_columns("shoper9x01"))
