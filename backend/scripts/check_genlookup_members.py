import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Check for records that might belong to category '0001' or similar
cursor.execute("SELECT TOP 20 * FROM GenLookUp WHERE Recid > 0 AND Number IN (1, 2, 5, 6, 7)")
for row in cursor.fetchall():
    print(row)

conn.close()
