import pyodbc

def list_related_tables():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    query = """
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (
            TABLE_NAME LIKE '%Fld%' OR 
            TABLE_NAME LIKE '%Descr%' OR
            TABLE_NAME LIKE '%Label%' OR
            TABLE_NAME LIKE '%Caption%'
        )
        ORDER BY TABLE_NAME
    """
    cursor.execute(query)
    tables = [row.TABLE_NAME for row in cursor.fetchall()]
    
    print("--- POTENTIAL METADATA TABLES ---")
    for t in tables:
        print(f"- {t}")
        
    conn.close()

if __name__ == '__main__':
    list_related_tables()
