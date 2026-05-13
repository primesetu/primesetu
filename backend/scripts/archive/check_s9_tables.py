import pyodbc

conn = pyodbc.connect(
    'DRIVER={SQL Server};SERVER=AITDL;UID=sa;PWD=netmanthan@123;DATABASE=Shoper9X01'
)
cursor = conn.cursor()
cursor.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES "
    "WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
)
rows = cursor.fetchall()
print(f"Total tables in Shoper9X01: {len(rows)}")
for r in rows[:40]:
    print(f"  {r[0]}")
if len(rows) > 40:
    print(f"  ... and {len(rows)-40} more")
conn.close()
