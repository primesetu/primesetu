import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

def pg_to_sqlalchemy(pg_type):
    mapping = {
        'boolean': 'Boolean',
        'smallint': 'Integer',
        'integer': 'Integer',
        'bigint': 'BigUint' if 'bigint' in pg_type else 'BigInteger',
        'numeric': 'Numeric',
        'double precision': 'Float',
        'real': 'Float',
        'timestamp without time zone': 'DateTime',
        'date': 'Date',
        'text': 'String',
        'character varying': 'String',
        'uuid': 'UUID',
        'bytea': 'LargeBinary'
    }
    return mapping.get(pg_type.lower(), 'String')

async def generate_models():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    # Get all s9sys_ tables
    tables = await conn.fetch("SELECT tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 's9sys_%'")
    
    output = [
        "from typing import Optional",
        "from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, ForeignKey, text, UUID, LargeBinary",
        "from sqlalchemy.orm import Mapped, mapped_column",
        "from .base import Base",
        "import uuid",
        "from datetime import datetime",
        "\n# tspsysdb9 Legacy System Models",
        "# Auto-generated for System Logic Integration\n"
    ]
    
    for table in tables:
        table_name = table['tablename']
        # Convert snake_case to PascalCase for class name
        class_name = "".join([part.capitalize() for part in table_name.replace('s9sys_', '').split('_')])
        
        print(f"Generating model for {table_name} -> {class_name}")
        
        cols = await conn.fetch(f"""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position
        """)
        
        model_str = f"class {class_name}(Base):\n"
        model_str += f"    __tablename__ = \"{table_name}\"\n\n"
        
        for col in cols:
            col_name = col['column_name']
            sa_type = pg_to_sqlalchemy(col['data_type'])
            nullable = col['is_nullable'] == 'YES'
            
            # Primary key handling
            is_pk = col_name == 'smriti_id'
            pk_str = ", primary_key=True" if is_pk else ""
            default_str = ", server_default=text(\"uuid_generate_v4()\")" if is_pk else ""
            
            # Type annotation
            if nullable:
                type_hint = f"Optional[{sa_type}]" if sa_type != 'String' else "Optional[str]"
                if sa_type == 'Integer': type_hint = "Optional[int]"
                if sa_type == 'Boolean': type_hint = "Optional[bool]"
                if sa_type == 'DateTime': type_hint = "Optional[datetime]"
                if sa_type == 'Numeric': type_hint = "Optional[float]"
            else:
                type_hint = sa_type if sa_type != 'String' else "str"
                if sa_type == 'Integer': type_hint = "int"
                if sa_type == 'Boolean': type_hint = "bool"
                if sa_type == 'DateTime': type_hint = "datetime"
                if sa_type == 'Numeric': type_hint = "float"

            model_str += f"    {col_name}: Mapped[{type_hint}] = mapped_column({sa_type}{pk_str}{default_str}, nullable={str(nullable).lower()})\n"
            
        output.append(model_str + "\n")
        
    with open("app/models/legacy_sys.py", "w") as f:
        f.write("\n".join(output))
        
    print("Models generated: app/models/legacy_sys.py")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(generate_models())
