import os

def rebuild_migration():
    nuke_sql = """-- SMRITI-OS: HARD RESET & LIVE SHOPER 9 PORT
-- Preserve: Users, Stores, Menus, Security
-- Recreate: All Shoper 9 Tables from Live Schema

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables except preservation list
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            'users', 'stores', 'store_users', 'menu_items', 
            'va_groups', 'va_group_permissions', 'va_group_menus', 'va_user_groups',
            '_prisma_migrations', 'schema_migrations'
        )
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Create store_users if it doesn't exist
CREATE TABLE IF NOT EXISTS public.store_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, 
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(store_id, user_id)
);

"""
    
    live_port_path = r"d:\IMP\GitHub\primesetu\supabase\migrations\20260501000000_shoper9_legacy_port.sql"
    output_path = r"d:\IMP\GitHub\primesetu\supabase\migrations\20260501000001_hard_reset_live_port.sql"
    
    with open(live_port_path, 'r') as f:
        content = f.read()
        
    with open(output_path, 'w') as f:
        f.write(nuke_sql)
        f.write(content)
        
    print(f"Rebuilt migration in {output_path}")

if __name__ == '__main__':
    rebuild_migration()
