import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def check_x01():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        tables = ['ItemMaster', 'AcceptDisplayDtls', 'StkTrnHdr', 'StkTrnDtls', 'StockMaster']
        for t in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
                count = cursor.fetchone()[0]
                print(f"  {t.ljust(20)} : {count} rows")
            except Exception as e:
                print(f"  {t.ljust(20)} : Error ({e})")
        
        conn.close()
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    check_x01()
