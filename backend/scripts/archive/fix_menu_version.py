import pyodbc

def fix_menu_version(db_name):
    print(f"Fixing {db_name}...")
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db_name};Trusted_Connection=yes;', autocommit=True)
        cursor = conn.cursor()
        
        # 1. Update VaVerTable to latest sub-release (904)
        try:
            cursor.execute("UPDATE VaVerTable SET ExeSubRel = '904'")
            print(f"  Updated VaVerTable rows: {cursor.rowcount}")
        except Exception as e:
            print(f"  VaVerTable Error: {e}")
            
        # 2. Update individual menu items in VAMENU if they have old version info
        # Some versions of Shoper store expected version in VAMENU or VaVerTable per EXE
        try:
            cursor.execute("UPDATE VAVERTABLE SET ExeSubRel = '904' WHERE ExeSubRel < '904'")
            print(f"  Updated VAVERTABLE Build rows: {cursor.rowcount}")
        except:
            pass

        conn.close()
    except Exception as e:
        print(f"  Connection Error: {e}")

dbs = ['tspsysdb9', 'Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
for db in dbs:
    fix_menu_version(db)
