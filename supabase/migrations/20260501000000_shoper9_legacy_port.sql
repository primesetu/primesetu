-- SMRITI-OS: SHOPER 9 LEGACY ARCHITECTURE MIGRATION
-- Generated for 423 tables with RLS and Store Isolation

-- Table: acceptdisplaydtls
CREATE TABLE IF NOT EXISTS public.acceptdisplaydtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    index INTEGER,
    acptcap TEXT,
    dispcap TEXT,
    acptvisible BOOLEAN,
    dispvisible BOOLEAN,
    acptpos INTEGER,
    disppos INTEGER,
    acptdatatype INTEGER,
    dispdatatype INTEGER,
    acptwidth DOUBLE PRECISION,
    dispwidth DOUBLE PRECISION,
    acptalign INTEGER,
    dispalign INTEGER,
    acptfontname TEXT,
    dispfontname TEXT,
    acptfourcolour TEXT,
    dispfourcolour TEXT,
    acptfontsize DOUBLE PRECISION,
    dispfontsize DOUBLE PRECISION,
    acptrowhight DOUBLE PRECISION,
    disprowhight DOUBLE PRECISION,
    acptbackcolour TEXT,
    dispbackcolour TEXT,
    columnname TEXT,
    custmtablename TEXT,
    fieldind INTEGER,
    linkid INTEGER,
    acptfontbold BOOLEAN,
    dispfontbold BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_acceptdisplaydtls_store_id ON public.acceptdisplaydtls(store_id);
ALTER TABLE public.acceptdisplaydtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acceptdisplaydtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.acceptdisplaydtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: accountsmaster
CREATE TABLE IF NOT EXISTS public.accountsmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    type TEXT,
    code TEXT,
    nm TEXT,
    yropbaldb NUMERIC,
    yropbalcr NUMERIC,
    curbaldb NUMERIC,
    curbalcr NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_accountsmaster_store_id ON public.accountsmaster(store_id);
ALTER TABLE public.accountsmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accountsmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.accountsmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: accountsummary
CREATE TABLE IF NOT EXISTS public.accountsummary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    type TEXT,
    code TEXT,
    yr INTEGER,
    monthno INTEGER,
    monthopbaldb NUMERIC,
    monthopbalcr NUMERIC,
    dbamt NUMERIC,
    cramt NUMERIC,
    transpresent BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_accountsummary_store_id ON public.accountsummary(store_id);
