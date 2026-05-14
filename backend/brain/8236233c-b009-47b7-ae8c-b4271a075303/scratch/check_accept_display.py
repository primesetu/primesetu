import pyodbc
import json

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    # Get column names
    cursor.execute("SELECT TOP 0 * FROM AcceptDisplayDtls")
    columns = [column[0] for column in cursor.description]

    # Fetch data
    cursor.execute("SELECT * FROM AcceptDisplayDtls")
    rows = cursor.fetchall()

    result = []
    for row in rows:
        result.append(dict(zip(columns, row)))

    print(json.dumps(result, indent=2, default=str))

    conn.close()
except Exception as e:
    print(f"Error: {e}")
