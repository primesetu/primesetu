"""
╔══════════════════════════════════════════════════════════════════════════════╗
║          SMRITI GOLDEN SEED ENGINE — v1.0                                  ║
║          Zero-Tension Company Provisioner                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Design Philosophy:                                                          ║
║    • ONE call provisions an entire new company — no manual setup ever.      ║
║    • Every seed is IDEMPOTENT (ON CONFLICT DO NOTHING). Safe to re-run.     ║
║    • Seeds run in dependency order (sysparam → lookup → masters → ops).     ║
║    • Company-specific overrides applied last (store code, name, GSTIN).     ║
║    • Adding new seed table = add one entry to SEED_STEPS list.              ║
║                                                                              ║
║  Usage in company_provisioner.py:                                            ║
║    from seeds.golden_seed_engine import GoldenSeedEngine                     ║
║    await GoldenSeedEngine.provision(conn, tenant_id, company_info)           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import json
import os
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Callable, Any
from sqlalchemy import text

log = logging.getLogger("smriti.seed_engine")
GOLDEN_DIR = os.path.join(os.path.dirname(__file__), "golden")
LEGACY_DIR  = os.path.dirname(__file__)  # existing seeds at seeds/ root


# ─────────────────────────────────────────────────────────────────────────────
#  Step definition — one entry per table
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class SeedStep:
    name:          str           # Human-readable step name (for logging)
    table:         str           # DB table name (without schema)
    json_file:     str           # Path to JSON file (absolute)
    pk_cols:       List[str]     # Primary key columns for ON CONFLICT clause
    col_map:       dict          # { "json_key": "db_column" } — rename/subset
    schema:        str = "s9"    # PostgreSQL schema
    batch:         int = 200     # Batch size for bulk inserts
    enabled:       bool = True
    conflict_cols: List[str] = field(default_factory=list)  # Override for serial-PK tables


# ─────────────────────────────────────────────────────────────────────────────
#  All seed steps — ordered by dependency
# ─────────────────────────────────────────────────────────────────────────────
SEED_STEPS: List[SeedStep] = [

    # ── 1. SysParam — 828 rows from real GKP store ──────────────────────────
    SeedStep(
        name="SysParam (GKP Golden)",
        table="sysparam",
        json_file=os.path.join(GOLDEN_DIR, "sysparam_gkp.json"),
        pk_cols=["id"],
        col_map={
            "id": "id", "descr": "descr", "paramcode": "paramcode",
            "boolean": "boolean", "intg": "intg", "txt": "txt",
            "dt": "dt", "sng": "sng", "cur": "cur", "opt": "opt",
            "fixed": "fixed", "changed": "changed",
            "category": "category", "catdescr": "catdescr",
            "disporder": "disporder", "wz": "wz",
            "wztype": "wztype", "wzorder": "wzorder",
            "vauid": "vauid", "vactr": "vactr",
            "vatermid": "vatermid", "vacompcode": "vacompcode",
        }
    ),

    # ── 2. GenLookUp — product categories, brands, departments, sizes, etc. ─
    SeedStep(
        name="GenLookup (Master Categories)",
        table="genlookup",
        json_file=os.path.join(LEGACY_DIR, "genlookup_seeds.json"),
        pk_cols=["recid", "code"],
        col_map={
            "Recid": "recid", "Code": "code",
            "Descr": "descr", "Flag": "flag", "Number": "number",
        }
    ),

    # ── 3. GenLookUpExtd — category metadata ─────────────────────────────────
    SeedStep(
        name="GenLookupExtd (Category Meta)",
        table="genlookupextd",
        json_file=os.path.join(LEGACY_DIR, "genlookupextd_seeds.json"),
        pk_cols=["recid"],
        col_map={
            "RecID": "recid", "Category": "category",
            "IsEditable": "iseditable", "Operations": "operations",
            "AddRules": "addrules", "EditRules": "editrules",
            "DeleteRules": "deleterules", "Additional1": "additional1",
            "Additional2": "additional2", "Description": "description",
        }
    ),

    # ── 4. AcceptDisplayDtls — billing field display config ──────────────────
    SeedStep(
        name="AcceptDisplayDtls (Billing Fields)",
        table="acceptdisplaydtls",
        json_file=os.path.join(LEGACY_DIR, "ad_seeds.json"),
        pk_cols=["trntype", "index"],
        col_map={
            "TrnType": "trntype", "Index": "index",
            "AcptCap": "acptcap", "DispCap": "dispcap",
            "AcptVisible": "acptvisible", "DispVisible": "dispvisible",
            "AcptPos": "acptpos", "DispPos": "disppos",
            "AcptDataType": "acptdatatype", "DispDataType": "dispdatatype",
            "AcptWidth": "acptwidth", "DispWidth": "dispwidth",
            "AcptAlign": "acptalign", "DispAlign": "dispalign",
        }
    ),

    # ── 5. BaseCompTemplate — bill/label template binary data ─────────────────
    SeedStep(
        name="BaseCompTemplate (Print Templates)",
        table="basecomptemplate",
        json_file=os.path.join(LEGACY_DIR, "basecomptemplate_seeds.json"),
        pk_cols=["tmplidno", "tmplextn", "srlno"],
        col_map={
            "TMPLIDNO": "tmplidno", "TMPLEXTN": "tmplextn",
            "SRLNO": "srlno", "TMPLFILEDTLS": "tmplfiledtls",
            "TMPLCOMPTYPE": "tmplcomptype", "TMPLLINEDTLS": "tmpllinedtls",
        }
    ),

    # ── 6. Class12Combo — valid Product × Brand combinations ─────────────────
    SeedStep(
        name="Class12Combo (Product-Brand Matrix)",
        table="class12combo",
        json_file=os.path.join(LEGACY_DIR, "class12combo_seeds.json"),
        pk_cols=["class1cd", "class2cd"],
        col_map={
            "Class1Cd": "class1cd", "Class2Cd": "class2cd",
            "Billable": "billable", "SizeGroup": "sizegroup",
            "RetailMarkUp": "retailmarkup", "DealerMarkUp": "dealermarkup",
            "ProdTaxType": "prodtaxtype",
            "SuperClass1": "superclass1", "SuperClass2": "superclass2",
        }
    ),

    # ── 7. SalesTaxCat — GST rate slabs ──────────────────────────────────────
    SeedStep(
        name="SalesTaxCat (GST Rates)",
        table="salestaxcat",
        json_file=os.path.join(GOLDEN_DIR, "salestaxcat.json"),
        pk_cols=["desttaxtype", "prodtaxtype", "srctaxtype"],
        col_map={
            "desttaxtype": "desttaxtype", "prodtaxtype": "prodtaxtype",
            "srctaxtype": "srctaxtype", "taxdesc": "taxdesc",
            "compcnt": "compcnt",
            "t1name": "t1name", "t1descr": "t1descr", "t1type": "t1type",
            "t1derivedformula": "t1derivedformula", "t1compon": "t1compon",
            "t1rate": "t1rate", "t1taxinclusive": "t1taxinclusive", "t1taxprintbill": "t1taxprintbill",
            "t2name": "t2name", "t2descr": "t2descr", "t2type": "t2type",
            "t2derivedformula": "t2derivedformula", "t2compon": "t2compon",
            "t2rate": "t2rate", "t2taxinclusive": "t2taxinclusive", "t2taxprintbill": "t2taxprintbill",
        }
    ),

    # ── 8. PaymodeConfig — Cash, Card, UPI, Cheque, etc. ─────────────────────
    SeedStep(
        name="PaymodeConfig (Payment Types)",
        table="paymodeconfig",
        json_file=os.path.join(GOLDEN_DIR, "paymodeconfig.json"),
        pk_cols=["paymodetype"],
        col_map={
            "paymodetype": "paymodetype", "paymodetypedesc": "paymodetypedesc",
            "billingcomponent": "billingcomponent",
            "submissioncomponent": "submissioncomponent",
            "realisationcomponent": "realisationcomponent",
            "activeflag": "activeflag", "typeofpaymode": "typeofpaymode",
            "userdefined": "userdefined",
        }
    ),

    # ── 9. PosPaymodes — CASH, VISA, GPAY, PHONEPE sub-codes ─────────────────
    SeedStep(
        name="PosPaymodes (POS Payment Sub-codes)",
        table="pospaymodes",
        json_file=os.path.join(GOLDEN_DIR, "pospaymodes.json"),
        pk_cols=["paymodetype", "paymodecode"],
        col_map={
            "paymodetype": "paymodetype", "paymodecode": "paymodecode",
            "isenabled": "isenabled", "tenderpervalue": "tenderpervalue",
            "srlnoapplicable": "srlnoapplicable",
            "percentageofbillamt": "percentageofbillamt",
            "billingrefcompcount": "billingrefcompcount",
            "submitrefcompcount": "submitrefcompcount",
            "realizerefcompcount": "realizerefcompcount",
            "tenderrefelem1cap": "tenderrefelem1cap",
            "tenderrefelem1type": "tenderrefelem1type",
            "tenderrefelem2cap": "tenderrefelem2cap",
            "tenderrefelem2type": "tenderrefelem2type",
        }
    ),

    # ── 10. PrefixMaster — document number prefix configuration ──────────────
    SeedStep(
        name="PrefixMaster (Document Prefixes)",
        table="prefixmaster",
        json_file=os.path.join(GOLDEN_DIR, "prefixmaster.json"),
        pk_cols=["trntype", "opid", "terminalgroupid", "srlno"],
        col_map={
            "trntype": "trntype", "opid": "opid",
            "terminalgroupid": "terminalgroupid", "srlno": "srlno",
            "prefix": "prefix", "baseprefix": "baseprefix",
            "suffix": "suffix", "isactive": "isactive",
            "resetrequired": "resetrequired", "resettype": "resettype",
        }
    ),

    # ── 11. PrefixTrnNo — running document numbers (all start at 0) ──────────
    SeedStep(
        name="PrefixTrnNo (Document Counters)",
        table="prefixtrnno",
        json_file=os.path.join(GOLDEN_DIR, "prefixtrnno.json"),
        pk_cols=["trntype", "actualprefix"],
        col_map={
            "trntype": "trntype", "actualprefix": "actualprefix",
            "docnumber": "docnumber", "isactive": "isactive",
        }
    ),

    # ── 12. Personnel — default staff / salesmen ──────────────────────────────
    SeedStep(
        name="Personnel (Staff Register)",
        table="personnel",
        json_file=os.path.join(GOLDEN_DIR, "personnel.json"),
        pk_cols=["code"],
        col_map={
            "code": "code", "nm": "nm", "type": "type",
            "isuser": "isuser", "loginid": "loginid",
            "userwt": "userwt", "activeflag": "activeflag",
            "allowinbilling": "allowinbilling", "isdefinedatho": "isdefinedatho",
        }
    ),

    # ── 13. Vendors — HO / principal supplier ────────────────────────────────
    SeedStep(
        name="Vendors (Supplier Register)",
        table="vendors",
        json_file=os.path.join(GOLDEN_DIR, "vendors.json"),
        pk_cols=["code"],
        col_map={
            "code": "code", "nm": "nm",
            "srctaxtype": "srctaxtype",
            "allowpartposupply": "allowpartposupply",
            "vendortype": "vendortype",
            "commissionpercent": "commissionpercent",
            "poapplicable": "poapplicable",
            "ptfileapplicable": "ptfileapplicable",
            "ptfilesuffix": "ptfilesuffix",
        }
    ),

    # ── 14. SeasonsMaster — SS/AW standard seasons ───────────────────────────
    SeedStep(
        name="SeasonsMaster (Apparel Seasons)",
        table="seasonsmaster",
        json_file=os.path.join(GOLDEN_DIR, "seasonsmaster.json"),
        pk_cols=["seasonsname"],
        col_map={
            "seasonsname": "seasonsname", "startdate": "startdate",
            "enddate": "enddate", "isactive": "isactive",
            "stype": "stype", "snumber": "snumber", "syear": "syear",
        }
    ),

    # ── 15. PurchaseTaxCat — GST rates for inward GIR/PT transactions ─────────
    SeedStep(
        name="PurchaseTaxCat (Purchase GST Rates)",
        table="purchasetaxcat",
        json_file=os.path.join(GOLDEN_DIR, "purchasetaxcat.json"),
        pk_cols=["desttaxtype", "prodtaxtype", "srctaxtype"],
        col_map={
            "desttaxtype": "desttaxtype", "prodtaxtype": "prodtaxtype",
            "srctaxtype": "srctaxtype", "taxdesc": "taxdesc",
            "compcnt": "compcnt",
            "t1name": "t1name", "t1descr": "t1descr", "t1type": "t1type",
            "t1derivedformula": "t1derivedformula", "t1compon": "t1compon",
            "t1rate": "t1rate", "t1taxinclusive": "t1taxinclusive", "t1taxprintbill": "t1taxprintbill",
            "t2name": "t2name", "t2descr": "t2descr", "t2type": "t2type",
            "t2derivedformula": "t2derivedformula", "t2compon": "t2compon",
            "t2rate": "t2rate", "t2taxinclusive": "t2taxinclusive", "t2taxprintbill": "t2taxprintbill",
        }
    ),

    # ── 16. SzHdrs — Size Group Headers (APPAREL, BOTTOM, SHOE, FREE, KID) ───
    SeedStep(
        name="SzHdrs (Size Group Headers)",
        table="szhdrs",
        json_file=os.path.join(GOLDEN_DIR, "szhdrs.json"),
        pk_cols=["sizegroup"],
        col_map={
            "sizegroup": "sizegroup", "sizedesc": "sizedesc", "activeflag": "activeflag",
        }
    ),

    # ── 17. SzCatDtls — Individual size codes (S/M/L/XL, 28/30/32, etc.) ─────
    SeedStep(
        name="SzCatDtls (Size Codes)",
        table="szcatdtls",
        json_file=os.path.join(GOLDEN_DIR, "szcatdtls.json"),
        pk_cols=["sizegroup", "sizecd"],
        col_map={
            "sizegroup": "sizegroup", "sizecd": "sizecd",
            "sizedescr": "sizedescr", "sizeorder": "sizeorder", "activeflag": "activeflag",
        }
    ),

    # ── 18. SubClass1Cat — Sub-classification tier 1 ─────────────────────────
    SeedStep(
        name="SubClass1Cat (Sub-Category Tier 1)",
        table="subclass1cat",
        json_file=os.path.join(GOLDEN_DIR, "subclass1cat.json"),
        pk_cols=["class1cd", "class2cd", "subclass1cd"],
        col_map={
            "class1cd": "class1cd", "class2cd": "class2cd",
            "subclass1cd": "subclass1cd", "subclass1desc": "subclass1desc",
            "prodtaxtype": "prodtaxtype", "regularind": "regularind",
        }
    ),

    # ── 19. SubClass2Cat — Sub-classification tier 2 ─────────────────────────
    SeedStep(
        name="SubClass2Cat (Sub-Category Tier 2)",
        table="subclass2cat",
        json_file=os.path.join(GOLDEN_DIR, "subclass2cat.json"),
        pk_cols=["class1cd", "class2cd", "subclass2cd"],
        col_map={
            "class1cd": "class1cd", "class2cd": "class2cd",
            "subclass2cd": "subclass2cd", "subclass2desc": "subclass2desc",
        }
    ),

    # ── 20. VersionDtls — Shoper9 version record (prevents startup warning) ───
    SeedStep(
        name="VersionDtls (Version Record)",
        table="versiondtls",
        json_file=os.path.join(GOLDEN_DIR, "versiondtls.json"),
        pk_cols=["verid"],
        col_map={
            "verid": "verid", "mjversion": "mjversion", "miversion": "miversion",
            "seriesid": "seriesid", "patchid": "patchid", "verdate": "verdate",
        }
    ),

    # ── 21. CommConfig — HO/POS sync mode config (prevents missing cfg error) ─
    SeedStep(
        name="CommConfig (Sync Mode Config)",
        table="commconfig",
        json_file=os.path.join(GOLDEN_DIR, "commconfig.json"),
        pk_cols=["synctype", "mode"],
        col_map={
            "synctype": "synctype", "mode": "mode",
            "active": "active", "configxml": "configxml",
        }
    ),

    # ── 22. TerminalMaster — Default POS terminal (required for billing) ──────
    SeedStep(
        name="TerminalMaster (POS Terminal)",
        table="terminalmaster",
        json_file=os.path.join(GOLDEN_DIR, "terminalmaster.json"),
        pk_cols=["terminalid"],
        col_map={
            "terminalid": "terminalid", "terminaldesc": "terminaldesc",
            "terminalgroupid": "terminalgroupid", "terminaltype": "terminaltype",
            "activeflag": "activeflag", "isdefault": "isdefault",
            "printreceiptflag": "printreceiptflag", "nodeid": "nodeid",
            "terminalipaddress": "terminalipaddress",
            "printerport": "printerport", "cashdrawerport": "cashdrawerport",
        }
    ),

    # ── 23. AgencyCatHdr — Card agency master (Visa, MC, RuPay, Amex) ────────
    SeedStep(
        name="AgencyCatHdr (Card Agencies)",
        table="agencycathdr",
        json_file=os.path.join(GOLDEN_DIR, "agencycathdr.json"),
        pk_cols=["agencyid"],
        col_map={
            "agencyid": "agencyid", "agencynm": "agencynm",
            "onlineauthpresent": "onlineauthpresent",
            "allowcrdtcard": "allowcrdtcard", "allowgiftcpn": "allowgiftcpn",
        }
    ),

    # ── 24. AgencyCatDtl — Agency → Paymode linkage ───────────────────────────
    SeedStep(
        name="AgencyCatDtl (Agency-Paymode Links)",
        table="agencycatdtl",
        json_file=os.path.join(GOLDEN_DIR, "agencycatdtl.json"),
        pk_cols=["agencycode", "paymodetype", "paymodecode"],
        col_map={
            "agencycode": "agencycode",
            "paymodetype": "paymodetype", "paymodecode": "paymodecode",
            "issuedbyagency": "issuedbyagency",
            "cansubmittoagency": "cansubmittoagency",
            "agencycommrate": "agencycommrate",
            "onlinesubreal": "onlinesubreal",
        }
    ),

    # ── 25. SchemesDefinitionHdr — Billing schemes header ────────────────────
    SeedStep(
        name="SchemesDefinitionHdr (Billing Schemes)",
        table="schemesdefinitionhdr",
        json_file=os.path.join(GOLDEN_DIR, "schemesdefinitionhdr.json"),
        pk_cols=["schemecode"],
        col_map={
            "schemecode": "schemecode", "schemedescr": "schemedescr",
            "schemeon": "schemeon", "iscommonforall": "iscommonforall",
            "schemestatus": "schemestatus",
        }
    ),

    # ── 26. SchemesDefinitionDtls — Scheme rules (discount %, points) ────────
    SeedStep(
        name="SchemesDefinitionDtls (Scheme Rules)",
        table="schemesdefinitiondtls",
        json_file=os.path.join(GOLDEN_DIR, "schemesdefinitiondtls.json"),
        pk_cols=["schemecode", "srlno"],
        col_map={
            "schemecode": "schemecode", "srlno": "srlno",
            "groupsrlno": "groupsrlno", "intermsof": "intermsof",
            "schemevalue": "schemevalue", "basedon": "basedon",
            "slabfrom": "slabfrom", "slabto": "slabto",
            "attributelevel": "attributelevel",
        }
    ),

    # ── 27. AccountsMaster — Chart of accounts (Cash, GST, Sales…) ───────────
    SeedStep(
        name="AccountsMaster (Chart of Accounts)",
        table="accountsmaster",
        json_file=os.path.join(GOLDEN_DIR, "accountsmaster.json"),
        pk_cols=["type", "code"],
        col_map={
            "type": "type", "code": "code", "nm": "nm",
            "yropbaldb": "yropbaldb", "yropbalcr": "yropbalcr",
            "curbaldb": "curbaldb", "curbalcr": "curbalcr",
        }
    ),

    # ── 28. PaymodeAcceptDisplayDtls — Payment capture field config ───────────
    SeedStep(
        name="PaymodeAcceptDisplayDtls (Payment UI Fields)",
        table="paymodeacceptdisplaydtls",
        json_file=os.path.join(GOLDEN_DIR, "paymodeacceptdisplaydtls.json"),
        pk_cols=["paymode", "index", "paycode"],
        col_map={
            "paymode": "paymode", "index": "index", "paycode": "paycode",
            "acptcap": "acptcap", "dispcap": "dispcap",
            "acptvisible": "acptvisible", "dispvisible": "dispvisible",
            "acptpos": "acptpos", "disppos": "disppos",
            "acptdatatype": "acptdatatype", "dispdatatype": "dispdatatype",
            "acptwidth": "acptwidth", "dispwidth": "dispwidth",
            "acptalign": "acptalign", "dispalign": "dispalign",
        }
    ),

    # ── 29. TillAcceptDisplayDtls — Till open/close screen field config ───────
    SeedStep(
        name="TillAcceptDisplayDtls (Shift Screen Fields)",
        table="tillacceptdisplaydtls",
        json_file=os.path.join(GOLDEN_DIR, "tillacceptdisplaydtls.json"),
        pk_cols=["tilltrntype", "tillindex"],
        col_map={
            "tilltrntype": "tilltrntype", "tillindex": "tillindex",
            "acptcap": "acptcap", "dispcap": "dispcap",
            "acptvisible": "acptvisible", "dispvisible": "dispvisible",
            "acptpos": "acptpos", "disppos": "disppos",
            "acptdatatype": "acptdatatype", "dispdatatype": "dispdatatype",
            "acptwidth": "acptwidth", "dispwidth": "dispwidth",
            "acptalign": "acptalign", "dispalign": "dispalign",
        }
    ),

    # ── 30. ConfinSchemeDtls — Paymode finance/EMI scheme linkage ─────────────
    SeedStep(
        name="ConfinSchemeDtls (Finance Scheme Links)",
        table="confinschemedtls",
        json_file=os.path.join(GOLDEN_DIR, "confinschemedtls.json"),
        pk_cols=["paymodetype", "paymodecode", "schemecode"],
        col_map={
            "paymodetype": "paymodetype", "paymodecode": "paymodecode",
            "schemecode": "schemecode", "schemename": "schemename",
            "activeflag": "activeflag",
            "noofinstallments": "noofinstallments", "downpayment": "downpayment",
        }
    ),

    # ── 31. AdditionalChargeDtls — Surcharge config per paymode (all 0%) ─────
    SeedStep(
        name="AdditionalChargeDtls (Surcharge Rules)",
        table="additionalchargedtls",
        json_file=os.path.join(GOLDEN_DIR, "additionalchargedtls.json"),
        pk_cols=["paymodecode", "schemecode", "addnlchrgcd"],
        col_map={
            "paymodecode": "paymodecode", "schemecode": "schemecode",
            "addnlchrgcd": "addnlchrgcd", "applicable": "applicable",
            "percentoramt": "percentoramt", "addnlchrgvalue": "addnlchrgvalue",
        }
    ),

    # ── 32. PrintNodeTrnConfigMaster — Node-level print config per trntype ────
    SeedStep(
        name="PrintNodeTrnConfigMaster (Node Print Config)",
        table="printnodetrnconfigmaster",
        json_file=os.path.join(GOLDEN_DIR, "printnodetrnconfigmaster.json"),
        pk_cols=["nodeid", "trntypeidentifier", "linkedrefid"],
        col_map={
            "nodeid": "nodeid", "trntypeidentifier": "trntypeidentifier",
            "trntypeidcaption": "trntypeidcaption", "trntypegroup": "trntypegroup",
            "displayorder": "displayorder", "linkedrefid": "linkedrefid",
            "trnlinkedrefexecutionorder": "trnlinkedrefexecutionorder",
            "printpreference": "printpreference", "isactive": "isactive",
        }
    ),

    # ── 33. PrintTemplateConfigDtls — Terminal × TrnType → Template name ─────
    SeedStep(
        name="PrintTemplateConfigDtls (Template Assignments)",
        table="printtemplateconfigdtls",
        json_file=os.path.join(GOLDEN_DIR, "printtemplateconfigdtls.json"),
        pk_cols=["linkrefid", "terminalid", "trntype", "templatename"],
        col_map={
            "linkrefid": "linkrefid", "terminalid": "terminalid",
            "trntype": "trntype", "templatename": "templatename",
            "templatetype": "templatetype", "showprintpreview": "showprintpreview",
        }
    ),

    # ── 34. TransactionComponentsDtls — Accounting field map per trntype ─────
    SeedStep(
        name="TransactionComponentsDtls (Accounting Components)",
        table="transactioncomponentsdtls",
        json_file=os.path.join(GOLDEN_DIR, "transactioncomponentsdtls.json"),
        pk_cols=["trntype", "fieldcode", "srlno", "eventid"],
        col_map={
            "trntype": "trntype", "trnsubtype": "trnsubtype",
            "fieldcode": "fieldcode", "srlno": "srlno", "eventid": "eventid",
            "eventkeycode": "eventkeycode", "componentdesc": "componentdesc",
            "orderofexec": "orderofexec", "compstatus": "compstatus",
        }
    ),

    # ── 35. BrowseSettings — Grid column visibility for key browsers ──────────
    SeedStep(
        name="BrowseSettings (Browser Column Config)",
        table="browsesettings",
        json_file=os.path.join(GOLDEN_DIR, "browsesettings.json"),
        pk_cols=[],          # smriti_id is serial autoincrement — no conflict key
        conflict_cols=["browseid", "fldname", "userid", "appname"],
        col_map={
            "browseid": "browseid", "browsetype": "browsetype",
            "browsename": "browsename", "userid": "userid",
            "appname": "appname", "trntype": "trntype",
            "fldname": "fldname", "fldcaption": "fldcaption", "fldtype": "fldtype",
            "fldenabled": "fldenabled", "dispinbrowse": "dispinbrowse",
            "dispinfilter": "dispinfilter", "dispinresult": "dispinresult",
            "alowfilter": "alowfilter", "sortorder": "sortorder",
        }
    ),

    # ── 36. CatalogSettings — Field visibility per form/module ────────────────
    SeedStep(
        name="CatalogSettings (Form Field Visibility)",
        table="catalogsettings",
        json_file=os.path.join(GOLDEN_DIR, "catalogsettings.json"),
        pk_cols=["appname", "formname", "fldname", "shoperenvtype", "pgmoption", "userid"],
        col_map={
            "appname": "appname", "formname": "formname", "fldname": "fldname",
            "shoperenvtype": "shoperenvtype", "pgmoption": "pgmoption", "userid": "userid",
            "fldcaption": "fldcaption", "fldtype": "fldtype",
            "fldenabled": "fldenabled", "displayflag": "displayflag", "activeflag": "activeflag",
        }
    ),
]




# ─────────────────────────────────────────────────────────────────────────────
#  Engine
# ─────────────────────────────────────────────────────────────────────────────
class GoldenSeedEngine:
    """
    Single entry point for seeding a brand new SMRITI company with all
    factory defaults derived from the GKP Shoper9 golden template.

    Usage:
        await GoldenSeedEngine.provision(conn, tenant_id, {
            "company_name":    "My Store",
            "invoice_prefix":  "MYS",
            "gstin":           "09ABCDE1234F1Z5",
            "store_code":      "MYS",
            "owner_mobile":    "9876543210",
        })
    """

    @classmethod
    async def provision(
        cls,
        conn,
        tenant_id: str,
        company_info: dict | None = None,
        segment: str = "APPAREL_RETAIL",
    ) -> dict:
        """
        Run all seed steps in order. Each step is idempotent.
        Returns a summary dict with counts per table.
        """
        summary = {}
        company_info = company_info or {}

        log.info(f"[GoldenSeed] Provisioning tenant={tenant_id} segment={segment}")

        for step in SEED_STEPS:
            if not step.enabled:
                log.debug(f"[GoldenSeed] SKIP {step.name} (disabled)")
                continue

            count = await cls._run_step(conn, step, tenant_id)
            summary[step.table] = count
            log.info(f"[GoldenSeed]  ✅ {step.name}: {count} rows seeded")

        # ── Final pass: company-specific overrides in s9.sysparam ────────────
        overrides = cls._build_company_overrides(tenant_id, company_info)
        for row in overrides:
            await conn.execute(text("""
                INSERT INTO s9.sysparam (tenant_id, id, paramcode, descr, txt, opt, category, fixed)
                VALUES (:tid, :id, :paramcode, :descr, :txt, 'T', 'COMPANY', 'Variable')
                ON CONFLICT (id) DO UPDATE SET txt = EXCLUDED.txt
            """), row)
        summary["_company_overrides"] = len(overrides)
        log.info(f"[GoldenSeed]  ✅ Company Overrides: {len(overrides)} params applied")

        # ── Chainstores self-registration (dynamic — uses company_info) ───────
        await cls._seed_chainstores(conn, tenant_id, company_info)
        summary["chainstores"] = 1
        log.info("[GoldenSeed]  ✅ ChainStores: self-registration inserted")

        log.info(f"[GoldenSeed] Provisioning COMPLETE for tenant={tenant_id}")
        return summary

    @classmethod
    async def _run_step(cls, conn, step: SeedStep, tenant_id: str) -> int:
        """Load JSON → transform → bulk upsert into s9.<table>"""
        if not os.path.exists(step.json_file):
            log.warning(f"[GoldenSeed] MISSING seed file: {step.json_file}")
            return 0

        with open(step.json_file, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        if not raw_data:
            return 0

        rows = cls._transform(raw_data, step, tenant_id)
        if not rows:
            return 0

        # Build columns list and parameterized INSERT
        cols      = list(rows[0].keys())
        col_names = ", ".join(cols)
        col_params = ", ".join(f":{c}" for c in cols)

        # Determine conflict resolution:
        #   conflict_cols → explicit logical unique key (e.g. browsesettings)
        #   pk_cols       → table primary key
        #   neither       → skip ON CONFLICT entirely (very rare)
        effective_conflict = step.conflict_cols or step.pk_cols
        if effective_conflict:
            pk_conflict = ", ".join(effective_conflict)
            conflict_clause = f"ON CONFLICT ({pk_conflict}) DO NOTHING"
        else:
            conflict_clause = ""   # plain INSERT; caller must ensure uniqueness

        sql = text(f"""
            INSERT INTO {step.schema}.{step.table} ({col_names})
            VALUES ({col_params})
            {conflict_clause}
        """)

        inserted = 0
        for i in range(0, len(rows), step.batch):
            batch = rows[i : i + step.batch]
            await conn.execute(sql, batch)
            inserted += len(batch)

        return inserted

    @classmethod
    def _transform(cls, raw: list, step: SeedStep, tenant_id: str) -> list:
        """Map JSON keys → DB column names, inject tenant_id, sanitize types."""
        result = []
        for item in raw:
            row = {"tenant_id": tenant_id}
            for json_key, db_col in step.col_map.items():
                # Try exact key first, then lowercase fallback
                val = item.get(json_key, item.get(json_key.lower()))
                row[db_col] = cls._sanitize(val)
            result.append(row)
        return result

    @staticmethod
    def _sanitize(val: Any) -> Any:
        """Coerce empty strings to None, keep everything else as-is."""
        if val == "" or val == "null":
            return None
        return val

    @staticmethod
    def _build_company_overrides(tenant_id: str, info: dict) -> list:
        """Build company-specific sysparam rows from provisioning info."""
        store_code   = info.get("invoice_prefix", info.get("store_code", "SMRITI")).upper()
        company_name = info.get("company_name", "SMRITI Retail Store")
        gstin        = info.get("gstin", "")
        owner_mobile = info.get("owner_mobile", "")

        return [
            {"tid": tenant_id, "id": "SMRITI_CompanyCode",  "paramcode": "CompanyCode",  "descr": "Company/Store Code",    "txt": store_code[:3]},
            {"tid": tenant_id, "id": "SMRITI_CompanyName",  "paramcode": "CompanyName",  "descr": "Company Name",          "txt": company_name},
            {"tid": tenant_id, "id": "SMRITI_StoreCode",    "paramcode": "StoreCode",    "descr": "Invoice Prefix/Code",   "txt": store_code},
            {"tid": tenant_id, "id": "SMRITI_GSTIN",        "paramcode": "GSTIN",        "descr": "GST Registration No",   "txt": gstin},
            {"tid": tenant_id, "id": "SMRITI_OwnerMobile",  "paramcode": "OwnerMobile",  "descr": "Owner Mobile Number",   "txt": owner_mobile},
            {"tid": tenant_id, "id": "SMRITI_DBVersion",    "paramcode": "DBVersion",    "descr": "SMRITI DB Version",     "txt": "1.0"},
            {"tid": tenant_id, "id": "SMRITI_AppSegment",   "paramcode": "SMRITIAppSeg", "descr": "Application Segment",   "txt": "Apparel"},
            {"tid": tenant_id, "id": "SMRITI_Env",          "paramcode": "SMRITIEnv",    "descr": "Environment Type",      "txt": "R"},
            {"tid": tenant_id, "id": "SMRITI_BillPfx_SL",   "paramcode": "BillPfxSL",   "descr": "Sale Bill Prefix",      "txt": f"{store_code[:3]}B"},
            {"tid": tenant_id, "id": "SMRITI_BillPfx_PT",   "paramcode": "BillPfxPT",   "descr": "GIR/Purchase Prefix",   "txt": f"{store_code[:3]}GIR"},
        ]

    @classmethod
    async def _seed_chainstores(cls, conn, tenant_id: str, info: dict) -> None:
        """
        Self-register this store in s9.chainstores.
        Every Shoper9 store must have its own row so inter-store transfers,
        GIR documents and PT files resolve the source company correctly.
        """
        store_code   = info.get("invoice_prefix", info.get("store_code", "SMRITI")).upper()
        company_name = info.get("company_name", "SMRITI Retail Store")
        gstin        = info.get("gstin", "")
        await conn.execute(text("""
            INSERT INTO s9.chainstores (
                tenant_id, code, type, nm, allowmiscrcpt, allowmiscissue,
                shopercomp, shoperver, shoperenv, srctaxtype, poapplicable, lstno
            )
            VALUES (
                :tid, :code, 1, :nm, true, true,
                'S9', '9.0', 'R', 'E', 1, :gstin
            )
            ON CONFLICT (code) DO NOTHING
        """), {"tid": tenant_id, "code": store_code[:16], "nm": company_name, "gstin": gstin})


# ─────────────────────────────────────────────────────────────────────────────
#  Standalone helper — copy sysparam_gkp_seeds.json to golden/ if not there
# ─────────────────────────────────────────────────────────────────────────────
def ensure_sysparam_golden():
    """Copy app/seeds/sysparam_gkp_seeds.json → seeds/golden/sysparam_gkp.json if needed."""
    dst = os.path.join(GOLDEN_DIR, "sysparam_gkp.json")
    if os.path.exists(dst):
        return
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "app", "seeds", "sysparam_gkp_seeds.json"),
        os.path.join(os.path.dirname(__file__), "sysparam_golden.csv"),
    ]
    for src in candidates:
        src = os.path.abspath(src)
        if os.path.exists(src):
            import shutil
            shutil.copy2(src, dst)
            log.info(f"[GoldenSeed] Copied sysparam seeds: {src} → {dst}")
            return
    log.warning("[GoldenSeed] sysparam_gkp.json not found — sysparam step will be skipped")
