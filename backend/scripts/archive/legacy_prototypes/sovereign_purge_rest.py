import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

# THE HOLY PROTECTED LIST (As provided by user)
USER_KEEP_LIST = """
PersonnelShrmWise, AdditionalChargeDtls, TallyMasterInfo, ExportSysparam, TallyPostingSettings, 
MultiplePrices, TallyVchInfo, VersionwiseTblsScript, TallyHSNRules, Class12LocWise, 
TallyMapPurchTaxCat, PgmWiseFeatureDtls, SzHdrs, UserWiseItemConfig, paymodeacceptconfig, 
TblHdr, VendorItems, FeatureIntroDtls, StkTrnEDhdr, StockTrnSummary, Vendors, logwgsync, 
IncDefTable, crdtinvrcvdtls, WalkIn, VersionDtls, dbtuningconfig, StkTrnEDDtls, 
logdbtuningconfig, IncentiveGrpItemDtls, PurchOrdConfig, AccountSummary, AccountsMaster, 
IncShrmPeriodDtls, SPDefSettings, ActualScheduleTask, AgencyCatDtl, PhyTmpStockTakingItemExtd01, 
AgencyCatHdr, PhyStkDtlsExtd01, PhyTmpStkTrnDtlsExtd01, AgentActivity, ExtensionConfigInfo, 
BaleDtl, BaseCompTemplate, BillPassHdr, BillPassdtls, ExtensionConfigExternal, 
Datasyncconfig, ItemTagDtls, CRMFinalCustomer, ExtdMailingList, CRMQryInfo, 
ExtensionConfigInternal, DiscountDtls72, ChainStores, ItemTagConfig, ExtnPartnerInfo, 
Class12Combo, CrmQryStruc, ItemClassRestrict, logtrnsctrlno, ItemTagConfigFromHO, 
CurrencyCat, CustPriceGroups, DashBoardConfig, Customers, StkTrnDtlsExtd01, DayBeginPgms, 
DayEndPgms, ReportConfigPreferences, DcRefNoDtls, DownloadParams, crdtsalecustopbal, 
ExpectedTrnAddonDed, ExptTrnDtlsExtd01, ExpectedTrnDtls, ExpectedTrnHdr, Itemmasterbackup, 
ExpectedTrnRcpts, IniLoadingErrorLog, StockMasterExtd02, ExtdItemMaster, PrintTemplateConfigDtls, 
FileLoadingStatus, TillOperationJournalHdr, FranchiseeTrans, PTHDRsuper, Errole, 
Franchiselstloadeddtls, PTDTLsuper, GenLookUp, FilesFromHO, PurgeLogDtls, GenLookupExtd, 
TillOperationJournalDtls, DeliveryAdviceHdr, PtBrowsesuper, HotKeys, InPackSlipHdr, 
CommConfig, InPackSlipTrn, TallyPrintConfigHeader, TillShiftdtls, ItemMaster, 
ONACCcrdtntLinktblhdr, ItemMasterConfig, TallyPrintConfigDetails, ItemMasterLog, 
TillTrnswiseDenomination, DeliveryAdviceDtls, KPIDtls, ReportConfigSettings, 
LogAgentActivity, LogDataExtractDetail, LogTilldtls, LogDataExtractsummary, LogDataSync, 
TempIMConfigsuper, LstLoadedDtls, TempIMConfigDefValsuper, TillAcceptDisplaydtls, 
MailingList, TempItemMastersuper, Mismatchvalue, MissingDocNo, PCBillDtls, PHYSTKDL, 
TempItemExportTablesuper, POSActivityLogDtls, POSActivityLogHdr, POSCashTrn, 
TempFlatFileDtls, POSMODEDATADTLS, DeliveryNoteHdr, POSPayModes, PayTermsCat, PurgeLogHdr, 
Personnel, TransactionComponentsDtls, PhyStkDtls, PrefixDocLog, PhyStkHdr, 
DeliveryNoteDtls, PhyStockTakingItemBkUp, PosModeBalances, Poslstloadeddtls, 
PriceLoadingLog, ONACCcrdtntLinktbldtls, DeliveryNoteDtlsExtd01, TempGstDatasuper, 
PromoArApplCustDtls, ItemMasterExtd01, PromoArBillLvlDiscDtls, PromoArBuyItemGrpDtls, 
GS1Dtls, BillDueStatusHdr, PromoArGetItemGrpDtls, StkTrnAddlHdr, PromoArHeader, 
StockMasterExtd01, CurrencyDenomination, PromoArItemLvlDiscDtls, BillDueStatusDtls, 
PromoArShowroomDtls, BrowseSettings, PromoLogApplCustDtls, TempExtdMailingListsuper, 
ItemReClassConfig, PromoLogBillLvlDiscDtls, ExchangeOldItems, PromoLogBuyItemGrpDtls, 
MonthSummary, TRNStockAudit, PromoLogGetItemGrpDtls, TempPromoIfSPHsuper, ItemReClassHeader, 
PromoLogHeader, SISStatus, TempPromoIfSPCDsuper, TripSheetHdr, PromoLogItemLvlDiscDtls, 
TempPromoIfSPBIDsuper, PromoLogShowroomDtls, TempPromoIfSPGIDsuper, ItemClassRestrict, 
ItemReClassDtls, PromoMnApplCustDtls, StockMasterExtdOpBal, TempPromoIfSPIDDsuper, 
PrefixTrnNo, TripSheetDtls, PromoMnBillLvlDiscDtls, TempPromoIfSPBDDsuper, 
franchiseelog, PromoMnBuyItemGrpDtls, ExtensionConfigTable, PrefixMaster, 
PromoMnGetItemGrpDtls, PtInvoiceExtd01, PromoMnHeader, AcceptDisplayDtls, 
PrefixTrnLog, franmismatchlog, PrefixConfig, SchemesDefinitionHdr, PrefixTerminalGroups, 
PromoMnIntermediate, PDTFieldConfig, PromoMnItemLvlDiscDtls, PromoMnShowroomDtls, 
PhyTmpStockTakingSC, SchemesDefinitionDtls, PtInvoiceDtl, PaymodeAcceptDisplayDtls, 
PhyTmpStockTakingItem, PtInvoiceHdr, PurchOrdDtl, PaymodeAcceptDisplayDtlsextd, 
PhyTmpStkDtlsSumm, TempStkTrnHrdsuper, InfoTable, PurchOrdHdr, 
PhyTmpStockTakingProgressSumm, SchemesPointsSlabs, PurchOrdTrl, 
PhyStockTakingItemBkUp02, PurchPlan, ReportDates, PrintNodeTrnConfigMaster, 
PurchaseTaxCat, PhyTmpStkTrnDtls, TempBillWiseReport, RptSelFileName, 
SalesTaxRevisionHistory, PosCashTrnExtd01, SaleTrnHdr, SalesFactors, 
PrintBusinessHandlerMaster, PriceRange, SalesTaxCat, ShrmScriptExtd, 
SalesTaxRevision, PhyStockTakingItemBkUp01, ShrmScript, SizeCat, ExciseDutyDtls, 
PriceRangeSettings, SizeEntryFieldsConfig, PrintRendererMaster, StkTrnAddlDtls, 
ItemsFromHO, ExciseDutyComponents, crdtinvrcvhdr, PriceRangeCatDtls, COMPAREQTY, 
StkTrnDtls, StkTrnHdr, ItemMappingRules, TempPriceRevisionsuper, PrintLinkedRefLookUp, 
StockCreditNote, TripSheetStatusDtls, StockMaster, ItemMapping, StockMasterExtd, 
PrintLinkedRefInterface, SubClass1Cat, EventExtnFieldConfig, SubClass2Cat, SysParam, 
EventExtnKeyValueConfig, TempTranGIR1100super, SysParamExtd, PrintConfigSettingMaster, 
TempMultiStockNos, TempPriceRevisionReportsuper, SysParamLookUp, MessageCentre, 
SeasonsMaster, TempStkTrnDtlssuper, PriceRevision, TallyExportedTrans, 
TallyMapSettingInfo, SeasonsMasterLog, PayModeConfig, MessageCentreLog, FactorHeader, 
PrintConfigSetting, PriceRevisionHistory, CatalogSettings, ShoperScriptUpdateInfo, 
CustomerImport, ConFinSchemeDtls, ExportGenLookUp, SISTransactionInfo, VaNode, 
SISFormulaTemplates, VaNodeDtls, SISObjectInfo, VaNodeRestrict, SISTableInfo, 
VaRestrictMnu, SISTransactionTemplatesInfo, VaUsg, SISTableRelation, VaVerTable, 
SISQueryLookup, SISQueryParam, vaCompWiseMnuOpt, SISTableRelationDetails, 
vaCompWiseUserPriority, SISFieldTemplates, vaCompany, vaDeviceids, vaMenu, vaUser, 
LiveUpdatePatDtls, VaRestrictMnuConfig, tmpShortCutTablesuper, 
TMPCHKFORDBCONSISTENCYTAB, AuthorisedPOSPatches, CustomPatchLocationDtls, 
PatchDownloadDetails, VaGroupRestrict, VaGroup, VaGroupWiseUserList, 
VaSecurityConfig, VaPasswordHistory, VaUserExtdInfo, VaLogHistory, SISWrapper, 
VaNodeExtd, VaGenlookup, VaContextHelpDtls, AlertEventDefinition, AlertDefinition, 
CommunicationConfig, ShprManiFest, ShprManiFestLink, ReportConfigFields, 
ReportConfigs, ReportVariableInfo, ReportActionInfo, ReportInfo, ReportScheduleDetails, 
ReportScheduleHistory, ReportScheduleHeader, VaRestrictInfo, AlertHistory, 
PrintDesignerCategory, PrintDesignerFields, PrintDesignerTrnGrpInfo, BrowseSettings, 
vaMenuShortcut, BakSISSysParam, SISSysParam, SISJobList, SISJobListHistory, 
SISTaskList, SISTaskListHistory, VAPatchDtls
"""

