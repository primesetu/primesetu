import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

USER_KEEP_LIST = """
PersonnelShrmWise
AdditionalChargeDtls
TallyMasterInfo
ExportSysparam
TallyPostingSettings
MultiplePrices
TallyVchInfo
VersionwiseTblsScript
TallyHSNRules
Class12LocWise
TallyMapPurchTaxCat
PgmWiseFeatureDtls
SzHdrs
UserWiseItemConfig
paymodeacceptconfig
TblHdr
VendorItems
FeatureIntroDtls
StkTrnEDhdr
StockTrnSummary
Vendors
logwgsync
IncDefTable
crdtinvrcvdtls
WalkIn
VersionDtls
dbtuningconfig
StkTrnEDDtls
logdbtuningconfig
IncentiveGrpItemDtls
PurchOrdConfig
AccountSummary
AccountsMaster
IncShrmPeriodDtls
SPDefSettings
ActualScheduleTask
AgencyCatDtl
PhyTmpStockTakingItemExtd01
AgencyCatHdr
PhyStkDtlsExtd01
PhyTmpStkTrnDtlsExtd01
AgentActivity
ExtensionConfigInfo
BaleDtl
BaseCompTemplate
BillPassHdr
BillPassdtls
ExtensionConfigExternal
Datasyncconfig
ItemTagDtls
CRMFinalCustomer
ExtdMailingList
CRMQryInfo
ExtensionConfigInternal
DiscountDtls72
ChainStores
ItemTagConfig
ExtnPartnerInfo
Class12Combo
CrmQryStruc
ItemClassRestrict
logtrnsctrlno
ItemTagConfigFromHO
CurrencyCat
CustPriceGroups
DashBoardConfig
Customers
StkTrnDtlsExtd01
DayBeginPgms
DayEndPgms
ReportConfigPreferences
DcRefNoDtls
DownloadParams
crdtsalecustopbal
ExpectedTrnAddonDed
ExptTrnDtlsExtd01
ExpectedTrnDtls
ExpectedTrnHdr
Itemmasterbackup
ExpectedTrnRcpts
IniLoadingErrorLog
StockMasterExtd02
ExtdItemMaster
PrintTemplateConfigDtls
FileLoadingStatus
TillOperationJournalHdr
FranchiseeTrans
PTHDRsuper
Errole
Franchiselstloadeddtls
PTDTLsuper
GenLookUp
FilesFromHO
PurgeLogDtls
GenLookupExtd
TillOperationJournalDtls
DeliveryAdviceHdr
PtBrowsesuper
HotKeys
InPackSlipHdr
CommConfig
InPackSlipTrn
TallyPrintConfigHeader
TillShiftdtls
ItemMaster
ONACCcrdtntLinktblhdr
ItemMasterConfig
TallyPrintConfigDetails
ItemMasterLog
TillTrnswiseDenomination
DeliveryAdviceDtls
KPIDtls
ReportConfigSettings
LogAgentActivity
LogDataExtractDetail
LogTilldtls
LogDataExtractsummary
LogDataSync
TempIMConfigsuper
LstLoadedDtls
TempIMConfigDefValsuper
TillAcceptDisplaydtls
MailingList
TempItemMastersuper
Mismatchvalue
MissingDocNo
PCBillDtls
PHYSTKDL
TempItemExportTablesuper
POSActivityLogDtls
POSActivityLogHdr
POSCashTrn
TempFlatFileDtls
POSMODEDATADTLS
DeliveryNoteHdr
POSPayModes
PayTermsCat
PurgeLogHdr
Personnel
TransactionComponentsDtls
PhyStkDtls
PrefixDocLog
PhyStkHdr
DeliveryNoteDtls
PhyStockTakingItemBkUp
PosModeBalances
Poslstloadeddtls
PriceLoadingLog
ONACCcrdtntLinktbldtls
DeliveryNoteDtlsExtd01
TempGstDatasuper
PromoArApplCustDtls
ItemMasterExtd01
PromoArBillLvlDiscDtls
PromoArBuyItemGrpDtls
GS1Dtls
BillDueStatusHdr
PromoArGetItemGrpDtls
StkTrnAddlHdr
PromoArHeader
StockMasterExtd01
CurrencyDenomination
PromoArItemLvlDiscDtls
BillDueStatusDtls
PromoArShowroomDtls
BrowseSettings
PromoLogApplCustDtls
TempExtdMailingListsuper
ItemReClassConfig
PromoLogBillLvlDiscDtls
ExchangeOldItems
PromoLogBuyItemGrpDtls
MonthSummary
TRNStockAudit
PromoLogGetItemGrpDtls
TempPromoIfSPHsuper
ItemReClassHeader
PromoLogHeader
SISStatus
TempPromoIfSPCDsuper
TripSheetHdr
PromoLogItemLvlDiscDtls
TempPromoIfSPBIDsuper
PromoLogShowroomDtls
TempPromoIfSPGIDsuper
ItemReClassDtls
PromoMnApplCustDtls
StockMasterExtdOpBal
TempPromoIfSPIDDsuper
PrefixTrnNo
TripSheetDtls
PromoMnBillLvlDiscDtls
TempPromoIfSPBDDsuper
franchiseelog
PromoMnBuyItemGrpDtls
ExtensionConfigTable
PrefixMaster
PromoMnGetItemGrpDtls
PtInvoiceExtd01
PromoMnHeader
AcceptDisplayDtls
PrefixTrnLog
franmismatchlog
PrefixConfig
SchemesDefinitionHdr
PrefixTerminalGroups
PromoMnIntermediate
PDTFieldConfig
PromoMnItemLvlDiscDtls
PromoMnShowroomDtls
PhyTmpStockTakingSC
SchemesDefinitionDtls
PtInvoiceDtl
PaymodeAcceptDisplayDtls
PhyTmpStockTakingItem
PtInvoiceHdr
PurchOrdDtl
PaymodeAcceptDisplayDtlsextd
PhyTmpStkDtlsSumm
TempStkTrnHrdsuper
InfoTable
PurchOrdHdr
PhyTmpStockTakingProgressSumm
SchemesPointsSlabs
PurchOrdTrl
PhyStockTakingItemBkUp02
PurchPlan
ReportDates
PrintNodeTrnConfigMaster
PurchaseTaxCat
PhyTmpStkTrnDtls
TempBillWiseReport
RptSelFileName
SalesTaxRevisionHistory
PosCashTrnExtd01
SaleTrnHdr
SalesFactors
PrintBusinessHandlerMaster
PriceRange
SalesTaxCat
ShrmScriptExtd
SalesTaxRevision
PhyStockTakingItemBkUp01
ShrmScript
SizeCat
ExciseDutyDtls
PriceRangeSettings
SizeEntryFieldsConfig
PrintRendererMaster
StkTrnAddlDtls
ItemsFromHO
ExciseDutyComponents
crdtinvrcvhdr
PriceRangeCatDtls
COMPAREQTY
StkTrnDtls
StkTrnHdr
ItemMappingRules
TempPriceRevisionsuper
PrintLinkedRefLookUp
StockCreditNote
TripSheetStatusDtls
StockMaster
ItemMapping
StockMasterExtd
PrintLinkedRefInterface
SubClass1Cat
EventExtnFieldConfig
SubClass2Cat
SysParam
EventExtnKeyValueConfig
TempTranGIR1100super
SysParamExtd
PrintConfigSettingMaster
TempMultiStockNos
TempPriceRevisionReportsuper
SysParamLookUp
MessageCentre
SeasonsMaster
TempStkTrnDtlssuper
PriceRevision
TallyExportedTrans
TallyMapSettingInfo
SeasonsMasterLog
PayModeConfig
MessageCentreLog
FactorHeader
PrintConfigSetting
PriceRevisionHistory
CatalogSettings
ShoperScriptUpdateInfo
CustomerImport
ConFinSchemeDtls
ExportGenLookUp SISTransactionInfo
VaNode
SISFormulaTemplates
VaNodeDtls
SISObjectInfo
VaNodeRestrict
SISTableInfo
VaRestrictMnu
SISTransactionTemplatesInfo
VaUsg
SISTableRelation
VaVerTable
SISQueryLookup
SISQueryParam
vaCompWiseMnuOpt
SISTableRelationDetails
vaCompWiseUserPriority
SISFieldTemplates
vaCompany
vaDeviceids
vaMenu
vaUser
LiveUpdatePatDtls
VaRestrictMnuConfig
tmpShortCutTablesuper
TMPCHKFORDBCONSISTENCYTAB
AuthorisedPOSPatches
CustomPatchLocationDtls
PatchDownloadDetails
VaGroupRestrict
VaGroup
VaGroupWiseUserList
VaSecurityConfig
VaPasswordHistory
VaUserExtdInfo
VaLogHistory
SISWrapper
VaNodeExtd
VaGenlookup
VaContextHelpDtls
AlertEventDefinition
AlertDefinition
CommunicationConfig
ShprManiFest
ShprManifestLink
ReportConfigFields
ReportConfigs
ReportVariableInfo
ReportActionInfo
ReportInfo
ReportScheduleDetails
ReportScheduleHistory
ReportScheduleHeader
VaRestrictInfo
AlertHistory
PrintDesignerCategory
PrintDesignerFields
PrintDesignerTrnGrpInfo
BrowseSettings
vaMenuShortcut
BakSISSysParam
SISSysParam
SISJobList
SISJobListHistory
SISTaskList
ShoperScriptUpdateInfo
SISTaskListHistory
VAPatchDtls
""".strip().split('\n')

