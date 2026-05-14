import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def list_shoper_tables():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = [r[0] for r in cursor.fetchall()]
        
        print(f"Total tables in Shoper9: {len(tables)}")
        
        # Categorize or sample them to not overwhelm the user
        print("\n--- Sample Shoper9 Tables ---")
        for table in sorted(tables)[:50]: # Just showing first 50 to avoid huge output
            print(table)
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_shoper_tables()
