import pyodbc
import json
import os

def extract_schema(instance=".", database="Shoper9001"):
    conn_str = f'DRIVER={{SQL Server}};SERVER={instance};DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print(f"Connected to {database} on {instance}")
        
        # Get all tables
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = [row.TABLE_NAME for row in cursor.fetchall()]
        
        # We focus on interesting ones for PrimeSetu
        shoper_focus = [
            'SaleHeader', 'SaleDetail', 'Stock', 'ItemMaster', 'Partners', 
            'GenLookUp', 'StoreMaster', 'TillMaster', 'InventoryHeader', 'InventoryDetail'
        ]
        
        schema = {}
        
        for table in tables:
            # Check if it matches our focus or has interesting prefix/suffix
            if any(f.lower() in table.lower() for f in shoper_focus):
                print(f"Extracting schema for {table}...")
                cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
                columns = []
                for col in cursor.fetchall():
                    columns.append({
                        "name": col.COLUMN_NAME,
                        "type": col.DATA_TYPE,
                        "nullable": col.IS_NULLABLE,
                        "length": col.CHARACTER_MAXIMUM_LENGTH
                    })
                schema[table] = columns
        
        # Save to a file in skills directory or as an artifact
        output_path = os.path.join("d:\\IMP\\GitHub\\primesetu\\skills", f"shoper9_schema_{database}.json")
        with open(output_path, 'w') as f:
            json.dump(schema, f, indent=4)
        
        print(f"Schema extracted and saved to {output_path}")
        
        conn.close()
    except Exception as e:
        print(f"Error connecting to MSSQL: {e}")

if __name__ == "__main__":
    # Try common Shoper 9 databases
    databases = ["Shoper9001", "SHOPER9X01", "Shoper9CSW"]
    for db in databases:
        extract_schema(database=db)
