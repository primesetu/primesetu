import pyodbc

def get_cols(db):
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;')
        cursor = conn.cursor()
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'VersionDtls'")
        cols = [r[0] for r in cursor.fetchall()]
        print(f"Columns in {db}.VersionDtls: {cols}")
        conn.close()
    except:
        pass

get_cols('Shoper9CSW')
