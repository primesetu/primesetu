import pyodbc

def show_stock_master_columns():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    query = """
        SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME LIKE 'StockMaster%'
        ORDER BY TABLE_NAME, ORDINAL_POSITION
    """
    cursor.execute(query)
    columns = cursor.fetchall()
    
    # Group by table name
    tables = {}
    for row in columns:
        if row.TABLE_NAME not in tables:
            tables[row.TABLE_NAME] = []
        tables[row.TABLE_NAME].append(f"{row.COLUMN_NAME} ({row.DATA_TYPE})")
        
    for t_name, cols in tables.items():
        print(f"\n--- SHOPER9WH1 ({t_name}) ALL {len(cols)} COLUMNS ---")
        for i in range(0, len(cols), 3):
            chunk = cols[i:i+3]
            print(" | ".join([f"{c:<35}" for c in chunk]))
            
    conn.close()

if __name__ == '__main__':
    show_stock_master_columns()
