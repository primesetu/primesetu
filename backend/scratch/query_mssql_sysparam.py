
import pyodbc
import json
from datetime import datetime

def query_mssql_sysparam():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SysParam'")
        if not cursor.fetchone():
            print("Table 'SysParam' not found.")
            return

        cursor.execute("SELECT * FROM SysParam")
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append(dict(zip(columns, row)))
        
        def json_serial(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError ("Type %s not serializable" % type(obj))

        with open('mssql_sysparam_data.json', 'w') as f:
            json.dump(results, f, default=json_serial, indent=2)
        print(f"Fetched {len(results)} system parameters.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    query_mssql_sysparam()