ALLOWED_TABLES_LOWER = {t.strip().lower() for t in USER_KEEP_LIST if t.strip()}

# Add SMRITI-OS native tables that might not be in the Shoper list
SMRITI_NATIVE = {
    "stores", "users", "va_groups", "va_group_permissions", "va_user_groups", 
    "va_group_menus", "transactions", "transaction_items", "customers", "partners",
    "departments", "menu_items", "general_lookup", "system_parameters", "alerts",
    "inventory_audits", "tills", "till_sessions", "loyalty_ledger", "loyalty_programs",
    "loyalty_tiers"
}

ALLOWED_TABLES_LOWER.update(SMRITI_NATIVE)

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    # All public schema tables
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    """)
    
    to_keep = []
    to_drop = []
    
    for t in tables:
        name = t['table_name']
        name_lower = name.lower()
        
        # Check if it matches any in the allowed list (including with s9sys_ prefix)
        is_allowed = False
        if name_lower in ALLOWED_TABLES_LOWER:
            is_allowed = True
        elif name_lower.startswith('s9sys_') and name_lower[6:] in ALLOWED_TABLES_LOWER:
            is_allowed = True
            
        if is_allowed:
            to_keep.append(name)
        else:
            to_drop.append(name)
            
    print(f"--- TABLES TO KEEP ({len(to_keep)}) ---")
    for k in sorted(to_keep):
        print(f"  [KEEP] {k}")
        
    print(f"\n--- TABLES TO DROP ({len(to_drop)}) ---")
    for d in sorted(to_drop):
        cnt = await conn.fetchval(f'SELECT count(*) FROM public."{d}"')
        row_str = f"({cnt} rows)" if cnt > 0 else ""
        print(f"  [DROP] {d} {row_str}")
        
    await conn.close()

asyncio.run(main())
