import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
tables = [r[0] for r in cursor.fetchall()]
results = []
for t in tables:
    try:
        cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
        count = cursor.fetchone()[0]
        if count > 0:
            results.append((t, count))
    except: pass
results.sort(key=lambda x: x[1], reverse=True)
for t, c in results[:20]:
    print(f"{t:<40} | {c}")
conn.close()
