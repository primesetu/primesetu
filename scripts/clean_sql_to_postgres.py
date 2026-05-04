import re
import os

SOURCE_FILE = r"d:\IMP\GitHub\primesetu\.shoper9trace\FreshShoper9GKP-2.sql"
OUTPUT_FILE = r"d:\IMP\GitHub\primesetu\Postgres_Sovereign_GKP.sql"

def translate_mssql_to_pg(sql):
    # 1. Handle the [Column][Type] pattern by adding a space between brackets
    sql = sql.replace('][', '] [')
    
    # 2. Strip [dbo]. and brackets
    sql = re.sub(r'\[dbo\]\.', '', sql, flags=re.IGNORECASE)
    sql = sql.replace('[', '').replace(']', '')
    
    # 3. Map Data Types (Using word boundaries \b)
    reps = {
        r'\bDATETIME\b': 'TIMESTAMP',
        r'\bNVARCHAR\b': 'VARCHAR',
        r'\bIMAGE\b': 'BYTEA',
        r'\bMONEY\b': 'NUMERIC(19,4)',
        r'\bTINYINT\b': 'SMALLINT',
        r'\bBIT\b': 'BOOLEAN',
        r'\bFLOAT\b': 'DOUBLE PRECISION',
        r'\bREAL\b': 'REAL',
        r'\bINT\b': 'INTEGER',
        r'\bINTEGER\b': 'INTEGER',
    }
    
    for pattern, replacement in reps.items():
        sql = re.sub(pattern, replacement, sql, flags=re.IGNORECASE)
        
    # 4. Clean up MSSQL specific syntax
    sql = re.sub(r'\bON\s+PRIMARY\b', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bCOLLATE\s+\w+\b', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bNOT\s+FOR\s+REPLICATION\b', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bCLUSTERED\b', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bNONCLUSTERED\b', '', sql, flags=re.IGNORECASE)
    
    # Fix boolean defaults and values
    if 'BOOLEAN' in sql.upper():
        sql = sql.replace('DEFAULT 0', 'DEFAULT false').replace('DEFAULT 1', 'DEFAULT true')
        sql = sql.replace('((0))', 'false').replace('((1))', 'true')
    
    # Generic replacement for boolean values in data
    # (Only if it looks like a numeric column that should be boolean)
    # This is safer to do manually or via specific table mapping

    return sql.strip()

def parse_sql_file():
    print(f"Reading clean SQL source: {SOURCE_FILE}")
    
    with open(SOURCE_FILE, 'r', encoding='utf-16', errors='ignore') as f:
        content = f.read()

    # Split by 'go' but keep it safe
    commands = re.split(r'\bgo\b', content, flags=re.IGNORECASE)
    
    print(f"Processing {len(commands)} SQL batches...")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        out.write("-- SMRITI-OS: Sovereign PostgreSQL Setup Script\n")
        out.write("-- Source: Shoper9GKP Clean SQL Export\n\n")
        out.write("CREATE SCHEMA IF NOT EXISTS shoper9;\n")
        out.write("SET search_path TO shoper9, public;\n\n")
        
        unique_tables = set()
        table_count = 0
        insert_count = 0
        
        for cmd in commands:
            cmd = cmd.strip()
            if not cmd: continue
            
            # Handle CREATE TABLE
            if "CREATE TABLE" in cmd.upper():
                translated = translate_mssql_to_pg(cmd)
                tname_match = re.search(r'CREATE TABLE\s+(\w+)', translated, re.IGNORECASE)
                if tname_match:
                    tname = tname_match.group(1).lower()
                    if tname not in unique_tables and not tname.startswith('tmp') and not tname.startswith('##'):
                        if not translated.endswith(';'): translated += ';'
                        out.write(translated + "\n\n")
                        unique_tables.add(tname)
                        table_count += 1

            # Handle INSERT INTO
            elif "INSERT INTO" in cmd.upper():
                translated = translate_mssql_to_pg(cmd)
                if 'tmp' not in translated.lower():
                    if not translated.endswith(';'): translated += ';'
                    out.write(translated + "\n")
                    insert_count += 1

    print(f"Successfully generated: {OUTPUT_FILE}")
    print(f"Summary: {table_count} Tables, {insert_count} Data Inserts.")

if __name__ == "__main__":
    parse_sql_file()
