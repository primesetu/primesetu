import pyodbc
import os
import json
import csv
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_connection():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    return pyodbc.connect(conn_str)

def export_to_csv(filename, columns, rows):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(rows)

def export_to_json(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, default=str)

def main():
    out_dir = os.path.join(os.getcwd(), 'schema')
    os.makedirs(out_dir, exist_ok=True)
    
    print(f"Connecting to MSSQL AITDL\\Shoper9X01...")
    try:
        conn = get_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # Q1. All Tables with Row Counts
    print("Q1. Fetching All Tables with Row Counts...")
    cursor.execute("""
        SELECT
            t.NAME AS TableName,
            SUM(p.rows) AS RowCounts
        FROM sys.tables t
        INNER JOIN sys.partitions p
            ON t.object_id = p.OBJECT_ID
        WHERE p.index_id IN (0,1)
        GROUP BY t.NAME
        ORDER BY RowCounts DESC;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'all_tables_with_counts.csv'), cols, rows)

    # Q2. All Columns with Data Types
    print("Q2. Fetching Column Details...")
    cursor.execute("""
        SELECT
            TABLE_NAME,
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        ORDER BY TABLE_NAME, ORDINAL_POSITION;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'all_columns.csv'), cols, rows)

    # Q3. Primary Keys
    print("Q3. Fetching Primary Keys...")
    cursor.execute("""
        SELECT
            KU.TABLE_NAME,
            KU.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KU
            ON TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME
        WHERE TC.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ORDER BY KU.TABLE_NAME;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'primary_keys.csv'), cols, rows)

    # Q4. Foreign Key Relationships
    print("Q4. Fetching Foreign Keys...")
    cursor.execute("""
        SELECT
            fk.name AS FK_Name,
            tp.name AS ParentTable,
            cp.name AS ParentColumn,
            tr.name AS ReferencedTable,
            cr.name AS ReferencedColumn
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc
            ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.tables tp
            ON fkc.parent_object_id = tp.object_id
        INNER JOIN sys.columns cp
            ON fkc.parent_object_id = cp.object_id
           AND fkc.parent_column_id = cp.column_id
        INNER JOIN sys.tables tr
            ON fkc.referenced_object_id = tr.object_id
        INNER JOIN sys.columns cr
            ON fkc.referenced_object_id = cr.object_id
           AND fkc.referenced_column_id = cr.column_id
        ORDER BY tp.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'relations.csv'), cols, rows)

    # Q5. Stored Procedures, Triggers, Functions, Views
    print("Q5. Fetching SPs, Triggers, Functions, Views...")
    cursor.execute("""
        SELECT
            name,
            type_desc
        FROM sys.objects
        WHERE type IN ('P', 'TR', 'FN', 'IF', 'TF', 'V')
        ORDER BY type_desc, name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'programmability.csv'), cols, rows)

    # Q6. Identity Columns
    print("Q6. Fetching Identity Columns...")
    cursor.execute("""
        SELECT
            t.name AS TableName,
            c.name AS ColumnName
        FROM sys.identity_columns c
        INNER JOIN sys.tables t
            ON c.object_id = t.object_id
        ORDER BY t.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'identity_columns.csv'), cols, rows)

    # Q7. Computed Columns
    print("Q7. Fetching Computed Columns...")
    cursor.execute("""
        SELECT
            t.name AS TableName,
            c.name AS ColumnName,
            c.definition
        FROM sys.computed_columns c
        INNER JOIN sys.tables t
            ON c.object_id = t.object_id
        ORDER BY t.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'computed_columns.csv'), cols, rows)

    # Q8. Non-Clustered Indexes
    print("Q8. Fetching Non-Clustered Indexes...")
    cursor.execute("""
        SELECT
            t.name AS TableName,
            i.name AS IndexName,
            i.type_desc
        FROM sys.indexes i
        INNER JOIN sys.tables t
            ON i.object_id = t.object_id
        WHERE i.type_desc = 'NONCLUSTERED'
        ORDER BY t.name, i.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'indexes.csv'), cols, rows)

    # Q9. Nullable Column Audit
    print("Q9. Nullable Column Audit...")
    cursor.execute("""
        SELECT
            TABLE_NAME,
            COLUMN_NAME,
            DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE IS_NULLABLE = 'YES'
        AND TABLE_NAME IN ('ItemMaster', 'StockMaster', 'StkTrnHdr', 'StkTrnDtls', 'Customers')
        ORDER BY TABLE_NAME;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'nullable_audit.csv'), cols, rows)

    # Q10. Check Constraints
    print("Q10. Check Constraints...")
    cursor.execute("""
        SELECT
            t.name AS TableName,
            c.name AS ConstraintName,
            c.definition
        FROM sys.check_constraints c
        INNER JOIN sys.tables t
            ON c.parent_object_id = t.object_id
        ORDER BY t.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'check_constraints.csv'), cols, rows)

    # Q11. Unique Constraints
    print("Q11. Unique Constraints...")
    cursor.execute("""
        SELECT
            t.name AS TableName,
            i.name AS ConstraintName,
            c.name AS ColumnName
        FROM sys.indexes i
        INNER JOIN sys.tables t
            ON i.object_id = t.object_id
        INNER JOIN sys.index_columns ic
            ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c
            ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.is_unique_constraint = 1
        ORDER BY t.name;
    """)
    cols = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    export_to_csv(os.path.join(out_dir, 'unique_constraints.csv'), cols, rows)

    # Data Quality Report (DQ1-DQ8) - FIXED FOR Shoper9X01
    print("Fetching Data Quality Report...")
    dq_results = []
    
    dq_queries = {
        "DQ1_Items_Null_StockNo": "SELECT COUNT(*) FROM ItemMaster WHERE StockNo IS NULL OR StockNo = ''",
        "DQ3_Cust_Null_Mobile": "SELECT COUNT(*) FROM Customers WHERE MobilePhone IS NULL OR MobilePhone = ''",
        "DQ4_Bills_Null_Zero_Total": "SELECT COUNT(*) FROM StkTrnHdr WHERE NetDocValue IS NULL OR NetDocValue = 0",
        "DQ5_Orphan_StkTrnDtls": "SELECT COUNT(*) FROM StkTrnDtls d LEFT JOIN StkTrnHdr h ON d.DocNo = h.DocNo AND d.TrnType = h.TrnType AND d.TrnCtrlNo = h.TrnCtrlNo WHERE h.DocNo IS NULL",
        "DQ6_Negative_Stock": "SELECT COUNT(*) FROM StockMaster WHERE CurBalQty < 0"
    }

    for name, query in dq_queries.items():
        try:
            cursor.execute(query)
            count = cursor.fetchone()[0]
            dq_results.append([name, count])
        except Exception as e:
            print(f"Error running {name}: {e}")

    export_to_csv(os.path.join(out_dir, 'dq_report.csv'), ['Check', 'Count'], dq_results)

    # DQ8 - TrnType Distribution
    print("DQ8. TrnType Distribution...")
    try:
        cursor.execute("SELECT TrnType, COUNT(*) as Count FROM StkTrnHdr GROUP BY TrnType ORDER BY TrnType")
        cols = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        export_to_csv(os.path.join(out_dir, 'trntype_distribution.csv'), cols, rows)
    except Exception as e:
        print(f"Error running DQ8: {e}")

    print(f"\nAudit v2.0 complete. Data exported to: {out_dir}")
    conn.close()

if __name__ == "__main__":
    main()
