
import pyodbc
import json
from datetime import datetime

def query_mssql_vamenu():
    # Attempt to connect to local SQL Server
    databases = ['SHOPER9WH1', 'tspsysdb9', 'shoper9sys', 'SHOPER9', 'S9SYS', 'Master']
    for db in databases:
        try:
            conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;'
            print(f"Connecting to MSSQL ({db}): {conn_str}")
            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()
            
            # Check if vamenu table exists (trying various common names)
            table_names = ['vamenu', 's9sys_vamenu', 'VAMenu']
            found_table = None
            for t_name in table_names:
                try:
                    cursor.execute(f"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{t_name}'")
                    if cursor.fetchone():
                        found_table = t_name
                        break
                except:
                    continue
            
            if not found_table:
                print(f"Table 'vamenu' not found in {db} database.")
                conn.close()
                continue

            print(f"Found '{found_table}' table in {db}. Fetching data...")
            cursor.execute(f"SELECT * FROM {found_table}")
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append(dict(zip(columns, row)))
            
            print(f"Fetched {len(results)} rows from MSSQL {db}.{found_table}.")
            
            # Save and exit on first success
            with open('mssql_vamenu_data.json', 'w') as f:
                def json_serial(obj):
                    if isinstance(obj, datetime):
                        return obj.isoformat()
                    raise TypeError ("Type %s not serializable" % type(obj))
                json.dump(results, f, default=json_serial, indent=2)
            print(f"Data saved to mssql_vamenu_data.json from {db}")
            conn.close()
            return

        except Exception as e:
            print(f"Error with {db}: {e}")

if __name__ == "__main__":
    query_mssql_vamenu()
