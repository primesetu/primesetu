import pyodbc

def final_hammer():
    dbs = ['tspsysdb9', 'Shoper9CSW', 'SHOPER9X01', 'SHOPER9WH1']
    for db in dbs:
        print(f"Hammering {db}...")
        try:
            conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;', autocommit=True)
            cursor = conn.cursor()
            
            # Find all tables containing version info
            cursor.execute("SELECT name FROM sysobjects WHERE (name LIKE '%VerTable%' OR name LIKE '%Version%') AND type='U'")
            tables = [row[0] for row in cursor.fetchall()]
            
            for table in tables:
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
                cols = [c[0] for c in cursor.fetchall()]
                
                # Broad update for all common version column names
                for col in ['ExeSubRel', 'PatchId', 'MiVersion', 'SubRelId']:
                    if col in cols:
                        try:
                            cursor.execute(f"UPDATE {table} SET [{col}] = '904'")
                            print(f"  [{db}.{table}.{col}] updated to 904")
                        except:
                            pass
                
            conn.close()
        except:
            pass

final_hammer()
