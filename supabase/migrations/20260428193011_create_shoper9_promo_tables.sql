/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Migration: 20260428193011_create_shoper9_promo_tables
 * © 2026 AITDL Network
 * ============================================================ */

-- 1. PromoMnHeader
CREATE TABLE IF NOT EXISTS public.promo_mn_header (
    id                                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id                            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code                    VARCHAR(32) NOT NULL,
    sales_promo_srl_no                  INTEGER,
    sales_promo_desc                    TEXT,
    status                              SMALLINT,
    priority_no                         INTEGER,
    definition_created_at               SMALLINT,
    created_shoper_date                 TIMESTAMPTZ,
    created_system_date                 TIMESTAMPTZ DEFAULT now(),
    start_date                          TIMESTAMPTZ,
    start_time                          TIMESTAMPTZ,
    end_date                            TIMESTAMPTZ,
    end_time                            TIMESTAMPTZ,
    week_days                           TEXT,
    applicable_happy_hours              SMALLINT,
    happy_hours_start_time              TIMESTAMPTZ,
    happy_hours_end_time                TIMESTAMPTZ,
    definition_type                     SMALLINT,
    definition_level                    SMALLINT,
    fixed_or_variable                   SMALLINT,
    item_lvl_discount_type              SMALLINT,
    item_lvl_offer_type                 SMALLINT,
    item_lvl_offer_buy_n_get_items_same SMALLINT,
    item_lvl_def_varies_on_buying_rate_val SMALLINT,
    item_lvl_buying_rate_value_cond     SMALLINT,
    item_lvl_def_varies_on_buying_qty   SMALLINT,
    bill_lvl_discount_type              SMALLINT,
    bill_lvl_offer_type                 SMALLINT,
    bl_def_varies_on_bill_val_qty       SMALLINT,
    bl_def_varies_on_bill_val_qty_cond  SMALLINT,
    free_offer_item_type                SMALLINT,
    applicable_items                    SMALLINT,
    applicable_customers                SMALLINT,
    can_be_combined                     SMALLINT,
    archived                            SMALLINT DEFAULT 0,
    user_id                             VARCHAR(32),
    exported_flag                       SMALLINT DEFAULT 0,
    exported_date                       TIMESTAMPTZ,
    imported_flag                       SMALLINT DEFAULT 0,
    imported_date                       TIMESTAMPTZ,
    remarks                             TEXT,
    va_uid                              VARCHAR(32),
    va_ctr                              INTEGER,
    va_term_id                          VARCHAR(32),
    va_comp_code                        VARCHAR(16),
    multiple_rate_cond                  SMALLINT,
    shoper_db_ver                       INTEGER DEFAULT 730,
    disc_rate_amt_ind                   INTEGER DEFAULT 0,
    and_condition                       INTEGER DEFAULT 0,
    no_of_and_conds                     INTEGER DEFAULT 0,
    lowest_highest_priced_item          INTEGER DEFAULT 0,
    feature_id                          INTEGER DEFAULT 0,
    and_condition_free_item             INTEGER DEFAULT 0,
    no_of_and_conds_free_item           INTEGER DEFAULT 0,
    sales_promo_id                      INTEGER DEFAULT 1,
    addl_item_flag                      INTEGER DEFAULT 0,
    addl_item_disc_type                 INTEGER DEFAULT 0,
    
    UNIQUE(store_id, sales_promo_code)
);

