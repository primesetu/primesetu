import pyodbc
import os

def run():
    conn_str = "DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;"
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Slip%'")
    tables = [t[0] for t in cursor.fetchall()]
    print("Slip Tables in MSSQL:")
    for t in sorted(tables):
        cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
        count = cursor.fetchone()[0]
        print(f"- {t}: {count} rows")
    conn.close()

if __name__ == '__main__':
    run()
