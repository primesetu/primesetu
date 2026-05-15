import pyodbc
import asyncio
import asyncpg
import os
from datetime import datetime
from decimal import Decimal
from app.core.config import settings

# ============================================================
# SMRITI-OS - Shoper 9 Class12Combo Migration Engine
# Purpose: Sync classification mappings from MSSQL to Smriti-OS
# ============================================================

async def migrate_class12combo(database="shoper9x01"):
    print(f"Starting migration for Class12Combo from MSSQL [{database}]...")
    
    # 1. Fetch data from MSSQL
    # Note: Using Trusted_Connection=yes assumes the user has access to the local SQL instance
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        mssql_conn = pyodbc.connect(conn_str)
        cursor = mssql_conn.cursor()
        
        # Select all relevant columns from Class12Combo
        # We use a comprehensive SELECT to ensure we capture DNA and markup logic
        query = "SELECT * FROM Class12Combo"
        cursor.execute(query)
        
        columns = [column[0].lower() for column in cursor.description]
        rows = cursor.fetchall()
        
        mssql_data = []
        for row in rows:
            # Map Row to Dictionary
            record = dict(zip(columns, row))
            mssql_data.append(record)
            
        mssql_conn.close()
        print(f"Fetched {len(mssql_data)} records from MSSQL.")
        
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return

    if not mssql_data:
        print("No data found to migrate.")
        return

    # 2. Connect to Smriti-OS PostgreSQL (via asyncpg for high-speed bulk copy)
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    try:
        pg_conn = await asyncpg.connect(url)
        
        # 3. Prepare records for insertion
        # We need to ensure the columns match our SQLAlchemy model exactly
        target_columns = [
            'class1cd', 'class2cd', 'billable', 'sizegroup', 'retailmarkup', 
            'dealermarkup', 'prefvendorid', 'altvendorid1', 'altvendorid2', 
            'altvendorid3', 'prodtaxtype', 'superclass1', 'superclass2', 
            'isservicecombo', 'isconsignmentitem', 'vauid', 'vactr', 
            'vatermid', 'vacompcode', 'dateinsert', 'lastupdateddate',
            'batchapplicable', 'batchmfgformat', 'batchexpformat', 
            'batchshelfapp', 'batchpriceapp', 'batchexpirtrnallowed', 
            'stopsalesbefexpdays', 'gradeapplicable', 'gradepriceapp', 
            'gradepromoapp', 'locationapplicable'
        ]
        
        insert_records = []
        for r in mssql_data:
            # Convert Bit to Boolean for PostgreSQL
            def to_bool(val):
                if val is None: return None
                return bool(val)

            record = (
                r.get('class1cd'),
                r.get('class2cd'),
                to_bool(r.get('billable')),
                r.get('sizegroup'),
                r.get('retailmarkup'),
                r.get('dealermarkup'),
                r.get('prefvendorid'),
                r.get('altvendorid1'),
                r.get('altvendorid2'),
                r.get('altvendorid3'),
                r.get('prodtaxtype'),
                r.get('superclass1'),
                r.get('superclass2'),
                to_bool(r.get('isservicecombo')),
                to_bool(r.get('isconsignmentitem')),
                r.get('vauid'),
                r.get('vactr'),
                r.get('vatermid'),
                r.get('vacompcode'),
                r.get('dateinsert'),
                r.get('lastupdateddate'),
                r.get('batchapplicable'),
                r.get('batchmfgformat'),
                r.get('batchexpformat'),
                r.get('batchshelfapp'),
                r.get('batchpriceapp'),
                r.get('batchexpirtrnallowed'),
                r.get('stopsalesbefexpdays'),
                r.get('gradeapplicable'),
                r.get('gradepriceapp'),
                r.get('gradepromoapp'),
                r.get('locationapplicable')
            )
            insert_records.append(record)

        # 4. Perform Atomic Bulk Swap
        print(f"Inserting {len(insert_records)} records into shoper9.class12combo...")
        async with pg_conn.transaction():
            # Set search path to ensure asyncpg finds the table
            await pg_conn.execute("SET search_path TO shoper9, public")
            
            # Clear existing mappings to avoid primary key collisions
            await pg_conn.execute("TRUNCATE TABLE class12combo")
            
            # Use high-speed COPY protocol
            await pg_conn.copy_records_to_table(
                'class12combo',
                records=insert_records,
                columns=target_columns
            )
            
        await pg_conn.close()
        print("MIGRATION SUCCESSFUL: Class12Combo DNA synchronized.")

    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    # You can pass the database name if it's different
    asyncio.run(migrate_class12combo("shoper9x01"))
