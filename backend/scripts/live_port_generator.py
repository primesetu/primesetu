import pyodbc
import re
import os

def mssql_to_sqlalchemy(mssql_type):
    t = mssql_type.lower()
    if 'varchar' in t or 'char' in t or 'text' in t: return 'String'
    if 'int' in t: return 'Integer'
    if 'money' in t or 'numeric' in t or 'decimal' in t: return 'Numeric'
    if 'bit' in t: return 'Boolean'
    if 'datetime' in t: return 'DateTime'
    if 'real' in t or 'float' in t: return 'Float'
    return 'String'

def get_live_schema():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Get all columns for all tables
    query = """
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
    ORDER BY TABLE_NAME, ORDINAL_POSITION
    """
    cursor.execute(query)
    
    tables = {}
    for row in cursor.fetchall():
        t_name = row.TABLE_NAME.lower()
        if t_name not in tables:
            tables[t_name] = []
        
        tables[t_name].append({
            "name": row.COLUMN_NAME.lower(),
            "type": mssql_to_sqlalchemy(row.DATA_TYPE),
            "nullable": "True" if row.IS_NULLABLE == "YES" else "False"
        })
    conn.close()
    return tables

def generate_full_port():
    live_tables = get_live_schema()
    
    header = """from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from sqlalchemy import String, Integer, Boolean, DateTime, JSON, ForeignKey, Numeric, Float, BigInteger, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

# ============================================================
# SMRITI-OS - FULL LIVE SHOPER 9 PORT (SHOPER9WH1)
# Generated from live INFORMATION_SCHEMA
# ============================================================

"""
    output_path = r"d:\IMP\GitHub\primesetu\backend\app\models\legacy_s9.py"
    
    with open(output_path, 'w') as f:
        f.write(header)
        for t_name, cols in live_tables.items():
            class_name = "".join(x.capitalize() for x in t_name.split("_"))
            f.write(f"class {class_name}(Base):\n")
            f.write(f"    __tablename__ = \"{t_name}\"\n\n")
            f.write(f"    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text(\"gen_random_uuid()\"))\n")
            f.write(f"    store_id: Mapped[str] = mapped_column(String, ForeignKey(\"stores.id\", ondelete=\"CASCADE\"), index=True)\n")
            
            seen_cols = {'id', 'store_id', 'vauid', 'vactr', 'vatermid', 'vacompcode'}
            for col in cols:
                c_name = col['name']
                if c_name in seen_cols: continue
                seen_cols.add(c_name)
                
                # Check for digit start
                if c_name[0].isdigit(): c_name = f"col_{c_name}"
                
                python_type = col['type']
                nullable = col['nullable']
                
                if nullable == "True":
                    f.write(f"    {c_name}: Mapped[Optional[{python_type}]] = mapped_column({python_type}, nullable=True)\n")
                else:
                    f.write(f"    {c_name}: Mapped[{python_type}] = mapped_column({python_type}, nullable=False)\n")
            
            # Legacy tracking (forced for all for consistency)
            f.write(f"    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n")
            f.write(f"    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)\n")
            f.write(f"    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n")
            f.write(f"    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n\n")

    print(f"Ported {len(live_tables)} tables from live SHOPER9WH1 database.")

if __name__ == '__main__':
    generate_full_port()
