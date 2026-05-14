import pyodbc
import asyncio
import os

async def check_trntypes(database="shoper9x01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT TrnType FROM StkTrnDtls")
        types = [row[0] for row in cursor.fetchall()]
        print(f"TrnTypes in StkTrnDtls: {types}")
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_trntypes("shoper9x01"))
