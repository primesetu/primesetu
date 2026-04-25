-- Migration: 004_fix_schema_consistency.sql
-- Description: Formalizes patches applied via Python setup scripts to ensure the remote Supabase schema matches local ORM expectations.

-- 1. Ensure the 'users' table exists for RBAC mapping.
CREATE TABLE IF NOT EXISTS public.users (
    id character varying PRIMARY KEY,
    store_id character varying,
    email character varying,
    full_name character varying,
    role character varying,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);

-- 2. Add the 'code' column to the 'stores' table if it does not exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stores'
        AND column_name = 'code'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN code character varying UNIQUE;
    END IF;
END $$;
