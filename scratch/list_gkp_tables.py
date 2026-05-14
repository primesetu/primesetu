import pyodbc

conn = pyodbc.connect('DRIVER={SQL Server};SERVER=AITDL;DATABASE=Shoper9GKP;UID=sa;PWD=netmanthan@123')
cursor = conn.cursor()

cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
tables = [row[0] for row in cursor.fetchall()]

print("--- TABLES IN Shoper9GKP ---")
for table in sorted(tables):
    print(table)

conn.close()
