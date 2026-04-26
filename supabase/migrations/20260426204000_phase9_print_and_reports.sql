/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Migration: phase9_print_and_reports
 * © 2026 AITDL Network
 * ============================================================ */

-- ============================================================
-- UP
-- ============================================================

-- 1. Print Designer Templates (Equivalent to PrintDesignerCategory/TrnGrpInfo)
CREATE TABLE IF NOT EXISTS public.print_templates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('BILL_RECEIPT', 'BARCODE_LABEL', 'A4_INVOICE')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    page_width    INTEGER NOT NULL DEFAULT 80, -- For thermal usually 80mm
    page_height   INTEGER NOT NULL DEFAULT 297, 
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Print Designer Fields (Equivalent to PrintDesignerFields)
CREATE TABLE IF NOT EXISTS public.print_template_fields (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id   UUID NOT NULL REFERENCES public.print_templates(id) ON DELETE CASCADE,
    field_name    TEXT NOT NULL, -- e.g., 'COMPANY_NAME', 'ITEM_NAME', 'NET_AMOUNT'
    pos_x         NUMERIC(10,2) NOT NULL DEFAULT 0,
    pos_y         NUMERIC(10,2) NOT NULL DEFAULT 0,
    font_size     INTEGER NOT NULL DEFAULT 12,
    font_weight   TEXT NOT NULL DEFAULT 'NORMAL',
    is_visible    BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Report Configurations (Equivalent to ReportConfigs/ReportInfo)
CREATE TABLE IF NOT EXISTS public.report_configs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    report_name   TEXT NOT NULL,
    module        TEXT NOT NULL, -- e.g., 'SALES', 'INVENTORY', 'FINANCE'
    query_json    JSONB NOT NULL, -- The structure defining columns, filters, groupings
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Report Scheduler (Equivalent to ReportScheduleHeader/Details)
CREATE TABLE IF NOT EXISTS public.report_schedules (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id     UUID NOT NULL REFERENCES public.report_configs(id) ON DELETE CASCADE,
    store_id      UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    frequency     TEXT NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    send_time     TEXT NOT NULL, -- e.g., '22:00'
    email_to      TEXT NOT NULL, -- Comma separated emails
    is_active     BOOLEAN NOT NULL DEFAULT true,
    last_run_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

ALTER TABLE public.print_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- Print Templates Isolation
CREATE POLICY "store_isolation_print_tmpl" ON public.print_templates
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "store_isolation_print_fld" ON public.print_template_fields
    FOR ALL USING (template_id IN (SELECT id FROM public.print_templates WHERE store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)));

-- Reports Isolation
CREATE POLICY "store_isolation_rep_cfg" ON public.report_configs
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "store_isolation_rep_sch" ON public.report_schedules
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
