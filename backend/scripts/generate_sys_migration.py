import pyodbc
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

def map_mssql_to_pg(mssql_type):
    mapping = {
        'bit': 'BOOLEAN',
        'tinyint': 'SMALLINT',
        'smallint': 'SMALLINT',
        'int': 'INTEGER',
        'bigint': 'BIGINT',
        'decimal': 'NUMERIC',
        'numeric': 'NUMERIC',
        'money': 'NUMERIC',
        'smallmoney': 'NUMERIC',
        'float': 'DOUBLE PRECISION',
        'real': 'REAL',
        'datetime': 'TIMESTAMP WITHOUT TIME ZONE',
        'datetime2': 'TIMESTAMP WITHOUT TIME ZONE',
        'smalldatetime': 'TIMESTAMP WITHOUT TIME ZONE',
        'date': 'DATE',
        'char': 'TEXT',
        'varchar': 'TEXT',
        'text': 'TEXT',
        'nchar': 'TEXT',
        'nvarchar': 'TEXT',
        'ntext': 'TEXT',
        'binary': 'BYTEA',
        'varbinary': 'BYTEA',
        'image': 'BYTEA',
        'uniqueidentifier': 'UUID'
    }
    return mapping.get(mssql_type.lower(), 'TEXT')

async def generate_sys_migration():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    tables = [t.table_name for t in cursor.tables(tableType='TABLE')]
    
    sql_output = [
        "-- SMRITI-OS - tspsysdb9 Legacy Migration",
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n"
    ]
    
    for table in tables:
        cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
        cols = cursor.fetchall()
        source_cols = {c[0].lower() for c in cols}
        
        pg_table_name = f"s9sys_{table.lower()}"
        
        sql = f"CREATE TABLE IF NOT EXISTS public.\"{pg_table_name}\" (\n"
        sql += "    \"smriti_id\" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n"
        sql += "    \"store_id\" VARCHAR NOT NULL,\n"
        
        for col in cols:
            col_name = col[0].lower()
            pg_type = map_mssql_to_pg(col[1])
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            sql += f"    \"{col_name}\" {pg_type} {nullable},\n"
        
        if 'vauid' not in source_cols: sql += "    \"vauid\" VARCHAR(50) DEFAULT 'super',\n"
        if 'vactr' not in source_cols: sql += "    \"vactr\" INTEGER DEFAULT 1,\n"
        if 'vatermid' not in source_cols: sql += "    \"vatermid\" VARCHAR(50),\n"
        if 'vacompcode' not in source_cols: sql += "    \"vacompcode\" VARCHAR(50)\n"
        
        sql = sql.strip()
        if sql.endswith(','): sql = sql[:-1]
        sql += ");\n"
        
        sql += f"ALTER TABLE public.\"{pg_table_name}\" ENABLE ROW LEVEL SECURITY;\n"
        sql += f"DROP POLICY IF EXISTS store_isolation ON public.\"{pg_table_name}\";\n"
        sql += f"CREATE POLICY store_isolation ON public.\"{pg_table_name}\" FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));\n"
        
        sql_output.append(sql)
        
    with open("scripts/tspsysdb9_migration.sql", "w") as f:
        f.write("\n".join(sql_output))
    
    conn.close()

if __name__ == '__main__':
    asyncio.run(generate_sys_migration())
