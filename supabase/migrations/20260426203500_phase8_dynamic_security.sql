/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: phase8_dynamic_security
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- 1. User Groups / Security Profiles (Equivalent to VaGroup)
CREATE TABLE IF NOT EXISTS public.va_groups (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Group Permissions (Equivalent to VaGroupRestrict)
CREATE TABLE IF NOT EXISTS public.va_group_permissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id      UUID NOT NULL REFERENCES public.va_groups(id) ON DELETE CASCADE,
    permission    TEXT NOT NULL, -- e.g., 'billing.void', 'inventory.adjust'
    is_allowed    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Group Menu Restrictions (Equivalent to VaRestrictMnu)
CREATE TABLE IF NOT EXISTS public.va_group_menus (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id      UUID NOT NULL REFERENCES public.va_groups(id) ON DELETE CASCADE,
    menu_id       VARCHAR(100) NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    is_visible    BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User to Group Mapping (Equivalent to VaGroupWiseUserList)
CREATE TABLE IF NOT EXISTS public.va_user_groups (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id      UUID NOT NULL REFERENCES public.va_groups(id) ON DELETE CASCADE,
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, group_id)
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.va_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.va_group_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.va_group_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.va_user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation_va_groups" ON public.va_groups
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "store_isolation_va_group_perms" ON public.va_group_permissions
    FOR ALL USING (group_id IN (SELECT id FROM public.va_groups WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));

CREATE POLICY "store_isolation_va_group_menus" ON public.va_group_menus
    FOR ALL USING (group_id IN (SELECT id FROM public.va_groups WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));

CREATE POLICY "store_isolation_va_user_groups" ON public.va_user_groups
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
