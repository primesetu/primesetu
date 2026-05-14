import pyodbc
# Credentials from backend/.env
# MSSQL_SERVER=AITDL, MSSQL_DATABASE=SHOPER9X01, MSSQL_USER=sa, MSSQL_PASSWORD=netmanthan@123
conn_str = 'DRIVER={SQL Server};SERVER=AITDL;DATABASE=SHOPER9X01;UID=sa;PWD=netmanthan@123;'
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT ParamCode, Descr, Txt FROM SysParam WHERE ParamCode LIKE 'CMP%' OR Descr LIKE '%Company%' OR Descr LIKE '%Firm%'")
    rows = cursor.fetchall()
    print("Legacy SysParams (Company):")
    for row in rows:
        print(f"Code: {row[0]} | Descr: {row[1]} | Value: {row[2]}")
except Exception as e:
    print(f"Error: {e}")
