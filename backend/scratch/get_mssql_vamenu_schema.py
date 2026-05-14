
import pyodbc
import json

def get_mssql_schema():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Get column details
        cursor.execute("""
            SELECT 
                COLUMN_NAME, 
                DATA_TYPE, 
                IS_NULLABLE, 
                CHARACTER_MAXIMUM_LENGTH, 
                NUMERIC_PRECISION, 
                NUMERIC_SCALE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'vamenu'
            ORDER BY ORDINAL_POSITION
        """)
        
        columns = []
        for row in cursor.fetchall():
            columns.append({
                "name": row.COLUMN_NAME,
                "type": row.DATA_TYPE,
                "nullable": row.IS_NULLABLE,
                "max_len": row.CHARACTER_MAXIMUM_LENGTH,
                "precision": row.NUMERIC_PRECISION,
                "scale": row.NUMERIC_SCALE
            })
        
        # Get Primary Key
        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'vamenu'
        """)
        pk_row = cursor.fetchone()
        pk = pk_row.COLUMN_NAME if pk_row else None

        print(json.dumps({"columns": columns, "pk": pk}, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    get_mssql_schema()
