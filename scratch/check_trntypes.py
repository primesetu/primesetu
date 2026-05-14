import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def check_trntypes():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("--- TrnType Distribution in StkTrnHdr ---")
    cursor.execute("SELECT TrnType, COUNT(*) FROM StkTrnHdr GROUP BY TrnType")
    for r in cursor.fetchall():
        print(f"TrnType: {r[0]}, Count: {r[1]}")
            
    conn.close()

if __name__ == "__main__":
    check_trntypes()