# SMRITI-OS NATIVE TABLES
SMRITI_NATIVE = {
    "stores", "users", "va_groups", "va_group_permissions", "va_user_groups", 
    "va_group_menus", "transactions", "transaction_items", "customers", "partners",
    "departments", "menu_items", "general_lookup", "system_parameters", "alerts",
    "inventory_audits", "tills", "till_sessions", "loyalty_ledger", "loyalty_programs",
    "loyalty_tiers", "menu_categories"
}

def normalize(name):
    # Lowercase, remove underscores, remove s9sys prefix
    return name.lower().replace('_', '').replace('s9sys', '')

# Parse and normalize keep list
keep_raw = [t.strip() for t in USER_KEEP_LIST.replace(',', '\n').split('\n') if t.strip()]
ALLOWED_NORMALIZED = {normalize(t) for t in keep_raw}

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
    
    junk = []
    for t in tables:
        name = t['table_name']
        name_norm = normalize(name)
        
        if name in SMRITI_NATIVE or name_norm in ALLOWED_NORMALIZED:
            continue
        else:
            junk.append(name)
            
    print(f"SMRITI-OS: Executing Sovereign Purge ('Rest Delete')")
    print(f"Junk Detected: {len(junk)} tables")
    print("=" * 60)
    
    dropped = 0
    errors = 0
    
    for j in junk:
        # Final safety check: rows?
        cnt = await conn.fetchval(f'SELECT count(*) FROM public."{j}"')
        row_str = f"({cnt} rows)" if cnt > 0 else ""
        
        try:
            await conn.execute(f'DROP TABLE IF EXISTS public."{j}" CASCADE')
            print(f"  [DELETED] {j} {row_str}")
            dropped += 1
        except Exception as e:
            print(f"  [ERROR]   {j}: {e}")
            errors += 1
            
    print("=" * 60)
    print(f"Purge Complete. Dropped: {dropped} | Errors: {errors}")
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
