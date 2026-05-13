import pyodbc

def force_904_all():
    # List of all Shoper databases
    dbs = ['tspsysdb9', 'Shoper9CSW', 'SHOPER9X01', 'SHOPER9WH1']
    
    for db in dbs:
        print(f"Applying fix to {db}...")
        try:
            conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;', autocommit=True)
            cursor = conn.cursor()
            
            # 1. Update VaVerTable if exists
            try:
                cursor.execute("UPDATE VaVerTable SET ExeSubRel = '904' WHERE ExeSubRel <> '904'")
                print(f"  Updated VaVerTable in {db}: {cursor.rowcount} rows")
            except:
                pass
                
            # 2. Update VersionDtls if exists
            try:
                # Based on get_cols.py: MiVersion, MjVersion, PatchId
                cursor.execute("UPDATE VersionDtls SET MiVersion = '1.904', PatchId = '904' WHERE PatchId <> '904'")
                print(f"  Updated VersionDtls in {db}: {cursor.rowcount} rows")
            except:
                pass
            
            conn.close()
        except Exception as e:
            print(f"  Connection Error on {db}: {e}")

force_904_all()
