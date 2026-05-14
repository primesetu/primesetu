import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Connection (The single source of truth now)
PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

def map_type(pg_type, char_len, precision, scale):
    pg_type = pg_type.lower()
    if pg_type in ['character varying', 'varchar', 'text', 'character', 'bpchar']:
        return "String"
    if pg_type in ['integer', 'smallint']:
        return "Integer"
    if pg_type in ['bigint']:
        return "BigInteger"
    if pg_type in ['numeric', 'decimal', 'money']:
        return f"Numeric(precision={precision}, scale={scale})" if precision else "Numeric"
    if pg_type in ['double precision', 'real']:
        return "Float"
    if pg_type in ['boolean']:
        return "Boolean"
    if pg_type in ['timestamp without time zone', 'timestamp with time zone', 'date']:
        return "DateTime"
    return "String"

def generate_models():
    conn = psycopg2.connect(PG_URL)
    cursor = conn.cursor()
    
    # Get all tables in shoper9 schema
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'shoper9' 
        AND table_type = 'BASE TABLE'
    """)
    tables = [row[0] for row in cursor.fetchall()]
    
    output = [
        "from typing import Optional",
        "from datetime import datetime",
        "from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, Float, BigInteger, text",
        "from sqlalchemy.orm import Mapped, mapped_column",
        "from .base import Base",
        "",
        "# ============================================================",
        "# SMRITI-OS - SOVEREIGN LEGACY MODELS (AUTO-GENERATED)",
        "# SOURCE: POSTGRESQL 'shoper9' SCHEMA",
        "# ============================================================",
        ""
    ]
    
    for table in sorted(tables):
        print(f"Processing {table}...")
        # CamelCase class name
        class_name = "".join([word.capitalize() for word in table.split("_")])
        output.append(f"class {class_name}(Base):")
        output.append(f"    __tablename__ = '{table.lower()}'")
        output.append("    __table_args__ = {'schema': 'shoper9', 'extend_existing': True}")
        output.append("")
        
        # Get Columns & PK info from PostgreSQL
        cursor.execute(f"""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                character_maximum_length,
                numeric_precision,
                numeric_scale,
                (SELECT count(*) FROM information_schema.key_column_usage k 
                 WHERE k.table_name = c.table_name AND k.column_name = c.column_name AND k.table_schema = c.table_schema) as is_pk
            FROM information_schema.columns c
            WHERE table_name = %s AND table_schema = 'shoper9'
            ORDER BY ordinal_position
        """, (table,))
        
        columns = cursor.fetchall()
        
        for col in columns:
            name, pg_type, is_null, c_len, prec, scale, is_pk_count = col
            nullable = is_null == 'YES'
            is_pk = is_pk_count > 0
                
            sqla_type = map_type(pg_type, c_len, prec, scale)
            
            pk_str = ", primary_key=True" if is_pk else ""
            null_str = ", nullable=True" if nullable and not is_pk else ", nullable=False"
            
            # Special case for smriti_id which we might have added
            if name == 'smriti_id':
                output.append(f"    {name}: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)")
                continue

            mapped_type = sqla_type if not nullable else f"Optional[{sqla_type}]"
            output.append(f"    {name}: Mapped[{mapped_type}] = mapped_column({sqla_type}{pk_str}{null_str})")
        
        output.append("")

    # Write to the models directory
    with open('app/models/legacy_s9.py', 'w') as f:
        f.write("\n".join(output))
    
    conn.close()
    print(f"✅ Sovereign Model generation complete! ({len(tables)} tables processed)")

if __name__ == "__main__":
    generate_models()
