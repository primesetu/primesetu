import os, json

SEEDS  = os.path.dirname(__file__)
GOLDEN = os.path.join(SEEDS, "golden")

steps = [
    # Phase 0 — Original 14
    ("sysparam_gkp.json",              GOLDEN, "sysparam",                  "P0", "SysParam (GKP Golden)"),
    ("genlookup_seeds.json",            SEEDS,  "genlookup",                 "P0", "GenLookup"),
    ("genlookupextd_seeds.json",        SEEDS,  "genlookupextd",             "P0", "GenLookupExtd"),
    ("ad_seeds.json",                   SEEDS,  "acceptdisplaydtls",         "P0", "AcceptDisplayDtls"),
    ("basecomptemplate_seeds.json",     SEEDS,  "basecomptemplate",          "P0", "BaseCompTemplate"),
    ("class12combo_seeds.json",         SEEDS,  "class12combo",              "P0", "Class12Combo"),
    ("salestaxcat.json",                GOLDEN, "salestaxcat",               "P0", "SalesTaxCat"),
    ("paymodeconfig.json",              GOLDEN, "paymodeconfig",             "P0", "PaymodeConfig"),
    ("pospaymodes.json",                GOLDEN, "pospaymodes",               "P0", "PosPaymodes"),
    ("prefixmaster.json",               GOLDEN, "prefixmaster",              "P0", "PrefixMaster"),
    ("prefixtrnno.json",                GOLDEN, "prefixtrnno",               "P0", "PrefixTrnNo"),
    ("personnel.json",                  GOLDEN, "personnel",                 "P0", "Personnel"),
    ("vendors.json",                    GOLDEN, "vendors",                   "P0", "Vendors"),
    ("seasonsmaster.json",              GOLDEN, "seasonsmaster",             "P0", "SeasonsMaster"),
    # Phase 1 — Infrastructure
    ("purchasetaxcat.json",             GOLDEN, "purchasetaxcat",            "P1", "PurchaseTaxCat"),
    ("szhdrs.json",                     GOLDEN, "szhdrs",                    "P1", "SzHdrs"),
    ("szcatdtls.json",                  GOLDEN, "szcatdtls",                 "P1", "SzCatDtls"),
    ("subclass1cat.json",               GOLDEN, "subclass1cat",              "P1", "SubClass1Cat"),
    ("subclass2cat.json",               GOLDEN, "subclass2cat",              "P1", "SubClass2Cat"),
    ("versiondtls.json",                GOLDEN, "versiondtls",               "P1", "VersionDtls"),
    ("commconfig.json",                 GOLDEN, "commconfig",                "P1", "CommConfig"),
    ("terminalmaster.json",             GOLDEN, "terminalmaster",            "P1", "TerminalMaster"),
    # Phase 2 — Payment Completeness
    ("agencycathdr.json",               GOLDEN, "agencycathdr",              "P2", "AgencyCatHdr"),
    ("agencycatdtl.json",               GOLDEN, "agencycatdtl",              "P2", "AgencyCatDtl"),
    ("schemesdefinitionhdr.json",       GOLDEN, "schemesdefinitionhdr",      "P2", "SchemesDefinitionHdr"),
    ("schemesdefinitiondtls.json",      GOLDEN, "schemesdefinitiondtls",     "P2", "SchemesDefinitionDtls"),
    ("accountsmaster.json",             GOLDEN, "accountsmaster",            "P2", "AccountsMaster"),
    ("paymodeacceptdisplaydtls.json",   GOLDEN, "paymodeacceptdisplaydtls",  "P2", "PaymodeAcceptDisplayDtls"),
    ("tillacceptdisplaydtls.json",      GOLDEN, "tillacceptdisplaydtls",     "P2", "TillAcceptDisplayDtls"),
    # Phase 3 — Reporting & UI
    ("confinschemedtls.json",           GOLDEN, "confinschemedtls",          "P3", "ConfinSchemeDtls"),
    ("additionalchargedtls.json",       GOLDEN, "additionalchargedtls",      "P3", "AdditionalChargeDtls"),
    ("printnodetrnconfigmaster.json",   GOLDEN, "printnodetrnconfigmaster",  "P3", "PrintNodeTrnConfigMaster"),
    ("printtemplateconfigdtls.json",    GOLDEN, "printtemplateconfigdtls",   "P3", "PrintTemplateConfigDtls"),
    ("transactioncomponentsdtls.json",  GOLDEN, "transactioncomponentsdtls", "P3", "TransactionComponentsDtls"),
    ("browsesettings.json",             GOLDEN, "browsesettings",            "P3", "BrowseSettings"),
    ("catalogsettings.json",            GOLDEN, "catalogsettings",           "P3", "CatalogSettings"),
]

DYNAMIC = [("chainstores", "P1", "ChainStores (dynamic from company_info)")]

by_phase   = {"P0": 0, "P1": 0, "P2": 0, "P3": 0}
total_rows = 0
all_ok     = True

print("{:<3} {:<4} {:<34} {:>5}  STATUS".format("#", "PH", "TABLE", "ROWS"))
print("-" * 72)

for i, (fname, directory, table, phase, label) in enumerate(steps, 1):
    fpath = os.path.abspath(os.path.join(directory, fname))
    if os.path.exists(fpath):
        data = json.load(open(fpath, encoding="utf-8"))
        rows = len(data)
        total_rows += rows
        by_phase[phase] = by_phase.get(phase, 0) + rows
        print("{:<3} {:<4} {:<34} {:>5}  OK   {}".format(i, phase, table, rows, label))
    else:
        print("{:<3} {:<4} {:<34} {:>5}  MISSING".format(i, phase, table, ""))
        all_ok = False

for j, (table, phase, label) in enumerate(DYNAMIC, len(steps)+1):
    print("{:<3} {:<4} {:<34} {:>5}  DYNAMIC  {}".format(j, phase, table, "1*", label))

print()
print("=" * 72)
print("Phase 0 (original 14)  : {:>5,} rows".format(by_phase["P0"]))
print("Phase 1 (infra +8)     : {:>5,} rows + 1 dynamic".format(by_phase["P1"]))
print("Phase 2 (payments +7)  : {:>5,} rows".format(by_phase["P2"]))
print("Phase 3 (UI/reporting) : {:>5,} rows".format(by_phase["P3"]))
print("-" * 72)
print("TOTAL static rows      : {:>5,}".format(total_rows))
print("TOTAL seed steps       : {:>5}  (+ 1 dynamic = {})".format(len(steps), len(steps)+1))
print()
status = "[PASS] ALL {} SEED FILES PRESENT".format(len(steps)) if all_ok else "[FAIL] MISSING FILES DETECTED"
print(status)