-- 2. PromoMnApplCustDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_appl_cust_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    cust_price_group    VARCHAR(16),
    cust_code           VARCHAR(32),
    cust_class1_code    VARCHAR(16),
    cust_class2_code    VARCHAR(16),
    cust_class3_code    VARCHAR(16),
    cust_class4_code    VARCHAR(16),
    cust_class5_code    VARCHAR(16),
    cust_profile1_code  VARCHAR(50),
    cust_profile2_code  VARCHAR(50),
    cust_profile3_code  VARCHAR(50),
    cust_profile4_code  VARCHAR(50),
    cust_profile5_code  VARCHAR(50),
    cust_loyalty_id     VARCHAR(20),
    cust_dest_tax_code  VARCHAR(16),
    va_uid              VARCHAR(32),
    va_ctr              INTEGER,
    va_term_id          VARCHAR(32),
    va_comp_code        VARCHAR(16),
    
    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- 3. PromoMnBillLvlDiscDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_bill_lvl_disc_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    bill_value_above    INTEGER, -- paise
    bill_value_upto     INTEGER, -- paise
    bill_qty_above      INTEGER, 
    bill_qty_upto       INTEGER,
    bill_disc_percent   NUMERIC(10, 4), -- percent (e.g. 10.5)
    bill_disc_amount    INTEGER, -- paise
    bill_max_disc_percent NUMERIC(10, 4),
    bill_max_disc_amount  INTEGER, -- paise
    disc_value_treatment  SMALLINT,
    remarks               TEXT,
    va_uid              VARCHAR(32),
    va_ctr              INTEGER,
    va_term_id          VARCHAR(32),
    va_comp_code        VARCHAR(16),

    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- 4. PromoMnBuyItemGrpDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_buy_item_grp_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    item_set_no         INTEGER,
    item_set_srl_no     INTEGER,
    item_inc_ex_flag    SMALLINT,
    stock_no            VARCHAR(32),
    sku_serial_no       INTEGER,
    sku_batch_no        VARCHAR(60),
    sku_location_id     VARCHAR(16),
    sku_grade_cd        VARCHAR(16),
    class1_cd           VARCHAR(16),
    class2_cd           VARCHAR(16),
    sub_class1_cd       VARCHAR(16),
    sub_class2_cd       VARCHAR(16),
    size_cd             VARCHAR(16),
    super_class1_cd     VARCHAR(16),
    super_class2_cd     VARCHAR(16),
    anal_code1          VARCHAR(16),
    anal_code2          VARCHAR(16),
    anal_code3          VARCHAR(16),
    anal_code4          VARCHAR(16),
    anal_code5          VARCHAR(16),
    anal_code6          VARCHAR(16),
    anal_code7          VARCHAR(16),
    anal_code8          VARCHAR(16),
    anal_code9          VARCHAR(16),
    anal_code10         VARCHAR(16),
    anal_code11         VARCHAR(16),
    anal_code12         VARCHAR(16),
    anal_code13         VARCHAR(16),
    anal_code14         VARCHAR(16),
    anal_code15         VARCHAR(16),
    anal_code16         VARCHAR(16),
    anal_code17         VARCHAR(16),
    anal_code18         VARCHAR(16),
    anal_code19         VARCHAR(16),
    anal_code20         VARCHAR(16),
    anal_code21         VARCHAR(16),
    anal_code22         VARCHAR(16),
    anal_code23         VARCHAR(16),
    anal_code24         VARCHAR(16),
    anal_code25         VARCHAR(16),
    anal_code26         VARCHAR(16),
    anal_code27         VARCHAR(16),
    anal_code28         VARCHAR(16),
    anal_code29         VARCHAR(16),
    anal_code30         VARCHAR(16),
    anal_code31         VARCHAR(16),
    anal_code32         VARCHAR(16),
    reg_non_reg_item_ind SMALLINT,
    product_tax_code    VARCHAR(16),
    source_tax_code     VARCHAR(16),
    item_tax_type       SMALLINT,
    item_mfg_date       TIMESTAMPTZ,
    item_expiry_date    TIMESTAMPTZ,
    item_shelf_life     INTEGER,
    merchandize_id      VARCHAR(16),
    consign_non_consign_item_ind SMALLINT,
    item_rate_value_cond SMALLINT,
    item_rate_equal_to   INTEGER, -- paise
    item_rate_above      INTEGER, -- paise
    item_rate_upto       INTEGER, -- paise
    item_value_equal_to  INTEGER, -- paise
    item_value_above     INTEGER, -- paise
    item_value_upto      INTEGER, -- paise
    diff_item_offer_buy_qty INTEGER,
    free_item_worth_based_on SMALLINT,
    free_item_worth_specified INTEGER, -- paise
    free_item_val_treatment SMALLINT,
    remarks              TEXT,
    va_uid               VARCHAR(32),
    va_ctr               INTEGER,
    va_term_id           VARCHAR(32),
    va_comp_code         VARCHAR(16),
    buy_item_attrib_lvl  VARCHAR(128),

    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- 5. PromoMnGetItemGrpDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_get_item_grp_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    item_set_no         INTEGER,
    item_set_srl_no     INTEGER,
    item_inc_ex_flag    SMALLINT,
    stock_no            VARCHAR(32),
    sku_serial_no       INTEGER,
    sku_batch_no        VARCHAR(16),
    sku_location_id     VARCHAR(16),
    sku_grade_cd        VARCHAR(16),
    class1_cd           VARCHAR(16),
    class2_cd           VARCHAR(16),
    sub_class1_cd       VARCHAR(16),
    sub_class2_cd       VARCHAR(16),
    size_cd             VARCHAR(16),
    super_class1_cd     VARCHAR(16),
    super_class2_cd     VARCHAR(16),
    anal_code1          VARCHAR(16),
    anal_code2          VARCHAR(16),
    anal_code3          VARCHAR(16),
    anal_code4          VARCHAR(16),
    anal_code5          VARCHAR(16),
    anal_code6          VARCHAR(16),
    anal_code7          VARCHAR(16),
    anal_code8          VARCHAR(16),
    anal_code9          VARCHAR(16),
    anal_code10         VARCHAR(16),
    anal_code11         VARCHAR(16),
    anal_code12         VARCHAR(16),
    anal_code13         VARCHAR(16),
    anal_code14         VARCHAR(16),
    anal_code15         VARCHAR(16),
    anal_code16         VARCHAR(16),
    anal_code17         VARCHAR(16),
    anal_code18         VARCHAR(16),
    anal_code19         VARCHAR(16),
    anal_code20         VARCHAR(16),
    anal_code21         VARCHAR(16),
    anal_code22         VARCHAR(16),
    anal_code23         VARCHAR(16),
    anal_code24         VARCHAR(16),
    anal_code25         VARCHAR(16),
    anal_code26         VARCHAR(16),
    anal_code27         VARCHAR(16),
    anal_code28         VARCHAR(16),
    anal_code29         VARCHAR(16),
    anal_code30         VARCHAR(16),
    anal_code31         VARCHAR(16),
    anal_code32         VARCHAR(16),
    reg_non_reg_item_ind SMALLINT,
    product_tax_code    VARCHAR(16),
    source_tax_code     VARCHAR(16),
    item_tax_type       SMALLINT,
    item_mfg_date       TIMESTAMPTZ,
    item_expiry_date    TIMESTAMPTZ,
    item_shelf_life     INTEGER,
    merchandize_id      VARCHAR(16),
    consign_non_consign_item_ind SMALLINT,
    item_rate_value_cond SMALLINT,
    item_rate_equal_to   INTEGER, -- paise
    item_rate_above      INTEGER, -- paise
    item_rate_upto       INTEGER, -- paise
    item_value_equal_to  INTEGER, -- paise
    item_value_above     INTEGER, -- paise
    item_value_upto      INTEGER, -- paise
    diff_item_offer_get_qty INTEGER,
    bill_value_above     INTEGER, -- paise
    bill_value_upto      INTEGER, -- paise
    bill_qty_above       INTEGER,
    bill_qty_upto        INTEGER,
    bill_lvl_offer_get_qty INTEGER,
    free_item_worth_based_on SMALLINT,
    free_item_worth_specified INTEGER, -- paise
    free_item_val_treatment SMALLINT,
    remarks              TEXT,
    va_uid               VARCHAR(32),
    va_ctr               INTEGER,
    va_term_id           VARCHAR(32),
    va_comp_code         VARCHAR(16),
    get_item_attrib_lvl  VARCHAR(128),

    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- 6. PromoMnIntermediate (Work Table)
