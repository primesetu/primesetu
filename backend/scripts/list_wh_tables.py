import pyodbc

def list_related_tables():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Query for tables containing 'Item', 'Stock', or related warehouse terms
    query = """
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (
            TABLE_NAME LIKE '%Item%' OR 
            TABLE_NAME LIKE '%Stock%' OR
            TABLE_NAME LIKE '%Audit%' OR
            TABLE_NAME LIKE '%Bin%' OR
            TABLE_NAME LIKE '%Rack%'
        )
        ORDER BY TABLE_NAME
    """
    cursor.execute(query)
    tables = [row.TABLE_NAME for row in cursor.fetchall()]
    
    print("--- RELATED WAREHOUSE TABLES IN SHOPER9WH1 ---")
    for t in tables:
        print(f"- {t}")
        
    conn.close()

if __name__ == '__main__':
    list_related_tables()
