import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'Stock%'")
for r in cursor.fetchall():
    print(f"'{r[0]}'")
conn.close()
