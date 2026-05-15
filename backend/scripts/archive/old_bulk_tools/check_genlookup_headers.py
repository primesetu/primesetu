import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Get category names for the IDs we found
target_ids = ('1', '2', '65', '66', '67', '68', '69', '70', '7026')
cursor.execute(f"SELECT Code, Descr FROM GenLookUp WHERE Recid=0 AND Code IN {target_ids}")
for row in cursor.fetchall():
    print(row)

conn.close()
