import pyodbc

def show_all_item_master_columns():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    query = """
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ItemMaster'
        ORDER BY ORDINAL_POSITION
    """
    cursor.execute(query)
    columns = cursor.fetchall()
    
    print(f"--- SHOPER9WH1 (ItemMaster) ALL {len(columns)} COLUMNS ---")
    
    # Print them in a compact grid format
    col_names = [f"{row.COLUMN_NAME} ({row.DATA_TYPE})" for row in columns]
    for i in range(0, len(col_names), 3):
        chunk = col_names[i:i+3]
        print(" | ".join([f"{c:<35}" for c in chunk]))
        
    conn.close()

if __name__ == '__main__':
    show_all_item_master_columns()