CREATE TABLE IF NOT EXISTS public.promo_mn_intermediate (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id                UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    stock_no                VARCHAR(32),
    batch_srl_no            VARCHAR(16),
    sales_promo_code        VARCHAR(32),
    promo_description       TEXT,
    buy_or_get_id           INTEGER,
    set_no                  INTEGER,
    shoper_date             TIMESTAMPTZ,
    created_date            TIMESTAMPTZ DEFAULT now(),
    applicable_happy_hours  SMALLINT,
    happy_hours_start_time  TIMESTAMPTZ,
    happy_hours_end_time    TIMESTAMPTZ,
    weekdays                VARCHAR(10),
    applicable_customers    INTEGER,
    definition_type         INTEGER,
    fixed_or_variable       INTEGER,
    item_lvl_discount_type  INTEGER,
    buying_quantity         INTEGER,
    buy_and_get_same_items  INTEGER,
    item_lvl_def_varies_on_buying_qty INTEGER,
    item_lvl_buying_rate_value_cond INTEGER,
    use_im_table            INTEGER,
    item_disc_percent       NUMERIC(10, 4),
    item_disc_amount        INTEGER, -- paise
    item_discounted_rate    INTEGER, -- paise
    item_max_disc_percent   NUMERIC(10, 4),
    item_max_disc_amount    INTEGER, -- paise
    va_uid                  VARCHAR(32),
    va_ctr                  INTEGER,
    va_term_id              VARCHAR(32),
    va_comp_code            VARCHAR(16)
);

-- 7. PromoMnItemLvlDiscDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_item_lvl_disc_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    item_rate_value_cond SMALLINT,
    item_rate_equal_to   INTEGER, -- paise
    item_rate_above      INTEGER, -- paise
    item_rate_upto       INTEGER, -- paise
    item_value_equal_to  INTEGER, -- paise
    item_value_above     INTEGER, -- paise
    item_value_upto      INTEGER, -- paise
    item_lvl_disc_buy_qty INTEGER,
    item_disc_percent    NUMERIC(10, 4),
    item_disc_amount     INTEGER, -- paise
    item_max_disc_percent NUMERIC(10, 4),
    item_max_disc_amount  INTEGER, -- paise
    item_discounted_rate INTEGER, -- paise
    all_items_at_specified_val INTEGER, -- paise
    same_item_offer_buy_qty INTEGER,
    same_item_offer_get_qty INTEGER,
    disc_value_treatment SMALLINT,
    remarks              TEXT,
    va_uid               VARCHAR(32),
    va_ctr               INTEGER,
    va_term_id           VARCHAR(32),
    va_comp_code         VARCHAR(16),

    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- 8. PromoMnShowroomDtls
CREATE TABLE IF NOT EXISTS public.promo_mn_showroom_dtls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sales_promo_code    VARCHAR(32) NOT NULL,
    srl_no              INTEGER NOT NULL,
    sales_promo_srl_no  INTEGER,
    status              SMALLINT,
    wear_house_or_showroom SMALLINT,
    showroom_class      VARCHAR(32),
    distribution_centre VARCHAR(16),
    country             VARCHAR(32),
    zone                VARCHAR(32),
    state               VARCHAR(32),
    city                VARCHAR(32),
    showroom_code       VARCHAR(16),
    over_ride           SMALLINT,
    remarks             TEXT,
    va_uid              VARCHAR(32),
    va_ctr              INTEGER,
    va_term_id          VARCHAR(32),
    va_comp_code        VARCHAR(16),

    FOREIGN KEY (store_id, sales_promo_code) REFERENCES public.promo_mn_header(store_id, sales_promo_code) ON DELETE CASCADE
);

-- ============================================================
-- RLS (MANDATORY)
-- ============================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'promo_mn_%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "store_isolation" ON public.%I', t);
        EXECUTE format('CREATE POLICY "store_isolation" ON public.%I FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1))', t);
    END LOOP;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_promo_mn_hdr_store_active ON public.promo_mn_header(store_id, status) WHERE status = 1;
CREATE INDEX idx_promo_mn_appl_cust_code ON public.promo_mn_appl_cust_dtls(store_id, cust_code);
CREATE INDEX idx_promo_mn_buy_stock_no ON public.promo_mn_buy_item_grp_dtls(store_id, stock_no);
CREATE INDEX idx_promo_mn_get_stock_no ON public.promo_mn_get_item_grp_dtls(store_id, stock_no);
