import re
import os

def sql_type_mapping(sa_type):
    mapping = {
        'String': 'TEXT',
        'Integer': 'INTEGER',
        'Numeric': 'NUMERIC',
        'Boolean': 'BOOLEAN',
        'DateTime': 'TIMESTAMP WITH TIME ZONE',
        'Float': 'DOUBLE PRECISION'
    }
    return mapping.get(sa_type, 'TEXT')

def generate_supabase_migration(models_file, output_sql):
    with open(models_file, 'r') as f:
        content = f.read()

    # Find all classes and their columns
    classes = re.findall(r'class (\w+)\(Base\):.*?__tablename__ = "(.*?)"(.*?)vauid:', content, re.DOTALL)
    
    with open(output_sql, 'w') as f:
        f.write("-- SMRITI-OS: SHOPER 9 LEGACY ARCHITECTURE MIGRATION\n")
        f.write("-- Generated for 423 tables with RLS and Store Isolation\n\n")
        
        for class_name, table_name, cols_block in classes:
            f.write(f"-- Table: {table_name}\n")
            f.write(f"CREATE TABLE IF NOT EXISTS public.{table_name} (\n")
            f.write(f"    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n")
            f.write(f"    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,\n")
            
            # Extract columns from SQLAlchemy definitions
            cols = re.findall(r'(\w+): Mapped\[(?:Optional\[)?(\w+)(?:\])?\] = mapped_column\((\w+)', cols_block)
            for c_name, c_type, sa_type in cols:
                if c_name in ['id', 'store_id']: continue
                sql_type = sql_type_mapping(sa_type)
                f.write(f"    {c_name} {sql_type},\n")
            
            # Legacy tracking columns
            f.write(f"    vauid TEXT,\n")
            f.write(f"    vactr INTEGER,\n")
            f.write(f"    vatermid TEXT,\n")
            f.write(f"    vacompcode TEXT\n")
            f.write(f");\n\n")
            
            # Indexing
            f.write(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_store_id ON public.{table_name}(store_id);\n")
            
            # RLS
            f.write(f"ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;\n")
            f.write(f"DO $$\nBEGIN\n")
            f.write(f"    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '{table_name}' AND policyname = 'store_isolation') THEN\n")
            f.write(f"        CREATE POLICY store_isolation ON public.{table_name} FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));\n")
            f.write(f"    END IF;\n")
            f.write(f"END $$;\n\n")
            f.write("-" * 40 + "\n\n")

if __name__ == "__main__":
    models_file = r"d:\IMP\GitHub\primesetu\backend\app\models\legacy_s9.py"
    output_sql = r"d:\IMP\GitHub\primesetu\supabase\migrations\20260501000000_shoper9_legacy_port.sql"
    generate_supabase_migration(models_file, output_sql)
    print(f"Generated migration in {output_sql}")
