import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Check for specific codes in GenLookUp to find their category (Recid)
search_codes = ('ASST', 'OTHERS', 'LACE UP', 'SPORT', 'LADY', 'LADIES', '6402', '6404')
cursor.execute(f"SELECT * FROM GenLookUp WHERE Code IN {search_codes}")
for row in cursor.fetchall():
    print(row)

conn.close()
