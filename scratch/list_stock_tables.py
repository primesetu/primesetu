import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def list_tables():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("Listing tables starting with 'Stk' or containing 'Stock'...")
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' AND (TABLE_NAME LIKE 'Stk%' OR TABLE_NAME LIKE '%Stock%')")
    rows = cursor.fetchall()
    for row in rows:
        print(row[0])
            
    conn.close()

if __name__ == "__main__":
    list_tables()
