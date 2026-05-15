import re
import os
import uuid

def mssql_to_sqlalchemy(mssql_type):
    """Maps MSSQL types to SQLAlchemy types."""
    t = mssql_type.lower()
    if 'varchar' in t or 'char' in t or 'text' in t:
        return 'String'
    if 'int' in t:
        return 'Integer'
    if 'money' in t or 'numeric' in t or 'decimal' in t:
        return 'Numeric'
    if 'bit' in t:
        return 'Boolean'
    if 'datetime' in t:
        return 'DateTime'
    if 'real' in t or 'float' in t:
        return 'Float'
    return 'String' # Default

def to_camel_case(snake_str):
    return "".join(x.capitalize() for x in snake_str.lower().split("_"))

def parse_s9q_ddl(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Extract SQL scripts between <s9qScript> tags
    scripts = re.findall(r'<s9qScript>(.*?)</s9qScript>', content, re.DOTALL)
    if not scripts:
        scripts = [content]

    tables = []
    for script in scripts:
        # Split by -GO- or GO
        parts = re.split(r'-GO-|GO', script, flags=re.IGNORECASE)
        for part in parts:
            # More robust table match: Find the table name, then find the opening (, then find the balanced closing )
            table_match = re.search(r'CREATE TABLE\s+(?:\[dbo\]\.)?\[?(\w+)\]?\s*\(', part, re.IGNORECASE)
            if table_match:
                table_name = table_match.group(1)
                start_index = table_match.end() - 1
                
                # Find balanced closing parenthesis
                paren_count = 0
                end_index = -1
                for i in range(start_index, len(part)):
                    if part[i] == '(': paren_count += 1
                    elif part[i] == ')':
                        paren_count -= 1
                        if paren_count == 0:
                            end_index = i
                            break
                
                if end_index != -1:
                    columns_raw = part[start_index+1 : end_index]
                    
                    # Strip out constraints
                    columns_clean = re.sub(r'CONSTRAINT\s+.*?\(.*?\)', '', columns_raw, flags=re.DOTALL | re.IGNORECASE)
                    columns_clean = re.sub(r'PRIMARY KEY\s+.*?\(.*?\)', '', columns_clean, flags=re.DOTALL | re.IGNORECASE)
                    
                    cols = []
                    seen_cols = set()
                    
                    # Better column split (comma not inside parentheses)
                    # We'll use a simple comma split for now but skip lines that don't look like columns
                    for col_line in columns_clean.split(','):
                        col_line = col_line.strip()
                        if not col_line or any(x in col_line.upper() for x in ['CONSTRAINT', 'PRIMARY KEY', 'CLUSTERED', 'ON [PRIMARY]', 'WITH NOCHECK']):
                            continue
                            
                        col_match = re.search(r'\[?(\w+)\]?\s*\[?(\w+)?\]?(?:\s*\((\d+)\))?\s*(NOT NULL|NULL)?', col_line, re.IGNORECASE)
                        if col_match:
                            c_name = col_match.group(1)
                            if c_name.lower() in seen_cols: continue
                            seen_cols.add(c_name.lower())
                            
                            if c_name[0].isdigit(): c_name = f"col_{c_name}"
                            c_type = col_match.group(2) or "varchar"
                            c_nullable = "False" if col_match.group(4) and "NOT NULL" in col_match.group(4).upper() else "True"
                            
                            cols.append({"name": c_name, "type": mssql_to_sqlalchemy(c_type), "nullable": c_nullable})
                    
                    tables.append({"name": table_name, "columns": cols})
    return tables

def generate_sqlalchemy_models(tables, output_file):
    header = """from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from sqlalchemy import String, Integer, Boolean, DateTime, JSON, ForeignKey, Numeric, Float, BigInteger, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

# ============================================================
# SMRITI-OS - LEGACY SHOPER 9 PORTED ARCHITECTURE
# Generated from Shoper 9 Reference DDLs
# ============================================================

"""
    seen_tables = set()
    final_tables = []
    for t in tables:
        if t['name'].lower() not in seen_tables:
            seen_tables.add(t['name'].lower())
            final_tables.append(t)

    with open(output_file, 'w') as f:
        f.write(header)
        for table in final_tables:
            class_name = "".join(x.capitalize() for x in table['name'].lower().split("_"))
            f.write(f"class {class_name}(Base):\n")
            f.write(f"    __tablename__ = \"{table['name'].lower()}\"\n\n")
            f.write(f"    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text(\"gen_random_uuid()\"))\n")
            f.write(f"    store_id: Mapped[str] = mapped_column(String, ForeignKey(\"stores.id\", ondelete=\"CASCADE\"), index=True)\n")
            
            for col in table['columns']:
                if col['name'].lower() in ['id', 'store_id', 'vauid', 'vactr', 'vatermid', 'vacompcode']: continue
                python_type = col['type']
                nullable = col['nullable']
                if nullable == "True":
                    f.write(f"    {col['name'].lower()}: Mapped[Optional[{python_type}]] = mapped_column({python_type}, nullable=True)\n")
                else:
                    f.write(f"    {col['name'].lower()}: Mapped[{python_type}] = mapped_column({python_type}, nullable=False)\n")
            
            f.write(f"    vauid: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n")
            f.write(f"    vactr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)\n")
            f.write(f"    vatermid: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n")
            f.write(f"    vacompcode: Mapped[Optional[str]] = mapped_column(String, nullable=True)\n\n")

if __name__ == "__main__":
    s9_dir = r"d:\IMP\GitHub\primesetu\docs\reference\Shoper9\ini"
    all_tables = []
    for filename in os.listdir(s9_dir):
        if filename.endswith(".S9Q"):
            all_tables.extend(parse_s9q_ddl(os.path.join(s9_dir, filename)))
    
    output_path = r"d:\IMP\GitHub\primesetu\backend\app\models\legacy_s9.py"
    generate_sqlalchemy_models(all_tables, output_path)
    print(f"Generated {len(set(t['name'].lower() for t in all_tables))} unique tables.")