ALTER TABLE public.accountsummary ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accountsummary' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.accountsummary FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: actualscheduletask
CREATE TABLE IF NOT EXISTS public.actualscheduletask (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    task_id TEXT,
    task_subno NUMERIC,
    task_location TEXT,
    showroomcode TEXT,
    task_name TEXT,
    task_level INTEGER,
    schedule_type INTEGER,
    day_weeknumber INTEGER,
    sch_run_type INTEGER,
    starttime TIMESTAMP WITH TIME ZONE,
    interval NUMERIC,
    waitdelay NUMERIC,
    lastexecutedtime TIMESTAMP WITH TIME ZONE,
    lastexecutedstatus TEXT,
    remarks TEXT,
    actstatus TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_actualscheduletask_store_id ON public.actualscheduletask(store_id);
ALTER TABLE public.actualscheduletask ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'actualscheduletask' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.actualscheduletask FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: additionalchargedtls
CREATE TABLE IF NOT EXISTS public.additionalchargedtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymodecode TEXT,
    schemecode TEXT,
    addnlchrgcd TEXT,
    applicable INTEGER,
    percentoramt INTEGER,
    addnlchrgvalue DOUBLE PRECISION,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_additionalchargedtls_store_id ON public.additionalchargedtls(store_id);
ALTER TABLE public.additionalchargedtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'additionalchargedtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.additionalchargedtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: agencycatdtl
CREATE TABLE IF NOT EXISTS public.agencycatdtl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    agencycode TEXT,
    paymodetype INTEGER,
    paymodecode TEXT,
    issuedbyagency BOOLEAN,
    cansubmittoagency BOOLEAN,
    agencycommrate NUMERIC,
    onlinesubreal BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_agencycatdtl_store_id ON public.agencycatdtl(store_id);
ALTER TABLE public.agencycatdtl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agencycatdtl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.agencycatdtl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: agencycathdr
CREATE TABLE IF NOT EXISTS public.agencycathdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    agencyid TEXT,
    agencynm TEXT,
    accountid TEXT,
    onlineauthpresent BOOLEAN,
    allowcrdtcard BOOLEAN,
    allowgiftcpn BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_agencycathdr_store_id ON public.agencycathdr(store_id);
ALTER TABLE public.agencycathdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agencycathdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.agencycathdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: agentactivity
CREATE TABLE IF NOT EXISTS public.agentactivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    actvindex INTEGER,
    task_id TEXT,
    actvexe TEXT,
    pgmdesc TEXT,
    pgmopt TEXT,
    actvflag INTEGER,
    actvrank INTEGER,
    actvdate TIMESTAMP WITH TIME ZONE,
    hocompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_agentactivity_store_id ON public.agentactivity(store_id);
ALTER TABLE public.agentactivity ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agentactivity' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.agentactivity FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: baledtl
CREATE TABLE IF NOT EXISTS public.baledtl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    suppcd TEXT,
    dcno TEXT,
    dcdate TIMESTAMP WITH TIME ZONE,
    baleno TEXT,
    status TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_baledtl_store_id ON public.baledtl(store_id);
ALTER TABLE public.baledtl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'baledtl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.baledtl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: basecomptemplate
CREATE TABLE IF NOT EXISTS public.basecomptemplate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tmplidno INTEGER,
    tmplextn TEXT,
    srlno INTEGER,
    tmplfiledtls TEXT,
    tmplcomptype TEXT,
    tmpllinedtls TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_basecomptemplate_store_id ON public.basecomptemplate(store_id);
ALTER TABLE public.basecomptemplate ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'basecomptemplate' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.basecomptemplate FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: billduestatusdtls
CREATE TABLE IF NOT EXISTS public.billduestatusdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    destcompcode TEXT,
    recvtrntype INTEGER,
    recvtrnctrlno INTEGER,
    recvtrnsrlno INTEGER,
    recvdocnoprefix TEXT,
    recvdocno INTEGER,
    recvdocdate TIMESTAMP WITH TIME ZONE,
    recvdoctime TIMESTAMP WITH TIME ZONE,
    recvamount NUMERIC,
    recvvoidind INTEGER,
    recvtranstatus INTEGER,
    sourceposcashtrntype INTEGER,
    sourceposcashctrlno INTEGER,
    sourceposcashdocnoprefix TEXT,
    sourceposcashdocno INTEGER,
    custcd TEXT,
    billsourcecompcode TEXT,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_billduestatusdtls_store_id ON public.billduestatusdtls(store_id);
ALTER TABLE public.billduestatusdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billduestatusdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.billduestatusdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: billduestatushdr
CREATE TABLE IF NOT EXISTS public.billduestatushdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    destcompcode TEXT,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    custcd TEXT,
    custname TEXT,
    billnetvalue NUMERIC,
    receivableamount NUMERIC,
    billretamount NUMERIC,
    billstatus INTEGER,
    remarks TEXT,
    voidind INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_billduestatushdr_store_id ON public.billduestatushdr(store_id);
ALTER TABLE public.billduestatushdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billduestatushdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.billduestatushdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: billpassdtls
CREATE TABLE IF NOT EXISTS public.billpassdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    srlno INTEGER,
    trndt TIMESTAMP WITH TIME ZONE,
    invno TEXT,
    invdt TIMESTAMP WITH TIME ZONE,
    dcno TEXT,
    dcdt TIMESTAMP WITH TIME ZONE,
    stockno TEXT,
    invrate NUMERIC,
    invqty INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_billpassdtls_store_id ON public.billpassdtls(store_id);
ALTER TABLE public.billpassdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billpassdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.billpassdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: billpasshdr
CREATE TABLE IF NOT EXISTS public.billpasshdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    trndt TIMESTAMP WITH TIME ZONE,
    supplierid TEXT,
    invno TEXT,
    invdt TIMESTAMP WITH TIME ZONE,
    shortqty INTEGER,
    shortval NUMERIC,
    exssqty INTEGER,
    exssval NUMERIC,
    tax NUMERIC,
    addons NUMERIC,
    dedns NUMERIC,
    discount NUMERIC,
    netamt NUMERIC,
    purvalue NUMERIC,
    billpassstat INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_billpasshdr_store_id ON public.billpasshdr(store_id);
ALTER TABLE public.billpasshdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billpasshdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.billpasshdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: browsesettings
CREATE TABLE IF NOT EXISTS public.browsesettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    browseid TEXT,
    browsetype TEXT,
    browsename TEXT,
    userid TEXT,
    appname TEXT,
    trntype INTEGER,
    fldname TEXT,
    fldcaption TEXT,
    fldtype TEXT,
    fldenabled BOOLEAN,
    dispinbrowse BOOLEAN,
    dispinfilter BOOLEAN,
    dispinresult BOOLEAN,
    alowfilter BOOLEAN,
    condition TEXT,
    searchval1 TEXT,
    searchval2 TEXT,
    othvalue TEXT,
    sortorder INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_browsesettings_store_id ON public.browsesettings(store_id);
ALTER TABLE public.browsesettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'browsesettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.browsesettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: catalogsettings
CREATE TABLE IF NOT EXISTS public.catalogsettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    appname TEXT,
    formname TEXT,
    fldname TEXT,
    shoperenvtype INTEGER,
    pgmoption INTEGER,
    userid TEXT,
    fldcaption TEXT,
    fldtype TEXT,
    fldenabled INTEGER,
    displayflag INTEGER,
    activeflag INTEGER,
    othvalue1 TEXT,
    othvalue2 TEXT,
    othvalue3 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_catalogsettings_store_id ON public.catalogsettings(store_id);
ALTER TABLE public.catalogsettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogsettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.catalogsettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: chainstores
CREATE TABLE IF NOT EXISTS public.chainstores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    type INTEGER,
    nm TEXT,
    maillistsrlno INTEGER,
    allowmiscrcpt BOOLEAN,
    allowmiscissue BOOLEAN,
    shopercomp TEXT,
    shoperver TEXT,
    shoperdelimiter TEXT,
    shoperenv TEXT,
    buyingfactor NUMERIC,
    sellingfactor NUMERIC,
    srctaxtype TEXT,
    poapplicable INTEGER,
    lstno TEXT,
    cstno TEXT,
    wslink TEXT,
    wsusername TEXT,
    wspassword TEXT,
    wsssl INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_chainstores_store_id ON public.chainstores(store_id);
ALTER TABLE public.chainstores ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chainstores' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.chainstores FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: class12combo
CREATE TABLE IF NOT EXISTS public.class12combo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class2cd TEXT,
    billable BOOLEAN,
    sizegroup TEXT,
    retailmarkup NUMERIC,
    dealermarkup NUMERIC,
    prefvendorid TEXT,
    altvendorid1 TEXT,
    altvendorid2 TEXT,
    altvendorid3 TEXT,
    prodtaxtype TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    isservicecombo BOOLEAN,
    isconsignmentitem BOOLEAN,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    batchapplicable INTEGER,
    batchmfgformat INTEGER,
    batchexpformat INTEGER,
    batchshelfapp INTEGER,
    batchpriceapp INTEGER,
    batchexpirtrnallowed TEXT,
    stopsalesbefexpdays INTEGER,
    gradeapplicable INTEGER,
    gradepriceapp INTEGER,
    gradepromoapp INTEGER,
    locationapplicable INTEGER,
    servicetype1 INTEGER,
    servicetype2 INTEGER,
    servicetype3 INTEGER,
    servicetype4 INTEGER,
    servicetype5 INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_class12combo_store_id ON public.class12combo(store_id);
ALTER TABLE public.class12combo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class12combo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.class12combo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: class12locwise
CREATE TABLE IF NOT EXISTS public.class12locwise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class1cddesc TEXT,
    class2cd TEXT,
    class2cddesc TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    locpriceappl INTEGER,
    multiplepriceapplicable INTEGER,
    sendbaseimfornotdefined INTEGER,
    remarks TEXT,
    batchwisepriceappl INTEGER,
    gradewisepriceappl INTEGER,
    mfgdateappl INTEGER,
    expdateappl INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_class12locwise_store_id ON public.class12locwise(store_id);
ALTER TABLE public.class12locwise ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class12locwise' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.class12locwise FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: commconfig
CREATE TABLE IF NOT EXISTS public.commconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    synctype TEXT,
    mode TEXT,
    active INTEGER,
    configxml TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_commconfig_store_id ON public.commconfig(store_id);
ALTER TABLE public.commconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.commconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: compareqty
CREATE TABLE IF NOT EXISTS public.compareqty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    actqty NUMERIC,
    dtlsqty NUMERIC,
    summqty NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_compareqty_store_id ON public.compareqty(store_id);
ALTER TABLE public.compareqty ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compareqty' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.compareqty FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: confinschemedtls
CREATE TABLE IF NOT EXISTS public.confinschemedtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymodetype INTEGER,
    paymodecode TEXT,
    schemecode TEXT,
    schemename TEXT,
    activeflag INTEGER,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    noofinstallments INTEGER,
    downpayment INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_confinschemedtls_store_id ON public.confinschemedtls(store_id);
ALTER TABLE public.confinschemedtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confinschemedtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.confinschemedtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crdtinvrcvdtls
CREATE TABLE IF NOT EXISTS public.crdtinvrcvdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recvtrntype INTEGER,
    recvctrlno INTEGER,
    recvsrlno INTEGER,
    recvdocnoprefix TEXT,
    recvdocno INTEGER,
    recvdocdt TIMESTAMP WITH TIME ZONE,
    recvdoctime TIMESTAMP WITH TIME ZONE,
    recvtranstatus INTEGER,
    poscashtrntype INTEGER,
    poscashctrlno INTEGER,
    poscashdocprefix TEXT,
    poscashdocno INTEGER,
    poscashdocdt TIMESTAMP WITH TIME ZONE,
    salereftrntype INTEGER,
    salerefctrlno INTEGER,
    salerefdocnoprefix TEXT,
    salerefdocno INTEGER,
    salerefdocdt TIMESTAMP WITH TIME ZONE,
    billpaidamt NUMERIC,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    custcd TEXT,
    sourcecompcd TEXT,
    destcompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crdtinvrcvdtls_store_id ON public.crdtinvrcvdtls(store_id);
ALTER TABLE public.crdtinvrcvdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crdtinvrcvdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crdtinvrcvdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crdtinvrcvhdr
CREATE TABLE IF NOT EXISTS public.crdtinvrcvhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recvtrntype INTEGER,
    recvctrlno INTEGER,
    recvsrlno INTEGER,
    recvdocnoprefix TEXT,
    recvdocno INTEGER,
    recvdocdt TIMESTAMP WITH TIME ZONE,
    recvdoctime TIMESTAMP WITH TIME ZONE,
    custcd TEXT,
    poscashtrntype INTEGER,
    poscashctrlno INTEGER,
    poscashdocnoprefix TEXT,
    poscashdocno INTEGER,
    recvtotamt NUMERIC,
    recvnarration TEXT,
    recvtranstatus INTEGER,
    voidind INTEGER,
    totalinvoicecnt INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    againsttripsheet TEXT,
    againstpaytype TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crdtinvrcvhdr_store_id ON public.crdtinvrcvhdr(store_id);
ALTER TABLE public.crdtinvrcvhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crdtinvrcvhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crdtinvrcvhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crdtsalecustopbal
CREATE TABLE IF NOT EXISTS public.crdtsalecustopbal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    trndt TIMESTAMP WITH TIME ZONE,
    srlno INTEGER,
    custcd TEXT,
    trntime TIMESTAMP WITH TIME ZONE,
    cutoffdt TIMESTAMP WITH TIME ZONE,
    trnamt NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crdtsalecustopbal_store_id ON public.crdtsalecustopbal(store_id);
ALTER TABLE public.crdtsalecustopbal ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crdtsalecustopbal' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crdtsalecustopbal FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crmfinalcustomer
CREATE TABLE IF NOT EXISTS public.crmfinalcustomer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    queryname TEXT,
    queryid TEXT,
    qrysrlno INTEGER,
    queryexedate TIMESTAMP WITH TIME ZONE,
    nm TEXT,
    streetaddr TEXT,
    town TEXT,
    postalcd TEXT,
    state TEXT,
    country TEXT,
    locality TEXT,
    homephone TEXT,
    mobilephone TEXT,
    email TEXT,
    email2 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crmfinalcustomer_store_id ON public.crmfinalcustomer(store_id);
ALTER TABLE public.crmfinalcustomer ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crmfinalcustomer' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crmfinalcustomer FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crmqryinfo
CREATE TABLE IF NOT EXISTS public.crmqryinfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    queryid INTEGER,
    queryname TEXT,
    fieldname TEXT,
    querycreationdate TIMESTAMP WITH TIME ZONE,
    querylastexecdate TIMESTAMP WITH TIME ZONE,
    custquerystring TEXT,
    prodquerystring TEXT,
    basedonpurchasestring TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crmqryinfo_store_id ON public.crmqryinfo(store_id);
ALTER TABLE public.crmqryinfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crmqryinfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crmqryinfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: crmqrystruc
CREATE TABLE IF NOT EXISTS public.crmqrystruc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    queryid INTEGER,
    qrysrlno INTEGER,
    queryfirlevelfilter TEXT,
    fieldname TEXT,
    criteria TEXT,
    queryjoin TEXT,
    sfield TEXT,
    ffield TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_crmqrystruc_store_id ON public.crmqrystruc(store_id);
ALTER TABLE public.crmqrystruc ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crmqrystruc' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.crmqrystruc FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: currencycat
CREATE TABLE IF NOT EXISTS public.currencycat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    nm TEXT,
    isallowedinpo BOOLEAN,
    isallowedastender BOOLEAN,
    isallowedinpayout BOOLEAN,
    convrate NUMERIC,
    ratedate TIMESTAMP WITH TIME ZONE,
    ratetime TIMESTAMP WITH TIME ZONE,
    ratechgfreq INTEGER,
    ratechgtimeunit TEXT,
    localcurrency BOOLEAN,
    decimaldesc TEXT,
    cursymbol TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_currencycat_store_id ON public.currencycat(store_id);
ALTER TABLE public.currencycat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'currencycat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.currencycat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: currencydenomination
CREATE TABLE IF NOT EXISTS public.currencydenomination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    srlno INTEGER,
    denomcap TEXT,
    denominations INTEGER,
    smallestunit INTEGER,
    active INTEGER,
    imageid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_currencydenomination_store_id ON public.currencydenomination(store_id);
ALTER TABLE public.currencydenomination ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'currencydenomination' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.currencydenomination FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: customerimport
CREATE TABLE IF NOT EXISTS public.customerimport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    nm TEXT,
    srlno INTEGER,
    pricegp TEXT,
    custclass1 TEXT,
    custclass2 TEXT,
    custclass3 TEXT,
    custclass4 TEXT,
    custclass5 TEXT,
    custprof1 TEXT,
    custprof2 TEXT,
    custprof3 TEXT,
    custprof4 TEXT,
    custprof5 TEXT,
    isasubordinate TEXT,
    hassubordinates TEXT,
    attachedtocd TEXT,
    applysuperaddress TEXT,
    ismale TEXT,
    birthdate TIMESTAMP WITH TIME ZONE,
    ismaried TEXT,
    wedanniv TIMESTAMP WITH TIME ZONE,
    loyaltypgmid TEXT,
    loyaltypgmcd TEXT,
    lstno TEXT,
    cstno TEXT,
    desttaxtype TEXT,
    modeoftrans TEXT,
    transcode TEXT,
    bankcd TEXT,
    bankloc TEXT,
    paymtcat TEXT,
    paymtterms TEXT,
    creditdays INTEGER,
    creditlimit NUMERIC,
    transitdays INTEGER,
    shopercomp TEXT,
    shoperver TEXT,
    isshopertaxinc TEXT,
    retail_factor TEXT,
    retail_roundoff TEXT,
    dealer_factor NUMERIC,
    dealer_roundoff TEXT,
    allowcreditinvoice TEXT,
    allowcashbill TEXT,
    allowmiscissue TEXT,
    allowdcgen TEXT,
    allowmiscrcpt TEXT,
    presaletaxformyes TEXT,
    presaletaxformnm TEXT,
    postsaletaxformyes TEXT,
    postsaletaxformnm TEXT,
    creditused NUMERIC,
    shoperdelimiter TEXT,
    shoperenv TEXT,
    srctaxtype TEXT,
    lstdate TIMESTAMP WITH TIME ZONE,
    cstdate TIMESTAMP WITH TIME ZONE,
    transallowed INTEGER,
    isconsignmentitem BOOLEAN,
    poapplicable INTEGER,
    streetaddr TEXT,
    town TEXT,
    postalcd TEXT,
    state TEXT,
    country TEXT,
    locality TEXT,
    offphone TEXT,
    homephone TEXT,
    mobilephone TEXT,
    faxno TEXT,
    email TEXT,
    email2 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_customerimport_store_id ON public.customerimport(store_id);
ALTER TABLE public.customerimport ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customerimport' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.customerimport FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    nm TEXT,
    maillistsrlno INTEGER,
    pricegrp TEXT,
    custclass1 TEXT,
    custclass2 TEXT,
    custclass3 TEXT,
    custclass4 TEXT,
    custclass5 TEXT,
    custprof1 TEXT,
    custprof2 TEXT,
    custprof3 TEXT,
    custprof4 TEXT,
    custprof5 TEXT,
    isasubordinate BOOLEAN,
    hassubordinates BOOLEAN,
    attachedtocd TEXT,
    applysuperaddress BOOLEAN,
    ismale INTEGER,
    birthdate TIMESTAMP WITH TIME ZONE,
    ismaried INTEGER,
    wedanniv TIMESTAMP WITH TIME ZONE,
    loyaltypgmid TEXT,
    loyaltypgmcd TEXT,
    lstno TEXT,
    cstno TEXT,
    desttaxtype TEXT,
    modeoftrans TEXT,
    transcode TEXT,
    bankcd TEXT,
    bankloc TEXT,
    paymtcat TEXT,
    paymtterms TEXT,
    creditdays INTEGER,
    creditlimit NUMERIC,
    transitdays INTEGER,
    shopercomp TEXT,
    shoperver TEXT,
    isshopertaxinc BOOLEAN,
    retail_factor NUMERIC,
    retail_roundoff NUMERIC,
    dealer_factor NUMERIC,
    dealer_roundoff NUMERIC,
    allowcreditinvoice BOOLEAN,
    allowcashbill BOOLEAN,
    allowmiscissue BOOLEAN,
    allowdcgen BOOLEAN,
    allowmiscrcpt BOOLEAN,
    presaletaxformyes BOOLEAN,
    presaletaxformnm TEXT,
    postsaletaxformyes BOOLEAN,
    postsaletaxformnm TEXT,
    dtofcreation TIMESTAMP WITH TIME ZONE,
    creditused NUMERIC,
    shoperdelimiter TEXT,
    shoperenv TEXT,
    srctaxtype TEXT,
    lstdate TIMESTAMP WITH TIME ZONE,
    cstdate TIMESTAMP WITH TIME ZONE,
    transallowed INTEGER,
    isconsignmentitem BOOLEAN,
    poapplicable INTEGER,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    wslink TEXT,
    wsusername TEXT,
    wspassword TEXT,
    wsssl INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_store_id ON public.customers(store_id);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.customers FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: custpricegroups
CREATE TABLE IF NOT EXISTS public.custpricegroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    pricegrpcd TEXT,
    pricegrpdesc TEXT,
    isfactorbyclass BOOLEAN,
    allowcreditinvoice BOOLEAN,
    allowcashbill BOOLEAN,
    allowmiscissue BOOLEAN,
    paymtterms INTEGER,
    creditdays INTEGER,
    creditlimit NUMERIC,
    desttaxtype TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_custpricegroups_store_id ON public.custpricegroups(store_id);
ALTER TABLE public.custpricegroups ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custpricegroups' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.custpricegroups FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: dashboardconfig
CREATE TABLE IF NOT EXISTS public.dashboardconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    userid TEXT,
    chartareacd TEXT,
    paramcd TEXT,
    descr TEXT,
    ctrlvalue TEXT,
    othparam TEXT,
    datetype INTEGER,
    fromdate TIMESTAMP WITH TIME ZONE,
    todate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_dashboardconfig_store_id ON public.dashboardconfig(store_id);
ALTER TABLE public.dashboardconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboardconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.dashboardconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: datasyncconfig
CREATE TABLE IF NOT EXISTS public.datasyncconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    hocompcd TEXT,
    hocompnm TEXT,
    islowerversion TEXT,
    isbasesystem TEXT,
    shrmcd TEXT,
    modesrlno INTEGER,
    modetype TEXT,
    modedtl TEXT,
    modeunm TEXT,
    modepwd TEXT,
    modeup TEXT,
    modedown TEXT,
    moderank INTEGER,
    upload_download_retry_times INTEGER,
    upload_download_retry_interval INTEGER,
    extract_file_split_size INTEGER,
    ftp_is_passive TEXT,
    mail_cc_from_shrm TEXT,
    mail_bcc_from_shrm TEXT,
    mail_cc_to_shrm TEXT,
    mail_bcc_to_shrm TEXT,
    mail_sub_from_shrm TEXT,
    mail_msg_from_shrm TEXT,
    mail_sub_to_shrm TEXT,
    mail_msg_to_shrm TEXT,
    mail_resync_sub_to_shrm TEXT,
    mail_resync_msg_to_shrm TEXT,
    mail_ack_sub_to_shrm TEXT,
    mail_ack_msg_to_shrm TEXT,
    filetype_downho TEXT,
    filetype_downpos TEXT,
    modeactive TEXT,
    modecrtdt TIMESTAMP WITH TIME ZONE,
    incrdownload TEXT,
    incrdownloadfromdt TIMESTAMP WITH TIME ZONE,
    usesisforonline TEXT,
    issecuremode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_datasyncconfig_store_id ON public.datasyncconfig(store_id);
ALTER TABLE public.datasyncconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datasyncconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.datasyncconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: daybeginpgms
CREATE TABLE IF NOT EXISTS public.daybeginpgms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    pgmindex INTEGER,
    pgmexe TEXT,
    pgmdesc TEXT,
    pgmopt TEXT,
    pgmflag BOOLEAN,
    pgmdate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_daybeginpgms_store_id ON public.daybeginpgms(store_id);
ALTER TABLE public.daybeginpgms ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daybeginpgms' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.daybeginpgms FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: dayendpgms
CREATE TABLE IF NOT EXISTS public.dayendpgms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    pgmindex INTEGER,
    pgmexe TEXT,
    pgmdesc TEXT,
    pgmopt TEXT,
    pgmflag BOOLEAN,
    pgmdate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_dayendpgms_store_id ON public.dayendpgms(store_id);
ALTER TABLE public.dayendpgms ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dayendpgms' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.dayendpgms FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: dbtuningconfig
CREATE TABLE IF NOT EXISTS public.dbtuningconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    srlno INTEGER,
    type TEXT,
    groupcaption TEXT,
    subcaption TEXT,
    command TEXT,
    arg1 TEXT,
    arg2 TEXT,
    arg3 TEXT,
    resultdisp TEXT,
    resulttofilter TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_dbtuningconfig_store_id ON public.dbtuningconfig(store_id);
ALTER TABLE public.dbtuningconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dbtuningconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.dbtuningconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: dcrefnodtls
CREATE TABLE IF NOT EXISTS public.dcrefnodtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    suppcd TEXT,
    suppnm TEXT,
    dcno INTEGER,
    dcdate TIMESTAMP WITH TIME ZONE,
    flag TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_dcrefnodtls_store_id ON public.dcrefnodtls(store_id);
ALTER TABLE public.dcrefnodtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dcrefnodtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.dcrefnodtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: deliveryadvicedtls
CREATE TABLE IF NOT EXISTS public.deliveryadvicedtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    destcompcode TEXT,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    sourceshowroomcode TEXT,
    destshowroomcode TEXT,
    docnoprefix TEXT,
    docno INTEGER,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    docqty NUMERIC,
    servicedqty NUMERIC,
    deliveredqty NUMERIC,
    rescheduleqty NUMERIC,
    rejectedqty NUMERIC,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    olditemflag INTEGER,
    olditemstockno TEXT,
    servicetype1 INTEGER,
    servicetype2 INTEGER,
    servicetype3 INTEGER,
    servicetype4 INTEGER,
    servicetype5 INTEGER,
    deliverystatus INTEGER,
    deliveryexptddatetime TIMESTAMP WITH TIME ZONE,
    delivereddatetime TIMESTAMP WITH TIME ZONE,
    docentvoidind INTEGER,
    rescheduledatetime TIMESTAMP WITH TIME ZONE,
    deliverystatusremarks TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliveryadvicedtls_store_id ON public.deliveryadvicedtls(store_id);
ALTER TABLE public.deliveryadvicedtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliveryadvicedtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.deliveryadvicedtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: deliveryadvicehdr
CREATE TABLE IF NOT EXISTS public.deliveryadvicehdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdate TIMESTAMP WITH TIME ZONE,
    billvalue NUMERIC,
    billtocustid TEXT,
    billtocustomername TEXT,
    billtoaddr1 TEXT,
    billtoaddr2 TEXT,
    billtoaddr3 TEXT,
    billtoaddr4 TEXT,
    billtocity TEXT,
    billtostate TEXT,
    billtolandmark TEXT,
    billtomobile TEXT,
    billtoemail TEXT,
    shiptocustid TEXT,
    shiptocustomername TEXT,
    shiptoaddr1 TEXT,
    shiptoaddr2 TEXT,
    shiptoaddr3 TEXT,
    shiptoaddr4 TEXT,
    shiptocity TEXT,
    shiptostate TEXT,
    shiptolandmark TEXT,
    shiptomobile TEXT,
    shiptoemail TEXT,
    deliverystatus INTEGER,
    olditemflag INTEGER,
    priority INTEGER,
    deliveryexptddatetime TIMESTAMP WITH TIME ZONE,
    deliveryinstructions TEXT,
    deliveryremarks TEXT,
    docvoidind INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliveryadvicehdr_store_id ON public.deliveryadvicehdr(store_id);
ALTER TABLE public.deliveryadvicehdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliveryadvicehdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.deliveryadvicehdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: deliverynotedtls
CREATE TABLE IF NOT EXISTS public.deliverynotedtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    docqty NUMERIC,
    sourcecompcode TEXT,
    sourceshowroomcode TEXT,
    reftrntype INTEGER,
    reftrnctrlno INTEGER,
    refdocnoprefix TEXT,
    refdocno INTEGER,
    refentsrlno INTEGER,
    dcreftrntype INTEGER,
    dcreftrnctrlno INTEGER,
    personincharge TEXT,
    statusflag INTEGER,
    fwdreftrntype INTEGER,
    fwdrefctrlno INTEGER,
    fwdrefdocentsrlno INTEGER,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    backrefdocentsrlno INTEGER,
    docentvoidind INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliverynotedtls_store_id ON public.deliverynotedtls(store_id);
ALTER TABLE public.deliverynotedtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliverynotedtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.deliverynotedtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: deliverynotedtlsextd01
CREATE TABLE IF NOT EXISTS public.deliverynotedtlsextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    destcompcode TEXT,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    docqty NUMERIC,
    reftrntype INTEGER,
    reftrnctrlno INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliverynotedtlsextd01_store_id ON public.deliverynotedtlsextd01(store_id);
ALTER TABLE public.deliverynotedtlsextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliverynotedtlsextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.deliverynotedtlsextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: deliverynotehdr
CREATE TABLE IF NOT EXISTS public.deliverynotehdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdate TIMESTAMP WITH TIME ZONE,
    personincharge TEXT,
    remarks TEXT,
    statusflag INTEGER,
    frwdreftrntype INTEGER,
    frwdrefctrlno INTEGER,
    bkwdreftrntype INTEGER,
    bkwdrefctrlno INTEGER,
    docvoidind INTEGER,
    docrsncd TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_deliverynotehdr_store_id ON public.deliverynotehdr(store_id);
ALTER TABLE public.deliverynotehdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliverynotehdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.deliverynotehdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: discountdtls72
CREATE TABLE IF NOT EXISTS public.discountdtls72 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    type INTEGER,
    priorityno INTEGER,
    custpricegrpid TEXT,
    custcd TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    itemclass1 TEXT,
    itemclass2 TEXT,
    stockno TEXT,
    apppt INTEGER,
    compon INTEGER,
    discadddedid TEXT,
    isvariable BOOLEAN,
    israte INTEGER,
    rateamt NUMERIC,
    validitystdt TIMESTAMP WITH TIME ZONE,
    validitysttm TIMESTAMP WITH TIME ZONE,
    validityenddt TIMESTAMP WITH TIME ZONE,
    validityendtm TIMESTAMP WITH TIME ZONE,
    appwkdays TEXT,
    appsttm TIMESTAMP WITH TIME ZONE,
    appendtm TIMESTAMP WITH TIME ZONE,
    minappval NUMERIC,
    maxappval NUMERIC,
    sf_isservice BOOLEAN,
    sf_isinventoryitem BOOLEAN,
    sf_isconsignmentitem BOOLEAN,
    sf_isrptaxinclusive BOOLEAN,
    sf_regularind TEXT,
    sf_locnid TEXT,
    sf_ccstockno TEXT,
    sf_gradecd TEXT,
    sf_merchid TEXT,
    sf_imageid TEXT,
    sf_mfgdate TIMESTAMP WITH TIME ZONE,
    sf_expdate TIMESTAMP WITH TIME ZONE,
    sf_prodtaxtype TEXT,
    sf_srctaxtype TEXT,
    sf_batchsrlno TEXT,
    sf_subclass1cd TEXT,
    sf_subclass2cd TEXT,
    sf_sizecd TEXT,
    sf_analcode1 TEXT,
    sf_analcode2 TEXT,
    sf_analcode3 TEXT,
    sf_analcode4 TEXT,
    sf_analcode5 TEXT,
    sf_leastsalableqty NUMERIC,
    sf_retail_price NUMERIC,
    sf_dealer_price NUMERIC,
    sf_rtlmarkup NUMERIC,
    sf_dlrmarkup NUMERIC,
    sf_curbalqty NUMERIC,
    salespromocode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_discountdtls72_store_id ON public.discountdtls72(store_id);
ALTER TABLE public.discountdtls72 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discountdtls72' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.discountdtls72 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: downloadparams
CREATE TABLE IF NOT EXISTS public.downloadparams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    dayenddate TIMESTAMP WITH TIME ZONE,
    controlno INTEGER,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_downloadparams_store_id ON public.downloadparams(store_id);
ALTER TABLE public.downloadparams ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'downloadparams' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.downloadparams FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: errole
CREATE TABLE IF NOT EXISTS public.errole (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    errfrom NUMERIC,
    errdes TEXT,
    erracc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_errole_store_id ON public.errole(store_id);
ALTER TABLE public.errole ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'errole' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.errole FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: eventextnfieldconfig
CREATE TABLE IF NOT EXISTS public.eventextnfieldconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    programid TEXT,
    eventid TEXT,
    fieldsrlno INTEGER,
    fieldname TEXT,
    returnflag INTEGER,
    fieldlock INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_eventextnfieldconfig_store_id ON public.eventextnfieldconfig(store_id);
ALTER TABLE public.eventextnfieldconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eventextnfieldconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.eventextnfieldconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: eventextnkeyvalueconfig
CREATE TABLE IF NOT EXISTS public.eventextnkeyvalueconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    programid TEXT,
    eventid TEXT,
    srlno INTEGER,
    eventkeyvalue TEXT,
    dllname TEXT,
    encryptver TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_eventextnkeyvalueconfig_store_id ON public.eventextnkeyvalueconfig(store_id);
ALTER TABLE public.eventextnkeyvalueconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'eventextnkeyvalueconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.eventextnkeyvalueconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: exchangeolditems
CREATE TABLE IF NOT EXISTS public.exchangeolditems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    srlno INTEGER,
    itemname TEXT,
    itemvalue NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_exchangeolditems_store_id ON public.exchangeolditems(store_id);
ALTER TABLE public.exchangeolditems ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exchangeolditems' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.exchangeolditems FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: excisedutycomponents
CREATE TABLE IF NOT EXISTS public.excisedutycomponents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    edcode INTEGER,
    orderno INTEGER,
    edcstatus INTEGER,
    edcompname TEXT,
    edcompshortform TEXT,
    dutytype TEXT,
    methodofcalinedcode TEXT,
    methodofcalinshortform TEXT,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_excisedutycomponents_store_id ON public.excisedutycomponents(store_id);
ALTER TABLE public.excisedutycomponents ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'excisedutycomponents' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.excisedutycomponents FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: excisedutydtls
CREATE TABLE IF NOT EXISTS public.excisedutydtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docno INTEGER,
    srlno INTEGER,
    eddesc TEXT,
    edstatus INTEGER,
    definitioncreatedat INTEGER,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    shoperdbver TEXT,
    featureid INTEGER,
    applicableitems INTEGER,
    class1cd TEXT,
    class2cd TEXT,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    assessablevalueper NUMERIC,
    assessablevaluebasedon TEXT,
    edc1code INTEGER,
    edc1per NUMERIC,
    edc1basedon TEXT,
    edc2code INTEGER,
    edc2per NUMERIC,
    edc2basedon TEXT,
    edc3code INTEGER,
    edc3per NUMERIC,
    edc3basedon TEXT,
    edc4code INTEGER,
    edc4per NUMERIC,
    edc4basedon TEXT,
    edc5code INTEGER,
    edc5per NUMERIC,
    edc5basedon TEXT,
    addedtotrnvalue NUMERIC,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_excisedutydtls_store_id ON public.excisedutydtls(store_id);
ALTER TABLE public.excisedutydtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'excisedutydtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.excisedutydtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: expectedtrnaddonded
CREATE TABLE IF NOT EXISTS public.expectedtrnaddonded (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    srlno INTEGER,
    factortype TEXT,
    factorid INTEGER,
    variablefixed TEXT,
    rateamt TEXT,
    rate NUMERIC,
    amount NUMERIC,
    trnstatus INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_expectedtrnaddonded_store_id ON public.expectedtrnaddonded(store_id);
ALTER TABLE public.expectedtrnaddonded ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expectedtrnaddonded' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.expectedtrnaddonded FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: expectedtrndtls
CREATE TABLE IF NOT EXISTS public.expectedtrndtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docsrlno INTEGER,
    docsubsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    itemdesc TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    itemrate NUMERIC,
    qty NUMERIC,
    itemvalue NUMERIC,
    salespersoncd TEXT,
    itemmeasurements TEXT,
    itemremarks TEXT,
    discountindicator INTEGER,
    tailorcode TEXT,
    disccode TEXT,
    discrate NUMERIC,
    eupcode TEXT,
    fwdtrntype INTEGER,
    fwdtrnctrlno INTEGER,
    bkwdtrntype INTEGER,
    bkwdtrnctrlno INTEGER,
    trnstatus INTEGER,
    salereftrntype INTEGER,
    salereftrndocnoprefix TEXT,
    salereftrndocno INTEGER,
    salereftrnctrlno INTEGER,
    salereftrndocsrlno INTEGER,
    appissreftrntype INTEGER,
    appissreftrndocpfx TEXT,
    appissreftrndocno INTEGER,
    appissreftrndocsrlno INTEGER,
    appissreftrnctrlno INTEGER,
    apprcptreftrntype INTEGER,
    apprcptreftrndocpfx TEXT,
    apprcptreftrndocno INTEGER,
    apprcptreftrnctrlno INTEGER,
    apprcptreftrndocsrlno INTEGER,
    servicedqty NUMERIC,
    linkpofromloc TEXT,
    linkpovendor TEXT,
    linkpotype INTEGER,
    linkpoprefix TEXT,
    linkponumber INTEGER,
    linkpoentrysrlno INTEGER,
    linkpoentrysubsrlno INTEGER,
    linkpodeldate TIMESTAMP WITH TIME ZONE,
    serviceloc TEXT,
    linkettrntype INTEGER,
    linkettrnctrlno INTEGER,
    linketdocsubsrlno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    locnid TEXT,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    ordentsrlno INTEGER,
    ordentsubsrlno INTEGER,
    stkupdtrate NUMERIC,
    docenttotdisc NUMERIC,
    docentvalaftdisc NUMERIC,
    docenttax NUMERIC,
    docentaddons NUMERIC,
    docentdedns NUMERIC,
    docentnetvalue NUMERIC,
    physqtyreturned DOUBLE PRECISION,
    docentbeftaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxaddons NUMERIC,
    docentafttaxdedns NUMERIC,
    docentdisc NUMERIC,
    docentbilldisc NUMERIC,
    itemtaxtype TEXT,
    custtaxtype TEXT,
    srctaxtype TEXT,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    retnreasoncd TEXT,
    fwdrefdocentsrlno INTEGER,
    backrefdocentsrlno INTEGER,
    billpassind INTEGER,
    itemwisediscreason TEXT,
    itemmrpbilltm NUMERIC,
    itemcurbalqty NUMERIC,
    itemlvlpricefacid INTEGER,
    itemlvledid INTEGER,
    docentpricefactor NUMERIC,
    stdtaxcomp1per NUMERIC,
    docented NUMERIC,
    stdtaxcomp2per NUMERIC,
    merchid TEXT,
    stdtaxcomp3per NUMERIC,
    stdtaxcomp4per NUMERIC,
    stdtaxcomp5per NUMERIC,
    stdtaxcomp1inc BOOLEAN,
    stdtaxcomp2inc BOOLEAN,
    stdtaxcomp3inc BOOLEAN,
    stdtaxcomp4inc BOOLEAN,
    stdtaxcomp5inc BOOLEAN,
    befcurbalqty NUMERIC,
    befcurbalval NUMERIC,
    aftcurbalqty NUMERIC,
    aftcurbalval NUMERIC,
    promocode TEXT,
    promoslabsrlno INTEGER,
    promoremarks TEXT,
    promotype INTEGER,
    promodeftype INTEGER,
    promoissuetrntype INTEGER,
    promoissuetrnctrlno INTEGER,
    promofwdlinktype INTEGER,
    promofwdlinkctrlno INTEGER,
    promoitemlevelofferval NUMERIC,
    promoitemlleveldiscdtls TEXT,
    promoitemgroup INTEGER,
    promoflgitemlevel INTEGER,
    promoflgbilllevel INTEGER,
    promosetsrlno INTEGER,
    promoofferitemtype INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_expectedtrndtls_store_id ON public.expectedtrndtls(store_id);
ALTER TABLE public.expectedtrndtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expectedtrndtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.expectedtrndtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: expectedtrnhdr
CREATE TABLE IF NOT EXISTS public.expectedtrnhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docsrlno INTEGER,
    custcd TEXT,
    custname TEXT,
    contributorcd TEXT,
    contributorname TEXT,
    contributoraddr TEXT,
    salespersoncd TEXT,
    createddt TIMESTAMP WITH TIME ZONE,
    netqty DOUBLE PRECISION,
    netvalue NUMERIC,
    salereftrntype INTEGER,
    salereftrndocnoprefix TEXT,
    salereftrndocno INTEGER,
    trnstatus INTEGER,
    orderremarks TEXT,
    trialdate TIMESTAMP WITH TIME ZONE,
    delivarydate TIMESTAMP WITH TIME ZONE,
    salesserviceind INTEGER,
    fwdtrntype INTEGER,
    fwdtrnctrlno INTEGER,
    bkwdtrntype INTEGER,
    bkwdtrnctrlno INTEGER,
    reasoncodeforcancel TEXT,
    copyno INTEGER,
    salereftrnctrlno INTEGER,
    transportcopyused BOOLEAN,
    custinf1 TEXT,
    custinf2 TEXT,
    custinf3 TEXT,
    custinf4 TEXT,
    custinf5 TEXT,
    billlvldisccode TEXT,
    billlvldiscper NUMERIC,
    billlvldiscamt NUMERIC,
    billlvldisccomp NUMERIC,
    gendiscreason TEXT,
    billlvlremarks TEXT,
    modeoftrans TEXT,
    transcd TEXT,
    transdocdate TIMESTAMP WITH TIME ZONE,
    doctime TIMESTAMP WITH TIME ZONE,
    partytype INTEGER,
    partystkdocno TEXT,
    partystkdocdt TIMESTAMP WITH TIME ZONE,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    orddocdt TIMESTAMP WITH TIME ZONE,
    totdocvalue NUMERIC,
    totdoctax NUMERIC,
    totdocaddons NUMERIC,
    totdocdedns NUMERIC,
    enteredsizewise BOOLEAN,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    billpassind INTEGER,
    totallineitems INTEGER,
    totdoced NUMERIC,
    totdocentbeftaxaddons NUMERIC,
    totdocentbeftaxdedns NUMERIC,
    totdocentafttaxaddons NUMERIC,
    totdocentafttaxdedns NUMERIC,
    promocode TEXT,
    promoslabsrlno INTEGER,
    promoremarks TEXT,
    promotype INTEGER,
    promodeftype INTEGER,
    promoissuetrntype INTEGER,
    promoissuetrnctrlno INTEGER,
    promofwdlinktype INTEGER,
    promofwdlinkctrlno INTEGER,
    promobilllevelofferval NUMERIC,
    promoitemlevelofferval NUMERIC,
    promoitemleveldiscval NUMERIC,
    promobillleveldiscdtls TEXT,
    linkettrntype INTEGER,
    linkettrnctrlno INTEGER,
    linkpovendor TEXT,
    shoperdbver INTEGER,
    cartontype TEXT,
    cartonweight NUMERIC,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_expectedtrnhdr_store_id ON public.expectedtrnhdr(store_id);
ALTER TABLE public.expectedtrnhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expectedtrnhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.expectedtrnhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: expectedtrnrcpts
CREATE TABLE IF NOT EXISTS public.expectedtrnrcpts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docsrlno INTEGER,
    posentrytype INTEGER,
    postrnctrlno INTEGER,
    posdocnoprefix TEXT,
    posdocno INTEGER,
    paymodetype TEXT,
    paymodecode TEXT,
    paidunits NUMERIC,
    appliedconvrate NUMERIC,
    loccurrnetamt NUMERIC,
    startcpnno TEXT,
    endcpnno TEXT,
    prefix TEXT,
    tenderrefelement1 TEXT,
    tenderrefelement2 TEXT,
    tenderrefelement3 TEXT,
    tenderrefelement4 TEXT,
    tenderrefelement5 TEXT,
    tenderrefelement6 TEXT,
    tenderrefelement7 TEXT,
    tenderrefelement8 TEXT,
    tenderrefelement9 TEXT,
    tenderrefelement10 TEXT,
    submissiononline TEXT,
    agencycode TEXT,
    agencycommison NUMERIC,
    crnotetotalamount NUMERIC,
    crnoteamtinbilling NUMERIC,
    trnstatus BOOLEAN,
    description TEXT,
    localcurrency TEXT,
    shoperdbver INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_expectedtrnrcpts_store_id ON public.expectedtrnrcpts(store_id);
ALTER TABLE public.expectedtrnrcpts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expectedtrnrcpts' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.expectedtrnrcpts FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: exportgenlookup
CREATE TABLE IF NOT EXISTS public.exportgenlookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recid INTEGER,
    code TEXT,
    descr TEXT,
    flag TEXT,
    number INTEGER,
    hocompcode TEXT,
    flagackrecd BOOLEAN,
    filenumber NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_exportgenlookup_store_id ON public.exportgenlookup(store_id);
ALTER TABLE public.exportgenlookup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exportgenlookup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.exportgenlookup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: exportsysparam
CREATE TABLE IF NOT EXISTS public.exportsysparam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    descr TEXT,
    paramcode TEXT,
    boolean BOOLEAN,
    intg INTEGER,
    txt TEXT,
    dt TIMESTAMP WITH TIME ZONE,
    sng DOUBLE PRECISION,
    cur NUMERIC,
    opt TEXT,
    hocompcode TEXT,
    flagackrecd BOOLEAN,
    filenumber NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_exportsysparam_store_id ON public.exportsysparam(store_id);
ALTER TABLE public.exportsysparam ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exportsysparam' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.exportsysparam FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: expttrndtlsextd01
CREATE TABLE IF NOT EXISTS public.expttrndtlsextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    quantity NUMERIC,
    minmop NUMERIC,
    maxmop NUMERIC,
    trnstatus INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_expttrndtlsextd01_store_id ON public.expttrndtlsextd01(store_id);
ALTER TABLE public.expttrndtlsextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expttrndtlsextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.expttrndtlsextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extditemmaster
CREATE TABLE IF NOT EXISTS public.extditemmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    itemextdesc TEXT,
    imageid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extditemmaster_store_id ON public.extditemmaster(store_id);
ALTER TABLE public.extditemmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extditemmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extditemmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extdmailinglist
CREATE TABLE IF NOT EXISTS public.extdmailinglist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    addresstype TEXT,
    nm TEXT,
    addr1 TEXT,
    addr2 TEXT,
    addr3 TEXT,
    addr4 TEXT,
    addr5 TEXT,
    locality TEXT,
    postalcd TEXT,
    country TEXT,
    zone TEXT,
    state TEXT,
    city TEXT,
    offphone TEXT,
    homephone TEXT,
    mobilephone TEXT,
    faxno TEXT,
    email TEXT,
    email2 TEXT,
    email3 TEXT,
    contact TEXT,
    cattype TEXT,
    catcd TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    defaultaddress INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extdmailinglist_store_id ON public.extdmailinglist(store_id);
ALTER TABLE public.extdmailinglist ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extdmailinglist' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extdmailinglist FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extensionconfigexternal
CREATE TABLE IF NOT EXISTS public.extensionconfigexternal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recid INTEGER,
    programid TEXT,
    eventid TEXT,
    srlno INTEGER,
    dllname TEXT,
    activeflag INTEGER,
    extntype TEXT,
    programtype INTEGER,
    fileformat TEXT,
    filedelimiter TEXT,
    partnerid TEXT,
    encryptver TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extensionconfigexternal_store_id ON public.extensionconfigexternal(store_id);
ALTER TABLE public.extensionconfigexternal ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extensionconfigexternal' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extensionconfigexternal FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extensionconfiginfo
CREATE TABLE IF NOT EXISTS public.extensionconfiginfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    extnlevel INTEGER,
    structtype INTEGER,
    fieldsrlno INTEGER,
    fieldname TEXT,
    fieldtype TEXT,
    fieldlength INTEGER,
    fieldcaption TEXT,
    extnconfigsrlno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extensionconfiginfo_store_id ON public.extensionconfiginfo(store_id);
ALTER TABLE public.extensionconfiginfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extensionconfiginfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extensionconfiginfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extensionconfiginternal
CREATE TABLE IF NOT EXISTS public.extensionconfiginternal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recid INTEGER,
    programid TEXT,
    eventid TEXT,
    srlno INTEGER,
    dllname TEXT,
    activeflag INTEGER,
    extntype TEXT,
    programtype INTEGER,
    fileformat TEXT,
    filedelimiter TEXT,
    partnerid TEXT,
    encryptver TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extensionconfiginternal_store_id ON public.extensionconfiginternal(store_id);
ALTER TABLE public.extensionconfiginternal ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extensionconfiginternal' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extensionconfiginternal FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extensionconfigtable
CREATE TABLE IF NOT EXISTS public.extensionconfigtable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    extlevel INTEGER,
    structtype INTEGER,
    tablestruct TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extensionconfigtable_store_id ON public.extensionconfigtable(store_id);
ALTER TABLE public.extensionconfigtable ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extensionconfigtable' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extensionconfigtable FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: extnpartnerinfo
CREATE TABLE IF NOT EXISTS public.extnpartnerinfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    partnerid TEXT,
    partnername TEXT,
    partneremail TEXT,
    contactno TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_extnpartnerinfo_store_id ON public.extnpartnerinfo(store_id);
ALTER TABLE public.extnpartnerinfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extnpartnerinfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.extnpartnerinfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: factorheader
CREATE TABLE IF NOT EXISTS public.factorheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    name TEXT,
    effectivedate TIMESTAMP WITH TIME ZONE,
    loccode TEXT,
    category INTEGER,
    applpoint INTEGER,
    basedon INTEGER,
    basedonrangefrom NUMERIC,
    basedonrangeto NUMERIC,
    intermsof INTEGER,
    fixedorvariable INTEGER,
    valuefrom INTEGER,
    value NUMERIC,
    status INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_factorheader_store_id ON public.factorheader(store_id);
ALTER TABLE public.factorheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'factorheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.factorheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: featureintrodtls
CREATE TABLE IF NOT EXISTS public.featureintrodtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    featureid INTEGER,
    minverid INTEGER,
    maxverid INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_featureintrodtls_store_id ON public.featureintrodtls(store_id);
ALTER TABLE public.featureintrodtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'featureintrodtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.featureintrodtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: fileloadingstatus
CREATE TABLE IF NOT EXISTS public.fileloadingstatus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    file_name TEXT,
    filepath TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    runnumber INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_fileloadingstatus_store_id ON public.fileloadingstatus(store_id);
ALTER TABLE public.fileloadingstatus ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fileloadingstatus' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.fileloadingstatus FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: filesfromho
CREATE TABLE IF NOT EXISTS public.filesfromho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    infofile TEXT,
    slno INTEGER,
    file_name TEXT,
    regorexe TEXT,
    versiondtls TEXT,
    copytopath TEXT,
    cmdlineargs TEXT,
    pgmopt INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    status TEXT,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_filesfromho_store_id ON public.filesfromho(store_id);
ALTER TABLE public.filesfromho ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'filesfromho' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.filesfromho FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: franchiseelog
CREATE TABLE IF NOT EXISTS public.franchiseelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    idtype TEXT,
    shoperdt TIMESTAMP WITH TIME ZONE,
    srlno INTEGER,
    trnstype TEXT,
    paymode TEXT,
    trnsamt NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_franchiseelog_store_id ON public.franchiseelog(store_id);
ALTER TABLE public.franchiseelog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchiseelog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.franchiseelog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: franchiseetrans
CREATE TABLE IF NOT EXISTS public.franchiseetrans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trnacctype TEXT,
    trntype TEXT,
    trnctrlno INTEGER,
    trndate TIMESTAMP WITH TIME ZONE,
    trnmode INTEGER,
    trncurr TEXT,
    trncurrunits DOUBLE PRECISION,
    currconvrate NUMERIC,
    trnamount NUMERIC,
    chqbankcode TEXT,
    chqbankloc TEXT,
    chqno TEXT,
    chqdate TIMESTAMP WITH TIME ZONE,
    payinslipno TEXT,
    payinslipdate TIMESTAMP WITH TIME ZONE,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_franchiseetrans_store_id ON public.franchiseetrans(store_id);
ALTER TABLE public.franchiseetrans ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchiseetrans' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.franchiseetrans FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: franchiselstloadeddtls
CREATE TABLE IF NOT EXISTS public.franchiselstloadeddtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoper_sysdt TIMESTAMP WITH TIME ZONE,
    trnacctype TEXT,
    trntype TEXT,
    trnctrlno INTEGER,
    lastloadeddate TIMESTAMP WITH TIME ZONE,
    recordfounddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_franchiselstloadeddtls_store_id ON public.franchiselstloadeddtls(store_id);
ALTER TABLE public.franchiselstloadeddtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franchiselstloadeddtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.franchiselstloadeddtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: franmismatchlog
CREATE TABLE IF NOT EXISTS public.franmismatchlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoperdt TIMESTAMP WITH TIME ZONE,
    paymode TEXT,
    logopbal NUMERIC,
    trnopbal NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_franmismatchlog_store_id ON public.franmismatchlog(store_id);
ALTER TABLE public.franmismatchlog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'franmismatchlog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.franmismatchlog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: genlookup
CREATE TABLE IF NOT EXISTS public.genlookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recid INTEGER,
    code TEXT,
    descr TEXT,
    flag TEXT,
    number INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_genlookup_store_id ON public.genlookup(store_id);
ALTER TABLE public.genlookup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'genlookup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.genlookup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: genlookupextd
CREATE TABLE IF NOT EXISTS public.genlookupextd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recid INTEGER,
    category TEXT,
    iseditable INTEGER,
    rectype TEXT,
    operations TEXT,
    addrules TEXT,
    editrules TEXT,
    deleterules TEXT,
    additional1 TEXT,
    additional2 TEXT,
    description TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_genlookupextd_store_id ON public.genlookupextd(store_id);
ALTER TABLE public.genlookupextd ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'genlookupextd' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.genlookupextd FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: gs1dtls
CREATE TABLE IF NOT EXISTS public.gs1dtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    slno INTEGER,
    gs1idkey TEXT,
    gs1companyprefix TEXT,
    startingno INTEGER,
    endingno INTEGER,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    totalbarcodespresent INTEGER,
    totalbarcodesused INTEGER,
    totalbarcodesavbl INTEGER,
    lastnoused INTEGER,
    active INTEGER,
    defaultpfx INTEGER,
    barcodelen INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_gs1dtls_store_id ON public.gs1dtls(store_id);
ALTER TABLE public.gs1dtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gs1dtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.gs1dtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: hotkeys
CREATE TABLE IF NOT EXISTS public.hotkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    formid INTEGER,
    formname TEXT,
    funcid INTEGER,
    funcdesp TEXT,
    keycode INTEGER,
    shiftcode INTEGER,
    keydesp TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_hotkeys_store_id ON public.hotkeys(store_id);
ALTER TABLE public.hotkeys ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hotkeys' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.hotkeys FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: incdeftable
CREATE TABLE IF NOT EXISTS public.incdeftable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    incname TEXT,
    docno INTEGER,
    selectiontype INTEGER,
    personnelcd TEXT,
    ptypedesc TEXT,
    srlno INTEGER,
    basedon INTEGER,
    percentageoramt INTEGER,
    percentageof INTEGER,
    value NUMERIC,
    conditiongrtrthan NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    personnelnm TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_incdeftable_store_id ON public.incdeftable(store_id);
ALTER TABLE public.incdeftable ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incdeftable' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.incdeftable FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: incentivegrpitemdtls
CREATE TABLE IF NOT EXISTS public.incentivegrpitemdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    incname TEXT,
    docno INTEGER,
    srlno INTEGER,
    skuno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    skuflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_incentivegrpitemdtls_store_id ON public.incentivegrpitemdtls(store_id);
ALTER TABLE public.incentivegrpitemdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incentivegrpitemdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.incentivegrpitemdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: incshrmperioddtls
CREATE TABLE IF NOT EXISTS public.incshrmperioddtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    incname TEXT,
    docno INTEGER,
    shrmprofcd TEXT,
    shrmprofname TEXT,
    ptype TEXT,
    pcode TEXT,
    srlno INTEGER,
    ptypedesc TEXT,
    pyear TEXT,
    fromdate TIMESTAMP WITH TIME ZONE,
    todate TIMESTAMP WITH TIME ZONE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_incshrmperioddtls_store_id ON public.incshrmperioddtls(store_id);
ALTER TABLE public.incshrmperioddtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incshrmperioddtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.incshrmperioddtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: infotable
CREATE TABLE IF NOT EXISTS public.infotable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tablename TEXT,
    tableprintsequence INTEGER,
    fieldprintconfig TEXT,
    sheetname TEXT,
    sheetseq INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_infotable_store_id ON public.infotable(store_id);
ALTER TABLE public.infotable ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'infotable' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.infotable FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: iniloadingerrorlog
CREATE TABLE IF NOT EXISTS public.iniloadingerrorlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    runnumber INTEGER,
    rundate TIMESTAMP WITH TIME ZONE,
    erroritem TEXT,
    errorrecords INTEGER,
    errordesc TEXT,
    uploadtype INTEGER,
    uploadsource TEXT,
    updinsertparms TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_iniloadingerrorlog_store_id ON public.iniloadingerrorlog(store_id);
ALTER TABLE public.iniloadingerrorlog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'iniloadingerrorlog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.iniloadingerrorlog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: inpacksliphdr
CREATE TABLE IF NOT EXISTS public.inpacksliphdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    partyid TEXT,
    partystkdocno TEXT,
    partystkdocdt TIMESTAMP WITH TIME ZONE,
    partytype TEXT,
    packcountdoc INTEGER,
    packcountphy INTEGER,
    shoperdbver INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_inpacksliphdr_store_id ON public.inpacksliphdr(store_id);
ALTER TABLE public.inpacksliphdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inpacksliphdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.inpacksliphdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: inpacksliptrn
CREATE TABLE IF NOT EXISTS public.inpacksliptrn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    slipcrtnno TEXT,
    slipentsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    phyqtyin NUMERIC,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_inpacksliptrn_store_id ON public.inpacksliptrn(store_id);
ALTER TABLE public.inpacksliptrn ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inpacksliptrn' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.inpacksliptrn FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemclassrestrict
CREATE TABLE IF NOT EXISTS public.itemclassrestrict (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    userid TEXT,
    columnname TEXT,
    value TEXT,
    isallowed INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemclassrestrict_store_id ON public.itemclassrestrict(store_id);
ALTER TABLE public.itemclassrestrict ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemclassrestrict' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemclassrestrict FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmapping
CREATE TABLE IF NOT EXISTS public.itemmapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    maptype TEXT,
    hocode TEXT,
    posattrib1 TEXT,
    posattrib2 TEXT,
    hoattrib1 TEXT,
    hoattrib2 TEXT,
    hoattrib TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmapping_store_id ON public.itemmapping(store_id);
ALTER TABLE public.itemmapping ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmapping' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmapping FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmappingrules
CREATE TABLE IF NOT EXISTS public.itemmappingrules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    hocode TEXT,
    hoattrib TEXT,
    posattrib TEXT,
    condition TEXT,
    receivedcode TEXT,
    receiveddesc TEXT,
    newcode TEXT,
    newdesc TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmappingrules_store_id ON public.itemmappingrules(store_id);
ALTER TABLE public.itemmappingrules ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmappingrules' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmappingrules FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmaster
CREATE TABLE IF NOT EXISTS public.itemmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    leastsalableqty NUMERIC,
    usejwlpricing BOOLEAN,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    isinventoryitem BOOLEAN,
    isrptaxinclusive BOOLEAN,
    itemdesc TEXT,
    extdescpresent BOOLEAN,
    regularind TEXT,
    reordlvl DOUBLE PRECISION,
    eoq DOUBLE PRECISION,
    minordqty DOUBLE PRECISION,
    lastpurchprice NUMERIC,
    currentcost NUMERIC,
    jwlmetalind TEXT,
    jwlcaratage INTEGER,
    jwlgrosswt DOUBLE PRECISION,
    jwlstonewt DOUBLE PRECISION,
    jwlwtfactor DOUBLE PRECISION,
    jwlratefactor NUMERIC,
    jwlstoneval NUMERIC,
    jwlmakecharge NUMERIC,
    jwlvalfactor NUMERIC,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    mfgdate TIMESTAMP WITH TIME ZONE,
    expdate TIMESTAMP WITH TIME ZONE,
    shelflife INTEGER,
    imagepresent BOOLEAN,
    isbillable BOOLEAN,
    isservice BOOLEAN,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    ccstockno TEXT,
    gradecd TEXT,
    imageid TEXT,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    merchid TEXT,
    discid INTEGER,
    discper INTEGER,
    discamt INTEGER,
    discsqlqry TEXT,
    pricefactorid INTEGER,
    pricefactorper INTEGER,
    pricefactoramt INTEGER,
    pricefactorsqlqry TEXT,
    addonid INTEGER,
    addonper NUMERIC,
    addonamt NUMERIC,
    addonsqlqry TEXT,
    dednid INTEGER,
    dednper NUMERIC,
    dednamt NUMERIC,
    dednsqlqry TEXT,
    edid INTEGER,
    edper NUMERIC,
    edamt NUMERIC,
    edsqlqry TEXT,
    finalmrp NUMERIC,
    isconsignmentitem BOOLEAN,
    flgstocktake INTEGER,
    flgratealterable INTEGER,
    flgstockchkappl INTEGER,
    stocktolerance NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    batchapplicable INTEGER,
    gradeapplicable INTEGER,
    locationapplicable INTEGER,
    batchnoflag INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmaster_store_id ON public.itemmaster(store_id);
ALTER TABLE public.itemmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmasterbackup
CREATE TABLE IF NOT EXISTS public.itemmasterbackup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    leastsalableqty NUMERIC,
    usejwlpricing BOOLEAN,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    isinventoryitem BOOLEAN,
    isrptaxinclusive BOOLEAN,
    itemdesc TEXT,
    extdescpresent BOOLEAN,
    regularind TEXT,
    reordlvl DOUBLE PRECISION,
    eoq DOUBLE PRECISION,
    minordqty DOUBLE PRECISION,
    lastpurchprice NUMERIC,
    currentcost NUMERIC,
    jwlmetalind TEXT,
    jwlcaratage INTEGER,
    jwlgrosswt DOUBLE PRECISION,
    jwlstonewt DOUBLE PRECISION,
    jwlwtfactor DOUBLE PRECISION,
    jwlratefactor NUMERIC,
    jwlstoneval NUMERIC,
    jwlmakecharge NUMERIC,
    jwlvalfactor NUMERIC,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    mfgdate TIMESTAMP WITH TIME ZONE,
    expdate TIMESTAMP WITH TIME ZONE,
    shelflife INTEGER,
    imagepresent BOOLEAN,
    isbillable BOOLEAN,
    isservice BOOLEAN,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    ccstockno TEXT,
    gradecd TEXT,
    imageid TEXT,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    merchid TEXT,
    discid INTEGER,
    discper INTEGER,
    discamt INTEGER,
    discsqlqry TEXT,
    pricefactorid INTEGER,
    pricefactorper INTEGER,
    pricefactoramt INTEGER,
    pricefactorsqlqry TEXT,
    addonid INTEGER,
    addonper NUMERIC,
    addonamt NUMERIC,
    addonsqlqry TEXT,
    dednid INTEGER,
    dednper NUMERIC,
    dednamt NUMERIC,
    dednsqlqry TEXT,
    edid INTEGER,
    edper NUMERIC,
    edamt NUMERIC,
    edsqlqry TEXT,
    finalmrp NUMERIC,
    isconsignmentitem BOOLEAN,
    flgstocktake INTEGER,
    flgratealterable INTEGER,
    flgstockchkappl INTEGER,
    stocktolerance NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    batchapplicable INTEGER,
    gradeapplicable INTEGER,
    locationapplicable INTEGER,
    batchnoflag INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmasterbackup_store_id ON public.itemmasterbackup(store_id);
ALTER TABLE public.itemmasterbackup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmasterbackup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmasterbackup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmasterconfig
CREATE TABLE IF NOT EXISTS public.itemmasterconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    fid TEXT,
    fn TEXT,
    fc TEXT,
    flag1 INTEGER,
    flag2 INTEGER,
    flag3 INTEGER,
    flag4 INTEGER,
    validrule1 TEXT,
    validrule2 TEXT,
    validrule3 TEXT,
    validrule1message TEXT,
    validrule2message TEXT,
    validrule3message TEXT,
    remarks TEXT,
    defaultvaue TEXT,
    exceptions TEXT,
    sysparamtitleid TEXT,
    boundtolookup TEXT,
    boundtolookupid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmasterconfig_store_id ON public.itemmasterconfig(store_id);
ALTER TABLE public.itemmasterconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmasterconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmasterconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmasterextd01
CREATE TABLE IF NOT EXISTS public.itemmasterextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    batchmfgdate TIMESTAMP WITH TIME ZONE,
    batchmfgformat INTEGER,
    batchmfgdatestring TEXT,
    batchexpdate TIMESTAMP WITH TIME ZONE,
    batchexpformat INTEGER,
    batchexpdatestring TEXT,
    batchshelflife INTEGER,
    batchremarks TEXT,
    linksrccompcode TEXT,
    linkdocno INTEGER,
    linkdestcompcode TEXT,
    linkslabno INTEGER,
    activeflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmasterextd01_store_id ON public.itemmasterextd01(store_id);
ALTER TABLE public.itemmasterextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmasterextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmasterextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemmasterlog
CREATE TABLE IF NOT EXISTS public.itemmasterlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sysdate TIMESTAMP WITH TIME ZONE,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systime TIMESTAMP WITH TIME ZONE,
    mode TEXT,
    isnewpm BOOLEAN,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    leastsalableqty NUMERIC,
    usejwlpricing BOOLEAN,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    isinventoryitem BOOLEAN,
    isrptaxinclusive BOOLEAN,
    itemdesc TEXT,
    extdescpresent BOOLEAN,
    regularind TEXT,
    reordlvl NUMERIC,
    eoq NUMERIC,
    minordqty NUMERIC,
    lastpurchprice NUMERIC,
    currentcost NUMERIC,
    jwlmetalind TEXT,
    jwlcaratage INTEGER,
    jwlgrosswt NUMERIC,
    jwlstonewt NUMERIC,
    jwlwtfactor NUMERIC,
    jwlratefactor NUMERIC,
    jwlstoneval NUMERIC,
    jwlmakecharge NUMERIC,
    jwlvalfactor NUMERIC,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    mfgdate TIMESTAMP WITH TIME ZONE,
    expdate TIMESTAMP WITH TIME ZONE,
    shelflife INTEGER,
    imagepresent BOOLEAN,
    isbillable BOOLEAN,
    isservice BOOLEAN,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    ccstockno TEXT,
    gradecd TEXT,
    imageid TEXT,
    merchid TEXT,
    discid INTEGER,
    discper INTEGER,
    discamt INTEGER,
    discsqlqry TEXT,
    pricefactorid INTEGER,
    pricefactorper INTEGER,
    pricefactoramt INTEGER,
    pricefactorsqlqry TEXT,
    addonid INTEGER,
    addonper NUMERIC,
    addonamt NUMERIC,
    addonsqlqry TEXT,
    dednid INTEGER,
    dednper NUMERIC,
    dednamt NUMERIC,
    dednsqlqry TEXT,
    edid INTEGER,
    edper NUMERIC,
    edamt NUMERIC,
    edsqlqry TEXT,
    finalmrp NUMERIC,
    isconsignmentitem BOOLEAN,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    flgstocktake INTEGER,
    flgratealterable INTEGER,
    flgstockchkappl INTEGER,
    stocktolerance NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemmasterlog_store_id ON public.itemmasterlog(store_id);
ALTER TABLE public.itemmasterlog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemmasterlog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemmasterlog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemreclassconfig
CREATE TABLE IF NOT EXISTS public.itemreclassconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    fldid TEXT,
    flddbcolname TEXT,
    fldterminology TEXT,
    flddefaultname TEXT,
    filterorder INTEGER,
    filterflag INTEGER,
    replaceorder INTEGER,
    replaceflag INTEGER,
    loookupdtls TEXT,
    filterdatatype TEXT,
    replacedatatype TEXT,
    datalen INTEGER,
    filtercontroltype TEXT,
    replacecontroltype TEXT,
    attribtype INTEGER,
    previewflag INTEGER,
    allowedop TEXT,
    allowedinswap TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemreclassconfig_store_id ON public.itemreclassconfig(store_id);
ALTER TABLE public.itemreclassconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemreclassconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemreclassconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemreclassdtls
CREATE TABLE IF NOT EXISTS public.itemreclassdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ircid TEXT,
    srlno INTEGER,
    frindicator TEXT,
    frindsrlno INTEGER,
    fldid TEXT,
    flddbcolname TEXT,
    fldterminology TEXT,
    flddefaultname TEXT,
    fldfilterdatatype TEXT,
    fldfiltercondition TEXT,
    fldfiltercurvalue TEXT,
    fldreplacedatatype TEXT,
    fldreplaceoption TEXT,
    fldreplacenewvalue TEXT,
    fldreplaceid TEXT,
    fldreplacedbcolname TEXT,
    ititemclassfld INTEGER,
    sqlbatchno INTEGER,
    sqlstmt TEXT,
    sqlindependent INTEGER,
    sqlexcuteatbegin INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemreclassdtls_store_id ON public.itemreclassdtls(store_id);
ALTER TABLE public.itemreclassdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemreclassdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemreclassdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemreclassheader
CREATE TABLE IF NOT EXISTS public.itemreclassheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ircid TEXT,
    ircstatus INTEGER,
    approvedflag INTEGER,
    createdat INTEGER,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    narration TEXT,
    filterflag INTEGER,
    runmultiple INTEGER,
    runinimport INTEGER,
    runinmenu INTEGER,
    runindaybegin INTEGER,
    runsqlstmt INTEGER,
    atho INTEGER,
    athorunno INTEGER,
    atholastrundate TIMESTAMP WITH TIME ZONE,
    atpos INTEGER,
    atposrunno INTEGER,
    atposlastrundate TIMESTAMP WITH TIME ZONE,
    atreplpos INTEGER,
    atreplposrunno INTEGER,
    atreplposlastrundate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemreclassheader_store_id ON public.itemreclassheader(store_id);
ALTER TABLE public.itemreclassheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemreclassheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemreclassheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemsfromho
CREATE TABLE IF NOT EXISTS public.itemsfromho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    guid TEXT,
    hostockno TEXT,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    class1desc TEXT,
    class2desc TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    subclass1desc TEXT,
    subclass2desc TEXT,
    sizecd TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    superclass1desc TEXT,
    superclass2desc TEXT,
    analcode1 TEXT,
    analdesc1 TEXT,
    analcode2 TEXT,
    analdesc2 TEXT,
    analcode3 TEXT,
    analdesc3 TEXT,
    analcode4 TEXT,
    analdesc4 TEXT,
    analcode5 TEXT,
    analdesc5 TEXT,
    analcode6 TEXT,
    analdesc6 TEXT,
    analcode7 TEXT,
    analdesc7 TEXT,
    analcode8 TEXT,
    analdesc8 TEXT,
    analcode9 TEXT,
    analdesc9 TEXT,
    analcode10 TEXT,
    analdesc10 TEXT,
    analcode11 TEXT,
    analdesc11 TEXT,
    analcode12 TEXT,
    analdesc12 TEXT,
    analcode13 TEXT,
    analdesc13 TEXT,
    analcode14 TEXT,
    analdesc14 TEXT,
    analcode15 TEXT,
    analdesc15 TEXT,
    analcode16 TEXT,
    analdesc16 TEXT,
    analcode17 TEXT,
    analdesc17 TEXT,
    analcode18 TEXT,
    analdesc18 TEXT,
    analcode19 TEXT,
    analdesc19 TEXT,
    analcode20 TEXT,
    analdesc20 TEXT,
    analcode21 TEXT,
    analdesc21 TEXT,
    analcode22 TEXT,
    analdesc22 TEXT,
    analcode23 TEXT,
    analdesc23 TEXT,
    analcode24 TEXT,
    analdesc24 TEXT,
    analcode25 TEXT,
    analdesc25 TEXT,
    analcode26 TEXT,
    analdesc26 TEXT,
    analcode27 TEXT,
    analdesc27 TEXT,
    analcode28 TEXT,
    analdesc28 TEXT,
    analcode29 TEXT,
    analdesc29 TEXT,
    analcode30 TEXT,
    analdesc30 TEXT,
    analcode31 TEXT,
    analdesc31 TEXT,
    analcode32 TEXT,
    analdesc32 TEXT,
    prodtaxtype TEXT,
    prodtaxdesc TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemsfromho_store_id ON public.itemsfromho(store_id);
ALTER TABLE public.itemsfromho ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemsfromho' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemsfromho FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemtagconfig
CREATE TABLE IF NOT EXISTS public.itemtagconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    class1cd TEXT,
    class2cd TEXT,
    fieldsrlno INTEGER,
    fieldname TEXT,
    fieldcaption TEXT,
    fieldapplicable INTEGER,
    fieldtype INTEGER,
    fieldminlength INTEGER,
    fieldmaxlength INTEGER,
    fieldlinkid INTEGER,
    activeflag INTEGER,
    fldapppreviousstatus INTEGER,
    fldappischanged INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemtagconfig_store_id ON public.itemtagconfig(store_id);
ALTER TABLE public.itemtagconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemtagconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemtagconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemtagconfigfromho
CREATE TABLE IF NOT EXISTS public.itemtagconfigfromho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    class1cd TEXT,
    class2cd TEXT,
    fieldsrlno INTEGER,
    fieldname TEXT,
    fieldcaption TEXT,
    fieldapplicable INTEGER,
    fieldtype INTEGER,
    fieldminlength INTEGER,
    fieldmaxlength INTEGER,
    fieldlinkid INTEGER,
    activeflag INTEGER,
    fldapppreviousstatus INTEGER,
    fldappischanged INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemtagconfigfromho_store_id ON public.itemtagconfigfromho(store_id);
ALTER TABLE public.itemtagconfigfromho ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemtagconfigfromho' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemtagconfigfromho FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: itemtagdtls
CREATE TABLE IF NOT EXISTS public.itemtagdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class2cd TEXT,
    itemtag1 TEXT,
    qty NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_itemtagdtls_store_id ON public.itemtagdtls(store_id);
ALTER TABLE public.itemtagdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itemtagdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.itemtagdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: kpidtls
CREATE TABLE IF NOT EXISTS public.kpidtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    showroomcode TEXT,
    showroomname TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    expectedwalkincount INTEGER,
    walkincount INTEGER,
    countofpurchases INTEGER,
    countoftransferins INTEGER,
    countofsalertn INTEGER,
    countofapprovrtns INTEGER,
    countofmiscrcpts INTEGER,
    countofvoidsales INTEGER,
    countofvoidpurchasertns INTEGER,
    countofvoidtransferouts INTEGER,
    countofvoidapprovissues INTEGER,
    countofvoidmiscissues INTEGER,
    countofsales INTEGER,
    countoftransferouts INTEGER,
    countofpurchasertn INTEGER,
    countofapprovissues INTEGER,
    countofmiscissues INTEGER,
    countofvoidsalesrtns INTEGER,
    countofvoidpurchase INTEGER,
    countofvoidtransferin INTEGER,
    countofvoidapprovrtns INTEGER,
    countofvoidmiscrcpts INTEGER,
    totsalevalue NUMERIC,
    tottaxamt NUMERIC,
    totaddons NUMERIC,
    totdeductions NUMERIC,
    totdiscount NUMERIC,
    totnetsalesval NUMERIC,
    totunitssold DOUBLE PRECISION,
    totsalertnval NUMERIC,
    totsalertntaxamt NUMERIC,
    totsalertnaddons NUMERIC,
    totsalertndeductions NUMERIC,
    totsalertndiscount NUMERIC,
    totnetsalertnval NUMERIC,
    totunitsrtnd DOUBLE PRECISION,
    totcustcomplaints INTEGER,
    totsalespersonabsent INTEGER,
    totsalespersonpresent INTEGER,
    countofcustomers INTEGER,
    floorpolished BOOLEAN,
    painted BOOLEAN,
    elevationcleaned BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_kpidtls_store_id ON public.kpidtls(store_id);
ALTER TABLE public.kpidtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpidtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.kpidtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logagentactivity
CREATE TABLE IF NOT EXISTS public.logagentactivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    logsrlno INTEGER,
    task_id TEXT,
    task_subno NUMERIC,
    transdt TIMESTAMP WITH TIME ZONE,
    shoperdt TIMESTAMP WITH TIME ZONE,
    actvexe TEXT,
    pgmopt TEXT,
    flag TEXT,
    remarks TEXT,
    hocompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logagentactivity_store_id ON public.logagentactivity(store_id);
ALTER TABLE public.logagentactivity ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logagentactivity' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logagentactivity FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logdataextractdetail
CREATE TABLE IF NOT EXISTS public.logdataextractdetail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    logsrlno INTEGER,
    runnumber INTEGER,
    transdate TIMESTAMP WITH TIME ZONE,
    typeoffile TEXT,
    reason TEXT,
    description TEXT,
    hocompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logdataextractdetail_store_id ON public.logdataextractdetail(store_id);
ALTER TABLE public.logdataextractdetail ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logdataextractdetail' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logdataextractdetail FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logdataextractsummary
CREATE TABLE IF NOT EXISTS public.logdataextractsummary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    runnumber INTEGER,
    shoper_sysdt TIMESTAMP WITH TIME ZONE,
    fileid TEXT,
    task_id TEXT,
    batchno INTEGER,
    batch_ctrno INTEGER,
    filecnt_day INTEGER,
    dttime_runstart TIMESTAMP WITH TIME ZONE,
    dttime_runend TIMESTAMP WITH TIME ZONE,
    consistencycheck_starttime TIMESTAMP WITH TIME ZONE,
    consistencycheck_endtime TIMESTAMP WITH TIME ZONE,
    ctrlnochk TEXT,
    docnochk TEXT,
    stk_sale_cntchk TEXT,
    delete_rec TEXT,
    docno_cont TEXT,
    pos_diff TEXT,
    hdramt_mismatch TEXT,
    hocompcd TEXT,
    ack_dt TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logdataextractsummary_store_id ON public.logdataextractsummary(store_id);
ALTER TABLE public.logdataextractsummary ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logdataextractsummary' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logdataextractsummary FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logdatasync
CREATE TABLE IF NOT EXISTS public.logdatasync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    logsrlno INTEGER,
    fileid TEXT,
    mode_comm TEXT,
    mode_dtls TEXT,
    trans_dt TIMESTAMP WITH TIME ZONE,
    ack_dt TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    hocompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logdatasync_store_id ON public.logdatasync(store_id);
ALTER TABLE public.logdatasync ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logdatasync' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logdatasync FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logdbtuningconfig
CREATE TABLE IF NOT EXISTS public.logdbtuningconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    srlno INTEGER,
    execdt TIMESTAMP WITH TIME ZONE,
    type TEXT,
    groupcaption TEXT,
    subcaption TEXT,
    exec_command TEXT,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logdbtuningconfig_store_id ON public.logdbtuningconfig(store_id);
ALTER TABLE public.logdbtuningconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logdbtuningconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logdbtuningconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logtilldtls
CREATE TABLE IF NOT EXISTS public.logtilldtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrndt TIMESTAMP WITH TIME ZONE,
    nodeid TEXT,
    tillid TEXT,
    cashierid TEXT,
    shiftno TEXT,
    opentime TIMESTAMP WITH TIME ZONE,
    openreason TEXT,
    tillstatus TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logtilldtls_store_id ON public.logtilldtls(store_id);
ALTER TABLE public.logtilldtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logtilldtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logtilldtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logtrnsctrlno
CREATE TABLE IF NOT EXISTS public.logtrnsctrlno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code INTEGER,
    number INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logtrnsctrlno_store_id ON public.logtrnsctrlno(store_id);
ALTER TABLE public.logtrnsctrlno ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logtrnsctrlno' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logtrnsctrlno FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: logwgsync
CREATE TABLE IF NOT EXISTS public.logwgsync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    syncfilename TEXT,
    shoperdt TIMESTAMP WITH TIME ZONE,
    syncdt TIMESTAMP WITH TIME ZONE,
    syncoperation TEXT,
    syncfiletype TEXT,
    exporttranstype INTEGER,
    exporttransctrlno TEXT,
    ackdt TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_logwgsync_store_id ON public.logwgsync(store_id);
ALTER TABLE public.logwgsync ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logwgsync' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.logwgsync FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: lstloadeddtls
CREATE TABLE IF NOT EXISTS public.lstloadeddtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoper_sysdt TIMESTAMP WITH TIME ZONE,
    trntype INTEGER,
    docno INTEGER,
    docnoprefix TEXT,
    lastloadeddate TIMESTAMP WITH TIME ZONE,
    recordfounddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_lstloadeddtls_store_id ON public.lstloadeddtls(store_id);
ALTER TABLE public.lstloadeddtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lstloadeddtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.lstloadeddtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: mailinglist
CREATE TABLE IF NOT EXISTS public.mailinglist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    nm TEXT,
    streetaddr TEXT,
    town TEXT,
    postalcd TEXT,
    state TEXT,
    country TEXT,
    locality TEXT,
    offphone TEXT,
    homephone TEXT,
    mobilephone TEXT,
    faxno TEXT,
    email TEXT,
    email2 TEXT,
    email3 TEXT,
    contact TEXT,
    cattype TEXT,
    catcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_mailinglist_store_id ON public.mailinglist(store_id);
ALTER TABLE public.mailinglist ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mailinglist' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.mailinglist FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: messagecentre
CREATE TABLE IF NOT EXISTS public.messagecentre (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    msgid TEXT,
    msgsource TEXT,
    msgsubject TEXT,
    msgbody TEXT,
    priority INTEGER,
    displaydate TIMESTAMP WITH TIME ZONE,
    attachfilename TEXT,
    displayonreceive INTEGER,
    msgexpirydate TIMESTAMP WITH TIME ZONE,
    deletedflag INTEGER,
    createddate TIMESTAMP WITH TIME ZONE,
    createdby TEXT,
    posrcvddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_messagecentre_store_id ON public.messagecentre(store_id);
ALTER TABLE public.messagecentre ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messagecentre' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.messagecentre FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: messagecentrelog
CREATE TABLE IF NOT EXISTS public.messagecentrelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    msgid TEXT,
    msgsource TEXT,
    srlno INTEGER,
    userid TEXT,
    systemdate TIMESTAMP WITH TIME ZONE,
    shoperdate TIMESTAMP WITH TIME ZONE,
    readstatus INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_messagecentrelog_store_id ON public.messagecentrelog(store_id);
ALTER TABLE public.messagecentrelog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messagecentrelog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.messagecentrelog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: mismatchvalue
CREATE TABLE IF NOT EXISTS public.mismatchvalue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoper_sysdt TIMESTAMP WITH TIME ZONE,
    batchno INTEGER,
    transdate TIMESTAMP WITH TIME ZONE,
    posvalue INTEGER,
    headervalue INTEGER,
    detailvalue INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_mismatchvalue_store_id ON public.mismatchvalue(store_id);
ALTER TABLE public.mismatchvalue ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mismatchvalue' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.mismatchvalue FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: missingdocno
CREATE TABLE IF NOT EXISTS public.missingdocno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    tabletype TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_missingdocno_store_id ON public.missingdocno(store_id);
ALTER TABLE public.missingdocno ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'missingdocno' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.missingdocno FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: monthsummary
CREATE TABLE IF NOT EXISTS public.monthsummary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    yr INTEGER,
    monthno INTEGER,
    monthopbalqty NUMERIC,
    monthopbalval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_monthsummary_store_id ON public.monthsummary(store_id);
ALTER TABLE public.monthsummary ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthsummary' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.monthsummary FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: multipleprices
CREATE TABLE IF NOT EXISTS public.multipleprices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    docno INTEGER,
    destcompcode TEXT,
    filenumber TEXT,
    stockno TEXT,
    slabno INTEGER,
    batchsrlno TEXT,
    retailpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    retailpriceapplicableflag TEXT,
    retailpriceupbyordownby INTEGER,
    isrprateoramount TEXT,
    retailpricerevisionflag TEXT,
    retailpricechangebyval NUMERIC,
    retailpricevalue NUMERIC,
    dealerpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    dealerpriceapplicableflag TEXT,
    dealerpriceupbyordownby INTEGER,
    isdprateoramount TEXT,
    dealerpricerevisionflag TEXT,
    dealerpricechangebyval NUMERIC,
    dealerpricevalue NUMERIC,
    currentcosteffectivedate TIMESTAMP WITH TIME ZONE,
    currentcostapplicableflag TEXT,
    currentcostupbyordownby INTEGER,
    isccrateoramount TEXT,
    currentcostrevisionflag TEXT,
    currentcostchangebyval NUMERIC,
    currentcostvalue NUMERIC,
    lastpurchpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    lastpurchpriceapplicableflag TEXT,
    lastpurchpriceupbyordownby INTEGER,
    islpprateoramount TEXT,
    lastpurchpricerevisionflag TEXT,
    lastpurchpricechangebyval NUMERIC,
    lastpurchpricevalue NUMERIC,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    pgmmode TEXT,
    voidflag TEXT,
    serialnumber INTEGER,
    attributelevel TEXT,
    approvedflag INTEGER,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    currentcost NUMERIC,
    lastpurchprice NUMERIC,
    skulineno INTEGER,
    slno INTEGER,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    isactive INTEGER,
    isdefinedatho INTEGER,
    batchno TEXT,
    gradecd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_multipleprices_store_id ON public.multipleprices(store_id);
ALTER TABLE public.multipleprices ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'multipleprices' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.multipleprices FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: onacccrdtntlinktbldtls
CREATE TABLE IF NOT EXISTS public.onacccrdtntlinktbldtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    srlno INTEGER,
    subsrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    onaccdocnoprefix TEXT,
    onaccdocno INTEGER,
    onaccdocdt TIMESTAMP WITH TIME ZONE,
    saletrntype INTEGER,
    saletrnctrlno INTEGER,
    salecrdtntval NUMERIC,
    reuseablecrdtntval NUMERIC,
    paymode1val NUMERIC,
    paymode2val NUMERIC,
    paymode3val NUMERIC,
    paymode4val NUMERIC,
    paymode5val NUMERIC,
    paymode6val NUMERIC,
    paymode7val NUMERIC,
    paymode8val NUMERIC,
    paymode9val NUMERIC,
    paymode10val NUMERIC,
    paymentrecvamt NUMERIC,
    paymode11val NUMERIC,
    paymode12val NUMERIC,
    paymode13val NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_onacccrdtntlinktbldtls_store_id ON public.onacccrdtntlinktbldtls(store_id);
ALTER TABLE public.onacccrdtntlinktbldtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onacccrdtntlinktbldtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.onacccrdtntlinktbldtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: onacccrdtntlinktblhdr
CREATE TABLE IF NOT EXISTS public.onacccrdtntlinktblhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    srlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    custcd TEXT,
    onaccdocnoprefix TEXT,
    onaccdocno INTEGER,
    onaccdocdt TIMESTAMP WITH TIME ZONE,
    onaccfacevalue NUMERIC,
    onaccreusevalue NUMERIC,
    gentrntype INTEGER,
    gentrnctlno INTEGER,
    gendocnoprefix TEXT,
    gendocno INTEGER,
    gendocdt TIMESTAMP WITH TIME ZONE,
    voidind INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_onacccrdtntlinktblhdr_store_id ON public.onacccrdtntlinktblhdr(store_id);
ALTER TABLE public.onacccrdtntlinktblhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onacccrdtntlinktblhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.onacccrdtntlinktblhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: paymodeacceptconfig
CREATE TABLE IF NOT EXISTS public.paymodeacceptconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype TEXT,
    acptpaymode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_paymodeacceptconfig_store_id ON public.paymodeacceptconfig(store_id);
ALTER TABLE public.paymodeacceptconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'paymodeacceptconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.paymodeacceptconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: paymodeacceptdisplaydtls
CREATE TABLE IF NOT EXISTS public.paymodeacceptdisplaydtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymode INTEGER,
    index INTEGER,
    paycode TEXT,
    acptcap TEXT,
    dispcap TEXT,
    acptvisible INTEGER,
    dispvisible INTEGER,
    acptpos INTEGER,
    disppos INTEGER,
    acptdatatype INTEGER,
    dispdatatype INTEGER,
    acptwidth DOUBLE PRECISION,
    dispwidth DOUBLE PRECISION,
    acptalign INTEGER,
    dispalign INTEGER,
    acptfontname TEXT,
    dispfontname TEXT,
    acptfourcolour TEXT,
    dispfourcolour TEXT,
    acptfontsize DOUBLE PRECISION,
    dispfontsize DOUBLE PRECISION,
    acptrowhight DOUBLE PRECISION,
    disprowhight DOUBLE PRECISION,
    acptbackcolour TEXT,
    dispbackcolour TEXT,
    columnname TEXT,
    columnnmmappresent TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_paymodeacceptdisplaydtls_store_id ON public.paymodeacceptdisplaydtls(store_id);
ALTER TABLE public.paymodeacceptdisplaydtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'paymodeacceptdisplaydtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.paymodeacceptdisplaydtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: paymodeacceptdisplaydtlsextd
CREATE TABLE IF NOT EXISTS public.paymodeacceptdisplaydtlsextd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymode INTEGER,
    index INTEGER,
    paycode TEXT,
    acptcap TEXT,
    acptpos INTEGER,
    acptdatatype INTEGER,
    acptvisible INTEGER,
    acptwidth DOUBLE PRECISION,
    acptalign INTEGER,
    acptfontname TEXT,
    acptfourcolour TEXT,
    acptfontsize DOUBLE PRECISION,
    acptrowhight DOUBLE PRECISION,
    acptbackcolour TEXT,
    columnname TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_paymodeacceptdisplaydtlsextd_store_id ON public.paymodeacceptdisplaydtlsextd(store_id);
ALTER TABLE public.paymodeacceptdisplaydtlsextd ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'paymodeacceptdisplaydtlsextd' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.paymodeacceptdisplaydtlsextd FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: paymodeconfig
CREATE TABLE IF NOT EXISTS public.paymodeconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymodetype INTEGER,
    paymodetypedesc TEXT,
    billingcomponent INTEGER,
    submissioncomponent INTEGER,
    realisationcomponent INTEGER,
    activeflag INTEGER,
    typeofpaymode TEXT,
    userdefined INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_paymodeconfig_store_id ON public.paymodeconfig(store_id);
ALTER TABLE public.paymodeconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'paymodeconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.paymodeconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: paytermscat
CREATE TABLE IF NOT EXISTS public.paytermscat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    descr TEXT,
    advper INTEGER,
    ondispper INTEGER,
    ondelper INTEGER,
    crdtper INTEGER,
    totinstlmtper INTEGER,
    instlmtper INTEGER,
    instlmtcount INTEGER,
    instlmtperioduom INTEGER,
    instlmtperiod INTEGER,
    issueblankchq INTEGER,
    issuepdchq INTEGER,
    paymtmode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_paytermscat_store_id ON public.paytermscat(store_id);
ALTER TABLE public.paytermscat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'paytermscat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.paytermscat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pcbilldtls
CREATE TABLE IF NOT EXISTS public.pcbilldtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    posentrytype INTEGER,
    posctrlno INTEGER,
    posdocnoprefix TEXT,
    posdocno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    srlno INTEGER,
    paymodetype INTEGER,
    paymodecode TEXT,
    cardunitrate NUMERIC,
    noofcards INTEGER,
    retflag TEXT,
    carddtls TEXT,
    stktrntype INTEGER,
    stktrnctrlno INTEGER,
    stkdocnoprefix TEXT,
    stkdocno INTEGER,
    shoperdbver INTEGER,
    custcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pcbilldtls_store_id ON public.pcbilldtls(store_id);
ALTER TABLE public.pcbilldtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pcbilldtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pcbilldtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pdtfieldconfig
CREATE TABLE IF NOT EXISTS public.pdtfieldconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    fieldid TEXT,
    fieldcaption TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pdtfieldconfig_store_id ON public.pdtfieldconfig(store_id);
ALTER TABLE public.pdtfieldconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pdtfieldconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pdtfieldconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: personnel
CREATE TABLE IF NOT EXISTS public.personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    nm TEXT,
    type TEXT,
    maillstsrlno INTEGER,
    isuser BOOLEAN,
    loginid TEXT,
    loginpwd TEXT,
    userwt INTEGER,
    doj TIMESTAMP WITH TIME ZONE,
    dob TIMESTAMP WITH TIME ZONE,
    activeflag INTEGER,
    effectivedateofdeactivation TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    dateofcatalog TIMESTAMP WITH TIME ZONE,
    isdefinedatho INTEGER,
    allowinbilling INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_personnel_store_id ON public.personnel(store_id);
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personnel' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.personnel FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: personnelshrmwise
CREATE TABLE IF NOT EXISTS public.personnelshrmwise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    smcode TEXT,
    shrmcode TEXT,
    srlno INTEGER,
    fromdate TIMESTAMP WITH TIME ZONE,
    todate TIMESTAMP WITH TIME ZONE,
    activeflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_personnelshrmwise_store_id ON public.personnelshrmwise(store_id);
ALTER TABLE public.personnelshrmwise ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personnelshrmwise' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.personnelshrmwise FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pgmwisefeaturedtls
CREATE TABLE IF NOT EXISTS public.pgmwisefeaturedtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    featureid INTEGER,
    programid TEXT,
    srlno INTEGER,
    description TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pgmwisefeaturedtls_store_id ON public.pgmwisefeaturedtls(store_id);
ALTER TABLE public.pgmwisefeaturedtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pgmwisefeaturedtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pgmwisefeaturedtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystkdl
CREATE TABLE IF NOT EXISTS public.phystkdl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    field2 INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystkdl_store_id ON public.phystkdl(store_id);
ALTER TABLE public.phystkdl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystkdl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystkdl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystkdtls
CREATE TABLE IF NOT EXISTS public.phystkdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    phystkbatchno TEXT,
    pageno INTEGER,
    entsrlno INTEGER,
    colsrlno INTEGER,
    stkno TEXT,
    batchsrlno TEXT,
    locid TEXT,
    phystkqty DOUBLE PRECISION,
    entdt TIMESTAMP WITH TIME ZONE,
    enttime TIMESTAMP WITH TIME ZONE,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystkdtls_store_id ON public.phystkdtls(store_id);
ALTER TABLE public.phystkdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystkdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystkdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystkdtlsextd01
CREATE TABLE IF NOT EXISTS public.phystkdtlsextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    phystkbatchno TEXT,
    pageno INTEGER,
    entsrlno INTEGER,
    colsrlno INTEGER,
    stkno TEXT,
    batchsrlno TEXT,
    locid TEXT,
    phystkqty NUMERIC,
    entdt TIMESTAMP WITH TIME ZONE,
    enttime TIMESTAMP WITH TIME ZONE,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    c1 TEXT,
    c2 TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    srlno INTEGER,
    stksrlno INTEGER,
    linesrlno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystkdtlsextd01_store_id ON public.phystkdtlsextd01(store_id);
ALTER TABLE public.phystkdtlsextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystkdtlsextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystkdtlsextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystkhdr
CREATE TABLE IF NOT EXISTS public.phystkhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    phystkbatchno TEXT,
    itemclass1 TEXT,
    itemclass2 TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    locid TEXT,
    batchstdt TIMESTAMP WITH TIME ZONE,
    batchsttime TIMESTAMP WITH TIME ZONE,
    batchenddt TIMESTAMP WITH TIME ZONE,
    batchendtime TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystkhdr_store_id ON public.phystkhdr(store_id);
ALTER TABLE public.phystkhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystkhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystkhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystocktakingitembkup
CREATE TABLE IF NOT EXISTS public.phystocktakingitembkup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scopeid INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    itemdesc TEXT,
    currcost NUMERIC,
    mrp NUMERIC,
    soh DOUBLE PRECISION,
    phystock DOUBLE PRECISION,
    diffqty DOUBLE PRECISION,
    updtflag INTEGER,
    phystkbatchno TEXT,
    pageno INTEGER,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    locid TEXT,
    sc1cd TEXT,
    sc1desc TEXT,
    sc2cd TEXT,
    sc2desc TEXT,
    cls1cd TEXT,
    cls1desc TEXT,
    cls2cd TEXT,
    cls2desc TEXT,
    subcls1cd TEXT,
    subcls1desc TEXT,
    subcls2cd TEXT,
    subcls2desc TEXT,
    sizecd TEXT,
    userid TEXT,
    shoperdbver INTEGER,
    stktakemode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystocktakingitembkup_store_id ON public.phystocktakingitembkup(store_id);
ALTER TABLE public.phystocktakingitembkup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystocktakingitembkup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystocktakingitembkup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystocktakingitembkup01
CREATE TABLE IF NOT EXISTS public.phystocktakingitembkup01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scopeid INTEGER,
    entsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    itemdesc TEXT,
    currcost NUMERIC,
    mrp NUMERIC,
    soh NUMERIC,
    phystock NUMERIC,
    diffqty NUMERIC,
    updtflag INTEGER,
    phystkbatchno TEXT,
    pageno INTEGER,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    locid TEXT,
    sc1cd TEXT,
    sc1desc TEXT,
    sc2cd TEXT,
    sc2desc TEXT,
    cls1cd TEXT,
    cls1desc TEXT,
    cls2cd TEXT,
    cls2desc TEXT,
    subcls1cd TEXT,
    subcls1desc TEXT,
    subcls2cd TEXT,
    subcls2desc TEXT,
    sizecd TEXT,
    userid TEXT,
    stktakemode TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystocktakingitembkup01_store_id ON public.phystocktakingitembkup01(store_id);
ALTER TABLE public.phystocktakingitembkup01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystocktakingitembkup01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystocktakingitembkup01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phystocktakingitembkup02
CREATE TABLE IF NOT EXISTS public.phystocktakingitembkup02 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scopeid INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    soh NUMERIC,
    phystock NUMERIC,
    diffqty NUMERIC,
    phystkbatchno TEXT,
    pageno INTEGER,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    userid TEXT,
    stktakemode TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phystocktakingitembkup02_store_id ON public.phystocktakingitembkup02(store_id);
ALTER TABLE public.phystocktakingitembkup02 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phystocktakingitembkup02' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phystocktakingitembkup02 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstkdtlssumm
CREATE TABLE IF NOT EXISTS public.phytmpstkdtlssumm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    phystockqty NUMERIC,
    userid TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstkdtlssumm_store_id ON public.phytmpstkdtlssumm(store_id);
ALTER TABLE public.phytmpstkdtlssumm ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstkdtlssumm' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstkdtlssumm FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstktrndtls
CREATE TABLE IF NOT EXISTS public.phytmpstktrndtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    entsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    locnid TEXT,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    ordentsrlno INTEGER,
    ordentsubsrlno INTEGER,
    refdoctype INTEGER,
    refdocnoprefix TEXT,
    refdocno INTEGER,
    refentsrlno INTEGER,
    docqty DOUBLE PRECISION,
    phyqtyin DOUBLE PRECISION,
    phyqtyout DOUBLE PRECISION,
    stkupdtrate NUMERIC,
    stkupdtvaluein NUMERIC,
    stkupdtvalueout NUMERIC,
    docentrate NUMERIC,
    docentvalue NUMERIC,
    docenttotdisc NUMERIC,
    docentvalaftdisc NUMERIC,
    docenttax NUMERIC,
    docentaddons NUMERIC,
    docentdedns NUMERIC,
    docentnetvalue NUMERIC,
    physqtyreturned DOUBLE PRECISION,
    docentbeftaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxaddons NUMERIC,
    docentafttaxdedns NUMERIC,
    docentdisc NUMERIC,
    docentdiscid TEXT,
    docentbilldisc NUMERIC,
    docentvoidind BOOLEAN,
    itemtaxtype TEXT,
    custtaxtype TEXT,
    srctaxtype TEXT,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    retnreasoncd TEXT,
    fwdreftrntype INTEGER,
    fwdrefctrlno INTEGER,
    fwdrefdocentsrlno INTEGER,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    backrefdocentsrlno INTEGER,
    billpassind INTEGER,
    salespersoncd TEXT,
    userid TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstktrndtls_store_id ON public.phytmpstktrndtls(store_id);
ALTER TABLE public.phytmpstktrndtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstktrndtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstktrndtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstktrndtlsextd01
CREATE TABLE IF NOT EXISTS public.phytmpstktrndtlsextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    phyqtyin NUMERIC,
    phyqtyout NUMERIC,
    docvoidind INTEGER,
    phyqtyreturned NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    docentdiscid TEXT,
    fldapplicable INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstktrndtlsextd01_store_id ON public.phytmpstktrndtlsextd01(store_id);
ALTER TABLE public.phytmpstktrndtlsextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstktrndtlsextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstktrndtlsextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstocktakingitem
CREATE TABLE IF NOT EXISTS public.phytmpstocktakingitem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    itemdesc TEXT,
    currcost NUMERIC,
    mrp NUMERIC,
    soh NUMERIC,
    phystock NUMERIC,
    diffqty NUMERIC,
    updtflag INTEGER,
    phystkbatchno TEXT,
    pageno INTEGER,
    entsrlno INTEGER,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    locid TEXT,
    sc1cd TEXT,
    sc1desc TEXT,
    sc2cd TEXT,
    sc2desc TEXT,
    cls1cd TEXT,
    cls1desc TEXT,
    cls2cd TEXT,
    cls2desc TEXT,
    subcls1cd TEXT,
    subcls1desc TEXT,
    subcls2cd TEXT,
    subcls2desc TEXT,
    sizecd TEXT,
    userid TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    srlnoapplicability INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstocktakingitem_store_id ON public.phytmpstocktakingitem(store_id);
ALTER TABLE public.phytmpstocktakingitem ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstocktakingitem' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstocktakingitem FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstocktakingitemextd01
CREATE TABLE IF NOT EXISTS public.phytmpstocktakingitemextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    cls1cd TEXT,
    cls2cd TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    soh NUMERIC,
    phystock NUMERIC,
    diffqty NUMERIC,
    phystkbatchno TEXT,
    pageno INTEGER,
    entsrlno INTEGER,
    recdt TIMESTAMP WITH TIME ZONE,
    rectime TIMESTAMP WITH TIME ZONE,
    srlnoapplicability INTEGER,
    fldapplicable INTEGER,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstocktakingitemextd01_store_id ON public.phytmpstocktakingitemextd01(store_id);
ALTER TABLE public.phytmpstocktakingitemextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstocktakingitemextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstocktakingitemextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstocktakingprogresssumm
CREATE TABLE IF NOT EXISTS public.phytmpstocktakingprogresssumm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    itemdesc TEXT,
    stktakemode TEXT,
    currcost NUMERIC,
    mrp NUMERIC,
    soh NUMERIC,
    phystock NUMERIC,
    phystkbatchno TEXT,
    sc1cd TEXT,
    sc1desc TEXT,
    sc2cd TEXT,
    sc2desc TEXT,
    cls1cd TEXT,
    cls1desc TEXT,
    cls2cd TEXT,
    cls2desc TEXT,
    subcls1cd TEXT,
    subcls1desc TEXT,
    subcls2cd TEXT,
    subcls2desc TEXT,
    sizecd TEXT,
    nofczs INTEGER,
    noiwphystk INTEGER,
    noiwophystk INTEGER,
    userid TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstocktakingprogresssumm_store_id ON public.phytmpstocktakingprogresssumm(store_id);
ALTER TABLE public.phytmpstocktakingprogresssumm ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstocktakingprogresssumm' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstocktakingprogresssumm FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: phytmpstocktakingsc
CREATE TABLE IF NOT EXISTS public.phytmpstocktakingsc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sc1cd TEXT,
    sc1desc TEXT,
    sc2cd TEXT,
    sc2desc TEXT,
    cls1cd TEXT,
    cls1desc TEXT,
    cls2cd TEXT,
    cls2desc TEXT,
    subcls1cd TEXT,
    subcls1desc TEXT,
    subcls2cd TEXT,
    subcls2desc TEXT,
    sizecd TEXT,
    nofsku INTEGER,
    bookstock NUMERIC,
    phystk NUMERIC,
    scope TEXT,
    scopeid INTEGER,
    userid TEXT,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_phytmpstocktakingsc_store_id ON public.phytmpstocktakingsc(store_id);
ALTER TABLE public.phytmpstocktakingsc ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phytmpstocktakingsc' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.phytmpstocktakingsc FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: posactivitylogdtls
CREATE TABLE IF NOT EXISTS public.posactivitylogdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ctrlnumber INTEGER,
    systemdatetime TIMESTAMP WITH TIME ZONE,
    srlno INTEGER,
    tblname TEXT,
    recordcounttextfile INTEGER,
    insertrecordcounttable INTEGER,
    updaterecordcounttable INTEGER,
    status TEXT,
    systemstarttime TIMESTAMP WITH TIME ZONE,
    systemendtime TIMESTAMP WITH TIME ZONE,
    hocompcd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_posactivitylogdtls_store_id ON public.posactivitylogdtls(store_id);
ALTER TABLE public.posactivitylogdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posactivitylogdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.posactivitylogdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: posactivityloghdr
CREATE TABLE IF NOT EXISTS public.posactivityloghdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ctrlnumber INTEGER,
    systemdatetime TIMESTAMP WITH TIME ZONE,
    shoperdate TIMESTAMP WITH TIME ZONE,
    shopersysstatus TEXT,
    programname TEXT,
    programoption INTEGER,
    programdesc TEXT,
    programversioninfo TEXT,
    file_name TEXT,
    filesize TEXT,
    status TEXT,
    systemstarttime TIMESTAMP WITH TIME ZONE,
    systemendtime TIMESTAMP WITH TIME ZONE,
    shoperdbver INTEGER,
    hocompcd TEXT,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_posactivityloghdr_store_id ON public.posactivityloghdr(store_id);
ALTER TABLE public.posactivityloghdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posactivityloghdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.posactivityloghdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: poscashtrn
CREATE TABLE IF NOT EXISTS public.poscashtrn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    entrytype INTEGER,
    ctrlno INTEGER,
    entsrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    doctime TIMESTAMP WITH TIME ZONE,
    salereftrntype INTEGER,
    salerefdocprefix TEXT,
    salerefdocno INTEGER,
    paymodetype INTEGER,
    paymodecode TEXT,
    paidunits NUMERIC,
    appliedconvrate NUMERIC,
    tendermodercptamt NUMERIC,
    loccurrrcptamt NUMERIC,
    loccurrpaidamt NUMERIC,
    loccurrnetamt NUMERIC,
    startcpnno INTEGER,
    endcpnno INTEGER,
    tenderrefelem1 TEXT,
    tenderrefelem2 TEXT,
    tenderrefelem3 TEXT,
    tenderrefelem4 TEXT,
    tenderrefelem5 TEXT,
    tenderrefelem6 TEXT,
    tenderrefelem7 TEXT,
    tenderrefelem8 TEXT,
    tenderrefelem9 TEXT,
    tenderrefelem10 TEXT,
    custid TEXT,
    narration TEXT,
    reasoncd TEXT,
    subagencyid TEXT,
    amtrealized NUMERIC,
    agencycomm NUMERIC,
    totvalused NUMERIC,
    fwdrefenttype INTEGER,
    fwdrefctrlno INTEGER,
    fwdrefentsrlno INTEGER,
    bkwdrefenttype INTEGER,
    bkwdrefctrlno INTEGER,
    bkwdrefentsrlno INTEGER,
    recstatus INTEGER,
    cashierid TEXT,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    salerefctrlno INTEGER,
    shoperdbver INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    tilltrntype INTEGER,
    tilltrnctrlno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_poscashtrn_store_id ON public.poscashtrn(store_id);
ALTER TABLE public.poscashtrn ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poscashtrn' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.poscashtrn FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: poscashtrnextd01
CREATE TABLE IF NOT EXISTS public.poscashtrnextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    entrytype INTEGER,
    ctrlno INTEGER,
    entsrlno INTEGER,
    entsubsrlno INTEGER,
    paymodecode TEXT,
    paymentsubcode TEXT,
    paymentsubdesc TEXT,
    payothdtlscode TEXT,
    payothdtlsdesc TEXT,
    valuetype TEXT,
    unitorrate NUMERIC,
    netamount NUMERIC,
    othvalues TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_poscashtrnextd01_store_id ON public.poscashtrnextd01(store_id);
ALTER TABLE public.poscashtrnextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poscashtrnextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.poscashtrnextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: poslstloadeddtls
CREATE TABLE IF NOT EXISTS public.poslstloadeddtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoper_sysdt TIMESTAMP WITH TIME ZONE,
    entrytype INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    lastloadeddate TIMESTAMP WITH TIME ZONE,
    recordfounddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_poslstloadeddtls_store_id ON public.poslstloadeddtls(store_id);
ALTER TABLE public.poslstloadeddtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poslstloadeddtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.poslstloadeddtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: posmodebalances
CREATE TABLE IF NOT EXISTS public.posmodebalances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    baltype TEXT,
    baldate TIMESTAMP WITH TIME ZONE,
    balposmode NUMERIC,
    balposcode TEXT,
    balamt NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_posmodebalances_store_id ON public.posmodebalances(store_id);
ALTER TABLE public.posmodebalances ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posmodebalances' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.posmodebalances FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: posmodedatadtls
CREATE TABLE IF NOT EXISTS public.posmodedatadtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    fld1 INTEGER,
    fld2 TEXT,
    fld3 TEXT,
    fld4 TEXT,
    fld5 INTEGER,
    fld6 INTEGER,
    fld7 TIMESTAMP WITH TIME ZONE,
    fld8 TIMESTAMP WITH TIME ZONE,
    fld9 TEXT,
    fld10 TEXT,
    fld11 TEXT,
    fld12 INTEGER,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_posmodedatadtls_store_id ON public.posmodedatadtls(store_id);
ALTER TABLE public.posmodedatadtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posmodedatadtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.posmodedatadtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pospaymodes
CREATE TABLE IF NOT EXISTS public.pospaymodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paymodetype INTEGER,
    paymodecode TEXT,
    srlnoapplicable BOOLEAN,
    percentageofbillamt BOOLEAN,
    tenderpervalue NUMERIC,
    billingrefcompcount INTEGER,
    submitrefcompcount INTEGER,
    realizerefcompcount INTEGER,
    tenderrefelem1cap TEXT,
    tenderrefelem1type INTEGER,
    tenderrefelem2cap TEXT,
    tenderrefelem2type INTEGER,
    tenderrefelem3cap TEXT,
    tenderrefelem3type INTEGER,
    tenderrefelem4cap TEXT,
    tenderrefelem4type INTEGER,
    tenderrefelem5cap TEXT,
    tenderrefelem5type INTEGER,
    tenderrefelem6cap TEXT,
    tenderrefelem6type INTEGER,
    tenderrefelem7cap TEXT,
    tenderrefelem7type INTEGER,
    tenderrefelem8cap TEXT,
    tenderrefelem8type INTEGER,
    tenderrefelem9cap TEXT,
    tenderrefelem9type INTEGER,
    tenderrefelem10cap TEXT,
    tenderrefelem10type INTEGER,
    isenabled BOOLEAN,
    tenderrefelem1mask INTEGER,
    tenderrefelem1lsegment TEXT,
    tenderrefelem1rsegment TEXT,
    tenderrefelem1minmax TEXT,
    tenderrefelem2mask INTEGER,
    tenderrefelem2lsegment TEXT,
    tenderrefelem2rsegment TEXT,
    tenderrefelem2minmax TEXT,
    tenderrefelem3mask INTEGER,
    tenderrefelem3lsegment TEXT,
    tenderrefelem3rsegment TEXT,
    tenderrefelem3minmax TEXT,
    tenderrefelem4mask INTEGER,
    tenderrefelem4lsegment TEXT,
    tenderrefelem4rsegment TEXT,
    tenderrefelem4minmax TEXT,
    tenderrefelem5mask INTEGER,
    tenderrefelem5lsegment TEXT,
    tenderrefelem5rsegment TEXT,
    tenderrefelem5minmax TEXT,
    tenderrefelem6mask INTEGER,
    tenderrefelem6lsegment TEXT,
    tenderrefelem6rsegment TEXT,
    tenderrefelem6minmax TEXT,
    tenderrefelem7mask INTEGER,
    tenderrefelem7lsegment TEXT,
    tenderrefelem7rsegment TEXT,
    tenderrefelem7minmax TEXT,
    tenderrefelem8mask INTEGER,
    tenderrefelem8lsegment TEXT,
    tenderrefelem8rsegment TEXT,
    tenderrefelem8minmax TEXT,
    tenderrefelem9mask INTEGER,
    tenderrefelem9lsegment TEXT,
    tenderrefelem9rsegment TEXT,
    tenderrefelem9minmax TEXT,
    tenderrefelem10mask INTEGER,
    tenderrefelem10lsegment TEXT,
    tenderrefelem10rsegment TEXT,
    tenderrefelem10minmax TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pospaymodes_store_id ON public.pospaymodes(store_id);
ALTER TABLE public.pospaymodes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pospaymodes' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pospaymodes FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixconfig
CREATE TABLE IF NOT EXISTS public.prefixconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    slno INTEGER,
    trntype TEXT,
    opid TEXT,
    trnname TEXT,
    trnsubname TEXT,
    isactive INTEGER,
    terminalwiseprefix INTEGER,
    numberreset INTEGER,
    sameprefixforsubtran INTEGER,
    parenttrntype TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixconfig_store_id ON public.prefixconfig(store_id);
ALTER TABLE public.prefixconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixdoclog
CREATE TABLE IF NOT EXISTS public.prefixdoclog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype TEXT,
    prefix TEXT,
    docno INTEGER,
    errdesc TEXT,
    systemdt TIMESTAMP WITH TIME ZONE,
    userid TEXT,
    terminalid TEXT,
    docnodllver TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixdoclog_store_id ON public.prefixdoclog(store_id);
ALTER TABLE public.prefixdoclog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixdoclog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixdoclog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixmaster
CREATE TABLE IF NOT EXISTS public.prefixmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype TEXT,
    opid TEXT,
    terminalgroupid TEXT,
    srlno INTEGER,
    prefix TEXT,
    baseprefix TEXT,
    suffix TEXT,
    isactive INTEGER,
    resetrequired INTEGER,
    resettype TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixmaster_store_id ON public.prefixmaster(store_id);
ALTER TABLE public.prefixmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixterminalgroups
CREATE TABLE IF NOT EXISTS public.prefixterminalgroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    terminalgroupid TEXT,
    srlno INTEGER,
    terminalid TEXT,
    terminalgroupdescr TEXT,
    isactive INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixterminalgroups_store_id ON public.prefixterminalgroups(store_id);
ALTER TABLE public.prefixterminalgroups ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixterminalgroups' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixterminalgroups FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixtrnlog
CREATE TABLE IF NOT EXISTS public.prefixtrnlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    fld1 TEXT,
    fld2 TEXT,
    fld3 TEXT,
    fld4 INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixtrnlog_store_id ON public.prefixtrnlog(store_id);
ALTER TABLE public.prefixtrnlog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixtrnlog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixtrnlog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: prefixtrnno
CREATE TABLE IF NOT EXISTS public.prefixtrnno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype TEXT,
    actualprefix TEXT,
    docnumber INTEGER,
    isactive INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_prefixtrnno_store_id ON public.prefixtrnno(store_id);
ALTER TABLE public.prefixtrnno ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prefixtrnno' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.prefixtrnno FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: priceloadinglog
CREATE TABLE IF NOT EXISTS public.priceloadinglog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    shoperdt TIMESTAMP WITH TIME ZONE,
    systemdt TIMESTAMP WITH TIME ZONE,
    primsec TEXT,
    sku TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    oldmrp NUMERIC,
    newmrp NUMERIC,
    status INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_priceloadinglog_store_id ON public.priceloadinglog(store_id);
ALTER TABLE public.priceloadinglog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'priceloadinglog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.priceloadinglog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pricerange
CREATE TABLE IF NOT EXISTS public.pricerange (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    pricetype INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    srlno INTEGER,
    showroomprofilecode TEXT,
    pricegroupname TEXT,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    prcatid INTEGER,
    prcatdesc TEXT,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    sellingprice NUMERIC,
    preminprice NUMERIC,
    premaxprice NUMERIC,
    minprice NUMERIC,
    maxprice NUMERIC,
    activeflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    ildapplicable INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricerange_store_id ON public.pricerange(store_id);
ALTER TABLE public.pricerange ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricerange' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pricerange FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pricerangecatdtls
CREATE TABLE IF NOT EXISTS public.pricerangecatdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    prcatid INTEGER,
    srlno INTEGER,
    prcatcode TEXT,
    prcatnm TEXT,
    prcatstatus INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricerangecatdtls_store_id ON public.pricerangecatdtls(store_id);
ALTER TABLE public.pricerangecatdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricerangecatdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pricerangecatdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pricerangesettings
CREATE TABLE IF NOT EXISTS public.pricerangesettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    fldtype INTEGER,
    fldid INTEGER,
    fldname TEXT,
    fldcaption TEXT,
    flddatatype TEXT,
    fldenabled INTEGER,
    fldcondition1 TEXT,
    fldcondition2 TEXT,
    fldcondition3 TEXT,
    fldorder INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricerangesettings_store_id ON public.pricerangesettings(store_id);
ALTER TABLE public.pricerangesettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricerangesettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pricerangesettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pricerevision
CREATE TABLE IF NOT EXISTS public.pricerevision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    docno INTEGER,
    destcompcode TEXT,
    filenumber TEXT,
    serialnumber TEXT,
    stockno TEXT,
    batchsrlno TEXT,
    retailpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isrprateoramount TEXT,
    retailpricerevisionflag TEXT,
    retailpricevalue NUMERIC,
    dealerpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isdprateoramount TEXT,
    dealerpricerevisionflag TEXT,
    dealerpricevalue NUMERIC,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    pgmmode TEXT,
    voidflag TEXT,
    shoperdbver INTEGER,
    attributelevel TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    approvedflag INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricerevision_store_id ON public.pricerevision(store_id);
ALTER TABLE public.pricerevision ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricerevision' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pricerevision FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pricerevisionhistory
CREATE TABLE IF NOT EXISTS public.pricerevisionhistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    docno INTEGER,
    destcompcode TEXT,
    filenumber TEXT,
    serialnumber TEXT,
    stockno TEXT,
    batchsrlno TEXT,
    retailpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isrprateoramount TEXT,
    retailpricerevisionflag TEXT,
    retailpricevalue NUMERIC,
    retailpriceold NUMERIC,
    retailpricenew NUMERIC,
    dealerpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isdprateoramount TEXT,
    dealerpricerevisionflag TEXT,
    dealerpricevalue NUMERIC,
    dealerpriceold NUMERIC,
    dealerpricenew NUMERIC,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    pgmmode TEXT,
    daybeginshoperdate TIMESTAMP WITH TIME ZONE,
    daybeginsystemdate TIMESTAMP WITH TIME ZONE,
    voidflag TEXT,
    shoperdbver INTEGER,
    attributelevel TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    approvedflag INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricerevisionhistory_store_id ON public.pricerevisionhistory(store_id);
ALTER TABLE public.pricerevisionhistory ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricerevisionhistory' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pricerevisionhistory FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printbusinesshandlermaster
CREATE TABLE IF NOT EXISTS public.printbusinesshandlermaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    bushandlerid TEXT,
    bhlibfilepath TEXT,
    bhclassname TEXT,
    bhcaption TEXT,
    bhtype TEXT,
    remarks TEXT,
    isactive INTEGER,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printbusinesshandlermaster_store_id ON public.printbusinesshandlermaster(store_id);
ALTER TABLE public.printbusinesshandlermaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printbusinesshandlermaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printbusinesshandlermaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printconfigsetting
CREATE TABLE IF NOT EXISTS public.printconfigsetting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    configsettingid TEXT,
    configparamid TEXT,
    configparamdesc TEXT,
    configparamvalue TEXT,
    configparamdatatype TEXT,
    configparamtype TEXT,
    isactive INTEGER,
    remarks TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printconfigsetting_store_id ON public.printconfigsetting(store_id);
ALTER TABLE public.printconfigsetting ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printconfigsetting' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printconfigsetting FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printconfigsettingmaster
CREATE TABLE IF NOT EXISTS public.printconfigsettingmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    configsettingid TEXT,
    configsettingname TEXT,
    configsettingtype TEXT,
    isactive INTEGER,
    remarks TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printconfigsettingmaster_store_id ON public.printconfigsettingmaster(store_id);
ALTER TABLE public.printconfigsettingmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printconfigsettingmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printconfigsettingmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printlinkedrefinterface
CREATE TABLE IF NOT EXISTS public.printlinkedrefinterface (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    linkedrefid TEXT,
    linkedrefcaption TEXT,
    bushandlerid TEXT,
    renhandlerid TEXT,
    configsettingid TEXT,
    linkedrefexecutionorder INTEGER,
    lrtype TEXT,
    isactive INTEGER,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printlinkedrefinterface_store_id ON public.printlinkedrefinterface(store_id);
ALTER TABLE public.printlinkedrefinterface ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printlinkedrefinterface' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printlinkedrefinterface FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printlinkedreflookup
CREATE TABLE IF NOT EXISTS public.printlinkedreflookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntypeidentifier INTEGER,
    linkedrefid TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printlinkedreflookup_store_id ON public.printlinkedreflookup(store_id);
ALTER TABLE public.printlinkedreflookup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printlinkedreflookup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printlinkedreflookup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printnodetrnconfigmaster
CREATE TABLE IF NOT EXISTS public.printnodetrnconfigmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    nodeid TEXT,
    trntypeidentifier INTEGER,
    trntypeidcaption TEXT,
    trntypegroup TEXT,
    displayorder INTEGER,
    linkedrefid TEXT,
    trnlinkedrefexecutionorder INTEGER,
    printpreference INTEGER,
    isactive INTEGER,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printnodetrnconfigmaster_store_id ON public.printnodetrnconfigmaster(store_id);
ALTER TABLE public.printnodetrnconfigmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printnodetrnconfigmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printnodetrnconfigmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printrenderermaster
CREATE TABLE IF NOT EXISTS public.printrenderermaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    renhandlerid TEXT,
    renlibfilepath TEXT,
    renclassname TEXT,
    rencaption TEXT,
    rentype TEXT,
    isactive INTEGER,
    remarks TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printrenderermaster_store_id ON public.printrenderermaster(store_id);
ALTER TABLE public.printrenderermaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printrenderermaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printrenderermaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: printtemplateconfigdtls
CREATE TABLE IF NOT EXISTS public.printtemplateconfigdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    linkrefid TEXT,
    terminalid TEXT,
    trntype INTEGER,
    templatename TEXT,
    templatetype TEXT,
    showprintpreview INTEGER,
    additionaldetails1 TEXT,
    additionaldetails2 TEXT,
    additionaldetails3 TEXT,
    additionaldetails4 TEXT,
    additionaldetails5 TEXT,
    conditionaltemplateid TEXT,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_printtemplateconfigdtls_store_id ON public.printtemplateconfigdtls(store_id);
ALTER TABLE public.printtemplateconfigdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printtemplateconfigdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.printtemplateconfigdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoarapplcustdtls
CREATE TABLE IF NOT EXISTS public.promoarapplcustdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    custpricegroup TEXT,
    custcode TEXT,
    custclass1code TEXT,
    custclass2code TEXT,
    custclass3code TEXT,
    custclass4code TEXT,
    custclass5code TEXT,
    custprofile1code TEXT,
    custprofile2code TEXT,
    custprofile3code TEXT,
    custprofile4code TEXT,
    custprofile5code TEXT,
    custloyaltyid TEXT,
    custdesttaxcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoarapplcustdtls_store_id ON public.promoarapplcustdtls(store_id);
ALTER TABLE public.promoarapplcustdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoarapplcustdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoarapplcustdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoarbilllvldiscdtls
CREATE TABLE IF NOT EXISTS public.promoarbilllvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    salespromosrlno INTEGER,
    srlno INTEGER,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billdiscpercent NUMERIC,
    billdiscamount NUMERIC,
    billmaxdiscpercent NUMERIC,
    billmaxdiscamount NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoarbilllvldiscdtls_store_id ON public.promoarbilllvldiscdtls(store_id);
ALTER TABLE public.promoarbilllvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoarbilllvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoarbilllvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoarbuyitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promoarbuyitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemofferbuyqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoarbuyitemgrpdtls_store_id ON public.promoarbuyitemgrpdtls(store_id);
ALTER TABLE public.promoarbuyitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoarbuyitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoarbuyitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoargetitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promoargetitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemoffergetqty NUMERIC,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billlvloffergetqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoargetitemgrpdtls_store_id ON public.promoargetitemgrpdtls(store_id);
ALTER TABLE public.promoargetitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoargetitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoargetitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoarheader
CREATE TABLE IF NOT EXISTS public.promoarheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    salespromosrlno INTEGER,
    salespromodesc TEXT,
    status INTEGER,
    priorityno INTEGER,
    definitioncreatedat INTEGER,
    createdshoperdate TIMESTAMP WITH TIME ZONE,
    createdsystemdate TIMESTAMP WITH TIME ZONE,
    startdate TIMESTAMP WITH TIME ZONE,
    starttime TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    endtime TIMESTAMP WITH TIME ZONE,
    weekdays TEXT,
    applicablehappyhours INTEGER,
    happyhoursstarttime TIMESTAMP WITH TIME ZONE,
    happyhoursendtime TIMESTAMP WITH TIME ZONE,
    definitiontype INTEGER,
    definitionlevel INTEGER,
    fixedorvariable INTEGER,
    itemlvldiscounttype INTEGER,
    itemlvloffertype INTEGER,
    itemlvlofferbuyngetitemsaresame INTEGER,
    itemlvldefvariesonbuyingrateval INTEGER,
    itemlvlbuyingratevaluecond INTEGER,
    itemlvldefvariesonbuyingqty INTEGER,
    billlvldiscounttype INTEGER,
    billlvloffertype INTEGER,
    bldefvariesonbillvalqty INTEGER,
    bldefvariesonbillvalqtycond INTEGER,
    freeofferitemtype INTEGER,
    applicableitems INTEGER,
    applicablecustomers INTEGER,
    canbecombined INTEGER,
    archived INTEGER,
    userid TEXT,
    exportedflag INTEGER,
    exporteddate TIMESTAMP WITH TIME ZONE,
    importedflag INTEGER,
    importeddate TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    archprocesstype INTEGER,
    archbatchno INTEGER,
    archshoperdate TIMESTAMP WITH TIME ZONE,
    archsystemdate TIMESTAMP WITH TIME ZONE,
    multipleratecond INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoarheader_store_id ON public.promoarheader(store_id);
ALTER TABLE public.promoarheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoarheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoarheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoaritemlvldiscdtls
CREATE TABLE IF NOT EXISTS public.promoaritemlvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    itemlvldiscbuyqty NUMERIC,
    itemdiscpercent NUMERIC,
    itemdiscamount NUMERIC,
    itemmaxdiscpercent NUMERIC,
    itemmaxdiscamount NUMERIC,
    itemdiscountedrate NUMERIC,
    allitemsatspecifiedval NUMERIC,
    sameitemofferbuyqty NUMERIC,
    sameitemoffergetqty NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoaritemlvldiscdtls_store_id ON public.promoaritemlvldiscdtls(store_id);
ALTER TABLE public.promoaritemlvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoaritemlvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoaritemlvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promoarshowroomdtls
CREATE TABLE IF NOT EXISTS public.promoarshowroomdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    status INTEGER,
    wearhouseorshowroom INTEGER,
    showroomclass TEXT,
    distributioncentre TEXT,
    country TEXT,
    zone TEXT,
    state TEXT,
    city TEXT,
    showroomcode TEXT,
    override INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promoarshowroomdtls_store_id ON public.promoarshowroomdtls(store_id);
ALTER TABLE public.promoarshowroomdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promoarshowroomdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promoarshowroomdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologapplcustdtls
CREATE TABLE IF NOT EXISTS public.promologapplcustdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    custpricegroup TEXT,
    custcode TEXT,
    custclass1code TEXT,
    custclass2code TEXT,
    custclass3code TEXT,
    custclass4code TEXT,
    custclass5code TEXT,
    custprofile1code TEXT,
    custprofile2code TEXT,
    custprofile3code TEXT,
    custprofile4code TEXT,
    custprofile5code TEXT,
    custloyaltyid TEXT,
    custdesttaxcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologapplcustdtls_store_id ON public.promologapplcustdtls(store_id);
ALTER TABLE public.promologapplcustdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologapplcustdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologapplcustdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologbilllvldiscdtls
CREATE TABLE IF NOT EXISTS public.promologbilllvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billdiscpercent NUMERIC,
    billdiscamount NUMERIC,
    billmaxdiscpercent NUMERIC,
    billmaxdiscamount NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologbilllvldiscdtls_store_id ON public.promologbilllvldiscdtls(store_id);
ALTER TABLE public.promologbilllvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologbilllvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologbilllvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologbuyitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promologbuyitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemofferbuyqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologbuyitemgrpdtls_store_id ON public.promologbuyitemgrpdtls(store_id);
ALTER TABLE public.promologbuyitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologbuyitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologbuyitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologgetitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promologgetitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemoffergetqty NUMERIC,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billlvloffergetqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologgetitemgrpdtls_store_id ON public.promologgetitemgrpdtls(store_id);
ALTER TABLE public.promologgetitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologgetitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologgetitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologheader
CREATE TABLE IF NOT EXISTS public.promologheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    salespromosrlno INTEGER,
    salespromodesc TEXT,
    status INTEGER,
    priorityno INTEGER,
    definitioncreatedat INTEGER,
    createdshoperdate TIMESTAMP WITH TIME ZONE,
    createdsystemdate TIMESTAMP WITH TIME ZONE,
    startdate TIMESTAMP WITH TIME ZONE,
    starttime TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    endtime TIMESTAMP WITH TIME ZONE,
    weekdays TEXT,
    applicablehappyhours INTEGER,
    happyhoursstarttime TIMESTAMP WITH TIME ZONE,
    happyhoursendtime TIMESTAMP WITH TIME ZONE,
    definitiontype INTEGER,
    definitionlevel INTEGER,
    fixedorvariable INTEGER,
    itemlvldiscounttype INTEGER,
    itemlvloffertype INTEGER,
    itemlvlofferbuyngetitemsaresame INTEGER,
    itemlvldefvariesonbuyingrateval INTEGER,
    itemlvlbuyingratevaluecond INTEGER,
    itemlvldefvariesonbuyingqty INTEGER,
    billlvldiscounttype INTEGER,
    billlvloffertype INTEGER,
    bldefvariesonbillvalqty INTEGER,
    bldefvariesonbillvalqtycond INTEGER,
    freeofferitemtype INTEGER,
    applicableitems INTEGER,
    applicablecustomers INTEGER,
    canbecombined INTEGER,
    archived INTEGER,
    userid TEXT,
    exportedflag INTEGER,
    exporteddate TIMESTAMP WITH TIME ZONE,
    importedflag INTEGER,
    importeddate TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    logprocesstype INTEGER,
    logbatchno INTEGER,
    logshoperdate TIMESTAMP WITH TIME ZONE,
    logsystemdate TIMESTAMP WITH TIME ZONE,
    multipleratecond INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologheader_store_id ON public.promologheader(store_id);
ALTER TABLE public.promologheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologitemlvldiscdtls
CREATE TABLE IF NOT EXISTS public.promologitemlvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    itemlvldiscbuyqty NUMERIC,
    itemdiscpercent NUMERIC,
    itemdiscamount NUMERIC,
    itemmaxdiscpercent NUMERIC,
    itemmaxdiscamount NUMERIC,
    itemdiscountedrate NUMERIC,
    allitemsatspecifiedval NUMERIC,
    sameitemofferbuyqty NUMERIC,
    sameitemoffergetqty NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologitemlvldiscdtls_store_id ON public.promologitemlvldiscdtls(store_id);
ALTER TABLE public.promologitemlvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologitemlvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologitemlvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promologshowroomdtls
CREATE TABLE IF NOT EXISTS public.promologshowroomdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    status INTEGER,
    wearhouseorshowroom INTEGER,
    showroomclass TEXT,
    distributioncentre TEXT,
    country TEXT,
    zone TEXT,
    state TEXT,
    city TEXT,
    showroomcode TEXT,
    override INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promologshowroomdtls_store_id ON public.promologshowroomdtls(store_id);
ALTER TABLE public.promologshowroomdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promologshowroomdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promologshowroomdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnapplcustdtls
CREATE TABLE IF NOT EXISTS public.promomnapplcustdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    custpricegroup TEXT,
    custcode TEXT,
    custclass1code TEXT,
    custclass2code TEXT,
    custclass3code TEXT,
    custclass4code TEXT,
    custclass5code TEXT,
    custprofile1code TEXT,
    custprofile2code TEXT,
    custprofile3code TEXT,
    custprofile4code TEXT,
    custprofile5code TEXT,
    custloyaltyid TEXT,
    custdesttaxcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnapplcustdtls_store_id ON public.promomnapplcustdtls(store_id);
ALTER TABLE public.promomnapplcustdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnapplcustdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnapplcustdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnbilllvldiscdtls
CREATE TABLE IF NOT EXISTS public.promomnbilllvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billdiscpercent NUMERIC,
    billdiscamount NUMERIC,
    billmaxdiscpercent NUMERIC,
    billmaxdiscamount NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnbilllvldiscdtls_store_id ON public.promomnbilllvldiscdtls(store_id);
ALTER TABLE public.promomnbilllvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnbilllvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnbilllvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnbuyitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promomnbuyitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemofferbuyqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    buyitemattriblvl TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnbuyitemgrpdtls_store_id ON public.promomnbuyitemgrpdtls(store_id);
ALTER TABLE public.promomnbuyitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnbuyitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnbuyitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomngetitemgrpdtls
CREATE TABLE IF NOT EXISTS public.promomngetitemgrpdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemoffergetqty NUMERIC,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billlvloffergetqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    getitemattriblvl TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomngetitemgrpdtls_store_id ON public.promomngetitemgrpdtls(store_id);
ALTER TABLE public.promomngetitemgrpdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomngetitemgrpdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomngetitemgrpdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnheader
CREATE TABLE IF NOT EXISTS public.promomnheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    salespromosrlno INTEGER,
    salespromodesc TEXT,
    status INTEGER,
    priorityno INTEGER,
    definitioncreatedat INTEGER,
    createdshoperdate TIMESTAMP WITH TIME ZONE,
    createdsystemdate TIMESTAMP WITH TIME ZONE,
    startdate TIMESTAMP WITH TIME ZONE,
    starttime TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    endtime TIMESTAMP WITH TIME ZONE,
    weekdays TEXT,
    applicablehappyhours INTEGER,
    happyhoursstarttime TIMESTAMP WITH TIME ZONE,
    happyhoursendtime TIMESTAMP WITH TIME ZONE,
    definitiontype INTEGER,
    definitionlevel INTEGER,
    fixedorvariable INTEGER,
    itemlvldiscounttype INTEGER,
    itemlvloffertype INTEGER,
    itemlvlofferbuyngetitemsaresame INTEGER,
    itemlvldefvariesonbuyingrateval INTEGER,
    itemlvlbuyingratevaluecond INTEGER,
    itemlvldefvariesonbuyingqty INTEGER,
    billlvldiscounttype INTEGER,
    billlvloffertype INTEGER,
    bldefvariesonbillvalqty INTEGER,
    bldefvariesonbillvalqtycond INTEGER,
    freeofferitemtype INTEGER,
    applicableitems INTEGER,
    applicablecustomers INTEGER,
    canbecombined INTEGER,
    archived INTEGER,
    userid TEXT,
    exportedflag INTEGER,
    exporteddate TIMESTAMP WITH TIME ZONE,
    importedflag INTEGER,
    importeddate TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    multipleratecond INTEGER,
    shoperdbver INTEGER,
    discrateamtind INTEGER,
    andcondition INTEGER,
    noofandconds INTEGER,
    lowesthighestpriceditem INTEGER,
    featureid INTEGER,
    andconditionfreeitem INTEGER,
    noofandcondsfreeitem INTEGER,
    salespromoid INTEGER,
    addlitemflag INTEGER,
    addlitemdisctype INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnheader_store_id ON public.promomnheader(store_id);
ALTER TABLE public.promomnheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnintermediate
CREATE TABLE IF NOT EXISTS public.promomnintermediate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    salespromocode TEXT,
    promodescription TEXT,
    buyorgetid INTEGER,
    setno INTEGER,
    shoperdate TIMESTAMP WITH TIME ZONE,
    createddate TIMESTAMP WITH TIME ZONE,
    applicablehappyhours INTEGER,
    happyhoursstarttime TIMESTAMP WITH TIME ZONE,
    happyhoursendtime TIMESTAMP WITH TIME ZONE,
    weekdays TEXT,
    applicablecustomers INTEGER,
    definationtype INTEGER,
    fixedorvariable INTEGER,
    itemlvldiscounttype INTEGER,
    buyingquantity NUMERIC,
    buyandgetsameitems INTEGER,
    itemlvldefvariesonbuyingqty INTEGER,
    itemlvlbuyingratevaluecond INTEGER,
    useimtable INTEGER,
    itemdiscpercent NUMERIC,
    itemdiscamount NUMERIC,
    itemdiscountedrate NUMERIC,
    itemmaxdiscpercent NUMERIC,
    itemmaxdiscamount NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnintermediate_store_id ON public.promomnintermediate(store_id);
ALTER TABLE public.promomnintermediate ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnintermediate' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnintermediate FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnitemlvldiscdtls
CREATE TABLE IF NOT EXISTS public.promomnitemlvldiscdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    itemlvldiscbuyqty NUMERIC,
    itemdiscpercent NUMERIC,
    itemdiscamount NUMERIC,
    itemmaxdiscpercent NUMERIC,
    itemmaxdiscamount NUMERIC,
    itemdiscountedrate NUMERIC,
    allitemsatspecifiedval NUMERIC,
    sameitemofferbuyqty NUMERIC,
    sameitemoffergetqty NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnitemlvldiscdtls_store_id ON public.promomnitemlvldiscdtls(store_id);
ALTER TABLE public.promomnitemlvldiscdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnitemlvldiscdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnitemlvldiscdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: promomnshowroomdtls
CREATE TABLE IF NOT EXISTS public.promomnshowroomdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    status INTEGER,
    wearhouseorshowroom INTEGER,
    showroomclass TEXT,
    distributioncentre TEXT,
    country TEXT,
    zone TEXT,
    state TEXT,
    city TEXT,
    showroomcode TEXT,
    override INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_promomnshowroomdtls_store_id ON public.promomnshowroomdtls(store_id);
ALTER TABLE public.promomnshowroomdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promomnshowroomdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.promomnshowroomdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: ptbrowsesuper
CREATE TABLE IF NOT EXISTS public.ptbrowsesuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    source TEXT,
    supcode TEXT,
    dcno TEXT,
    dcdate TIMESTAMP WITH TIME ZONE,
    docqty NUMERIC,
    actqty NUMERIC,
    penqty NUMERIC,
    billamt NUMERIC,
    status TEXT,
    filepath TEXT,
    addlsource TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_ptbrowsesuper_store_id ON public.ptbrowsesuper(store_id);
ALTER TABLE public.ptbrowsesuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ptbrowsesuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.ptbrowsesuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: ptdtlsuper
CREATE TABLE IF NOT EXISTS public.ptdtlsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docid INTEGER,
    suppcode TEXT,
    billno TEXT,
    billdate TIMESTAMP WITH TIME ZONE,
    docno TEXT,
    srlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class1desc TEXT,
    class2cd TEXT,
    class2desc TEXT,
    subclass1cd TEXT,
    subclass1desc TEXT,
    subclass2cd TEXT,
    subclass2desc TEXT,
    sizecd TEXT,
    qty NUMERIC,
    rate NUMERIC,
    itemvalue NUMERIC,
    retailprice NUMERIC,
    taxcd1 TEXT,
    leastqty NUMERIC,
    whslprice NUMERIC,
    taxcd2 TEXT,
    invind TEXT,
    taxinclind TEXT,
    taxrate NUMERIC,
    comprate NUMERIC,
    itemdesc TEXT,
    itemind TEXT,
    potype INTEGER,
    poprefix TEXT,
    ponumber INTEGER,
    posrlno INTEGER,
    posubsrlno INTEGER,
    prodtaxcd TEXT,
    reordlvl NUMERIC,
    eoq NUMERIC,
    minordqty NUMERIC,
    ispivotalsize TEXT,
    sizegroupid TEXT,
    sizegroupsrlno INTEGER,
    idealstockratio NUMERIC,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    prefvendorid TEXT,
    altvendorid1 TEXT,
    altvendorid2 TEXT,
    altvendorid3 TEXT,
    dlrprice NUMERIC,
    regularind TEXT,
    isbillable TEXT,
    isservice TEXT,
    analcode1 TEXT,
    analcode1desc TEXT,
    analcode2 TEXT,
    analcode2desc TEXT,
    analcode3 TEXT,
    analcode3desc TEXT,
    analcode4 TEXT,
    analcode4desc TEXT,
    analcode5 TEXT,
    analcode5desc TEXT,
    superclass1 TEXT,
    sc1desc TEXT,
    superclass2 TEXT,
    sc2desc TEXT,
    actualqty NUMERIC,
    gradecode TEXT,
    baleno TEXT,
    balesubsrlno TEXT,
    ccstockno TEXT,
    isconsignmentitem TEXT,
    docenttax NUMERIC,
    docentdisc NUMERIC,
    docentbeftaxaddons NUMERIC,
    docentafttaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxdedns NUMERIC,
    analcode6 TEXT,
    analcode6desc TEXT,
    analcode7 TEXT,
    analcode7desc TEXT,
    analcode8 TEXT,
    analcode8desc TEXT,
    analcode9 TEXT,
    analcode9desc TEXT,
    analcode10 TEXT,
    analcode10desc TEXT,
    analcode11 TEXT,
    analcode11desc TEXT,
    analcode12 TEXT,
    analcode12desc TEXT,
    analcode13 TEXT,
    analcode13desc TEXT,
    analcode14 TEXT,
    analcode14desc TEXT,
    analcode15 TEXT,
    analcode15desc TEXT,
    analcode16 TEXT,
    analcode16desc TEXT,
    analcode17 TEXT,
    analcode17desc TEXT,
    analcode18 TEXT,
    analcode18desc TEXT,
    analcode19 TEXT,
    analcode19desc TEXT,
    analcode20 TEXT,
    analcode20desc TEXT,
    analcode21 TEXT,
    analcode21desc TEXT,
    analcode22 TEXT,
    analcode22desc TEXT,
    analcode23 TEXT,
    analcode23desc TEXT,
    analcode24 TEXT,
    analcode24desc TEXT,
    analcode25 TEXT,
    analcode25desc TEXT,
    analcode26 TEXT,
    analcode26desc TEXT,
    analcode27 TEXT,
    analcode27desc TEXT,
    analcode28 TEXT,
    analcode28desc TEXT,
    analcode29 TEXT,
    analcode29desc TEXT,
    analcode30 TEXT,
    analcode30desc TEXT,
    analcode31 TEXT,
    analcode31desc TEXT,
    analcode32 TEXT,
    analcode32desc TEXT,
    imagepresent TEXT,
    imageid TEXT,
    finalmrp NUMERIC,
    mfgdate TEXT,
    expdate TEXT,
    shelflife INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_ptdtlsuper_store_id ON public.ptdtlsuper(store_id);
ALTER TABLE public.ptdtlsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ptdtlsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.ptdtlsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: pthdrsuper
CREATE TABLE IF NOT EXISTS public.pthdrsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docid INTEGER,
    docno TEXT,
    docsrlno INTEGER,
    suppcode TEXT,
    suppname TEXT,
    billno TEXT,
    billdate TIMESTAMP WITH TIME ZONE,
    billactddate TIMESTAMP WITH TIME ZONE,
    purchasevalue NUMERIC,
    noitems INTEGER,
    tax NUMERIC,
    addons NUMERIC,
    discount NUMERIC,
    dedns NUMERIC,
    billamt NUMERIC,
    opnind TEXT,
    stkvalind TEXT,
    loadind TEXT,
    fabilltype TEXT,
    doctype TEXT,
    dcno TEXT,
    dcdate TIMESTAMP WITH TIME ZONE,
    grnno TEXT,
    grndate TIMESTAMP WITH TIME ZONE,
    reasoncd TEXT,
    reasondesc TEXT,
    poprefix TEXT,
    ponumber INTEGER,
    srctaxcd TEXT,
    ptnewfmtid TEXT,
    ptrevind TEXT,
    ptdocrmks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_pthdrsuper_store_id ON public.pthdrsuper(store_id);
ALTER TABLE public.pthdrsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pthdrsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.pthdrsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: ptinvoicedtl
CREATE TABLE IF NOT EXISTS public.ptinvoicedtl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docid INTEGER,
    suppcode TEXT,
    billdate TIMESTAMP WITH TIME ZONE,
    billno TEXT,
    srlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class1desc TEXT,
    class2cd TEXT,
    class2desc TEXT,
    subclass1cd TEXT,
    subclass1desc TEXT,
    subclass2cd TEXT,
    subclass2desc TEXT,
    sizecd TEXT,
    qty NUMERIC,
    rate NUMERIC,
    itemvalue NUMERIC,
    retailprice NUMERIC,
    taxcd1 TEXT,
    leastqty NUMERIC,
    whslprice NUMERIC,
    taxcd2 TEXT,
    invind TEXT,
    taxinclind TEXT,
    taxrate NUMERIC,
    comprate NUMERIC,
    itemdesc TEXT,
    itemind TEXT,
    poprefix TEXT,
    ponumber INTEGER,
    posrlno INTEGER,
    prodtaxcd TEXT,
    reordlvl NUMERIC,
    eoq NUMERIC,
    minordqty NUMERIC,
    ispivotalsize TEXT,
    sizegroupid TEXT,
    sizegroupsrlno INTEGER,
    idealstockratio NUMERIC,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    prefvendorid TEXT,
    altvendorid1 TEXT,
    altvendorid2 TEXT,
    altvendorid3 TEXT,
    dlrprice NUMERIC,
    regularind TEXT,
    isbillable TEXT,
    isservice TEXT,
    analcode1 TEXT,
    analcode1desc TEXT,
    analcode2 TEXT,
    analcode2desc TEXT,
    analcode3 TEXT,
    analcode3desc TEXT,
    analcode4 TEXT,
    analcode4desc TEXT,
    analcode5 TEXT,
    analcode5desc TEXT,
    superclass1 TEXT,
    sc1desc TEXT,
    superclass2 TEXT,
    sc2desc TEXT,
    hold TEXT,
    reason TEXT,
    billat INTEGER,
    actualqty NUMERIC,
    gradecode TEXT,
    baleno TEXT,
    balesubsrlno TEXT,
    ccstockno TEXT,
    trntype INTEGER,
    pgmflag TEXT,
    updtflag TEXT,
    pocurrency TEXT,
    poconvrate NUMERIC,
    isconsignmentitem BOOLEAN,
    potype INTEGER,
    posubsrlno INTEGER,
    docenttax NUMERIC,
    docentdisc NUMERIC,
    docentbeftaxaddons NUMERIC,
    docentafttaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxdedns NUMERIC,
    analcode6 TEXT,
    analcode6desc TEXT,
    analcode7 TEXT,
    analcode7desc TEXT,
    analcode8 TEXT,
    analcode8desc TEXT,
    analcode9 TEXT,
    analcode9desc TEXT,
    analcode10 TEXT,
    analcode10desc TEXT,
    analcode11 TEXT,
    analcode11desc TEXT,
    analcode12 TEXT,
    analcode12desc TEXT,
    analcode13 TEXT,
    analcode13desc TEXT,
    analcode14 TEXT,
    analcode14desc TEXT,
    analcode15 TEXT,
    analcode15desc TEXT,
    analcode16 TEXT,
    analcode16desc TEXT,
    analcode17 TEXT,
    analcode17desc TEXT,
    analcode18 TEXT,
    analcode18desc TEXT,
    analcode19 TEXT,
    analcode19desc TEXT,
    analcode20 TEXT,
    analcode20desc TEXT,
    analcode21 TEXT,
    analcode21desc TEXT,
    analcode22 TEXT,
    analcode22desc TEXT,
    analcode23 TEXT,
    analcode23desc TEXT,
    analcode24 TEXT,
    analcode24desc TEXT,
    analcode25 TEXT,
    analcode25desc TEXT,
    analcode26 TEXT,
    analcode26desc TEXT,
    analcode27 TEXT,
    analcode27desc TEXT,
    analcode28 TEXT,
    analcode28desc TEXT,
    analcode29 TEXT,
    analcode29desc TEXT,
    analcode30 TEXT,
    analcode30desc TEXT,
    analcode31 TEXT,
    analcode31desc TEXT,
    analcode32 TEXT,
    analcode32desc TEXT,
    imagepresent TEXT,
    imageid TEXT,
    finalmrp NUMERIC,
    mfgdate TEXT,
    expdate TEXT,
    shelflife INTEGER,
    batchno TEXT,
    batchmfgdate TIMESTAMP WITH TIME ZONE,
    batchexpdate TIMESTAMP WITH TIME ZONE,
    batchshelflife INTEGER,
    batchremarks TEXT,
    batchpriceapp INTEGER,
    gradecd TEXT,
    gradedesc TEXT,
    gradepriceapp INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_ptinvoicedtl_store_id ON public.ptinvoicedtl(store_id);
ALTER TABLE public.ptinvoicedtl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ptinvoicedtl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.ptinvoicedtl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: ptinvoiceextd01
CREATE TABLE IF NOT EXISTS public.ptinvoiceextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    suppcode TEXT,
    showroomcode TEXT,
    billdate TIMESTAMP WITH TIME ZONE,
    billno TEXT,
    srlno INTEGER,
    subsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_ptinvoiceextd01_store_id ON public.ptinvoiceextd01(store_id);
ALTER TABLE public.ptinvoiceextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ptinvoiceextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.ptinvoiceextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: ptinvoicehdr
CREATE TABLE IF NOT EXISTS public.ptinvoicehdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docid INTEGER,
    docno TEXT,
    docsrlno INTEGER,
    suppcode TEXT,
    suppname TEXT,
    billno TEXT,
    billdate TIMESTAMP WITH TIME ZONE,
    billactddate TIMESTAMP WITH TIME ZONE,
    purchasevalue NUMERIC,
    noitems INTEGER,
    tax NUMERIC,
    addons NUMERIC,
    discount NUMERIC,
    dedns NUMERIC,
    billamt NUMERIC,
    opnind TEXT,
    stkvalind TEXT,
    loadind TEXT,
    fabilltype TEXT,
    doctype TEXT,
    dcno TEXT,
    dcdate TIMESTAMP WITH TIME ZONE,
    grnno TEXT,
    grndate TIMESTAMP WITH TIME ZONE,
    reasoncd TEXT,
    reasondesc TEXT,
    poprefix TEXT,
    ponumber INTEGER,
    srctaxcd TEXT,
    ptnewfmtid TEXT,
    ptrevind TEXT,
    ptdocrmks TEXT,
    trntype INTEGER,
    ptfilename TEXT,
    ptfilenamesubsrlno INTEGER,
    pgmflag TEXT,
    updtflag TEXT,
    pocurrency TEXT,
    poconvrate NUMERIC,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_ptinvoicehdr_store_id ON public.ptinvoicehdr(store_id);
ALTER TABLE public.ptinvoicehdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ptinvoicehdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.ptinvoicehdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchasetaxcat
CREATE TABLE IF NOT EXISTS public.purchasetaxcat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    desttaxtype TEXT,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    taxdesc TEXT,
    compcnt INTEGER,
    t1name TEXT,
    t1descr TEXT,
    t1type TEXT,
    t1derivedformula TEXT,
    t1compon TEXT,
    t1rate NUMERIC,
    t1taxinclusive BOOLEAN,
    t1taxprintbill BOOLEAN,
    t2name TEXT,
    t2descr TEXT,
    t2type TEXT,
    t2derivedformula TEXT,
    t2compon TEXT,
    t2rate NUMERIC,
    t2taxinclusive BOOLEAN,
    t2taxprintbill BOOLEAN,
    t3name TEXT,
    t3descr TEXT,
    t3type TEXT,
    t3derivedformula TEXT,
    t3compon TEXT,
    t3rate NUMERIC,
    t3taxinclusive BOOLEAN,
    t3taxprintbill BOOLEAN,
    t4name TEXT,
    t4descr TEXT,
    t4type TEXT,
    t4derivedformula TEXT,
    t4compon TEXT,
    t4rate NUMERIC,
    t4taxinclusive BOOLEAN,
    t4taxprintbill BOOLEAN,
    t5name TEXT,
    t5descr TEXT,
    t5type TEXT,
    t5derivedformula TEXT,
    t5compon TEXT,
    t5rate NUMERIC,
    t5taxinclusive BOOLEAN,
    t5taxprintbill BOOLEAN,
    haspretaxform BOOLEAN,
    pretaxformname TEXT,
    hasposttaxform BOOLEAN,
    posttaxformname TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchasetaxcat_store_id ON public.purchasetaxcat(store_id);
ALTER TABLE public.purchasetaxcat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchasetaxcat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchasetaxcat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchordconfig
CREATE TABLE IF NOT EXISTS public.purchordconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    classification TEXT,
    selected BOOLEAN,
    mandatory BOOLEAN,
    disporder INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchordconfig_store_id ON public.purchordconfig(store_id);
ALTER TABLE public.purchordconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchordconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchordconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchorddtl
CREATE TABLE IF NOT EXISTS public.purchorddtl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    potype INTEGER,
    ponoprefix TEXT,
    poctrlno INTEGER,
    deliverylocation TEXT,
    entrysrlno INTEGER,
    entrysubsrlno INTEGER,
    podate TIMESTAMP WITH TIME ZONE,
    itemclass1 TEXT,
    itemclass2 TEXT,
    itemsubclass1 TEXT,
    itemsubclass2 TEXT,
    itemsize TEXT,
    stockno TEXT,
    descr TEXT,
    purchordqty DOUBLE PRECISION,
    purchordrate NUMERIC,
    pocurrency TEXT,
    convrate NUMERIC,
    deldate TIMESTAMP WITH TIME ZONE,
    rcvdqty NUMERIC,
    planadhocind TEXT,
    poorgqty NUMERIC,
    poind TEXT,
    orderedmtrs NUMERIC,
    cancelqty NUMERIC,
    holdqty NUMERIC,
    buyercode DOUBLE PRECISION,
    posource INTEGER,
    sourcecompcd TEXT,
    poattributelevel TEXT,
    poappanlcount INTEGER,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    lineremarks TEXT,
    doclinegrossvalue NUMERIC,
    salestaxper NUMERIC,
    salestaxamt NUMERIC,
    addonbeftaxper NUMERIC,
    addonbeftaxamt NUMERIC,
    addonafttaxper NUMERIC,
    addonafttaxamt NUMERIC,
    deductbeftaxper NUMERIC,
    deductbeftaxamt NUMERIC,
    deductafttaxper NUMERIC,
    deductafttaxamt NUMERIC,
    discountbeftaxper NUMERIC,
    discountbeftaxamt NUMERIC,
    discountafttaxper NUMERIC,
    discountafttaxamt NUMERIC,
    addonbeftaxaprtndamt NUMERIC,
    addonafttaxaprtndamt NUMERIC,
    deductbeftaxaprtndamt NUMERIC,
    deductafttaxaprtndamt NUMERIC,
    discountbeftaxaprtndamt NUMERIC,
    discountafttaxaprtndamt NUMERIC,
    doclinenetvalue NUMERIC,
    linkpotype INTEGER,
    linkpoloccompcd TEXT,
    linkpoprefix TEXT,
    linkponumber INTEGER,
    linkpoentrysrlno INTEGER,
    linkpoentrysubsrlno INTEGER,
    poclosureflag INTEGER,
    poconsolflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastmodifieddt TIMESTAMP WITH TIME ZONE,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchorddtl_store_id ON public.purchorddtl(store_id);
ALTER TABLE public.purchorddtl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchorddtl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchorddtl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchordhdr
CREATE TABLE IF NOT EXISTS public.purchordhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    potype INTEGER,
    ponoprefix TEXT,
    poctrlno INTEGER,
    supptype TEXT,
    suppid TEXT,
    podate TIMESTAMP WITH TIME ZONE,
    ordcurrency TEXT,
    ordcurrencyval NUMERIC,
    convrate NUMERIC,
    loccurrencyval NUMERIC,
    deldate TIMESTAMP WITH TIME ZONE,
    shiptype TEXT,
    transmode TEXT,
    advanceper INTEGER,
    ordcurrencyadvval NUMERIC,
    loccurrencyadvval NUMERIC,
    creditdays INTEGER,
    isposizewise BOOLEAN,
    shipmentaddr TEXT,
    docremarks TEXT,
    delperiodindays INTEGER,
    isconsignmentitemspo BOOLEAN,
    buyercode DOUBLE PRECISION,
    sourcecompcd TEXT,
    posource INTEGER,
    povendertype TEXT,
    povendorid TEXT,
    pobilltovendortype TEXT,
    pobilltovendorid TEXT,
    addonbeftaxhdrper NUMERIC,
    addonafttaxhdrper NUMERIC,
    deductbeftaxhdrper NUMERIC,
    deductafttaxhdrper NUMERIC,
    discountbeftaxhdrper NUMERIC,
    discountafttaxhdrper NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastmodifieddt TIMESTAMP WITH TIME ZONE,
    closuredate TIMESTAMP WITH TIME ZONE,
    closureremarks TEXT,
    reopendatetime TIMESTAMP WITH TIME ZONE,
    reopenremarks TEXT,
    shoperdbver INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchordhdr_store_id ON public.purchordhdr(store_id);
ALTER TABLE public.purchordhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchordhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchordhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchordtrl
CREATE TABLE IF NOT EXISTS public.purchordtrl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ponoprefix TEXT,
    poctrlno INTEGER,
    entrysrlno INTEGER,
    entrytype TEXT,
    entryid TEXT,
    entryapponfrom INTEGER,
    entryapponto INTEGER,
    entrydesc TEXT,
    entryper DOUBLE PRECISION,
    ordcurrencyamt NUMERIC,
    convrate NUMERIC,
    loccurrencyamt NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchordtrl_store_id ON public.purchordtrl(store_id);
ALTER TABLE public.purchordtrl ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchordtrl' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchordtrl FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purchplan
CREATE TABLE IF NOT EXISTS public.purchplan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    startdt TIMESTAMP WITH TIME ZONE,
    enddt TIMESTAMP WITH TIME ZONE,
    deptsrlno INTEGER,
    merchsrlno INTEGER,
    entrysrlno INTEGER,
    planby TEXT,
    planref TEXT,
    deptname TEXT,
    merchname TEXT,
    storatio DOUBLE PRECISION,
    superclass1 TEXT,
    superclass2 TEXT,
    itemclass1 TEXT,
    itemclass2 TEXT,
    regularind TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    opstkqty DOUBLE PRECISION,
    opstkval NUMERIC,
    purchqty DOUBLE PRECISION,
    purchval NUMERIC,
    saleqty DOUBLE PRECISION,
    salecost NUMERIC,
    clstkqty DOUBLE PRECISION,
    clstkval NUMERIC,
    saleval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchplan_store_id ON public.purchplan(store_id);
ALTER TABLE public.purchplan ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchplan' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purchplan FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purgelogdtls
CREATE TABLE IF NOT EXISTS public.purgelogdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ctrlnumber INTEGER,
    srlno INTEGER,
    stockno TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purgelogdtls_store_id ON public.purgelogdtls(store_id);
ALTER TABLE public.purgelogdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purgelogdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purgelogdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: purgeloghdr
CREATE TABLE IF NOT EXISTS public.purgeloghdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    ctrlnumber INTEGER,
    purgedate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_purgeloghdr_store_id ON public.purgeloghdr(store_id);
ALTER TABLE public.purgeloghdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purgeloghdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.purgeloghdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: reportconfigpreferences
CREATE TABLE IF NOT EXISTS public.reportconfigpreferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    userid TEXT,
    taskid TEXT,
    defaultconfig INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_reportconfigpreferences_store_id ON public.reportconfigpreferences(store_id);
ALTER TABLE public.reportconfigpreferences ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reportconfigpreferences' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.reportconfigpreferences FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: reportconfigsettings
CREATE TABLE IF NOT EXISTS public.reportconfigsettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    configid INTEGER,
    configurationname TEXT,
    taskid TEXT,
    configuration TEXT,
    status INTEGER,
    createduser TEXT,
    allowedusers TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_reportconfigsettings_store_id ON public.reportconfigsettings(store_id);
ALTER TABLE public.reportconfigsettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reportconfigsettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.reportconfigsettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: reportdates
CREATE TABLE IF NOT EXISTS public.reportdates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sno TEXT,
    type TEXT,
    caption TEXT,
    formula_type TEXT,
    from_date_formula TEXT,
    to_date_formula TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_reportdates_store_id ON public.reportdates(store_id);
ALTER TABLE public.reportdates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reportdates' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.reportdates FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: rptselfilename
CREATE TABLE IF NOT EXISTS public.rptselfilename (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    exename TEXT,
    descr TEXT,
    filename TEXT,
    fld1 TEXT,
    fld2 TEXT,
    fld3 TEXT,
    fld4 TEXT,
    fld5 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_rptselfilename_store_id ON public.rptselfilename(store_id);
ALTER TABLE public.rptselfilename ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rptselfilename' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.rptselfilename FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: salesfactors
CREATE TABLE IF NOT EXISTS public.salesfactors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    type INTEGER,
    priorityno INTEGER,
    custpricegrpid TEXT,
    custcd TEXT,
    superclass1 TEXT,
    superclass2 TEXT,
    itemclass1 TEXT,
    itemclass2 TEXT,
    stockno TEXT,
    apppt INTEGER,
    compon INTEGER,
    discadddedid TEXT,
    isvariable BOOLEAN,
    israte INTEGER,
    rateamt NUMERIC,
    validitystdt TIMESTAMP WITH TIME ZONE,
    validitysttm TIMESTAMP WITH TIME ZONE,
    validityenddt TIMESTAMP WITH TIME ZONE,
    validityendtm TIMESTAMP WITH TIME ZONE,
    appwkdays TEXT,
    appsttm TIMESTAMP WITH TIME ZONE,
    appendtm TIMESTAMP WITH TIME ZONE,
    minappval NUMERIC,
    maxappval NUMERIC,
    sf_isservice BOOLEAN,
    sf_isinventoryitem BOOLEAN,
    sf_isconsignmentitem BOOLEAN,
    sf_isrptaxinclusive BOOLEAN,
    sf_regularind TEXT,
    sf_locnid TEXT,
    sf_ccstockno TEXT,
    sf_gradecd TEXT,
    sf_merchid TEXT,
    sf_imageid TEXT,
    sf_mfgdate TIMESTAMP WITH TIME ZONE,
    sf_expdate TIMESTAMP WITH TIME ZONE,
    sf_prodtaxtype TEXT,
    sf_srctaxtype TEXT,
    sf_batchsrlno TEXT,
    sf_subclass1cd TEXT,
    sf_subclass2cd TEXT,
    sf_sizecd TEXT,
    sf_analcode1 TEXT,
    sf_analcode2 TEXT,
    sf_analcode3 TEXT,
    sf_analcode4 TEXT,
    sf_analcode5 TEXT,
    sf_leastsalableqty NUMERIC,
    sf_retail_price NUMERIC,
    sf_dealer_price NUMERIC,
    sf_rtlmarkup NUMERIC,
    sf_dlrmarkup NUMERIC,
    sf_curbalqty NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_salesfactors_store_id ON public.salesfactors(store_id);
ALTER TABLE public.salesfactors ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salesfactors' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.salesfactors FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: salestaxcat
CREATE TABLE IF NOT EXISTS public.salestaxcat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    desttaxtype TEXT,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    taxdesc TEXT,
    compcnt INTEGER,
    t1name TEXT,
    t1descr TEXT,
    t1type TEXT,
    t1derivedformula TEXT,
    t1compon TEXT,
    t1rate NUMERIC,
    t1taxinclusive BOOLEAN,
    t1taxprintbill BOOLEAN,
    t2name TEXT,
    t2descr TEXT,
    t2type TEXT,
    t2derivedformula TEXT,
    t2compon TEXT,
    t2rate NUMERIC,
    t2taxinclusive BOOLEAN,
    t2taxprintbill BOOLEAN,
    t3name TEXT,
    t3descr TEXT,
    t3type TEXT,
    t3derivedformula TEXT,
    t3compon TEXT,
    t3rate NUMERIC,
    t3taxinclusive BOOLEAN,
    t3taxprintbill BOOLEAN,
    t4name TEXT,
    t4descr TEXT,
    t4type TEXT,
    t4derivedformula TEXT,
    t4compon TEXT,
    t4rate NUMERIC,
    t4taxinclusive BOOLEAN,
    t4taxprintbill BOOLEAN,
    t5name TEXT,
    t5descr TEXT,
    t5type TEXT,
    t5derivedformula TEXT,
    t5compon TEXT,
    t5rate NUMERIC,
    t5taxinclusive BOOLEAN,
    t5taxprintbill BOOLEAN,
    haspretaxform BOOLEAN,
    pretaxformname TEXT,
    hasposttaxform BOOLEAN,
    posttaxformname TEXT,
    taxrevisionid INTEGER,
    effectivedate TIMESTAMP WITH TIME ZONE,
    applieddate TIMESTAMP WITH TIME ZONE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    showroomcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_salestaxcat_store_id ON public.salestaxcat(store_id);
ALTER TABLE public.salestaxcat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salestaxcat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.salestaxcat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: salestaxrevision
CREATE TABLE IF NOT EXISTS public.salestaxrevision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    taxrevisionid INTEGER,
    desttaxtype TEXT,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    taxdesc TEXT,
    compcnt INTEGER,
    t1name TEXT,
    t1descr TEXT,
    t1type TEXT,
    t1derivedformula TEXT,
    t1compon TEXT,
    t1rate NUMERIC,
    t1taxinclusive BOOLEAN,
    t1taxprintbill BOOLEAN,
    t2name TEXT,
    t2descr TEXT,
    t2type TEXT,
    t2derivedformula TEXT,
    t2compon TEXT,
    t2rate NUMERIC,
    t2taxinclusive BOOLEAN,
    t2taxprintbill BOOLEAN,
    t3name TEXT,
    t3descr TEXT,
    t3type TEXT,
    t3derivedformula TEXT,
    t3compon TEXT,
    t3rate NUMERIC,
    t3taxinclusive BOOLEAN,
    t3taxprintbill BOOLEAN,
    t4name TEXT,
    t4descr TEXT,
    t4type TEXT,
    t4derivedformula TEXT,
    t4compon TEXT,
    t4rate NUMERIC,
    t4taxinclusive BOOLEAN,
    t4taxprintbill BOOLEAN,
    t5name TEXT,
    t5descr TEXT,
    t5type TEXT,
    t5derivedformula TEXT,
    t5compon TEXT,
    t5rate NUMERIC,
    t5taxinclusive BOOLEAN,
    t5taxprintbill BOOLEAN,
    haspretaxform BOOLEAN,
    pretaxformname TEXT,
    hasposttaxform BOOLEAN,
    posttaxformname TEXT,
    effectivedate TIMESTAMP WITH TIME ZONE,
    applieddate TIMESTAMP WITH TIME ZONE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    showroomcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_salestaxrevision_store_id ON public.salestaxrevision(store_id);
ALTER TABLE public.salestaxrevision ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salestaxrevision' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.salestaxrevision FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: salestaxrevisionhistory
CREATE TABLE IF NOT EXISTS public.salestaxrevisionhistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    taxrevisionid INTEGER,
    desttaxtype TEXT,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    taxdesc TEXT,
    compcnt INTEGER,
    t1name TEXT,
    t1descr TEXT,
    t1type TEXT,
    t1derivedformula TEXT,
    t1compon TEXT,
    t1rate NUMERIC,
    t1taxinclusive BOOLEAN,
    t1taxprintbill BOOLEAN,
    t2name TEXT,
    t2descr TEXT,
    t2type TEXT,
    t2derivedformula TEXT,
    t2compon TEXT,
    t2rate NUMERIC,
    t2taxinclusive BOOLEAN,
    t2taxprintbill BOOLEAN,
    t3name TEXT,
    t3descr TEXT,
    t3type TEXT,
    t3derivedformula TEXT,
    t3compon TEXT,
    t3rate NUMERIC,
    t3taxinclusive BOOLEAN,
    t3taxprintbill BOOLEAN,
    t4name TEXT,
    t4descr TEXT,
    t4type TEXT,
    t4derivedformula TEXT,
    t4compon TEXT,
    t4rate NUMERIC,
    t4taxinclusive BOOLEAN,
    t4taxprintbill BOOLEAN,
    t5name TEXT,
    t5descr TEXT,
    t5type TEXT,
    t5derivedformula TEXT,
    t5compon TEXT,
    t5rate NUMERIC,
    t5taxinclusive BOOLEAN,
    t5taxprintbill BOOLEAN,
    haspretaxform BOOLEAN,
    pretaxformname TEXT,
    hasposttaxform BOOLEAN,
    posttaxformname TEXT,
    effectivedate TIMESTAMP WITH TIME ZONE,
    applieddate TIMESTAMP WITH TIME ZONE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    showroomcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_salestaxrevisionhistory_store_id ON public.salestaxrevisionhistory(store_id);
ALTER TABLE public.salestaxrevisionhistory ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salestaxrevisionhistory' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.salestaxrevisionhistory FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: saletrnhdr
CREATE TABLE IF NOT EXISTS public.saletrnhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    saletrntype INTEGER,
    saletrnctrlno INTEGER,
    prodservind TEXT,
    billtype TEXT,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    doctime TIMESTAMP WITH TIME ZONE,
    fwdreftrntype INTEGER,
    fwdrefctrlno INTEGER,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    custcd TEXT,
    salespersoncd TEXT,
    cashiercd TEXT,
    custtaxtype TEXT,
    stktrntypesale INTEGER,
    stktrnctrlnosale INTEGER,
    stktrntypegift INTEGER,
    stktrnctrlnogift INTEGER,
    modeoftrans TEXT,
    transcd TEXT,
    transdocid TEXT,
    transdocdt TIMESTAMP WITH TIME ZONE,
    creditdays INTEGER,
    bankcd TEXT,
    presaletaxformyes BOOLEAN,
    presaletaxformnm TEXT,
    presaletaxformref TEXT,
    postsaletaxformyes BOOLEAN,
    postsaletaxformnm TEXT,
    postsaletaxformref TEXT,
    poscashtrntype INTEGER,
    poscashtrndocprefix TEXT,
    poscashtrndocno INTEGER,
    lastcopyno INTEGER,
    custinf1 TEXT,
    custinf2 TEXT,
    custinf3 TEXT,
    custinf4 TEXT,
    custinf5 TEXT,
    gendiscreason TEXT,
    transitdays INTEGER,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    paymodetype INTEGER,
    sfield1 TEXT,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_saletrnhdr_store_id ON public.saletrnhdr(store_id);
ALTER TABLE public.saletrnhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saletrnhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.saletrnhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: schemesdefinitiondtls
CREATE TABLE IF NOT EXISTS public.schemesdefinitiondtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    schemecode TEXT,
    srlno INTEGER,
    groupsrlno INTEGER,
    intermsof TEXT,
    schemevalue NUMERIC,
    basedon TEXT,
    slabfrom NUMERIC,
    slabto NUMERIC,
    stockno TEXT,
    attributelevel TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_schemesdefinitiondtls_store_id ON public.schemesdefinitiondtls(store_id);
ALTER TABLE public.schemesdefinitiondtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schemesdefinitiondtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.schemesdefinitiondtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: schemesdefinitionhdr
CREATE TABLE IF NOT EXISTS public.schemesdefinitionhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    schemecode TEXT,
    schemedescr TEXT,
    schemeon TEXT,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    iscommonforall INTEGER,
    schemestatus INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_schemesdefinitionhdr_store_id ON public.schemesdefinitionhdr(store_id);
ALTER TABLE public.schemesdefinitionhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schemesdefinitionhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.schemesdefinitionhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: schemespointsslabs
CREATE TABLE IF NOT EXISTS public.schemespointsslabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    schemecode TEXT,
    slabtype TEXT,
    srlno INTEGER,
    slabfrom NUMERIC,
    slabto NUMERIC,
    valueperpoint NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_schemespointsslabs_store_id ON public.schemespointsslabs(store_id);
ALTER TABLE public.schemespointsslabs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schemespointsslabs' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.schemespointsslabs FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: seasonsmaster
CREATE TABLE IF NOT EXISTS public.seasonsmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    seasonsname TEXT,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    isactive INTEGER,
    username TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    stype INTEGER,
    snumber INTEGER,
    syear TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_seasonsmaster_store_id ON public.seasonsmaster(store_id);
ALTER TABLE public.seasonsmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seasonsmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.seasonsmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: seasonsmasterlog
CREATE TABLE IF NOT EXISTS public.seasonsmasterlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    seasonsname TEXT,
    startdate TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    isactive INTEGER,
    userid TEXT,
    datetimechange TIMESTAMP WITH TIME ZONE,
    typeflag TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_seasonsmasterlog_store_id ON public.seasonsmasterlog(store_id);
ALTER TABLE public.seasonsmasterlog ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seasonsmasterlog' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.seasonsmasterlog FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: shoperscriptupdateinfo
CREATE TABLE IF NOT EXISTS public.shoperscriptupdateinfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scriptid TEXT,
    runsrl INTEGER,
    progid TEXT,
    dbexecuted TEXT,
    forversion TEXT,
    shprogenv TEXT,
    argumenttype INTEGER,
    argumentdata TEXT,
    scriptfilename TEXT,
    status TEXT,
    dateexecuted TIMESTAMP WITH TIME ZONE,
    shoperdate TEXT,
    currentvactr INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_shoperscriptupdateinfo_store_id ON public.shoperscriptupdateinfo(store_id);
ALTER TABLE public.shoperscriptupdateinfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shoperscriptupdateinfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.shoperscriptupdateinfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: shrmscript
CREATE TABLE IF NOT EXISTS public.shrmscript (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scriptblockid INTEGER,
    srlno INTEGER,
    script TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    executedshoperdate TIMESTAMP WITH TIME ZONE,
    executedsystemdate TIMESTAMP WITH TIME ZONE,
    isexecuted TEXT,
    minposverid INTEGER,
    executebeforeimport INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_shrmscript_store_id ON public.shrmscript(store_id);
ALTER TABLE public.shrmscript ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shrmscript' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.shrmscript FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: shrmscriptextd
CREATE TABLE IF NOT EXISTS public.shrmscriptextd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    scriptblockid INTEGER,
    distcenter TEXT,
    glcountry TEXT,
    glzone TEXT,
    glstate TEXT,
    glcity TEXT,
    showroomcode TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_shrmscriptextd_store_id ON public.shrmscriptextd(store_id);
ALTER TABLE public.shrmscriptextd ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shrmscriptextd' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.shrmscriptextd FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sisstatus
CREATE TABLE IF NOT EXISTS public.sisstatus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    runno INTEGER,
    filenm TEXT,
    jobid TEXT,
    programname TEXT,
    commmode TEXT,
    optype TEXT,
    destinationcompcode TEXT,
    status TEXT,
    serverresponse TEXT,
    field1 TEXT,
    field2 TEXT,
    request TEXT,
    shoperdate TIMESTAMP WITH TIME ZONE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    dateupdate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sisstatus_store_id ON public.sisstatus(store_id);
ALTER TABLE public.sisstatus ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sisstatus' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sisstatus FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sizecat
CREATE TABLE IF NOT EXISTS public.sizecat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class2cd TEXT,
    sizecd TEXT,
    ispivotalsize BOOLEAN,
    sizegroupid TEXT,
    sizegroupsrlno INTEGER,
    idealstockratioqty DOUBLE PRECISION,
    convsizecd TEXT,
    convfactor DOUBLE PRECISION,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sizecat_store_id ON public.sizecat(store_id);
ALTER TABLE public.sizecat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sizecat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sizecat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sizeentryfieldsconfig
CREATE TABLE IF NOT EXISTS public.sizeentryfieldsconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    entrytype TEXT,
    trntype INTEGER,
    fieldsrlno INTEGER,
    fieldname TEXT,
    fieldcaption TEXT,
    fieldtype INTEGER,
    fieldwidth INTEGER,
    fieldhidden INTEGER,
    fieldlock INTEGER,
    fieldflag INTEGER,
    fieldformula TEXT,
    fielddefaultvalue TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sizeentryfieldsconfig_store_id ON public.sizeentryfieldsconfig(store_id);
ALTER TABLE public.sizeentryfieldsconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sizeentryfieldsconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sizeentryfieldsconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: spdefsettings
CREATE TABLE IF NOT EXISTS public.spdefsettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    keytype INTEGER,
    keyval TEXT,
    valb BOOLEAN,
    vali INTEGER,
    vald TIMESTAMP WITH TIME ZONE,
    valt TEXT,
    vals NUMERIC,
    valc NUMERIC,
    valtyp TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_spdefsettings_store_id ON public.spdefsettings(store_id);
ALTER TABLE public.spdefsettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spdefsettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.spdefsettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrnaddldtls
CREATE TABLE IF NOT EXISTS public.stktrnaddldtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    trndocnoprefix TEXT,
    trndocno INTEGER,
    entsrlno INTEGER,
    type INTEGER,
    code INTEGER,
    descr TEXT,
    rate NUMERIC,
    amount NUMERIC,
    netvalue NUMERIC,
    applpoint INTEGER,
    compon INTEGER,
    componvalue NUMERIC,
    gvcouponno TEXT,
    gvcouponvalue NUMERIC,
    posentrytype INTEGER,
    postrnctrlno INTEGER,
    othertext TEXT,
    othervalue NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrnaddldtls_store_id ON public.stktrnaddldtls(store_id);
ALTER TABLE public.stktrnaddldtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrnaddldtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrnaddldtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrnaddlhdr
CREATE TABLE IF NOT EXISTS public.stktrnaddlhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    lrno TEXT,
    lrdate TIMESTAMP WITH TIME ZONE,
    vehicleno TEXT,
    drivername TEXT,
    presaletaxformnm TEXT,
    presaletaxsrlno TEXT,
    postsaletaxformnm TEXT,
    postsaletaxsrlno TEXT,
    transportmode TEXT,
    transportcode TEXT,
    addlinfo1 TEXT,
    addlinfo2 TEXT,
    addlinfo3 TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrnaddlhdr_store_id ON public.stktrnaddlhdr(store_id);
ALTER TABLE public.stktrnaddlhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrnaddlhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrnaddlhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrndtls
CREATE TABLE IF NOT EXISTS public.stktrndtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    entsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    locnid TEXT,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    ordentsrlno INTEGER,
    ordentsubsrlno INTEGER,
    refdoctype INTEGER,
    refdocnoprefix TEXT,
    refdocno TEXT,
    refentsrlno INTEGER,
    docqty DOUBLE PRECISION,
    phyqtyin DOUBLE PRECISION,
    phyqtyout DOUBLE PRECISION,
    stkupdtrate NUMERIC,
    stkupdtvaluein NUMERIC,
    stkupdtvalueout NUMERIC,
    docentrate NUMERIC,
    docentvalue NUMERIC,
    docenttotdisc NUMERIC,
    docentvalaftdisc NUMERIC,
    docenttax NUMERIC,
    docentaddons NUMERIC,
    docentdedns NUMERIC,
    docentnetvalue NUMERIC,
    physqtyreturned DOUBLE PRECISION,
    docentbeftaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxaddons NUMERIC,
    docentafttaxdedns NUMERIC,
    docentdisc NUMERIC,
    docentdiscid TEXT,
    docentbilldisc NUMERIC,
    docentvoidind BOOLEAN,
    itemtaxtype TEXT,
    custtaxtype TEXT,
    srctaxtype TEXT,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    retnreasoncd TEXT,
    fwdreftrntype INTEGER,
    fwdrefctrlno INTEGER,
    fwdrefdocentsrlno INTEGER,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    backrefdocentsrlno INTEGER,
    billpassind INTEGER,
    salespersoncd TEXT,
    itemwisediscreason TEXT,
    expttrntype INTEGER,
    expttrndocpfx TEXT,
    expttrndocno INTEGER,
    expttrndocsrlno INTEGER,
    expttrndocsubsrlno INTEGER,
    eupcode TEXT,
    applpoint INTEGER,
    valucomp INTEGER,
    itemmrpbilltm NUMERIC,
    itemcurbalqty NUMERIC,
    lngaisrlno INTEGER,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    itemlvlpricefacid INTEGER,
    itemlvledid INTEGER,
    docentpricefactor NUMERIC,
    stdtaxcomp1per NUMERIC,
    docented NUMERIC,
    stdtaxcomp2per NUMERIC,
    merchid TEXT,
    stdtaxcomp3per NUMERIC,
    stdtaxcomp4per NUMERIC,
    stdtaxcomp5per NUMERIC,
    stdtaxcomp1inc BOOLEAN,
    stdtaxcomp2inc BOOLEAN,
    stdtaxcomp3inc BOOLEAN,
    stdtaxcomp4inc BOOLEAN,
    stdtaxcomp5inc BOOLEAN,
    befcurbalqty NUMERIC,
    befcurbalval NUMERIC,
    aftcurbalqty NUMERIC,
    aftcurbalval NUMERIC,
    promocode TEXT,
    promoslabsrlno INTEGER,
    promoremarks TEXT,
    promotype INTEGER,
    promodeftype INTEGER,
    promoissuetrntype INTEGER,
    promoissuetrnctrlno INTEGER,
    promofwdlinktype INTEGER,
    promofwdlinkctrlno INTEGER,
    promoitemlevelofferval NUMERIC,
    promoitemlleveldiscdtls TEXT,
    promoitemgroup INTEGER,
    promoflgitemlevel INTEGER,
    promoflgbilllevel INTEGER,
    promosetsrlno INTEGER,
    promoofferitemtype INTEGER,
    itemremarks TEXT,
    discrate NUMERIC,
    servicedqty NUMERIC,
    linkpofromloc TEXT,
    linkpotype INTEGER,
    linkpoprefix TEXT,
    linkponumber INTEGER,
    linkpoentrysrlno INTEGER,
    linkpoentrysubsrlno INTEGER,
    linkpodeldate TIMESTAMP WITH TIME ZONE,
    serviceloc TEXT,
    linkettrntype INTEGER,
    linkettrnctrlno INTEGER,
    linketdocsubsrlno INTEGER,
    taxrevisionid INTEGER,
    itemtaxflag INTEGER,
    docentaddonstax NUMERIC,
    docrndoffvalue NUMERIC,
    taxav1 NUMERIC,
    taxav2 NUMERIC,
    taxav3 NUMERIC,
    taxav4 NUMERIC,
    taxav5 NUMERIC,
    prodservind INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    servicelocationcd TEXT,
    minmop NUMERIC,
    maxmop NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrndtls_store_id ON public.stktrndtls(store_id);
ALTER TABLE public.stktrndtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrndtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrndtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrndtlsextd01
CREATE TABLE IF NOT EXISTS public.stktrndtlsextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    itemtag2 TEXT,
    itemtag3 TEXT,
    itemtag4 TEXT,
    itemtag5 TEXT,
    phyqtyin NUMERIC,
    phyqtyout NUMERIC,
    fieldapplicable INTEGER,
    docvoidind INTEGER,
    phyqtyreturned NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrndtlsextd01_store_id ON public.stktrndtlsextd01(store_id);
ALTER TABLE public.stktrndtlsextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrndtlsextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrndtlsextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrneddtls
CREATE TABLE IF NOT EXISTS public.stktrneddtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    stockno TEXT,
    itemqty NUMERIC,
    itemrate NUMERIC,
    itemassessableamt1 NUMERIC,
    itemassessableamt2 NUMERIC,
    itemassessableamt3 NUMERIC,
    itemassessableamt4 NUMERIC,
    itemassessableamt5 NUMERIC,
    edtaxcode1 TEXT,
    edtaxcode2 TEXT,
    edtaxcode3 TEXT,
    edtaxcode4 TEXT,
    edtaxcode5 TEXT,
    edtaxcomp1 NUMERIC,
    edtaxcomp2 NUMERIC,
    edtaxcomp3 NUMERIC,
    edtaxcomp4 NUMERIC,
    edtaxcomp5 NUMERIC,
    edtaxcomp1per NUMERIC,
    edtaxcomp2per NUMERIC,
    edtaxcomp3per NUMERIC,
    edtaxcomp4per NUMERIC,
    edtaxcomp5per NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrneddtls_store_id ON public.stktrneddtls(store_id);
ALTER TABLE public.stktrneddtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrneddtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrneddtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrnedhdr
CREATE TABLE IF NOT EXISTS public.stktrnedhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    edbookno TEXT,
    eddocno INTEGER,
    eddate TIMESTAMP WITH TIME ZONE,
    custid TEXT,
    lrno TEXT,
    lrdate TIMESTAMP WITH TIME ZONE,
    vehicleno TEXT,
    drivername TEXT,
    removaldate TIMESTAMP WITH TIME ZONE,
    removaltime TIMESTAMP WITH TIME ZONE,
    edremarks TEXT,
    edvoidind INTEGER,
    copyno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrnedhdr_store_id ON public.stktrnedhdr(store_id);
ALTER TABLE public.stktrnedhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrnedhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrnedhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stktrnhdr
CREATE TABLE IF NOT EXISTS public.stktrnhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    doctime TIMESTAMP WITH TIME ZONE,
    docstat TEXT,
    packcountdoc INTEGER,
    packcountphy INTEGER,
    partytype INTEGER,
    partyid TEXT,
    partystkdocno TEXT,
    partystkdocdt TIMESTAMP WITH TIME ZONE,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    orddocdt TIMESTAMP WITH TIME ZONE,
    accdoctyp INTEGER,
    accdocno TEXT,
    accdocdt TIMESTAMP WITH TIME ZONE,
    totdocvalue NUMERIC,
    totdocdisc NUMERIC,
    totdoctax NUMERIC,
    totdocaddons NUMERIC,
    totdocdedns NUMERIC,
    netdocvalue NUMERIC,
    enteredsizewise BOOLEAN,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    frwdreftrntype INTEGER,
    frwdrefctrlno INTEGER,
    bkwdreftrntype INTEGER,
    bkwdrefctrlno INTEGER,
    docvoidind INTEGER,
    billlvldiscid TEXT,
    billpassind INTEGER,
    docremarks TEXT,
    totallineitems INTEGER,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    prodservind TEXT,
    totdocpricefactor NUMERIC,
    totdoced NUMERIC,
    totdocentbeftaxaddons NUMERIC,
    totdocentbeftaxdedns NUMERIC,
    totdocentafttaxaddons NUMERIC,
    totdocentafttaxdedns NUMERIC,
    promocode TEXT,
    promoslabsrlno INTEGER,
    promoremarks TEXT,
    promotype INTEGER,
    promodeftype INTEGER,
    promoissuetrntype INTEGER,
    promoissuetrnctrlno INTEGER,
    promofwdlinktype INTEGER,
    promofwdlinkctrlno INTEGER,
    promobilllevelofferval NUMERIC,
    promoitemlevelofferval NUMERIC,
    promoitemleveldiscval NUMERIC,
    promobillleveldiscdtls TEXT,
    reasoncodeforcancel TEXT,
    gendiscreason TEXT,
    linkettrntype INTEGER,
    linkettrnctrlno INTEGER,
    linkpovendor TEXT,
    totrndoffvalue NUMERIC,
    totdocaddonstax NUMERIC,
    shoperdbver INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stktrnhdr_store_id ON public.stktrnhdr(store_id);
ALTER TABLE public.stktrnhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stktrnhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stktrnhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockcreditnote
CREATE TABLE IF NOT EXISTS public.stockcreditnote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docnoprefix TEXT,
    docno INTEGER,
    docentsrlno INTEGER,
    docdt TIMESTAMP WITH TIME ZONE,
    partyid TEXT,
    partyname TEXT,
    refdocno TEXT,
    remarks TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    stockno TEXT,
    docqty DOUBLE PRECISION,
    docrate NUMERIC,
    docvalue NUMERIC,
    docnetvalue NUMERIC,
    creditnoteno INTEGER,
    creditnotedt TIMESTAMP WITH TIME ZONE,
    creditnoteqty DOUBLE PRECISION,
    creditnoteremark TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockcreditnote_store_id ON public.stockcreditnote(store_id);
ALTER TABLE public.stockcreditnote ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockcreditnote' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockcreditnote FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockmaster
CREATE TABLE IF NOT EXISTS public.stockmaster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    locnid TEXT,
    yropbalqty NUMERIC,
    yropbalval NUMERIC,
    curbalqty NUMERIC,
    curbalval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockmaster_store_id ON public.stockmaster(store_id);
ALTER TABLE public.stockmaster ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockmaster' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockmaster FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockmasterextd
CREATE TABLE IF NOT EXISTS public.stockmasterextd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    qty1 DOUBLE PRECISION,
    qty2 DOUBLE PRECISION,
    qty3 DOUBLE PRECISION,
    qty4 DOUBLE PRECISION,
    qty5 DOUBLE PRECISION,
    qty6 DOUBLE PRECISION,
    qty7 DOUBLE PRECISION,
    qty8 DOUBLE PRECISION,
    qty9 DOUBLE PRECISION,
    qty10 DOUBLE PRECISION,
    qty11 DOUBLE PRECISION,
    qty12 DOUBLE PRECISION,
    qty13 DOUBLE PRECISION,
    qty14 DOUBLE PRECISION,
    qty15 DOUBLE PRECISION,
    qty16 DOUBLE PRECISION,
    qty17 DOUBLE PRECISION,
    qty18 DOUBLE PRECISION,
    qty19 DOUBLE PRECISION,
    qty20 DOUBLE PRECISION,
    qty21 DOUBLE PRECISION,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockmasterextd_store_id ON public.stockmasterextd(store_id);
ALTER TABLE public.stockmasterextd ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockmasterextd' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockmasterextd FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockmasterextd01
CREATE TABLE IF NOT EXISTS public.stockmasterextd01 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    yropbalqty NUMERIC,
    yropbalval NUMERIC,
    curbalqty NUMERIC,
    curbalval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockmasterextd01_store_id ON public.stockmasterextd01(store_id);
ALTER TABLE public.stockmasterextd01 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockmasterextd01' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockmasterextd01 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockmasterextd02
CREATE TABLE IF NOT EXISTS public.stockmasterextd02 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    itemtag1 TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    curbalqty NUMERIC,
    curbalval NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockmasterextd02_store_id ON public.stockmasterextd02(store_id);
ALTER TABLE public.stockmasterextd02 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockmasterextd02' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockmasterextd02 FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stockmasterextdopbal
CREATE TABLE IF NOT EXISTS public.stockmasterextdopbal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    dateinsert TIMESTAMP WITH TIME ZONE,
    shoperdate TIMESTAMP WITH TIME ZONE,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    dayopbalqty NUMERIC,
    dayopbalval NUMERIC,
    yropbalqty NUMERIC,
    yropbalval NUMERIC,
    curbalqty NUMERIC,
    curbalval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stockmasterextdopbal_store_id ON public.stockmasterextdopbal(store_id);
ALTER TABLE public.stockmasterextdopbal ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stockmasterextdopbal' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stockmasterextdopbal FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: stocktrnsummary
CREATE TABLE IF NOT EXISTS public.stocktrnsummary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    batchsrlno TEXT,
    locnid TEXT,
    yr INTEGER,
    monthno INTEGER,
    monthopbalqty NUMERIC,
    monthopbalval NUMERIC,
    goodspurchqty DOUBLE PRECISION,
    goodspurchval NUMERIC,
    purchretnqty DOUBLE PRECISION,
    purchretnval NUMERIC,
    saleqty DOUBLE PRECISION,
    saledocval NUMERIC,
    saleretnqty DOUBLE PRECISION,
    saleretndocval NUMERIC,
    salestkval NUMERIC,
    saleretnstkval NUMERIC,
    cstransferinqty DOUBLE PRECISION,
    cstransferinval NUMERIC,
    cstransferoutqty DOUBLE PRECISION,
    cstransferoutval NUMERIC,
    miscrcptqty DOUBLE PRECISION,
    miscrcptval NUMERIC,
    miscissuqty DOUBLE PRECISION,
    miscissuval NUMERIC,
    iltransferinqty DOUBLE PRECISION,
    iltransferinval NUMERIC,
    iltransferoutqty DOUBLE PRECISION,
    iltransferoutval NUMERIC,
    approvalissqty DOUBLE PRECISION,
    approvalissval NUMERIC,
    approvalretqty DOUBLE PRECISION,
    approvalretval NUMERIC,
    miscrcptstkval NUMERIC,
    miscissstkval NUMERIC,
    approvalissstkval NUMERIC,
    approvalretstkval NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_stocktrnsummary_store_id ON public.stocktrnsummary(store_id);
ALTER TABLE public.stocktrnsummary ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stocktrnsummary' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.stocktrnsummary FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: subclass1cat
CREATE TABLE IF NOT EXISTS public.subclass1cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass1desc TEXT,
    prodtaxtype TEXT,
    regularind TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    imageid TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_subclass1cat_store_id ON public.subclass1cat(store_id);
ALTER TABLE public.subclass1cat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subclass1cat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.subclass1cat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: subclass2cat
CREATE TABLE IF NOT EXISTS public.subclass2cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    class1cd TEXT,
    class2cd TEXT,
    subclass2cd TEXT,
    subclass2desc TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_subclass2cat_store_id ON public.subclass2cat(store_id);
ALTER TABLE public.subclass2cat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subclass2cat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.subclass2cat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sysparam
CREATE TABLE IF NOT EXISTS public.sysparam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    descr TEXT,
    paramcode TEXT,
    boolean BOOLEAN,
    intg INTEGER,
    txt TEXT,
    dt TIMESTAMP WITH TIME ZONE,
    sng DOUBLE PRECISION,
    cur NUMERIC,
    opt TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sysparam_store_id ON public.sysparam(store_id);
ALTER TABLE public.sysparam ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sysparam' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sysparam FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sysparamextd
CREATE TABLE IF NOT EXISTS public.sysparamextd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paramcode TEXT,
    fixed TEXT,
    changed INTEGER,
    category TEXT,
    catdescr TEXT,
    disporder INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sysparamextd_store_id ON public.sysparamextd(store_id);
ALTER TABLE public.sysparamextd ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sysparamextd' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sysparamextd FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: sysparamlookup
CREATE TABLE IF NOT EXISTS public.sysparamlookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    paramcode TEXT,
    string TEXT,
    value TEXT,
    returntyp TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_sysparamlookup_store_id ON public.sysparamlookup(store_id);
ALTER TABLE public.sysparamlookup ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sysparamlookup' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.sysparamlookup FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: szhdrs
CREATE TABLE IF NOT EXISTS public.szhdrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    rowno INTEGER,
    colno INTEGER,
    sizes TEXT,
    userid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_szhdrs_store_id ON public.szhdrs(store_id);
ALTER TABLE public.szhdrs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'szhdrs' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.szhdrs FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallyexportedtrans
CREATE TABLE IF NOT EXISTS public.tallyexportedtrans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    voucherno TEXT,
    vocherdt TIMESTAMP WITH TIME ZONE,
    exportdt TIMESTAMP WITH TIME ZONE,
    ctrlno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallyexportedtrans_store_id ON public.tallyexportedtrans(store_id);
ALTER TABLE public.tallyexportedtrans ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallyexportedtrans' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallyexportedtrans FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallyhsnrules
CREATE TABLE IF NOT EXISTS public.tallyhsnrules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    mapid INTEGER,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    hsncode TEXT,
    levelno TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallyhsnrules_store_id ON public.tallyhsnrules(store_id);
ALTER TABLE public.tallyhsnrules ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallyhsnrules' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallyhsnrules FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallymappurchtaxcat
CREATE TABLE IF NOT EXISTS public.tallymappurchtaxcat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    taxcomponent NUMERIC,
    mapname TEXT,
    t1type TEXT,
    t1rate NUMERIC,
    t2type TEXT,
    t2rate NUMERIC,
    t3type TEXT,
    t3rate NUMERIC,
    t4type TEXT,
    t4rate NUMERIC,
    t5type TEXT,
    t5rate NUMERIC,
    taxcnt NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallymappurchtaxcat_store_id ON public.tallymappurchtaxcat(store_id);
ALTER TABLE public.tallymappurchtaxcat ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallymappurchtaxcat' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallymappurchtaxcat FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallymapsettinginfo
CREATE TABLE IF NOT EXISTS public.tallymapsettinginfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    mapname TEXT,
    poststartdate TIMESTAMP WITH TIME ZONE,
    shopercompanycode TEXT,
    shopercompanyname TEXT,
    ishsncodeenabled TEXT,
    isshopsalesasledgername TEXT,
    isdiscountaslineentry TEXT,
    isdetailedpaymodes TEXT,
    isdetaileddeductions TEXT,
    isdetailedaddons TEXT,
    isoffline TEXT,
    creditcumulative TEXT,
    taxtype TEXT,
    sale TEXT,
    salesreturns TEXT,
    payments TEXT,
    receipts TEXT,
    purchase TEXT,
    purchasereturns TEXT,
    advances TEXT,
    ledgernameformat TEXT,
    tallycompanyname TEXT,
    tallyguid TEXT,
    tallystate TEXT,
    firstaliasnameformat TEXT,
    shrmgroupname TEXT,
    shoperbasecurrency TEXT,
    tallyserverip TEXT,
    tallyserverport TEXT,
    tallybasecurrency TEXT,
    isdeactivated TEXT,
    isdeleted TEXT,
    isautocreatemasters TEXT,
    lastposteddate TIMESTAMP WITH TIME ZONE,
    offlinefilegen TEXT,
    offlinefileloaded TEXT,
    masternameprefix TEXT,
    isprefix TEXT,
    mapcode TEXT,
    isscheduled TEXT,
    shoperdbver INTEGER,
    isposttransfers TEXT,
    isusegodown TEXT,
    isusecostcenter TEXT,
    isnocustomer TEXT,
    ismapnameinvouchernumber TEXT,
    issendclosingstock TEXT,
    iscompanycodeinbillref TEXT,
    isuseprefixforvouchertypes TEXT,
    ispostbeforetaxdetails TEXT,
    ispostvouchernarration TEXT,
    issendallcustomers TEXT,
    isuseprefixforledgers TEXT,
    iscustomerinfoinremarks TEXT,
    vatclass_salesreturn TEXT,
    vatclass_purchasereturn TEXT,
    ispostpurchasediscounts TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallymapsettinginfo_store_id ON public.tallymapsettinginfo(store_id);
ALTER TABLE public.tallymapsettinginfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallymapsettinginfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallymapsettinginfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallymasterinfo
CREATE TABLE IF NOT EXISTS public.tallymasterinfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    alias TEXT,
    shopermastername TEXT,
    groupname TEXT,
    ledgername TEXT,
    paymodetype INTEGER,
    amounttype TEXT,
    producttax TEXT,
    sourcetax TEXT,
    destinationtax TEXT,
    tax TEXT,
    taxclassification TEXT,
    mastercode TEXT,
    mastertype TEXT,
    firstalias TEXT,
    isoldtallymaster TEXT,
    serialno NUMERIC,
    isconfirmed TEXT,
    mapname TEXT,
    offlinefilegen TEXT,
    offlinefileloaded TEXT,
    shoperdbver INTEGER,
    isgstledger TEXT,
    creditlimitamount NUMERIC,
    creditlimitdays INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallymasterinfo_store_id ON public.tallymasterinfo(store_id);
ALTER TABLE public.tallymasterinfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallymasterinfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallymasterinfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallypostingsettings
CREATE TABLE IF NOT EXISTS public.tallypostingsettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trantype INTEGER,
    slno INTEGER,
    paymode INTEGER,
    usecode INTEGER,
    modecode TEXT,
    prdtaxtype TEXT,
    srctaxtype TEXT,
    desttaxtype TEXT,
    taxpercentage TEXT,
    accounttype TEXT,
    amounttype TEXT,
    assessablevaltype TEXT,
    ledgername TEXT,
    taxclassification TEXT,
    companycd TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallypostingsettings_store_id ON public.tallypostingsettings(store_id);
ALTER TABLE public.tallypostingsettings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallypostingsettings' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallypostingsettings FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallyprintconfigdetails
CREATE TABLE IF NOT EXISTS public.tallyprintconfigdetails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    configname TEXT,
    paramname TEXT,
    paramvalue TEXT,
    datatype TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallyprintconfigdetails_store_id ON public.tallyprintconfigdetails(store_id);
ALTER TABLE public.tallyprintconfigdetails ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallyprintconfigdetails' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallyprintconfigdetails FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallyprintconfigheader
CREATE TABLE IF NOT EXISTS public.tallyprintconfigheader (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    terminal TEXT,
    trntype INTEGER,
    configname TEXT,
    reportname TEXT,
    tcplocation TEXT,
    isactive BOOLEAN,
    printername TEXT,
    printmode TEXT,
    printpreview BOOLEAN,
    noofcopies INTEGER,
    iscustom INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallyprintconfigheader_store_id ON public.tallyprintconfigheader(store_id);
ALTER TABLE public.tallyprintconfigheader ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallyprintconfigheader' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallyprintconfigheader FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tallyvchinfo
CREATE TABLE IF NOT EXISTS public.tallyvchinfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    vchid TEXT,
    vchguid TEXT,
    trntype INTEGER,
    prefix TEXT,
    voucherno TEXT,
    exportdt TIMESTAMP WITH TIME ZONE,
    voucherdt TIMESTAMP WITH TIME ZONE,
    ctrlno INTEGER,
    mapname TEXT,
    isoptional TEXT,
    masterid TEXT,
    offlinefilegen TEXT,
    offlinefileloaded TEXT,
    vchhashcode TEXT,
    shoperdbver INTEGER,
    narration TEXT,
    iscorrectedvoucher TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tallyvchinfo_store_id ON public.tallyvchinfo(store_id);
ALTER TABLE public.tallyvchinfo ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tallyvchinfo' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tallyvchinfo FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tblhdr
CREATE TABLE IF NOT EXISTS public.tblhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    rowrefno INTEGER,
    sz1 TEXT,
    sz2 TEXT,
    sz3 TEXT,
    sz4 TEXT,
    sz5 TEXT,
    sz6 TEXT,
    sz7 TEXT,
    sz8 TEXT,
    sz9 TEXT,
    userid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tblhdr_store_id ON public.tblhdr(store_id);
ALTER TABLE public.tblhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tblhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tblhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempbillwisereport
CREATE TABLE IF NOT EXISTS public.tempbillwisereport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docdt TIMESTAMP WITH TIME ZONE,
    trntype TEXT,
    docprefix TEXT,
    docno INTEGER,
    custcd TEXT,
    salespersoncd TEXT,
    docentdiscid TEXT,
    billlvldiscid TEXT,
    stockno TEXT,
    itemdesc TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    stkupdtrate NUMERIC,
    itemmrpbilltm NUMERIC,
    docentrate NUMERIC,
    docqty DOUBLE PRECISION,
    docentvalue NUMERIC,
    docentaddons NUMERIC,
    docentdedns NUMERIC,
    taxperc NUMERIC,
    docenttax NUMERIC,
    docentdisc NUMERIC,
    docbillentdisc NUMERIC,
    docenttotdisc NUMERIC,
    oldbill TEXT,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempbillwisereport_store_id ON public.tempbillwisereport(store_id);
ALTER TABLE public.tempbillwisereport ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempbillwisereport' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempbillwisereport FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempextdmailinglistsuper
CREATE TABLE IF NOT EXISTS public.tempextdmailinglistsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    recno INTEGER,
    addresstype TEXT,
    nm TEXT,
    addr1 TEXT,
    addr2 TEXT,
    addr3 TEXT,
    addr4 TEXT,
    addr5 TEXT,
    locality TEXT,
    postalcd TEXT,
    country TEXT,
    zone TEXT,
    state TEXT,
    city TEXT,
    offphone TEXT,
    homephone TEXT,
    mobilephone TEXT,
    faxno TEXT,
    email TEXT,
    email2 TEXT,
    email3 TEXT,
    contact TEXT,
    cattype TEXT,
    catcd TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    defaultaddress INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempextdmailinglistsuper_store_id ON public.tempextdmailinglistsuper(store_id);
ALTER TABLE public.tempextdmailinglistsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempextdmailinglistsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempextdmailinglistsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempflatfiledtls
CREATE TABLE IF NOT EXISTS public.tempflatfiledtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    docid TEXT,
    docno TEXT,
    docsrlno TEXT,
    stockno TEXT,
    batchsrlno TEXT,
    class1cd TEXT,
    class1desc TEXT,
    class2cd TEXT,
    class2desc TEXT,
    subclass1cd TEXT,
    subclass1desc TEXT,
    subclass2cd TEXT,
    subclass2desc TEXT,
    sizecd TEXT,
    docqty TEXT,
    docentrate TEXT,
    docentvalue TEXT,
    retail_price TEXT,
    prodtaxcode TEXT,
    leastsalableqty TEXT,
    dealer_price TEXT,
    srctaxtype TEXT,
    isinventoryitem TEXT,
    isrptaxinclusive TEXT,
    taxrate TEXT,
    currentcost TEXT,
    itemdesc TEXT,
    itemind TEXT,
    poprefix TEXT,
    pono TEXT,
    posrlno TEXT,
    prodtaxtype TEXT,
    reordlvl TEXT,
    eoq TEXT,
    minordqty TEXT,
    ispivotalsize TEXT,
    sizegroupid TEXT,
    sizegroupsrlno TEXT,
    idealstockratioqty TEXT,
    retailmarkup TEXT,
    dealermarkup TEXT,
    prefvendorid TEXT,
    altvendorid1 TEXT,
    altvendorid2 TEXT,
    altvendorid3 TEXT,
    dealerprice1 TEXT,
    regularind TEXT,
    isbillable TEXT,
    isservice TEXT,
    analcode1 TEXT,
    analdesc1 TEXT,
    analcode2 TEXT,
    analdesc2 TEXT,
    analcode3 TEXT,
    analdesc3 TEXT,
    analcode4 TEXT,
    analdesc4 TEXT,
    analcode5 TEXT,
    analdesc5 TEXT,
    superclass1 TEXT,
    superc1desc TEXT,
    superclass2 TEXT,
    superc2desc TEXT,
    actualqty TEXT,
    gradecode TEXT,
    baledetails TEXT,
    balesubserial TEXT,
    ccstockno TEXT,
    isconsignmentitem TEXT,
    docenttax TEXT,
    docentdisc TEXT,
    docentbeftaxaddons TEXT,
    docentafttaxaddons TEXT,
    docentbeftaxdedns TEXT,
    docentafttaxdedns TEXT,
    analcode6 TEXT,
    analdesc6 TEXT,
    analcode7 TEXT,
    analdesc7 TEXT,
    analcode8 TEXT,
    analdesc8 TEXT,
    analcode9 TEXT,
    analdesc9 TEXT,
    analcode10 TEXT,
    analdesc10 TEXT,
    analcode11 TEXT,
    analdesc11 TEXT,
    analcode12 TEXT,
    analdesc12 TEXT,
    analcode13 TEXT,
    analdesc13 TEXT,
    analcode14 TEXT,
    analdesc14 TEXT,
    analcode15 TEXT,
    analdesc15 TEXT,
    analcode16 TEXT,
    analdesc16 TEXT,
    analcode17 TEXT,
    analdesc17 TEXT,
    analcode18 TEXT,
    analdesc18 TEXT,
    analcode19 TEXT,
    analdesc19 TEXT,
    analcode20 TEXT,
    analdesc20 TEXT,
    analcode21 TEXT,
    analdesc21 TEXT,
    analcode22 TEXT,
    analdesc22 TEXT,
    analcode23 TEXT,
    analdesc23 TEXT,
    analcode24 TEXT,
    analdesc24 TEXT,
    analcode25 TEXT,
    analdesc25 TEXT,
    analcode26 TEXT,
    analdesc26 TEXT,
    analcode27 TEXT,
    analdesc27 TEXT,
    analcode28 TEXT,
    analdesc28 TEXT,
    analcode29 TEXT,
    analdesc29 TEXT,
    analcode30 TEXT,
    analdesc30 TEXT,
    analcode31 TEXT,
    analdesc31 TEXT,
    analcode32 TEXT,
    analdesc32 TEXT,
    imagepresent TEXT,
    imageid TEXT,
    finalmrp TEXT,
    mfgdate TEXT,
    expdate TEXT,
    shelflife TEXT,
    potype TEXT,
    posubsrlno TEXT,
    docentaddonstax TEXT,
    docentnetvalue TEXT,
    docenttmpnetvalue TEXT,
    doclvldisc TEXT,
    docnoprefix TEXT,
    trntype INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempflatfiledtls_store_id ON public.tempflatfiledtls(store_id);
ALTER TABLE public.tempflatfiledtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempflatfiledtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempflatfiledtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempgstdatasuper
CREATE TABLE IF NOT EXISTS public.tempgstdatasuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    entsrlno INTEGER,
    stockno TEXT,
    itemdesc TEXT,
    itemtaxtype TEXT,
    desttaxtype TEXT,
    isrptaxinclusive INTEGER,
    docentrate NUMERIC,
    docenttotdisc NUMERIC,
    phyqtyout NUMERIC,
    srctaxtype TEXT,
    gstgroup TEXT,
    basevalue NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentbeftaxaddons NUMERIC,
    docenttax NUMERIC,
    t1rate NUMERIC,
    t1value NUMERIC,
    t2rate NUMERIC,
    t2value NUMERIC,
    t3rate NUMERIC,
    t3value NUMERIC,
    docentnetvalue NUMERIC,
    t1compon TEXT,
    t2compon TEXT,
    t3compon TEXT,
    taxav1value NUMERIC,
    taxav2value NUMERIC,
    taxav3value NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempgstdatasuper_store_id ON public.tempgstdatasuper(store_id);
ALTER TABLE public.tempgstdatasuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempgstdatasuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempgstdatasuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempimconfigdefvalsuper
CREATE TABLE IF NOT EXISTS public.tempimconfigdefvalsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    flag1 INTEGER,
    flag2 INTEGER,
    flag3 INTEGER,
    flag4 INTEGER,
    fid TEXT,
    fn TEXT,
    fc TEXT,
    defaultvaue TEXT,
    boundtolookup TEXT,
    boundtolookupid TEXT,
    name TEXT,
    fieldtype INTEGER,
    length INTEGER,
    userwiseconfigsrlno INTEGER,
    cmnfieldflag INTEGER,
    cmnfielddata TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempimconfigdefvalsuper_store_id ON public.tempimconfigdefvalsuper(store_id);
ALTER TABLE public.tempimconfigdefvalsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempimconfigdefvalsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempimconfigdefvalsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempimconfigsuper
CREATE TABLE IF NOT EXISTS public.tempimconfigsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    flag1 INTEGER,
    flag2 INTEGER,
    flag3 INTEGER,
    flag4 INTEGER,
    fid TEXT,
    fn TEXT,
    fc TEXT,
    defaultvaue TEXT,
    boundtolookup TEXT,
    boundtolookupid TEXT,
    name TEXT,
    fieldtype INTEGER,
    length INTEGER,
    userwiseconfigsrlno INTEGER,
    cmnfieldflag INTEGER,
    cmnfielddata TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempimconfigsuper_store_id ON public.tempimconfigsuper(store_id);
ALTER TABLE public.tempimconfigsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempimconfigsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempimconfigsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempitemexporttablesuper
CREATE TABLE IF NOT EXISTS public.tempitemexporttablesuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    type TEXT,
    code TEXT,
    descr TEXT,
    flag BOOLEAN,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempitemexporttablesuper_store_id ON public.tempitemexporttablesuper(store_id);
ALTER TABLE public.tempitemexporttablesuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempitemexporttablesuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempitemexporttablesuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempitemmastersuper
CREATE TABLE IF NOT EXISTS public.tempitemmastersuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    leastsalableqty NUMERIC,
    usejwlpricing BOOLEAN,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    prodtaxtype TEXT,
    srctaxtype TEXT,
    isinventoryitem BOOLEAN,
    isrptaxinclusive BOOLEAN,
    itemdesc TEXT,
    extdescpresent BOOLEAN,
    regularind TEXT,
    reordlvl DOUBLE PRECISION,
    eoq DOUBLE PRECISION,
    minordqty DOUBLE PRECISION,
    lastpurchprice NUMERIC,
    currentcost NUMERIC,
    jwlmetalind TEXT,
    jwlcaratage INTEGER,
    jwlgrosswt DOUBLE PRECISION,
    jwlstonewt DOUBLE PRECISION,
    jwlwtfactor DOUBLE PRECISION,
    jwlratefactor NUMERIC,
    jwlstoneval NUMERIC,
    jwlmakecharge NUMERIC,
    jwlvalfactor NUMERIC,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    mfgdate TIMESTAMP WITH TIME ZONE,
    expdate TIMESTAMP WITH TIME ZONE,
    shelflife INTEGER,
    imagepresent BOOLEAN,
    isbillable BOOLEAN,
    isservice BOOLEAN,
    rtlmarkup NUMERIC,
    dlrmarkup NUMERIC,
    ccstockno TEXT,
    gradecd TEXT,
    imageid TEXT,
    sfield1 TEXT,
    sfield2 TEXT,
    sfield3 TEXT,
    sfield4 TEXT,
    sfield5 TEXT,
    nfield1 INTEGER,
    nfield2 INTEGER,
    nfield3 INTEGER,
    nfield4 INTEGER,
    nfield5 INTEGER,
    dfield1 TIMESTAMP WITH TIME ZONE,
    dfield2 TIMESTAMP WITH TIME ZONE,
    dfield3 TIMESTAMP WITH TIME ZONE,
    bfield1 BOOLEAN,
    bfield2 BOOLEAN,
    merchid TEXT,
    discid INTEGER,
    discper INTEGER,
    discamt INTEGER,
    discsqlqry TEXT,
    pricefactorid INTEGER,
    pricefactorper INTEGER,
    pricefactoramt INTEGER,
    pricefactorsqlqry TEXT,
    addonid INTEGER,
    addonper NUMERIC,
    addonamt NUMERIC,
    addonsqlqry TEXT,
    dednid INTEGER,
    dednper NUMERIC,
    dednamt NUMERIC,
    dednsqlqry TEXT,
    edid INTEGER,
    edper NUMERIC,
    edamt NUMERIC,
    edsqlqry TEXT,
    finalmrp NUMERIC,
    isconsignmentitem BOOLEAN,
    flgstocktake INTEGER,
    flgratealterable INTEGER,
    flgstockchkappl INTEGER,
    stocktolerance NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    lastupdateddate TIMESTAMP WITH TIME ZONE,
    batchapplicable INTEGER,
    gradeapplicable INTEGER,
    locationapplicable INTEGER,
    batchnoflag INTEGER,
    batchsrlno TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempitemmastersuper_store_id ON public.tempitemmastersuper(store_id);
ALTER TABLE public.tempitemmastersuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempitemmastersuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempitemmastersuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempmultistocknos
CREATE TABLE IF NOT EXISTS public.tempmultistocknos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    applflag TEXT,
    rate NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempmultistocknos_store_id ON public.tempmultistocknos(store_id);
ALTER TABLE public.tempmultistocknos ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempmultistocknos' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempmultistocknos FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppricerevisionreportsuper
CREATE TABLE IF NOT EXISTS public.temppricerevisionreportsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    docno INTEGER,
    destcompcode TEXT,
    filenumber TEXT,
    stockno TEXT,
    batchsrlno TEXT,
    retailpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isrprateoramount TEXT,
    retailpricerevisionflag TEXT,
    retailpricevalue NUMERIC,
    retailpriceold NUMERIC,
    retailpricenew NUMERIC,
    dealerpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isdprateoramount TEXT,
    dealerpricerevisionflag TEXT,
    dealerpricevalue NUMERIC,
    dealerpriceold NUMERIC,
    dealerpricenew NUMERIC,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    pgmmode TEXT,
    daybeginshoperdate TIMESTAMP WITH TIME ZONE,
    daybeginsystemdate TIMESTAMP WITH TIME ZONE,
    voidflag TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    slno TEXT,
    approvedflag BOOLEAN,
    rejectflag BOOLEAN,
    attributelevel TEXT,
    attrimatchfld TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppricerevisionreportsuper_store_id ON public.temppricerevisionreportsuper(store_id);
ALTER TABLE public.temppricerevisionreportsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppricerevisionreportsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppricerevisionreportsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppricerevisionsuper
CREATE TABLE IF NOT EXISTS public.temppricerevisionsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    sourcecompcode TEXT,
    docno INTEGER,
    destcompcode TEXT,
    filenumber TEXT,
    stockno TEXT,
    batchsrlno TEXT,
    retailpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isrprateoramount TEXT,
    retailpricerevisionflag TEXT,
    retailpricevalue NUMERIC,
    dealerpriceeffectivedate TIMESTAMP WITH TIME ZONE,
    isdprateoramount TEXT,
    dealerpricerevisionflag TEXT,
    dealerpricevalue NUMERIC,
    shoperdate TIMESTAMP WITH TIME ZONE,
    systemdate TIMESTAMP WITH TIME ZONE,
    pgmmode TEXT,
    voidflag TEXT,
    retail_price NUMERIC,
    dealer_price NUMERIC,
    skulineno INTEGER,
    slno INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppricerevisionsuper_store_id ON public.temppricerevisionsuper(store_id);
ALTER TABLE public.temppricerevisionsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppricerevisionsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppricerevisionsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifspbddsuper
CREATE TABLE IF NOT EXISTS public.temppromoifspbddsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billdiscpercent NUMERIC,
    billdiscamount NUMERIC,
    billmaxdiscpercent NUMERIC,
    billmaxdiscamount NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifspbddsuper_store_id ON public.temppromoifspbddsuper(store_id);
ALTER TABLE public.temppromoifspbddsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifspbddsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifspbddsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifspbidsuper
CREATE TABLE IF NOT EXISTS public.temppromoifspbidsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemofferbuyqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    buyitemattriblvl TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifspbidsuper_store_id ON public.temppromoifspbidsuper(store_id);
ALTER TABLE public.temppromoifspbidsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifspbidsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifspbidsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifspcdsuper
CREATE TABLE IF NOT EXISTS public.temppromoifspcdsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    custpricegroup TEXT,
    custcode TEXT,
    custclass1code TEXT,
    custclass2code TEXT,
    custclass3code TEXT,
    custclass4code TEXT,
    custclass5code TEXT,
    custprofile1code TEXT,
    custprofile2code TEXT,
    custprofile3code TEXT,
    custprofile4code TEXT,
    custprofile5code TEXT,
    custloyaltyid TEXT,
    custdesttaxcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifspcdsuper_store_id ON public.temppromoifspcdsuper(store_id);
ALTER TABLE public.temppromoifspcdsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifspcdsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifspcdsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifspgidsuper
CREATE TABLE IF NOT EXISTS public.temppromoifspgidsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemsetno INTEGER,
    itemsetsrlno INTEGER,
    itemincexflag INTEGER,
    stockno TEXT,
    skuserialno INTEGER,
    skubatchno TEXT,
    skulocationid TEXT,
    skugradecd TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    superclass1cd TEXT,
    superclass2cd TEXT,
    analcode1 TEXT,
    analcode2 TEXT,
    analcode3 TEXT,
    analcode4 TEXT,
    analcode5 TEXT,
    analcode6 TEXT,
    analcode7 TEXT,
    analcode8 TEXT,
    analcode9 TEXT,
    analcode10 TEXT,
    analcode11 TEXT,
    analcode12 TEXT,
    analcode13 TEXT,
    analcode14 TEXT,
    analcode15 TEXT,
    analcode16 TEXT,
    analcode17 TEXT,
    analcode18 TEXT,
    analcode19 TEXT,
    analcode20 TEXT,
    analcode21 TEXT,
    analcode22 TEXT,
    analcode23 TEXT,
    analcode24 TEXT,
    analcode25 TEXT,
    analcode26 TEXT,
    analcode27 TEXT,
    analcode28 TEXT,
    analcode29 TEXT,
    analcode30 TEXT,
    analcode31 TEXT,
    analcode32 TEXT,
    regnonregitemind INTEGER,
    producttaxcode TEXT,
    sourcetaxcode TEXT,
    itemtaxtype INTEGER,
    itemmfgdate TIMESTAMP WITH TIME ZONE,
    itemexpirydate TIMESTAMP WITH TIME ZONE,
    itemshelflife INTEGER,
    merchandizeid TEXT,
    consignnonconsignitemind INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    diffitemoffergetqty NUMERIC,
    billvalueabove NUMERIC,
    billvalueupto NUMERIC,
    billqtyabove NUMERIC,
    billqtyupto NUMERIC,
    billlvloffergetqty NUMERIC,
    freeitemworthbasedon INTEGER,
    freeitemworthspecified NUMERIC,
    freeitemvaltreatment INTEGER,
    remarks TEXT,
    getitemattriblvl TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifspgidsuper_store_id ON public.temppromoifspgidsuper(store_id);
ALTER TABLE public.temppromoifspgidsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifspgidsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifspgidsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifsphsuper
CREATE TABLE IF NOT EXISTS public.temppromoifsphsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    salespromosrlno INTEGER,
    salespromodesc TEXT,
    status INTEGER,
    priorityno INTEGER,
    definitioncreatedat INTEGER,
    createdshoperdate TIMESTAMP WITH TIME ZONE,
    createdsystemdate TIMESTAMP WITH TIME ZONE,
    startdate TIMESTAMP WITH TIME ZONE,
    starttime TIMESTAMP WITH TIME ZONE,
    enddate TIMESTAMP WITH TIME ZONE,
    endtime TIMESTAMP WITH TIME ZONE,
    weekdays TEXT,
    applicablehappyhours INTEGER,
    happyhoursstarttime TIMESTAMP WITH TIME ZONE,
    happyhoursendtime TIMESTAMP WITH TIME ZONE,
    definitiontype INTEGER,
    definitionlevel INTEGER,
    fixedorvariable INTEGER,
    itemlvldiscounttype INTEGER,
    itemlvloffertype INTEGER,
    itemlvlofferbuyngetitemsaresame INTEGER,
    itemlvldefvariesonbuyingrateval INTEGER,
    itemlvlbuyingratevaluecond INTEGER,
    itemlvldefvariesonbuyingqty INTEGER,
    billlvldiscounttype INTEGER,
    billlvloffertype INTEGER,
    bldefvariesonbillvalqty INTEGER,
    bldefvariesonbillvalqtycond INTEGER,
    freeofferitemtype INTEGER,
    applicableitems INTEGER,
    applicablecustomers INTEGER,
    canbecombined INTEGER,
    archived INTEGER,
    userid TEXT,
    exportedflag INTEGER,
    exporteddate TIMESTAMP WITH TIME ZONE,
    importedflag INTEGER,
    importeddate TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    multipleratecond INTEGER,
    discrateamtind INTEGER,
    andcondition INTEGER,
    noofandconds INTEGER,
    lowesthighestpriceditem INTEGER,
    featureid INTEGER,
    andconditionfreeitem INTEGER,
    noofandcondsfreeitem INTEGER,
    addlitemflag INTEGER,
    addlitemdisctype INTEGER,
    salespromoid INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifsphsuper_store_id ON public.temppromoifsphsuper(store_id);
ALTER TABLE public.temppromoifsphsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifsphsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifsphsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temppromoifspiddsuper
CREATE TABLE IF NOT EXISTS public.temppromoifspiddsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    salespromocode TEXT,
    srlno INTEGER,
    salespromosrlno INTEGER,
    itemratevaluecond INTEGER,
    itemrateequalto NUMERIC,
    itemrateabove NUMERIC,
    itemrateupto NUMERIC,
    itemvalueequalto NUMERIC,
    itemvalueabove NUMERIC,
    itemvalueupto NUMERIC,
    itemlvldiscbuyqty NUMERIC,
    itemdiscpercent NUMERIC,
    itemdiscamount NUMERIC,
    itemmaxdiscpercent NUMERIC,
    itemmaxdiscamount NUMERIC,
    itemdiscountedrate NUMERIC,
    allitemsatspecifiedval NUMERIC,
    sameitemofferbuyqty NUMERIC,
    sameitemoffergetqty NUMERIC,
    discvaluetreatment INTEGER,
    remarks TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temppromoifspiddsuper_store_id ON public.temppromoifspiddsuper(store_id);
ALTER TABLE public.temppromoifspiddsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temppromoifspiddsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temppromoifspiddsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempstktrndtlssuper
CREATE TABLE IF NOT EXISTS public.tempstktrndtlssuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    entsrlno INTEGER,
    stockno TEXT,
    batchsrlno TEXT,
    locnid TEXT,
    orddoctype INTEGER,
    orddocnoprefix TEXT,
    orddocno INTEGER,
    ordentsrlno INTEGER,
    ordentsubsrlno INTEGER,
    refdoctype INTEGER,
    refdocnoprefix TEXT,
    refdocno TEXT,
    refentsrlno INTEGER,
    docqty NUMERIC,
    phyqtyin NUMERIC,
    phyqtyout NUMERIC,
    stkupdtrate NUMERIC,
    stkupdtvaluein NUMERIC,
    stkupdtvalueout NUMERIC,
    docentrate NUMERIC,
    docentvalue NUMERIC,
    docenttotdisc NUMERIC,
    docentvalaftdisc NUMERIC,
    docenttax NUMERIC,
    docentaddons NUMERIC,
    docentdedns NUMERIC,
    docentnetvalue NUMERIC,
    physqtyreturned DOUBLE PRECISION,
    docentbeftaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxaddons NUMERIC,
    docentafttaxdedns NUMERIC,
    docentdisc NUMERIC,
    docentvoidind BOOLEAN,
    itemtaxtype TEXT,
    custtaxtype TEXT,
    srctaxtype TEXT,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    docentbilldisc NUMERIC,
    expttrntype INTEGER,
    expttrndocpfx TEXT,
    expttrndocno TEXT,
    expttrndocsrlno INTEGER,
    expttrndocsubsrlno INTEGER,
    retnreasoncd TEXT,
    fwdreftrntype INTEGER,
    fwdrefctrlno INTEGER,
    fwdrefdocentsrlno INTEGER,
    backreftrntype INTEGER,
    backrefctrlno INTEGER,
    backrefdocentsrlno INTEGER,
    billpassind INTEGER,
    salespersoncd TEXT,
    stdtaxcomp1per NUMERIC,
    stdtaxcomp2per NUMERIC,
    stdtaxcomp3per NUMERIC,
    stdtaxcomp4per NUMERIC,
    stdtaxcomp5per NUMERIC,
    befcurbalqty NUMERIC,
    befcurbalval NUMERIC,
    aftcurbalqty NUMERIC,
    aftcurbalval NUMERIC,
    itemremarks TEXT,
    discrate NUMERIC,
    stockstateok BOOLEAN,
    actqty NUMERIC,
    extnrowid INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    tmpupdtflag INTEGER,
    itemmrpbilltm NUMERIC,
    batchno TEXT,
    gradecd TEXT,
    gradedesc TEXT,
    locationcd TEXT,
    locationdesc TEXT,
    reftrnctrlno INTEGER,
    compcode TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempstktrndtlssuper_store_id ON public.tempstktrndtlssuper(store_id);
ALTER TABLE public.tempstktrndtlssuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempstktrndtlssuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempstktrndtlssuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tempstktrnhrdsuper
CREATE TABLE IF NOT EXISTS public.tempstktrnhrdsuper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docrsncd TEXT,
    docdt TIMESTAMP WITH TIME ZONE,
    doctime TIMESTAMP WITH TIME ZONE,
    docstat TEXT,
    packcountdoc INTEGER,
    packcountphy INTEGER,
    partytype INTEGER,
    partyid TEXT,
    partystkdocno TEXT,
    partystkdocdt TIMESTAMP WITH TIME ZONE,
    totdocvalue NUMERIC,
    totdocdisc NUMERIC,
    totdoctax NUMERIC,
    totdocaddons NUMERIC,
    totdocdedns NUMERIC,
    netdocvalue NUMERIC,
    enteredsizewise BOOLEAN,
    taxcomp1 NUMERIC,
    taxcomp2 NUMERIC,
    taxcomp3 NUMERIC,
    taxcomp4 NUMERIC,
    taxcomp5 NUMERIC,
    frwdreftrntype INTEGER,
    frwdrefctrlno INTEGER,
    bkwdreftrntype INTEGER,
    bkwdrefctrlno INTEGER,
    docvoidind INTEGER,
    docremarks TEXT,
    totallineitems INTEGER,
    totdocentbeftaxaddons NUMERIC,
    totdocentbeftaxdedns NUMERIC,
    totdocentafttaxaddons NUMERIC,
    totdocentafttaxdedns NUMERIC,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    transportmode TEXT,
    transportcode TEXT,
    lrno TEXT,
    lrdate TIMESTAMP WITH TIME ZONE,
    vehicleno TEXT,
    presaleformname TEXT,
    presaleformsrlno TEXT,
    postsaleformname TEXT,
    postsaleformsrlno TEXT,
    additionalinfo1 TEXT,
    additionalinfo2 TEXT,
    additionalinfo3 TEXT,
    drivername TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tempstktrnhrdsuper_store_id ON public.tempstktrnhrdsuper(store_id);
ALTER TABLE public.tempstktrnhrdsuper ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tempstktrnhrdsuper' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tempstktrnhrdsuper FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: temptrangir1100super
CREATE TABLE IF NOT EXISTS public.temptrangir1100super (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    spdrowno INTEGER,
    stockno TEXT,
    class1cd TEXT,
    class2cd TEXT,
    subclass1cd TEXT,
    subclass2cd TEXT,
    sizecd TEXT,
    qty NUMERIC,
    docqty NUMERIC,
    currentcost NUMERIC,
    retail_price NUMERIC,
    discountrate NUMERIC,
    docentdisc NUMERIC,
    taxrate NUMERIC,
    docenttax NUMERIC,
    docentbeftaxaddons NUMERIC,
    docentafttaxaddons NUMERIC,
    docentbeftaxdedns NUMERIC,
    docentafttaxdedns NUMERIC,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_temptrangir1100super_store_id ON public.temptrangir1100super(store_id);
ALTER TABLE public.temptrangir1100super ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temptrangir1100super' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.temptrangir1100super FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tillacceptdisplaydtls
CREATE TABLE IF NOT EXISTS public.tillacceptdisplaydtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrntype INTEGER,
    tillindex INTEGER,
    acptcap TEXT,
    dispcap TEXT,
    acptvisible BOOLEAN,
    dispvisible BOOLEAN,
    acptpos INTEGER,
    disppos INTEGER,
    acptdatatype INTEGER,
    dispdatatype INTEGER,
    acptwidth DOUBLE PRECISION,
    dispwidth DOUBLE PRECISION,
    acptalign INTEGER,
    dispalign INTEGER,
    acptfontname TEXT,
    dispfontname TEXT,
    acptfourcolour TEXT,
    dispfourcolour TEXT,
    acptfontsize DOUBLE PRECISION,
    dispfontsize DOUBLE PRECISION,
    acptrowhight DOUBLE PRECISION,
    disprowhight DOUBLE PRECISION,
    acptbackcolour TEXT,
    dispbackcolour TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tillacceptdisplaydtls_store_id ON public.tillacceptdisplaydtls(store_id);
ALTER TABLE public.tillacceptdisplaydtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tillacceptdisplaydtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tillacceptdisplaydtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tilloperationjournaldtls
CREATE TABLE IF NOT EXISTS public.tilloperationjournaldtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrntype INTEGER,
    tilltrnctrlno INTEGER,
    tilltrndt TIMESTAMP WITH TIME ZONE,
    srlno INTEGER,
    currencycd TEXT,
    trnunits NUMERIC,
    convrate NUMERIC,
    rcptunits NUMERIC,
    loccurrrcptamt NUMERIC,
    paidunits NUMERIC,
    loccurrpaidamt NUMERIC,
    trnvalue NUMERIC,
    diffamt NUMERIC,
    tillpaymodetype INTEGER,
    backreftrntype INTEGER,
    backreftrnctrlno INTEGER,
    fwdreftrntype INTEGER,
    fwdreftrnctrlno INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tilloperationjournaldtls_store_id ON public.tilloperationjournaldtls(store_id);
ALTER TABLE public.tilloperationjournaldtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tilloperationjournaldtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tilloperationjournaldtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tilloperationjournalhdr
CREATE TABLE IF NOT EXISTS public.tilloperationjournalhdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrntype INTEGER,
    tilltrnctrlno INTEGER,
    tilltrndt TIMESTAMP WITH TIME ZONE,
    trntime TIMESTAMP WITH TIME ZONE,
    reftrntype INTEGER,
    reftrnctrlno INTEGER,
    nodeid TEXT,
    tillid TEXT,
    shiftid TEXT,
    tojamt NUMERIC,
    tojnarration TEXT,
    tojreason TEXT,
    tojlifttype TEXT,
    fromtillid TEXT,
    totillid TEXT,
    tojdiffamt NUMERIC,
    refshiftctrlno INTEGER,
    rcptunits NUMERIC,
    loccurrrcptamt NUMERIC,
    paidunits NUMERIC,
    loccurrpaidamt NUMERIC,
    backreftrntype INTEGER,
    backreftrnctrlno INTEGER,
    fwdreftrntype INTEGER,
    fwdreftrnctrlno INTEGER,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    shoperdbver INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tilloperationjournalhdr_store_id ON public.tilloperationjournalhdr(store_id);
ALTER TABLE public.tilloperationjournalhdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tilloperationjournalhdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tilloperationjournalhdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tillshiftdtls
CREATE TABLE IF NOT EXISTS public.tillshiftdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrndt TIMESTAMP WITH TIME ZONE,
    nodeid TEXT,
    shiftno TEXT,
    shiftctrlno INTEGER,
    shiftstarttime TIMESTAMP WITH TIME ZONE,
    shiftendtime TIMESTAMP WITH TIME ZONE,
    shiftstartvactr INTEGER,
    shiftendvactr INTEGER,
    cashierid TEXT,
    tillid TEXT,
    shiftstatus TEXT,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tillshiftdtls_store_id ON public.tillshiftdtls(store_id);
ALTER TABLE public.tillshiftdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tillshiftdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tillshiftdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tilltrnswisedenomination
CREATE TABLE IF NOT EXISTS public.tilltrnswisedenomination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    tilltrntype INTEGER,
    tilltrnctrlno INTEGER,
    srlno INTEGER,
    subsrlno INTEGER,
    tilltrndt TIMESTAMP WITH TIME ZONE,
    currencycd TEXT,
    trnfacevalue NUMERIC,
    trnunits NUMERIC,
    convrate NUMERIC,
    trnvalue NUMERIC,
    xs1 TEXT,
    xs2 TEXT,
    xs3 TEXT,
    xs4 TEXT,
    xs5 TEXT,
    xs6 TEXT,
    xs7 TEXT,
    xs8 TEXT,
    xi1 INTEGER,
    xi2 INTEGER,
    xi3 INTEGER,
    xi4 INTEGER,
    xm1 NUMERIC,
    xm2 NUMERIC,
    xm3 NUMERIC,
    xm4 NUMERIC,
    xd1 TIMESTAMP WITH TIME ZONE,
    xd2 TIMESTAMP WITH TIME ZONE,
    xd3 TIMESTAMP WITH TIME ZONE,
    xd4 TIMESTAMP WITH TIME ZONE,
    cs1 TEXT,
    cs2 TEXT,
    cs3 TEXT,
    cs4 TEXT,
    cs5 TEXT,
    cs6 TEXT,
    cs7 TEXT,
    cs8 TEXT,
    ci1 INTEGER,
    ci2 INTEGER,
    ci3 INTEGER,
    ci4 INTEGER,
    cm1 NUMERIC,
    cm2 NUMERIC,
    cm3 NUMERIC,
    cm4 NUMERIC,
    cd1 TIMESTAMP WITH TIME ZONE,
    cd2 TIMESTAMP WITH TIME ZONE,
    cd3 TIMESTAMP WITH TIME ZONE,
    cd4 TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tilltrnswisedenomination_store_id ON public.tilltrnswisedenomination(store_id);
ALTER TABLE public.tilltrnswisedenomination ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tilltrnswisedenomination' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tilltrnswisedenomination FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: transactioncomponentsdtls
CREATE TABLE IF NOT EXISTS public.transactioncomponentsdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnsubtype INTEGER,
    fieldcode TEXT,
    srlno INTEGER,
    eventid TEXT,
    eventkeycode INTEGER,
    componentdesc TEXT,
    orderofexec INTEGER,
    compstatus TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactioncomponentsdtls_store_id ON public.transactioncomponentsdtls(store_id);
ALTER TABLE public.transactioncomponentsdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactioncomponentsdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.transactioncomponentsdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tripsheetdtls
CREATE TABLE IF NOT EXISTS public.tripsheetdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    sourcecompcode TEXT,
    reftrntype INTEGER,
    reftrnctrlno INTEGER,
    dntrntype INTEGER,
    dntrnctrlno INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tripsheetdtls_store_id ON public.tripsheetdtls(store_id);
ALTER TABLE public.tripsheetdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tripsheetdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tripsheetdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tripsheethdr
CREATE TABLE IF NOT EXISTS public.tripsheethdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    docnoprefix TEXT,
    docno INTEGER,
    docdate TIMESTAMP WITH TIME ZONE,
    transportinfo1 TEXT,
    transportinfo2 TEXT,
    transportinfo3 TEXT,
    transportinfo4 TEXT,
    transportinfo5 TEXT,
    statusflag INTEGER,
    totnodocs INTEGER,
    totallineitems INTEGER,
    remarks TEXT,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tripsheethdr_store_id ON public.tripsheethdr(store_id);
ALTER TABLE public.tripsheethdr ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tripsheethdr' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tripsheethdr FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: tripsheetstatusdtls
CREATE TABLE IF NOT EXISTS public.tripsheetstatusdtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    statusctrlno TEXT,
    statusentsrlno INTEGER,
    tsreftrntype INTEGER,
    tsreftrnctrlno INTEGER,
    tsrefentsrlno INTEGER,
    sourcecompcode TEXT,
    salereftrntype INTEGER,
    salereftrnctrlno INTEGER,
    salerefentsrlno INTEGER,
    dnreftrntype INTEGER,
    dnreftrnctrlno INTEGER,
    dnrefentsrlno INTEGER,
    dnrefitemtagsrlno INTEGER,
    stockno TEXT,
    itemtag1 TEXT,
    deliveredqty NUMERIC,
    rescheduleqty NUMERIC,
    rejectedqty NUMERIC,
    rescheduledatetime TIMESTAMP WITH TIME ZONE,
    delivereddatetime TIMESTAMP WITH TIME ZONE,
    deliverystatus INTEGER,
    deliverystatusremarks TEXT,
    olditemflag INTEGER,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_tripsheetstatusdtls_store_id ON public.tripsheetstatusdtls(store_id);
ALTER TABLE public.tripsheetstatusdtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tripsheetstatusdtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.tripsheetstatusdtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: trnstockaudit
CREATE TABLE IF NOT EXISTS public.trnstockaudit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    trntype INTEGER,
    trnctrlno INTEGER,
    entsrlno INTEGER,
    itemtagsrlno INTEGER,
    stockno TEXT,
    batchno TEXT,
    gradecd TEXT,
    locationcd TEXT,
    stdexitemtag1 TEXT,
    docqty DOUBLE PRECISION,
    phyqtyin DOUBLE PRECISION,
    phyqtyout DOUBLE PRECISION,
    smcurbalqty NUMERIC,
    smcurbalval NUMERIC,
    smex01curbalqty NUMERIC,
    smex01curbalval NUMERIC,
    smex02curbalqty NUMERIC,
    smex02curbalval NUMERIC,
    dateinsert TIMESTAMP WITH TIME ZONE,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_trnstockaudit_store_id ON public.trnstockaudit(store_id);
ALTER TABLE public.trnstockaudit ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trnstockaudit' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.trnstockaudit FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: userwiseitemconfig
CREATE TABLE IF NOT EXISTS public.userwiseitemconfig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    userid TEXT,
    fieldid_position TEXT,
    formatsettings TEXT,
    updatestockmaster TEXT,
    cancreatenewc1c2combo INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_userwiseitemconfig_store_id ON public.userwiseitemconfig(store_id);
ALTER TABLE public.userwiseitemconfig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'userwiseitemconfig' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.userwiseitemconfig FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: vendoritems
CREATE TABLE IF NOT EXISTS public.vendoritems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    vendcd TEXT,
    recno INTEGER,
    itemclass1 TEXT,
    itemclass2 TEXT,
    preforalt TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_vendoritems_store_id ON public.vendoritems(store_id);
ALTER TABLE public.vendoritems ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendoritems' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.vendoritems FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT,
    nm TEXT,
    srctaxtype TEXT,
    maillistsrlno INTEGER,
    allowpartposupply BOOLEAN,
    vendortype TEXT,
    vendorlst TEXT,
    vendorcst TEXT,
    commissionpercent NUMERIC,
    ptfileapplicable INTEGER,
    ptfilesuffix TEXT,
    shopercomp TEXT,
    shoperver TEXT,
    shoperdelimiter TEXT,
    shoperenv TEXT,
    buyingfactor NUMERIC,
    sellingfactor NUMERIC,
    poapplicable INTEGER,
    wslink TEXT,
    wsusername TEXT,
    wspassword TEXT,
    wsssl INTEGER,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_vendors_store_id ON public.vendors(store_id);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.vendors FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: versiondtls
CREATE TABLE IF NOT EXISTS public.versiondtls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    verid INTEGER,
    verdate TIMESTAMP WITH TIME ZONE,
    mjversion TEXT,
    miversion TEXT,
    seriesid TEXT,
    patchid TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_versiondtls_store_id ON public.versiondtls(store_id);
ALTER TABLE public.versiondtls ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'versiondtls' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.versiondtls FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: versionwisetblsscript
CREATE TABLE IF NOT EXISTS public.versionwisetblsscript (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    verid INTEGER,
    srlno INTEGER,
    tblscript TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_versionwisetblsscript_store_id ON public.versionwisetblsscript(store_id);
ALTER TABLE public.versionwisetblsscript ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'versionwisetblsscript' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.versionwisetblsscript FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

-- Table: walkin
CREATE TABLE IF NOT EXISTS public.walkin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    walkinsysdate TIMESTAMP WITH TIME ZONE,
    walkinintervalctr INTEGER,
    walkininterval INTEGER,
    walkintimestart TEXT,
    walkintimeend TEXT,
    walkincurrentdate TIMESTAMP WITH TIME ZONE,
    walkincurrenttime TIMESTAMP WITH TIME ZONE,
    walkincount INTEGER,
    salecount INTEGER,
    salevalue NUMERIC,
    noofreason1 NUMERIC,
    noofreason2 NUMERIC,
    noofreason3 NUMERIC,
    noofreason4 NUMERIC,
    noofreason5 NUMERIC,
    docremarks TEXT,
    shoperdbver INTEGER,
    walkoutcount INTEGER,
    adjustfactorapplicable TEXT,
    vauid TEXT,
    vactr INTEGER,
    vatermid TEXT,
    vacompcode TEXT
);

CREATE INDEX IF NOT EXISTS idx_walkin_store_id ON public.walkin(store_id);
ALTER TABLE public.walkin ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'walkin' AND policyname = 'store_isolation') THEN
        CREATE POLICY store_isolation ON public.walkin FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
    END IF;
END $$;

----------------------------------------

