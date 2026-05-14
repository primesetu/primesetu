
import pyodbc
import json

def list_tables_with_counts():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'")
        tables = [row.TABLE_NAME for row in cursor.fetchall()]
        
        results = []
        for t in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
                count = cursor.fetchone()[0]
                results.append({"table": t, "count": count})
            except:
                results.append({"table": t, "count": -1})
        
        print(json.dumps(results, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    list_tables_with_counts()
