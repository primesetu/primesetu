import pyodbc

def fix_all_dbs():
    dbs = ['Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
    for db in dbs:
        print(f"Checking {db}...")
        try:
            conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;', autocommit=True)
            cursor = conn.cursor()
            
            # Find the table that stores version info
            cursor.execute("SELECT name FROM sysobjects WHERE (name LIKE '%VerTable%' OR name LIKE '%Version%') AND type='U'")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"  Found tables: {tables}")
            
            for table in tables:
                try:
                    # Update common version columns to 904
                    cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
                    cols = [c[0] for c in cursor.fetchall()]
                    
                    if 'ExeSubRel' in cols:
                        cursor.execute(f"UPDATE {table} SET ExeSubRel = '904'")
                        print(f"  Updated ExeSubRel in {table}")
                    if 'SubRelId' in cols:
                        cursor.execute(f"UPDATE {table} SET SubRelId = '904'")
                        print(f"  Updated SubRelId in {table}")
                    if 'RelId' in cols:
                        cursor.execute(f"UPDATE {table} SET RelId = 'P901904' WHERE RelId LIKE 'P%' OR RelId LIKE 'VER%'")
                        print(f"  Updated RelId in {table}")
                except Exception as e:
                    print(f"  Error updating {table}: {e}")
            
            conn.close()
        except Exception as e:
            print(f"  Connection Error: {e}")

fix_all_dbs()
