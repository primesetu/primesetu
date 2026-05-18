-- SMRITI-OS: Multi-Tenant PK Migration
-- Tables to fix:  271
-- Clean/safe:     271
-- Blockers:       0 (skipped)
-- FKs handled:    0

BEGIN;

-- STEP B: Add tenant_id to Primary Keys (clean tables only)
-- acceptdisplaydtls  old_pk=(trntype, index)
ALTER TABLE s9.acceptdisplaydtls DROP CONSTRAINT acceptdisplaydtls_pkey;
ALTER TABLE s9.acceptdisplaydtls ADD CONSTRAINT acceptdisplaydtls_pkey PRIMARY KEY (trntype, index, tenant_id);

-- accountsmaster  old_pk=(type, code)
ALTER TABLE s9.accountsmaster DROP CONSTRAINT accountsmaster_pkey;
ALTER TABLE s9.accountsmaster ADD CONSTRAINT accountsmaster_pkey PRIMARY KEY (type, code, tenant_id);

-- accountsummary  old_pk=(type, code, yr, monthno)
ALTER TABLE s9.accountsummary DROP CONSTRAINT accountsummary_pkey;
ALTER TABLE s9.accountsummary ADD CONSTRAINT accountsummary_pkey PRIMARY KEY (type, code, yr, monthno, tenant_id);

-- actualscheduletask  old_pk=(task_id, task_subno, task_location, showroomcode)
ALTER TABLE s9.actualscheduletask DROP CONSTRAINT actualscheduletask_pkey;
ALTER TABLE s9.actualscheduletask ADD CONSTRAINT actualscheduletask_pkey PRIMARY KEY (task_id, task_subno, task_location, showroomcode, tenant_id);

-- additionalchargedtls  old_pk=(paymodecode, schemecode, addnlchrgcd)
ALTER TABLE s9.additionalchargedtls DROP CONSTRAINT additionalchargedtls_pkey;
ALTER TABLE s9.additionalchargedtls ADD CONSTRAINT additionalchargedtls_pkey PRIMARY KEY (paymodecode, schemecode, addnlchrgcd, tenant_id);

-- agencycatdtl  old_pk=(agencycode, paymodetype, paymodecode)
ALTER TABLE s9.agencycatdtl DROP CONSTRAINT agencycatdtl_pkey;
ALTER TABLE s9.agencycatdtl ADD CONSTRAINT agencycatdtl_pkey PRIMARY KEY (agencycode, paymodetype, paymodecode, tenant_id);

-- agencycathdr  old_pk=(agencyid)
ALTER TABLE s9.agencycathdr DROP CONSTRAINT agencycathdr_pkey;
ALTER TABLE s9.agencycathdr ADD CONSTRAINT agencycathdr_pkey PRIMARY KEY (agencyid, tenant_id);

-- agentactivity  old_pk=(actvindex, task_id, hocompcd)
ALTER TABLE s9.agentactivity DROP CONSTRAINT agentactivity_pkey;
ALTER TABLE s9.agentactivity ADD CONSTRAINT agentactivity_pkey PRIMARY KEY (actvindex, task_id, hocompcd, tenant_id);

-- baledtl  old_pk=(suppcd, dcno, dcdate, baleno)
ALTER TABLE s9.baledtl DROP CONSTRAINT baledtl_pkey;
ALTER TABLE s9.baledtl ADD CONSTRAINT baledtl_pkey PRIMARY KEY (suppcd, dcno, dcdate, baleno, tenant_id);

-- basecomptemplate  old_pk=(tmplidno)
ALTER TABLE s9.basecomptemplate DROP CONSTRAINT basecomptemplate_pkey;
ALTER TABLE s9.basecomptemplate ADD CONSTRAINT basecomptemplate_pkey PRIMARY KEY (tmplidno, tenant_id);

-- billduestatusdtls  old_pk=(sourcecompcode, destcompcode, recvtrntype, recvtrnctrlno, recvtrnsrlno)
ALTER TABLE s9.billduestatusdtls DROP CONSTRAINT billduestatusdtls_pkey;
ALTER TABLE s9.billduestatusdtls ADD CONSTRAINT billduestatusdtls_pkey PRIMARY KEY (sourcecompcode, destcompcode, recvtrntype, recvtrnctrlno, recvtrnsrlno, tenant_id);

-- billduestatushdr  old_pk=(sourcecompcode, destcompcode, trntype, trnctrlno)
ALTER TABLE s9.billduestatushdr DROP CONSTRAINT billduestatushdr_pkey;
ALTER TABLE s9.billduestatushdr ADD CONSTRAINT billduestatushdr_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, tenant_id);

-- billpassdtls  old_pk=(trntype, trnctrlno, srlno)
ALTER TABLE s9.billpassdtls DROP CONSTRAINT billpassdtls_pkey;
ALTER TABLE s9.billpassdtls ADD CONSTRAINT billpassdtls_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- billpasshdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.billpasshdr DROP CONSTRAINT billpasshdr_pkey;
ALTER TABLE s9.billpasshdr ADD CONSTRAINT billpasshdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- browsesettings  old_pk=(smriti_id)
ALTER TABLE s9.browsesettings DROP CONSTRAINT browsesettings_pkey;
ALTER TABLE s9.browsesettings ADD CONSTRAINT browsesettings_pkey PRIMARY KEY (smriti_id, tenant_id);

-- catalogsettings  old_pk=(appname, formname, fldname, shoperenvtype, pgmoption, userid)
ALTER TABLE s9.catalogsettings DROP CONSTRAINT catalogsettings_pkey;
ALTER TABLE s9.catalogsettings ADD CONSTRAINT catalogsettings_pkey PRIMARY KEY (appname, formname, fldname, shoperenvtype, pgmoption, userid, tenant_id);

-- chainstores  old_pk=(code)
ALTER TABLE s9.chainstores DROP CONSTRAINT chainstores_pkey;
ALTER TABLE s9.chainstores ADD CONSTRAINT chainstores_pkey PRIMARY KEY (code, tenant_id);

-- class12combo  old_pk=(class1cd, class2cd)
ALTER TABLE s9.class12combo DROP CONSTRAINT class12combo_pkey;
ALTER TABLE s9.class12combo ADD CONSTRAINT class12combo_pkey PRIMARY KEY (class1cd, class2cd, tenant_id);

-- class12locwise  old_pk=(class1cd, class2cd)
ALTER TABLE s9.class12locwise DROP CONSTRAINT class12locwise_pkey;
ALTER TABLE s9.class12locwise ADD CONSTRAINT class12locwise_pkey PRIMARY KEY (class1cd, class2cd, tenant_id);

-- commconfig  old_pk=(synctype, mode)
ALTER TABLE s9.commconfig DROP CONSTRAINT commconfig_pkey;
ALTER TABLE s9.commconfig ADD CONSTRAINT commconfig_pkey PRIMARY KEY (synctype, mode, tenant_id);

-- compareqty  old_pk=(smriti_id)
ALTER TABLE s9.compareqty DROP CONSTRAINT compareqty_pkey;
ALTER TABLE s9.compareqty ADD CONSTRAINT compareqty_pkey PRIMARY KEY (smriti_id, tenant_id);

-- confinschemedtls  old_pk=(paymodetype, paymodecode, schemecode)
ALTER TABLE s9.confinschemedtls DROP CONSTRAINT confinschemedtls_pkey;
ALTER TABLE s9.confinschemedtls ADD CONSTRAINT confinschemedtls_pkey PRIMARY KEY (paymodetype, paymodecode, schemecode, tenant_id);

-- crdtinvrcvdtls  old_pk=(recvtrntype, recvctrlno, recvsrlno, recvdocdt)
ALTER TABLE s9.crdtinvrcvdtls DROP CONSTRAINT crdtinvrcvdtls_pkey;
ALTER TABLE s9.crdtinvrcvdtls ADD CONSTRAINT crdtinvrcvdtls_pkey PRIMARY KEY (recvtrntype, recvctrlno, recvsrlno, recvdocdt, tenant_id);

-- crdtinvrcvhdr  old_pk=(recvtrntype, recvctrlno, recvsrlno, recvdocdt)
ALTER TABLE s9.crdtinvrcvhdr DROP CONSTRAINT crdtinvrcvhdr_pkey;
ALTER TABLE s9.crdtinvrcvhdr ADD CONSTRAINT crdtinvrcvhdr_pkey PRIMARY KEY (recvtrntype, recvctrlno, recvsrlno, recvdocdt, tenant_id);

-- crdtsalecustopbal  old_pk=(trntype, trnctrlno, trndt, srlno)
ALTER TABLE s9.crdtsalecustopbal DROP CONSTRAINT crdtsalecustopbal_pkey;
ALTER TABLE s9.crdtsalecustopbal ADD CONSTRAINT crdtsalecustopbal_pkey PRIMARY KEY (trntype, trnctrlno, trndt, srlno, tenant_id);

-- crmfinalcustomer  old_pk=(queryid, qrysrlno)
ALTER TABLE s9.crmfinalcustomer DROP CONSTRAINT crmfinalcustomer_pkey;
ALTER TABLE s9.crmfinalcustomer ADD CONSTRAINT crmfinalcustomer_pkey PRIMARY KEY (queryid, qrysrlno, tenant_id);

-- crmqryinfo  old_pk=(queryid)
ALTER TABLE s9.crmqryinfo DROP CONSTRAINT crmqryinfo_pkey;
ALTER TABLE s9.crmqryinfo ADD CONSTRAINT crmqryinfo_pkey PRIMARY KEY (queryid, tenant_id);

-- crmqrystruc  old_pk=(queryid, qrysrlno)
ALTER TABLE s9.crmqrystruc DROP CONSTRAINT crmqrystruc_pkey;
ALTER TABLE s9.crmqrystruc ADD CONSTRAINT crmqrystruc_pkey PRIMARY KEY (queryid, qrysrlno, tenant_id);

-- currencycat  old_pk=(code)
ALTER TABLE s9.currencycat DROP CONSTRAINT currencycat_pkey;
ALTER TABLE s9.currencycat ADD CONSTRAINT currencycat_pkey PRIMARY KEY (code, tenant_id);

-- currencydenomination  old_pk=(code, srlno)
ALTER TABLE s9.currencydenomination DROP CONSTRAINT currencydenomination_pkey;
ALTER TABLE s9.currencydenomination ADD CONSTRAINT currencydenomination_pkey PRIMARY KEY (code, srlno, tenant_id);

-- customerimport  old_pk=(smriti_id)
ALTER TABLE s9.customerimport DROP CONSTRAINT customerimport_pkey;
ALTER TABLE s9.customerimport ADD CONSTRAINT customerimport_pkey PRIMARY KEY (smriti_id, tenant_id);

-- customers  old_pk=(code)
ALTER TABLE s9.customers DROP CONSTRAINT customers_pkey;
ALTER TABLE s9.customers ADD CONSTRAINT customers_pkey PRIMARY KEY (code, tenant_id);

-- custpricegroups  old_pk=(pricegrpcd)
ALTER TABLE s9.custpricegroups DROP CONSTRAINT custpricegroups_pkey;
ALTER TABLE s9.custpricegroups ADD CONSTRAINT custpricegroups_pkey PRIMARY KEY (pricegrpcd, tenant_id);

-- dashboardconfig  old_pk=(userid, chartareacd, paramcd)
ALTER TABLE s9.dashboardconfig DROP CONSTRAINT dashboardconfig_pkey;
ALTER TABLE s9.dashboardconfig ADD CONSTRAINT dashboardconfig_pkey PRIMARY KEY (userid, chartareacd, paramcd, tenant_id);

-- datasyncconfig  old_pk=(hocompcd)
ALTER TABLE s9.datasyncconfig DROP CONSTRAINT datasyncconfig_pkey;
ALTER TABLE s9.datasyncconfig ADD CONSTRAINT datasyncconfig_pkey PRIMARY KEY (hocompcd, tenant_id);

-- daybeginpgms  old_pk=(pgmindex)
ALTER TABLE s9.daybeginpgms DROP CONSTRAINT daybeginpgms_pkey;
ALTER TABLE s9.daybeginpgms ADD CONSTRAINT daybeginpgms_pkey PRIMARY KEY (pgmindex, tenant_id);

-- dayendpgms  old_pk=(pgmindex)
ALTER TABLE s9.dayendpgms DROP CONSTRAINT dayendpgms_pkey;
ALTER TABLE s9.dayendpgms ADD CONSTRAINT dayendpgms_pkey PRIMARY KEY (pgmindex, tenant_id);

-- dbtuningconfig  old_pk=(srlno, type)
ALTER TABLE s9.dbtuningconfig DROP CONSTRAINT dbtuningconfig_pkey;
ALTER TABLE s9.dbtuningconfig ADD CONSTRAINT dbtuningconfig_pkey PRIMARY KEY (srlno, type, tenant_id);

-- dcrefnodtls  old_pk=(suppcd, dcno, dcdate)
ALTER TABLE s9.dcrefnodtls DROP CONSTRAINT dcrefnodtls_pkey;
ALTER TABLE s9.dcrefnodtls ADD CONSTRAINT dcrefnodtls_pkey PRIMARY KEY (suppcd, dcno, dcdate, tenant_id);

-- deliveryadvicedtls  old_pk=(sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno)
ALTER TABLE s9.deliveryadvicedtls DROP CONSTRAINT deliveryadvicedtls_pkey;
ALTER TABLE s9.deliveryadvicedtls ADD CONSTRAINT deliveryadvicedtls_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- deliveryadvicehdr  old_pk=(sourcecompcode, trntype, trnctrlno, docnoprefix, docno)
ALTER TABLE s9.deliveryadvicehdr DROP CONSTRAINT deliveryadvicehdr_pkey;
ALTER TABLE s9.deliveryadvicehdr ADD CONSTRAINT deliveryadvicehdr_pkey PRIMARY KEY (sourcecompcode, trntype, trnctrlno, docnoprefix, docno, tenant_id);

-- deliverynotedtls  old_pk=(trntype, trnctrlno, entsrlno)
ALTER TABLE s9.deliverynotedtls DROP CONSTRAINT deliverynotedtls_pkey;
ALTER TABLE s9.deliverynotedtls ADD CONSTRAINT deliverynotedtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- deliverynotedtlsextd01  old_pk=(sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno)
ALTER TABLE s9.deliverynotedtlsextd01 DROP CONSTRAINT deliverynotedtlsextd01_pkey;
ALTER TABLE s9.deliverynotedtlsextd01 ADD CONSTRAINT deliverynotedtlsextd01_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- deliverynotehdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.deliverynotehdr DROP CONSTRAINT deliverynotehdr_pkey;
ALTER TABLE s9.deliverynotehdr ADD CONSTRAINT deliverynotehdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- discountdtls72  old_pk=(recno)
ALTER TABLE s9.discountdtls72 DROP CONSTRAINT discountdtls72_pkey;
ALTER TABLE s9.discountdtls72 ADD CONSTRAINT discountdtls72_pkey PRIMARY KEY (recno, tenant_id);

-- downloadparams  old_pk=(dayenddate, controlno)
ALTER TABLE s9.downloadparams DROP CONSTRAINT downloadparams_pkey;
ALTER TABLE s9.downloadparams ADD CONSTRAINT downloadparams_pkey PRIMARY KEY (dayenddate, controlno, tenant_id);

-- errole  old_pk=(smriti_id)
ALTER TABLE s9.errole DROP CONSTRAINT errole_pkey;
ALTER TABLE s9.errole ADD CONSTRAINT errole_pkey PRIMARY KEY (smriti_id, tenant_id);

-- eventextnfieldconfig  old_pk=(programid, eventid, fieldsrlno, fieldname)
ALTER TABLE s9.eventextnfieldconfig DROP CONSTRAINT eventextnfieldconfig_pkey;
ALTER TABLE s9.eventextnfieldconfig ADD CONSTRAINT eventextnfieldconfig_pkey PRIMARY KEY (programid, eventid, fieldsrlno, fieldname, tenant_id);

-- eventextnkeyvalueconfig  old_pk=(programid, eventid, srlno, eventkeyvalue)
ALTER TABLE s9.eventextnkeyvalueconfig DROP CONSTRAINT eventextnkeyvalueconfig_pkey;
ALTER TABLE s9.eventextnkeyvalueconfig ADD CONSTRAINT eventextnkeyvalueconfig_pkey PRIMARY KEY (programid, eventid, srlno, eventkeyvalue, tenant_id);

-- exchangeolditems  old_pk=(trntype, trnctrlno, srlno)
ALTER TABLE s9.exchangeolditems DROP CONSTRAINT exchangeolditems_pkey;
ALTER TABLE s9.exchangeolditems ADD CONSTRAINT exchangeolditems_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- excisedutycomponents  old_pk=(edcode)
ALTER TABLE s9.excisedutycomponents DROP CONSTRAINT excisedutycomponents_pkey;
ALTER TABLE s9.excisedutycomponents ADD CONSTRAINT excisedutycomponents_pkey PRIMARY KEY (edcode, tenant_id);

-- excisedutydtls  old_pk=(docno, srlno)
ALTER TABLE s9.excisedutydtls DROP CONSTRAINT excisedutydtls_pkey;
ALTER TABLE s9.excisedutydtls ADD CONSTRAINT excisedutydtls_pkey PRIMARY KEY (docno, srlno, tenant_id);

-- expectedtrnaddonded  old_pk=(trntype, trnctrlno, srlno)
ALTER TABLE s9.expectedtrnaddonded DROP CONSTRAINT expectedtrnaddonded_pkey;
ALTER TABLE s9.expectedtrnaddonded ADD CONSTRAINT expectedtrnaddonded_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- expectedtrndtls  old_pk=(trntype, trnctrlno, docsubsrlno)
ALTER TABLE s9.expectedtrndtls DROP CONSTRAINT expectedtrndtls_pkey;
ALTER TABLE s9.expectedtrndtls ADD CONSTRAINT expectedtrndtls_pkey PRIMARY KEY (trntype, trnctrlno, docsubsrlno, tenant_id);

-- expectedtrnhdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.expectedtrnhdr DROP CONSTRAINT expectedtrnhdr_pkey;
ALTER TABLE s9.expectedtrnhdr ADD CONSTRAINT expectedtrnhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- expectedtrnrcpts  old_pk=(trntype, trnctrlno, docsrlno)
ALTER TABLE s9.expectedtrnrcpts DROP CONSTRAINT expectedtrnrcpts_pkey;
ALTER TABLE s9.expectedtrnrcpts ADD CONSTRAINT expectedtrnrcpts_pkey PRIMARY KEY (trntype, trnctrlno, docsrlno, tenant_id);

-- exportgenlookup  old_pk=(recid, code, hocompcode, filenumber)
ALTER TABLE s9.exportgenlookup DROP CONSTRAINT exportgenlookup_pkey;
ALTER TABLE s9.exportgenlookup ADD CONSTRAINT exportgenlookup_pkey PRIMARY KEY (recid, code, hocompcode, filenumber, tenant_id);

-- exportsysparam  old_pk=(id, hocompcode, filenumber)
ALTER TABLE s9.exportsysparam DROP CONSTRAINT exportsysparam_pkey;
ALTER TABLE s9.exportsysparam ADD CONSTRAINT exportsysparam_pkey PRIMARY KEY (id, hocompcode, filenumber, tenant_id);

-- expttrndtlsextd01  old_pk=(trntype, trnctrlno, entsrlno, itemtagsrlno)
ALTER TABLE s9.expttrndtlsextd01 DROP CONSTRAINT expttrndtlsextd01_pkey;
ALTER TABLE s9.expttrndtlsextd01 ADD CONSTRAINT expttrndtlsextd01_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- extditemmaster  old_pk=(stockno)
ALTER TABLE s9.extditemmaster DROP CONSTRAINT extditemmaster_pkey;
ALTER TABLE s9.extditemmaster ADD CONSTRAINT extditemmaster_pkey PRIMARY KEY (stockno, tenant_id);

-- extdmailinglist  old_pk=(recno, addresstype)
ALTER TABLE s9.extdmailinglist DROP CONSTRAINT extdmailinglist_pkey;
ALTER TABLE s9.extdmailinglist ADD CONSTRAINT extdmailinglist_pkey PRIMARY KEY (recno, addresstype, tenant_id);

-- extensionconfigexternal  old_pk=(recid, programid, eventid, srlno)
ALTER TABLE s9.extensionconfigexternal DROP CONSTRAINT extensionconfigexternal_pkey;
ALTER TABLE s9.extensionconfigexternal ADD CONSTRAINT extensionconfigexternal_pkey PRIMARY KEY (recid, programid, eventid, srlno, tenant_id);

-- extensionconfiginfo  old_pk=(trntype, extnlevel, structtype, fieldsrlno)
ALTER TABLE s9.extensionconfiginfo DROP CONSTRAINT extensionconfiginfo_pkey;
ALTER TABLE s9.extensionconfiginfo ADD CONSTRAINT extensionconfiginfo_pkey PRIMARY KEY (trntype, extnlevel, structtype, fieldsrlno, tenant_id);

-- extensionconfiginternal  old_pk=(recid, programid, eventid, srlno)
ALTER TABLE s9.extensionconfiginternal DROP CONSTRAINT extensionconfiginternal_pkey;
ALTER TABLE s9.extensionconfiginternal ADD CONSTRAINT extensionconfiginternal_pkey PRIMARY KEY (recid, programid, eventid, srlno, tenant_id);

-- extensionconfigtable  old_pk=(trntype, extlevel, structtype)
ALTER TABLE s9.extensionconfigtable DROP CONSTRAINT extensionconfigtable_pkey;
ALTER TABLE s9.extensionconfigtable ADD CONSTRAINT extensionconfigtable_pkey PRIMARY KEY (trntype, extlevel, structtype, tenant_id);

-- extnpartnerinfo  old_pk=(partnerid)
ALTER TABLE s9.extnpartnerinfo DROP CONSTRAINT extnpartnerinfo_pkey;
ALTER TABLE s9.extnpartnerinfo ADD CONSTRAINT extnpartnerinfo_pkey PRIMARY KEY (partnerid, tenant_id);

-- factorheader  old_pk=(trntype, name)
ALTER TABLE s9.factorheader DROP CONSTRAINT factorheader_pkey;
ALTER TABLE s9.factorheader ADD CONSTRAINT factorheader_pkey PRIMARY KEY (trntype, name, tenant_id);

-- featureintrodtls  old_pk=(featureid)
ALTER TABLE s9.featureintrodtls DROP CONSTRAINT featureintrodtls_pkey;
ALTER TABLE s9.featureintrodtls ADD CONSTRAINT featureintrodtls_pkey PRIMARY KEY (featureid, tenant_id);

-- fileloadingstatus  old_pk=(smriti_id)
ALTER TABLE s9.fileloadingstatus DROP CONSTRAINT fileloadingstatus_pkey;
ALTER TABLE s9.fileloadingstatus ADD CONSTRAINT fileloadingstatus_pkey PRIMARY KEY (smriti_id, tenant_id);

-- filesfromho  old_pk=(infofile, slno)
ALTER TABLE s9.filesfromho DROP CONSTRAINT filesfromho_pkey;
ALTER TABLE s9.filesfromho ADD CONSTRAINT filesfromho_pkey PRIMARY KEY (infofile, slno, tenant_id);

-- franchiseelog  old_pk=(idtype, shoperdt, srlno, trnstype, paymode)
ALTER TABLE s9.franchiseelog DROP CONSTRAINT franchiseelog_pkey;
ALTER TABLE s9.franchiseelog ADD CONSTRAINT franchiseelog_pkey PRIMARY KEY (idtype, shoperdt, srlno, trnstype, paymode, tenant_id);

-- franchiseetrans  old_pk=(trnacctype, trntype, trnctrlno)
ALTER TABLE s9.franchiseetrans DROP CONSTRAINT franchiseetrans_pkey;
ALTER TABLE s9.franchiseetrans ADD CONSTRAINT franchiseetrans_pkey PRIMARY KEY (trnacctype, trntype, trnctrlno, tenant_id);

-- franchiselstloadeddtls  old_pk=(smriti_id)
ALTER TABLE s9.franchiselstloadeddtls DROP CONSTRAINT franchiselstloadeddtls_pkey;
ALTER TABLE s9.franchiselstloadeddtls ADD CONSTRAINT franchiselstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- franmismatchlog  old_pk=(shoperdt, paymode)
ALTER TABLE s9.franmismatchlog DROP CONSTRAINT franmismatchlog_pkey;
ALTER TABLE s9.franmismatchlog ADD CONSTRAINT franmismatchlog_pkey PRIMARY KEY (shoperdt, paymode, tenant_id);

-- genlookup  old_pk=(recid, code)
ALTER TABLE s9.genlookup DROP CONSTRAINT genlookup_pkey;
ALTER TABLE s9.genlookup ADD CONSTRAINT genlookup_pkey PRIMARY KEY (recid, code, tenant_id);

-- genlookupextd  old_pk=(recid, code)
ALTER TABLE s9.genlookupextd DROP CONSTRAINT genlookupextd_pkey;
ALTER TABLE s9.genlookupextd ADD CONSTRAINT genlookupextd_pkey PRIMARY KEY (recid, code, tenant_id);

-- gs1dtls  old_pk=(slno, gs1companyprefix, startingno, endingno, class1cd, class2cd)
ALTER TABLE s9.gs1dtls DROP CONSTRAINT gs1dtls_pkey;
ALTER TABLE s9.gs1dtls ADD CONSTRAINT gs1dtls_pkey PRIMARY KEY (slno, gs1companyprefix, startingno, endingno, class1cd, class2cd, tenant_id);

-- hotkeys  old_pk=(formid, funcid)
ALTER TABLE s9.hotkeys DROP CONSTRAINT hotkeys_pkey;
ALTER TABLE s9.hotkeys ADD CONSTRAINT hotkeys_pkey PRIMARY KEY (formid, funcid, tenant_id);

-- incdeftable  old_pk=(incname, personnelcd, ptypedesc)
ALTER TABLE s9.incdeftable DROP CONSTRAINT incdeftable_pkey;
ALTER TABLE s9.incdeftable ADD CONSTRAINT incdeftable_pkey PRIMARY KEY (incname, personnelcd, ptypedesc, tenant_id);

-- incentivegrpitemdtls  old_pk=(incname, srlno)
ALTER TABLE s9.incentivegrpitemdtls DROP CONSTRAINT incentivegrpitemdtls_pkey;
ALTER TABLE s9.incentivegrpitemdtls ADD CONSTRAINT incentivegrpitemdtls_pkey PRIMARY KEY (incname, srlno, tenant_id);

-- incshrmperioddtls  old_pk=(incname, shrmprofcd, pcode, srlno)
ALTER TABLE s9.incshrmperioddtls DROP CONSTRAINT incshrmperioddtls_pkey;
ALTER TABLE s9.incshrmperioddtls ADD CONSTRAINT incshrmperioddtls_pkey PRIMARY KEY (incname, shrmprofcd, pcode, srlno, tenant_id);

-- infotable  old_pk=(smriti_id)
ALTER TABLE s9.infotable DROP CONSTRAINT infotable_pkey;
ALTER TABLE s9.infotable ADD CONSTRAINT infotable_pkey PRIMARY KEY (smriti_id, tenant_id);

-- iniloadingerrorlog  old_pk=(smriti_id)
ALTER TABLE s9.iniloadingerrorlog DROP CONSTRAINT iniloadingerrorlog_pkey;
ALTER TABLE s9.iniloadingerrorlog ADD CONSTRAINT iniloadingerrorlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- inpacksliphdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.inpacksliphdr DROP CONSTRAINT inpacksliphdr_pkey;
ALTER TABLE s9.inpacksliphdr ADD CONSTRAINT inpacksliphdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- inpacksliptrn  old_pk=(trntype, trnctrlno, slipcrtnno, slipentsrlno)
ALTER TABLE s9.inpacksliptrn DROP CONSTRAINT inpacksliptrn_pkey;
ALTER TABLE s9.inpacksliptrn ADD CONSTRAINT inpacksliptrn_pkey PRIMARY KEY (trntype, trnctrlno, slipcrtnno, slipentsrlno, tenant_id);

-- itemclassrestrict  old_pk=(userid, columnname, value)
ALTER TABLE s9.itemclassrestrict DROP CONSTRAINT itemclassrestrict_pkey;
ALTER TABLE s9.itemclassrestrict ADD CONSTRAINT itemclassrestrict_pkey PRIMARY KEY (userid, columnname, value, tenant_id);

-- itemmapping  old_pk=(maptype, hocode, posattrib1, posattrib2, hoattrib1, hoattrib2, hoattrib)
ALTER TABLE s9.itemmapping DROP CONSTRAINT itemmapping_pkey;
ALTER TABLE s9.itemmapping ADD CONSTRAINT itemmapping_pkey PRIMARY KEY (maptype, hocode, posattrib1, posattrib2, hoattrib1, hoattrib2, hoattrib, tenant_id);

-- itemmappingrules  old_pk=(hocode, hoattrib, posattrib, condition, receivedcode, newcode)
ALTER TABLE s9.itemmappingrules DROP CONSTRAINT itemmappingrules_pkey;
ALTER TABLE s9.itemmappingrules ADD CONSTRAINT itemmappingrules_pkey PRIMARY KEY (hocode, hoattrib, posattrib, condition, receivedcode, newcode, tenant_id);

-- itemmaster  old_pk=(stockno, batchsrlno)
ALTER TABLE s9.itemmaster DROP CONSTRAINT itemmaster_pkey;
ALTER TABLE s9.itemmaster ADD CONSTRAINT itemmaster_pkey PRIMARY KEY (stockno, batchsrlno, tenant_id);

-- itemmasterconfig  old_pk=(fid)
ALTER TABLE s9.itemmasterconfig DROP CONSTRAINT itemmasterconfig_pkey;
ALTER TABLE s9.itemmasterconfig ADD CONSTRAINT itemmasterconfig_pkey PRIMARY KEY (fid, tenant_id);

-- itemmasterextd01  old_pk=(stockno, batchno, gradecd)
ALTER TABLE s9.itemmasterextd01 DROP CONSTRAINT itemmasterextd01_pkey;
ALTER TABLE s9.itemmasterextd01 ADD CONSTRAINT itemmasterextd01_pkey PRIMARY KEY (stockno, batchno, gradecd, tenant_id);

-- itemmasterlog  old_pk=(smriti_id)
ALTER TABLE s9.itemmasterlog DROP CONSTRAINT itemmasterlog_pkey;
ALTER TABLE s9.itemmasterlog ADD CONSTRAINT itemmasterlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- itemreclassconfig  old_pk=(fldid)
ALTER TABLE s9.itemreclassconfig DROP CONSTRAINT itemreclassconfig_pkey;
ALTER TABLE s9.itemreclassconfig ADD CONSTRAINT itemreclassconfig_pkey PRIMARY KEY (fldid, tenant_id);

-- itemreclassdtls  old_pk=(ircid, srlno, frindicator, frindsrlno)
ALTER TABLE s9.itemreclassdtls DROP CONSTRAINT itemreclassdtls_pkey;
ALTER TABLE s9.itemreclassdtls ADD CONSTRAINT itemreclassdtls_pkey PRIMARY KEY (ircid, srlno, frindicator, frindsrlno, tenant_id);

-- itemreclassheader  old_pk=(ircid)
ALTER TABLE s9.itemreclassheader DROP CONSTRAINT itemreclassheader_pkey;
ALTER TABLE s9.itemreclassheader ADD CONSTRAINT itemreclassheader_pkey PRIMARY KEY (ircid, tenant_id);

-- itemsfromho  old_pk=(stockno)
ALTER TABLE s9.itemsfromho DROP CONSTRAINT itemsfromho_pkey;
ALTER TABLE s9.itemsfromho ADD CONSTRAINT itemsfromho_pkey PRIMARY KEY (stockno, tenant_id);

-- itemtagconfig  old_pk=(trntype, class1cd, class2cd, fieldsrlno)
ALTER TABLE s9.itemtagconfig DROP CONSTRAINT itemtagconfig_pkey;
ALTER TABLE s9.itemtagconfig ADD CONSTRAINT itemtagconfig_pkey PRIMARY KEY (trntype, class1cd, class2cd, fieldsrlno, tenant_id);

-- itemtagconfigfromho  old_pk=(trntype, class1cd, class2cd, fieldsrlno)
ALTER TABLE s9.itemtagconfigfromho DROP CONSTRAINT itemtagconfigfromho_pkey;
ALTER TABLE s9.itemtagconfigfromho ADD CONSTRAINT itemtagconfigfromho_pkey PRIMARY KEY (trntype, class1cd, class2cd, fieldsrlno, tenant_id);

-- itemtagdtls  old_pk=(class1cd, class2cd, itemtag1)
ALTER TABLE s9.itemtagdtls DROP CONSTRAINT itemtagdtls_pkey;
ALTER TABLE s9.itemtagdtls ADD CONSTRAINT itemtagdtls_pkey PRIMARY KEY (class1cd, class2cd, itemtag1, tenant_id);

-- kpidtls  old_pk=(showroomcode, docdt)
ALTER TABLE s9.kpidtls DROP CONSTRAINT kpidtls_pkey;
ALTER TABLE s9.kpidtls ADD CONSTRAINT kpidtls_pkey PRIMARY KEY (showroomcode, docdt, tenant_id);

-- logagentactivity  old_pk=(logsrlno)
ALTER TABLE s9.logagentactivity DROP CONSTRAINT logagentactivity_pkey;
ALTER TABLE s9.logagentactivity ADD CONSTRAINT logagentactivity_pkey PRIMARY KEY (logsrlno, tenant_id);

-- logdataextractdetail  old_pk=(logsrlno)
ALTER TABLE s9.logdataextractdetail DROP CONSTRAINT logdataextractdetail_pkey;
ALTER TABLE s9.logdataextractdetail ADD CONSTRAINT logdataextractdetail_pkey PRIMARY KEY (logsrlno, tenant_id);

-- logdataextractsummary  old_pk=(runnumber)
ALTER TABLE s9.logdataextractsummary DROP CONSTRAINT logdataextractsummary_pkey;
ALTER TABLE s9.logdataextractsummary ADD CONSTRAINT logdataextractsummary_pkey PRIMARY KEY (runnumber, tenant_id);

-- logdatasync  old_pk=(logsrlno)
ALTER TABLE s9.logdatasync DROP CONSTRAINT logdatasync_pkey;
ALTER TABLE s9.logdatasync ADD CONSTRAINT logdatasync_pkey PRIMARY KEY (logsrlno, tenant_id);

-- logdbtuningconfig  old_pk=(srlno)
ALTER TABLE s9.logdbtuningconfig DROP CONSTRAINT logdbtuningconfig_pkey;
ALTER TABLE s9.logdbtuningconfig ADD CONSTRAINT logdbtuningconfig_pkey PRIMARY KEY (srlno, tenant_id);

-- logtilldtls  old_pk=(tilltrndt, nodeid)
ALTER TABLE s9.logtilldtls DROP CONSTRAINT logtilldtls_pkey;
ALTER TABLE s9.logtilldtls ADD CONSTRAINT logtilldtls_pkey PRIMARY KEY (tilltrndt, nodeid, tenant_id);

-- logtrnsctrlno  old_pk=(smriti_id)
ALTER TABLE s9.logtrnsctrlno DROP CONSTRAINT logtrnsctrlno_pkey;
ALTER TABLE s9.logtrnsctrlno ADD CONSTRAINT logtrnsctrlno_pkey PRIMARY KEY (smriti_id, tenant_id);

-- logwgsync  old_pk=(syncfilename, shoperdt, syncdt)
ALTER TABLE s9.logwgsync DROP CONSTRAINT logwgsync_pkey;
ALTER TABLE s9.logwgsync ADD CONSTRAINT logwgsync_pkey PRIMARY KEY (syncfilename, shoperdt, syncdt, tenant_id);

-- lstloadeddtls  old_pk=(smriti_id)
ALTER TABLE s9.lstloadeddtls DROP CONSTRAINT lstloadeddtls_pkey;
ALTER TABLE s9.lstloadeddtls ADD CONSTRAINT lstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- mailinglist  old_pk=(recno)
ALTER TABLE s9.mailinglist DROP CONSTRAINT mailinglist_pkey;
ALTER TABLE s9.mailinglist ADD CONSTRAINT mailinglist_pkey PRIMARY KEY (recno, tenant_id);

-- messagecentre  old_pk=(msgid, msgsource)
ALTER TABLE s9.messagecentre DROP CONSTRAINT messagecentre_pkey;
ALTER TABLE s9.messagecentre ADD CONSTRAINT messagecentre_pkey PRIMARY KEY (msgid, msgsource, tenant_id);

-- messagecentrelog  old_pk=(msgid, msgsource, srlno)
ALTER TABLE s9.messagecentrelog DROP CONSTRAINT messagecentrelog_pkey;
ALTER TABLE s9.messagecentrelog ADD CONSTRAINT messagecentrelog_pkey PRIMARY KEY (msgid, msgsource, srlno, tenant_id);

-- mismatchvalue  old_pk=(smriti_id)
ALTER TABLE s9.mismatchvalue DROP CONSTRAINT mismatchvalue_pkey;
ALTER TABLE s9.mismatchvalue ADD CONSTRAINT mismatchvalue_pkey PRIMARY KEY (smriti_id, tenant_id);

-- missingdocno  old_pk=(trntype, docnoprefix, docno, docdt, tabletype)
ALTER TABLE s9.missingdocno DROP CONSTRAINT missingdocno_pkey;
ALTER TABLE s9.missingdocno ADD CONSTRAINT missingdocno_pkey PRIMARY KEY (trntype, docnoprefix, docno, docdt, tabletype, tenant_id);

-- monthsummary  old_pk=(stockno, batchno, gradecd, locationcd, yr, monthno)
ALTER TABLE s9.monthsummary DROP CONSTRAINT monthsummary_pkey;
ALTER TABLE s9.monthsummary ADD CONSTRAINT monthsummary_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, yr, monthno, tenant_id);

-- multipleprices  old_pk=(sourcecompcode, docno, destcompcode, stockno, slabno)
ALTER TABLE s9.multipleprices DROP CONSTRAINT multipleprices_pkey;
ALTER TABLE s9.multipleprices ADD CONSTRAINT multipleprices_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, stockno, slabno, tenant_id);

-- onacccrdtntlinktbldtls  old_pk=(trntype, trnctrlno, srlno, subsrlno)
ALTER TABLE s9.onacccrdtntlinktbldtls DROP CONSTRAINT onacccrdtntlinktbldtls_pkey;
ALTER TABLE s9.onacccrdtntlinktbldtls ADD CONSTRAINT onacccrdtntlinktbldtls_pkey PRIMARY KEY (trntype, trnctrlno, srlno, subsrlno, tenant_id);

-- onacccrdtntlinktblhdr  old_pk=(trntype, trnctrlno, srlno)
ALTER TABLE s9.onacccrdtntlinktblhdr DROP CONSTRAINT onacccrdtntlinktblhdr_pkey;
ALTER TABLE s9.onacccrdtntlinktblhdr ADD CONSTRAINT onacccrdtntlinktblhdr_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- paymodeacceptconfig  old_pk=(trntype, acptpaymode)
ALTER TABLE s9.paymodeacceptconfig DROP CONSTRAINT paymodeacceptconfig_pkey;
ALTER TABLE s9.paymodeacceptconfig ADD CONSTRAINT paymodeacceptconfig_pkey PRIMARY KEY (trntype, acptpaymode, tenant_id);

-- paymodeacceptdisplaydtls  old_pk=(paymode, index, paycode)
ALTER TABLE s9.paymodeacceptdisplaydtls DROP CONSTRAINT paymodeacceptdisplaydtls_pkey;
ALTER TABLE s9.paymodeacceptdisplaydtls ADD CONSTRAINT paymodeacceptdisplaydtls_pkey PRIMARY KEY (paymode, index, paycode, tenant_id);

-- paymodeacceptdisplaydtlsextd  old_pk=(paymode, index, paycode)
ALTER TABLE s9.paymodeacceptdisplaydtlsextd DROP CONSTRAINT paymodeacceptdisplaydtlsextd_pkey;
ALTER TABLE s9.paymodeacceptdisplaydtlsextd ADD CONSTRAINT paymodeacceptdisplaydtlsextd_pkey PRIMARY KEY (paymode, index, paycode, tenant_id);

-- paymodeconfig  old_pk=(paymodetype)
ALTER TABLE s9.paymodeconfig DROP CONSTRAINT paymodeconfig_pkey;
ALTER TABLE s9.paymodeconfig ADD CONSTRAINT paymodeconfig_pkey PRIMARY KEY (paymodetype, tenant_id);

-- paytermscat  old_pk=(recno)
ALTER TABLE s9.paytermscat DROP CONSTRAINT paytermscat_pkey;
ALTER TABLE s9.paytermscat ADD CONSTRAINT paytermscat_pkey PRIMARY KEY (recno, tenant_id);

-- pcbilldtls  old_pk=(posentrytype, posctrlno, posdocnoprefix, posdocno, srlno)
ALTER TABLE s9.pcbilldtls DROP CONSTRAINT pcbilldtls_pkey;
ALTER TABLE s9.pcbilldtls ADD CONSTRAINT pcbilldtls_pkey PRIMARY KEY (posentrytype, posctrlno, posdocnoprefix, posdocno, srlno, tenant_id);

-- pdtfieldconfig  old_pk=(trntype, fieldid, fieldcaption)
ALTER TABLE s9.pdtfieldconfig DROP CONSTRAINT pdtfieldconfig_pkey;
ALTER TABLE s9.pdtfieldconfig ADD CONSTRAINT pdtfieldconfig_pkey PRIMARY KEY (trntype, fieldid, fieldcaption, tenant_id);

-- personnel  old_pk=(code)
ALTER TABLE s9.personnel DROP CONSTRAINT personnel_pkey;
ALTER TABLE s9.personnel ADD CONSTRAINT personnel_pkey PRIMARY KEY (code, tenant_id);

-- personnelshrmwise  old_pk=(smcode, shrmcode, srlno)
ALTER TABLE s9.personnelshrmwise DROP CONSTRAINT personnelshrmwise_pkey;
ALTER TABLE s9.personnelshrmwise ADD CONSTRAINT personnelshrmwise_pkey PRIMARY KEY (smcode, shrmcode, srlno, tenant_id);

-- pgmwisefeaturedtls  old_pk=(featureid, programid, srlno)
ALTER TABLE s9.pgmwisefeaturedtls DROP CONSTRAINT pgmwisefeaturedtls_pkey;
ALTER TABLE s9.pgmwisefeaturedtls ADD CONSTRAINT pgmwisefeaturedtls_pkey PRIMARY KEY (featureid, programid, srlno, tenant_id);

-- phystkdl  old_pk=(stockno)
ALTER TABLE s9.phystkdl DROP CONSTRAINT phystkdl_pkey;
ALTER TABLE s9.phystkdl ADD CONSTRAINT phystkdl_pkey PRIMARY KEY (stockno, tenant_id);

-- phystkdtls  old_pk=(smriti_id)
ALTER TABLE s9.phystkdtls DROP CONSTRAINT phystkdtls_pkey;
ALTER TABLE s9.phystkdtls ADD CONSTRAINT phystkdtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- phystkdtlsextd01  old_pk=(smriti_id)
ALTER TABLE s9.phystkdtlsextd01 DROP CONSTRAINT phystkdtlsextd01_pkey;
ALTER TABLE s9.phystkdtlsextd01 ADD CONSTRAINT phystkdtlsextd01_pkey PRIMARY KEY (smriti_id, tenant_id);

-- phystkhdr  old_pk=(smriti_id)
ALTER TABLE s9.phystkhdr DROP CONSTRAINT phystkhdr_pkey;
ALTER TABLE s9.phystkhdr ADD CONSTRAINT phystkhdr_pkey PRIMARY KEY (smriti_id, tenant_id);

-- phystocktakingitembkup  old_pk=(scopeid, stockno, batchsrlno)
ALTER TABLE s9.phystocktakingitembkup DROP CONSTRAINT phystocktakingitembkup_pkey;
ALTER TABLE s9.phystocktakingitembkup ADD CONSTRAINT phystocktakingitembkup_pkey PRIMARY KEY (scopeid, stockno, batchsrlno, tenant_id);

-- phystocktakingitembkup01  old_pk=(scopeid, entsrlno)
ALTER TABLE s9.phystocktakingitembkup01 DROP CONSTRAINT phystocktakingitembkup01_pkey;
ALTER TABLE s9.phystocktakingitembkup01 ADD CONSTRAINT phystocktakingitembkup01_pkey PRIMARY KEY (scopeid, entsrlno, tenant_id);

-- phystocktakingitembkup02  old_pk=(smriti_id)
ALTER TABLE s9.phystocktakingitembkup02 DROP CONSTRAINT phystocktakingitembkup02_pkey;
ALTER TABLE s9.phystocktakingitembkup02 ADD CONSTRAINT phystocktakingitembkup02_pkey PRIMARY KEY (smriti_id, tenant_id);

-- posactivitylogdtls  old_pk=(ctrlnumber, srlno)
ALTER TABLE s9.posactivitylogdtls DROP CONSTRAINT posactivitylogdtls_pkey;
ALTER TABLE s9.posactivitylogdtls ADD CONSTRAINT posactivitylogdtls_pkey PRIMARY KEY (ctrlnumber, srlno, tenant_id);

-- posactivityloghdr  old_pk=(ctrlnumber)
ALTER TABLE s9.posactivityloghdr DROP CONSTRAINT posactivityloghdr_pkey;
ALTER TABLE s9.posactivityloghdr ADD CONSTRAINT posactivityloghdr_pkey PRIMARY KEY (ctrlnumber, tenant_id);

-- poscashtrn  old_pk=(entrytype, ctrlno, entsrlno)
ALTER TABLE s9.poscashtrn DROP CONSTRAINT poscashtrn_pkey;
ALTER TABLE s9.poscashtrn ADD CONSTRAINT poscashtrn_pkey PRIMARY KEY (entrytype, ctrlno, entsrlno, tenant_id);

-- poscashtrnextd01  old_pk=(entrytype, ctrlno, entsrlno, entsubsrlno)
ALTER TABLE s9.poscashtrnextd01 DROP CONSTRAINT poscashtrnextd01_pkey;
ALTER TABLE s9.poscashtrnextd01 ADD CONSTRAINT poscashtrnextd01_pkey PRIMARY KEY (entrytype, ctrlno, entsrlno, entsubsrlno, tenant_id);

-- poslstloadeddtls  old_pk=(smriti_id)
ALTER TABLE s9.poslstloadeddtls DROP CONSTRAINT poslstloadeddtls_pkey;
ALTER TABLE s9.poslstloadeddtls ADD CONSTRAINT poslstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- posmodebalances  old_pk=(smriti_id)
ALTER TABLE s9.posmodebalances DROP CONSTRAINT posmodebalances_pkey;
ALTER TABLE s9.posmodebalances ADD CONSTRAINT posmodebalances_pkey PRIMARY KEY (smriti_id, tenant_id);

-- posmodedatadtls  old_pk=(fld1, fld6)
ALTER TABLE s9.posmodedatadtls DROP CONSTRAINT posmodedatadtls_pkey;
ALTER TABLE s9.posmodedatadtls ADD CONSTRAINT posmodedatadtls_pkey PRIMARY KEY (fld1, fld6, tenant_id);

-- pospaymodes  old_pk=(paymodetype, paymodecode)
ALTER TABLE s9.pospaymodes DROP CONSTRAINT pospaymodes_pkey;
ALTER TABLE s9.pospaymodes ADD CONSTRAINT pospaymodes_pkey PRIMARY KEY (paymodetype, paymodecode, tenant_id);

-- prefixconfig  old_pk=(slno)
ALTER TABLE s9.prefixconfig DROP CONSTRAINT prefixconfig_pkey;
ALTER TABLE s9.prefixconfig ADD CONSTRAINT prefixconfig_pkey PRIMARY KEY (slno, tenant_id);

-- prefixdoclog  old_pk=(smriti_id)
ALTER TABLE s9.prefixdoclog DROP CONSTRAINT prefixdoclog_pkey;
ALTER TABLE s9.prefixdoclog ADD CONSTRAINT prefixdoclog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- prefixmaster  old_pk=(trntype, opid, terminalgroupid, srlno)
ALTER TABLE s9.prefixmaster DROP CONSTRAINT prefixmaster_pkey;
ALTER TABLE s9.prefixmaster ADD CONSTRAINT prefixmaster_pkey PRIMARY KEY (trntype, opid, terminalgroupid, srlno, tenant_id);

-- prefixterminalgroups  old_pk=(terminalgroupid, srlno)
ALTER TABLE s9.prefixterminalgroups DROP CONSTRAINT prefixterminalgroups_pkey;
ALTER TABLE s9.prefixterminalgroups ADD CONSTRAINT prefixterminalgroups_pkey PRIMARY KEY (terminalgroupid, srlno, tenant_id);

-- prefixtrnlog  old_pk=(fld1, fld2, fld4)
ALTER TABLE s9.prefixtrnlog DROP CONSTRAINT prefixtrnlog_pkey;
ALTER TABLE s9.prefixtrnlog ADD CONSTRAINT prefixtrnlog_pkey PRIMARY KEY (fld1, fld2, fld4, tenant_id);

-- prefixtrnno  old_pk=(trntype, actualprefix)
ALTER TABLE s9.prefixtrnno DROP CONSTRAINT prefixtrnno_pkey;
ALTER TABLE s9.prefixtrnno ADD CONSTRAINT prefixtrnno_pkey PRIMARY KEY (trntype, actualprefix, tenant_id);

-- priceloadinglog  old_pk=(smriti_id)
ALTER TABLE s9.priceloadinglog DROP CONSTRAINT priceloadinglog_pkey;
ALTER TABLE s9.priceloadinglog ADD CONSTRAINT priceloadinglog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- pricerange  old_pk=(pricetype, docnoprefix, docno, srlno)
ALTER TABLE s9.pricerange DROP CONSTRAINT pricerange_pkey;
ALTER TABLE s9.pricerange ADD CONSTRAINT pricerange_pkey PRIMARY KEY (pricetype, docnoprefix, docno, srlno, tenant_id);

-- pricerangecatdtls  old_pk=(prcatid, srlno)
ALTER TABLE s9.pricerangecatdtls DROP CONSTRAINT pricerangecatdtls_pkey;
ALTER TABLE s9.pricerangecatdtls ADD CONSTRAINT pricerangecatdtls_pkey PRIMARY KEY (prcatid, srlno, tenant_id);

-- pricerangesettings  old_pk=(fldtype, fldid)
ALTER TABLE s9.pricerangesettings DROP CONSTRAINT pricerangesettings_pkey;
ALTER TABLE s9.pricerangesettings ADD CONSTRAINT pricerangesettings_pkey PRIMARY KEY (fldtype, fldid, tenant_id);

-- pricerevision  old_pk=(sourcecompcode, docno, destcompcode, filenumber, serialnumber)
ALTER TABLE s9.pricerevision DROP CONSTRAINT pricerevision_pkey;
ALTER TABLE s9.pricerevision ADD CONSTRAINT pricerevision_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, filenumber, serialnumber, tenant_id);

-- pricerevisionhistory  old_pk=(sourcecompcode, docno, destcompcode, filenumber, serialnumber)
ALTER TABLE s9.pricerevisionhistory DROP CONSTRAINT pricerevisionhistory_pkey;
ALTER TABLE s9.pricerevisionhistory ADD CONSTRAINT pricerevisionhistory_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, filenumber, serialnumber, tenant_id);

-- printbusinesshandlermaster  old_pk=(bushandlerid)
ALTER TABLE s9.printbusinesshandlermaster DROP CONSTRAINT printbusinesshandlermaster_pkey;
ALTER TABLE s9.printbusinesshandlermaster ADD CONSTRAINT printbusinesshandlermaster_pkey PRIMARY KEY (bushandlerid, tenant_id);

-- printconfigsetting  old_pk=(configsettingid, configparamid)
ALTER TABLE s9.printconfigsetting DROP CONSTRAINT printconfigsetting_pkey;
ALTER TABLE s9.printconfigsetting ADD CONSTRAINT printconfigsetting_pkey PRIMARY KEY (configsettingid, configparamid, tenant_id);

-- printconfigsettingmaster  old_pk=(configsettingid)
ALTER TABLE s9.printconfigsettingmaster DROP CONSTRAINT printconfigsettingmaster_pkey;
ALTER TABLE s9.printconfigsettingmaster ADD CONSTRAINT printconfigsettingmaster_pkey PRIMARY KEY (configsettingid, tenant_id);

-- printlinkedrefinterface  old_pk=(linkedrefid, bushandlerid, renhandlerid, configsettingid)
ALTER TABLE s9.printlinkedrefinterface DROP CONSTRAINT printlinkedrefinterface_pkey;
ALTER TABLE s9.printlinkedrefinterface ADD CONSTRAINT printlinkedrefinterface_pkey PRIMARY KEY (linkedrefid, bushandlerid, renhandlerid, configsettingid, tenant_id);

-- printlinkedreflookup  old_pk=(smriti_id)
ALTER TABLE s9.printlinkedreflookup DROP CONSTRAINT printlinkedreflookup_pkey;
ALTER TABLE s9.printlinkedreflookup ADD CONSTRAINT printlinkedreflookup_pkey PRIMARY KEY (smriti_id, tenant_id);

-- printnodetrnconfigmaster  old_pk=(nodeid, trntypeidentifier, linkedrefid)
ALTER TABLE s9.printnodetrnconfigmaster DROP CONSTRAINT printnodetrnconfigmaster_pkey;
ALTER TABLE s9.printnodetrnconfigmaster ADD CONSTRAINT printnodetrnconfigmaster_pkey PRIMARY KEY (nodeid, trntypeidentifier, linkedrefid, tenant_id);

-- printrenderermaster  old_pk=(renhandlerid)
ALTER TABLE s9.printrenderermaster DROP CONSTRAINT printrenderermaster_pkey;
ALTER TABLE s9.printrenderermaster ADD CONSTRAINT printrenderermaster_pkey PRIMARY KEY (renhandlerid, tenant_id);

-- printtemplateconfigdtls  old_pk=(linkrefid, terminalid, trntype, templatename)
ALTER TABLE s9.printtemplateconfigdtls DROP CONSTRAINT printtemplateconfigdtls_pkey;
ALTER TABLE s9.printtemplateconfigdtls ADD CONSTRAINT printtemplateconfigdtls_pkey PRIMARY KEY (linkrefid, terminalid, trntype, templatename, tenant_id);

-- promoarapplcustdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promoarapplcustdtls DROP CONSTRAINT promoarapplcustdtls_pkey;
ALTER TABLE s9.promoarapplcustdtls ADD CONSTRAINT promoarapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promoarbilllvldiscdtls  old_pk=(salespromocode, salespromosrlno, srlno)
ALTER TABLE s9.promoarbilllvldiscdtls DROP CONSTRAINT promoarbilllvldiscdtls_pkey;
ALTER TABLE s9.promoarbilllvldiscdtls ADD CONSTRAINT promoarbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, salespromosrlno, srlno, tenant_id);

-- promoarbuyitemgrpdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promoarbuyitemgrpdtls DROP CONSTRAINT promoarbuyitemgrpdtls_pkey;
ALTER TABLE s9.promoarbuyitemgrpdtls ADD CONSTRAINT promoarbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promoargetitemgrpdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promoargetitemgrpdtls DROP CONSTRAINT promoargetitemgrpdtls_pkey;
ALTER TABLE s9.promoargetitemgrpdtls ADD CONSTRAINT promoargetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promoarheader  old_pk=(salespromocode, salespromosrlno)
ALTER TABLE s9.promoarheader DROP CONSTRAINT promoarheader_pkey;
ALTER TABLE s9.promoarheader ADD CONSTRAINT promoarheader_pkey PRIMARY KEY (salespromocode, salespromosrlno, tenant_id);

-- promoaritemlvldiscdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promoaritemlvldiscdtls DROP CONSTRAINT promoaritemlvldiscdtls_pkey;
ALTER TABLE s9.promoaritemlvldiscdtls ADD CONSTRAINT promoaritemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promoarshowroomdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promoarshowroomdtls DROP CONSTRAINT promoarshowroomdtls_pkey;
ALTER TABLE s9.promoarshowroomdtls ADD CONSTRAINT promoarshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologapplcustdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologapplcustdtls DROP CONSTRAINT promologapplcustdtls_pkey;
ALTER TABLE s9.promologapplcustdtls ADD CONSTRAINT promologapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologbilllvldiscdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologbilllvldiscdtls DROP CONSTRAINT promologbilllvldiscdtls_pkey;
ALTER TABLE s9.promologbilllvldiscdtls ADD CONSTRAINT promologbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologbuyitemgrpdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologbuyitemgrpdtls DROP CONSTRAINT promologbuyitemgrpdtls_pkey;
ALTER TABLE s9.promologbuyitemgrpdtls ADD CONSTRAINT promologbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologgetitemgrpdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologgetitemgrpdtls DROP CONSTRAINT promologgetitemgrpdtls_pkey;
ALTER TABLE s9.promologgetitemgrpdtls ADD CONSTRAINT promologgetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologheader  old_pk=(salespromocode, salespromosrlno)
ALTER TABLE s9.promologheader DROP CONSTRAINT promologheader_pkey;
ALTER TABLE s9.promologheader ADD CONSTRAINT promologheader_pkey PRIMARY KEY (salespromocode, salespromosrlno, tenant_id);

-- promologitemlvldiscdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologitemlvldiscdtls DROP CONSTRAINT promologitemlvldiscdtls_pkey;
ALTER TABLE s9.promologitemlvldiscdtls ADD CONSTRAINT promologitemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promologshowroomdtls  old_pk=(salespromocode, srlno, salespromosrlno)
ALTER TABLE s9.promologshowroomdtls DROP CONSTRAINT promologshowroomdtls_pkey;
ALTER TABLE s9.promologshowroomdtls ADD CONSTRAINT promologshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- promomnapplcustdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomnapplcustdtls DROP CONSTRAINT promomnapplcustdtls_pkey;
ALTER TABLE s9.promomnapplcustdtls ADD CONSTRAINT promomnapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- promomnbilllvldiscdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomnbilllvldiscdtls DROP CONSTRAINT promomnbilllvldiscdtls_pkey;
ALTER TABLE s9.promomnbilllvldiscdtls ADD CONSTRAINT promomnbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- promomnbuyitemgrpdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomnbuyitemgrpdtls DROP CONSTRAINT promomnbuyitemgrpdtls_pkey;
ALTER TABLE s9.promomnbuyitemgrpdtls ADD CONSTRAINT promomnbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- promomngetitemgrpdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomngetitemgrpdtls DROP CONSTRAINT promomngetitemgrpdtls_pkey;
ALTER TABLE s9.promomngetitemgrpdtls ADD CONSTRAINT promomngetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- promomnheader  old_pk=(salespromocode)
ALTER TABLE s9.promomnheader DROP CONSTRAINT promomnheader_pkey;
ALTER TABLE s9.promomnheader ADD CONSTRAINT promomnheader_pkey PRIMARY KEY (salespromocode, tenant_id);

-- promomnintermediate  old_pk=(smriti_id)
ALTER TABLE s9.promomnintermediate DROP CONSTRAINT promomnintermediate_pkey;
ALTER TABLE s9.promomnintermediate ADD CONSTRAINT promomnintermediate_pkey PRIMARY KEY (smriti_id, tenant_id);

-- promomnitemlvldiscdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomnitemlvldiscdtls DROP CONSTRAINT promomnitemlvldiscdtls_pkey;
ALTER TABLE s9.promomnitemlvldiscdtls ADD CONSTRAINT promomnitemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- promomnshowroomdtls  old_pk=(salespromocode, srlno)
ALTER TABLE s9.promomnshowroomdtls DROP CONSTRAINT promomnshowroomdtls_pkey;
ALTER TABLE s9.promomnshowroomdtls ADD CONSTRAINT promomnshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- ptbrowsesuper  old_pk=(smriti_id)
ALTER TABLE s9.ptbrowsesuper DROP CONSTRAINT ptbrowsesuper_pkey;
ALTER TABLE s9.ptbrowsesuper ADD CONSTRAINT ptbrowsesuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- ptdtlsuper  old_pk=(smriti_id)
ALTER TABLE s9.ptdtlsuper DROP CONSTRAINT ptdtlsuper_pkey;
ALTER TABLE s9.ptdtlsuper ADD CONSTRAINT ptdtlsuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- pthdrsuper  old_pk=(smriti_id)
ALTER TABLE s9.pthdrsuper DROP CONSTRAINT pthdrsuper_pkey;
ALTER TABLE s9.pthdrsuper ADD CONSTRAINT pthdrsuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- ptinvoicedtl  old_pk=(suppcode, billdate, billno, srlno, trntype)
ALTER TABLE s9.ptinvoicedtl DROP CONSTRAINT ptinvoicedtl_pkey;
ALTER TABLE s9.ptinvoicedtl ADD CONSTRAINT ptinvoicedtl_pkey PRIMARY KEY (suppcode, billdate, billno, srlno, trntype, tenant_id);

-- ptinvoiceextd01  old_pk=(trntype, suppcode, showroomcode, billdate, billno, srlno, subsrlno)
ALTER TABLE s9.ptinvoiceextd01 DROP CONSTRAINT ptinvoiceextd01_pkey;
ALTER TABLE s9.ptinvoiceextd01 ADD CONSTRAINT ptinvoiceextd01_pkey PRIMARY KEY (trntype, suppcode, showroomcode, billdate, billno, srlno, subsrlno, tenant_id);

-- ptinvoicehdr  old_pk=(suppcode, billno, billdate, trntype)
ALTER TABLE s9.ptinvoicehdr DROP CONSTRAINT ptinvoicehdr_pkey;
ALTER TABLE s9.ptinvoicehdr ADD CONSTRAINT ptinvoicehdr_pkey PRIMARY KEY (suppcode, billno, billdate, trntype, tenant_id);

-- purchasetaxcat  old_pk=(desttaxtype, prodtaxtype, srctaxtype)
ALTER TABLE s9.purchasetaxcat DROP CONSTRAINT purchasetaxcat_pkey;
ALTER TABLE s9.purchasetaxcat ADD CONSTRAINT purchasetaxcat_pkey PRIMARY KEY (desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- purchordconfig  old_pk=(smriti_id)
ALTER TABLE s9.purchordconfig DROP CONSTRAINT purchordconfig_pkey;
ALTER TABLE s9.purchordconfig ADD CONSTRAINT purchordconfig_pkey PRIMARY KEY (smriti_id, tenant_id);

-- purchorddtl  old_pk=(potype, ponoprefix, poctrlno, deliverylocation, entrysrlno, entrysubsrlno)
ALTER TABLE s9.purchorddtl DROP CONSTRAINT purchorddtl_pkey;
ALTER TABLE s9.purchorddtl ADD CONSTRAINT purchorddtl_pkey PRIMARY KEY (potype, ponoprefix, poctrlno, deliverylocation, entrysrlno, entrysubsrlno, tenant_id);

-- purchordhdr  old_pk=(potype, ponoprefix, poctrlno)
ALTER TABLE s9.purchordhdr DROP CONSTRAINT purchordhdr_pkey;
ALTER TABLE s9.purchordhdr ADD CONSTRAINT purchordhdr_pkey PRIMARY KEY (potype, ponoprefix, poctrlno, tenant_id);

-- purchordtrl  old_pk=(ponoprefix, poctrlno, entrysrlno)
ALTER TABLE s9.purchordtrl DROP CONSTRAINT purchordtrl_pkey;
ALTER TABLE s9.purchordtrl ADD CONSTRAINT purchordtrl_pkey PRIMARY KEY (ponoprefix, poctrlno, entrysrlno, tenant_id);

-- purchplan  old_pk=(smriti_id)
ALTER TABLE s9.purchplan DROP CONSTRAINT purchplan_pkey;
ALTER TABLE s9.purchplan ADD CONSTRAINT purchplan_pkey PRIMARY KEY (smriti_id, tenant_id);

-- purgelogdtls  old_pk=(ctrlnumber, srlno)
ALTER TABLE s9.purgelogdtls DROP CONSTRAINT purgelogdtls_pkey;
ALTER TABLE s9.purgelogdtls ADD CONSTRAINT purgelogdtls_pkey PRIMARY KEY (ctrlnumber, srlno, tenant_id);

-- purgeloghdr  old_pk=(ctrlnumber)
ALTER TABLE s9.purgeloghdr DROP CONSTRAINT purgeloghdr_pkey;
ALTER TABLE s9.purgeloghdr ADD CONSTRAINT purgeloghdr_pkey PRIMARY KEY (ctrlnumber, tenant_id);

-- reportconfigpreferences  old_pk=(userid, taskid)
ALTER TABLE s9.reportconfigpreferences DROP CONSTRAINT reportconfigpreferences_pkey;
ALTER TABLE s9.reportconfigpreferences ADD CONSTRAINT reportconfigpreferences_pkey PRIMARY KEY (userid, taskid, tenant_id);

-- reportconfigsettings  old_pk=(configid, taskid)
ALTER TABLE s9.reportconfigsettings DROP CONSTRAINT reportconfigsettings_pkey;
ALTER TABLE s9.reportconfigsettings ADD CONSTRAINT reportconfigsettings_pkey PRIMARY KEY (configid, taskid, tenant_id);

-- reportdates  old_pk=(sno)
ALTER TABLE s9.reportdates DROP CONSTRAINT reportdates_pkey;
ALTER TABLE s9.reportdates ADD CONSTRAINT reportdates_pkey PRIMARY KEY (sno, tenant_id);

-- repsizecat  old_pk=(smriti_id)
ALTER TABLE s9.repsizecat DROP CONSTRAINT repsizecat_pkey;
ALTER TABLE s9.repsizecat ADD CONSTRAINT repsizecat_pkey PRIMARY KEY (smriti_id, tenant_id);

-- rptselfilename  old_pk=(exename, filename)
ALTER TABLE s9.rptselfilename DROP CONSTRAINT rptselfilename_pkey;
ALTER TABLE s9.rptselfilename ADD CONSTRAINT rptselfilename_pkey PRIMARY KEY (exename, filename, tenant_id);

-- salesfactors  old_pk=(recno)
ALTER TABLE s9.salesfactors DROP CONSTRAINT salesfactors_pkey;
ALTER TABLE s9.salesfactors ADD CONSTRAINT salesfactors_pkey PRIMARY KEY (recno, tenant_id);

-- salestaxcat  old_pk=(desttaxtype, prodtaxtype, srctaxtype)
ALTER TABLE s9.salestaxcat DROP CONSTRAINT salestaxcat_pkey;
ALTER TABLE s9.salestaxcat ADD CONSTRAINT salestaxcat_pkey PRIMARY KEY (desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- salestaxrevision  old_pk=(taxrevisionid, desttaxtype, prodtaxtype, srctaxtype)
ALTER TABLE s9.salestaxrevision DROP CONSTRAINT salestaxrevision_pkey;
ALTER TABLE s9.salestaxrevision ADD CONSTRAINT salestaxrevision_pkey PRIMARY KEY (taxrevisionid, desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- salestaxrevisionhistory  old_pk=(taxrevisionid, desttaxtype, prodtaxtype, srctaxtype)
ALTER TABLE s9.salestaxrevisionhistory DROP CONSTRAINT salestaxrevisionhistory_pkey;
ALTER TABLE s9.salestaxrevisionhistory ADD CONSTRAINT salestaxrevisionhistory_pkey PRIMARY KEY (taxrevisionid, desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- saletrnhdr  old_pk=(saletrntype, saletrnctrlno)
ALTER TABLE s9.saletrnhdr DROP CONSTRAINT saletrnhdr_pkey;
ALTER TABLE s9.saletrnhdr ADD CONSTRAINT saletrnhdr_pkey PRIMARY KEY (saletrntype, saletrnctrlno, tenant_id);

-- schemesdefinitiondtls  old_pk=(schemecode, srlno)
ALTER TABLE s9.schemesdefinitiondtls DROP CONSTRAINT schemesdefinitiondtls_pkey;
ALTER TABLE s9.schemesdefinitiondtls ADD CONSTRAINT schemesdefinitiondtls_pkey PRIMARY KEY (schemecode, srlno, tenant_id);

-- schemesdefinitionhdr  old_pk=(schemecode)
ALTER TABLE s9.schemesdefinitionhdr DROP CONSTRAINT schemesdefinitionhdr_pkey;
ALTER TABLE s9.schemesdefinitionhdr ADD CONSTRAINT schemesdefinitionhdr_pkey PRIMARY KEY (schemecode, tenant_id);

-- schemespointsslabs  old_pk=(schemecode, slabtype, srlno)
ALTER TABLE s9.schemespointsslabs DROP CONSTRAINT schemespointsslabs_pkey;
ALTER TABLE s9.schemespointsslabs ADD CONSTRAINT schemespointsslabs_pkey PRIMARY KEY (schemecode, slabtype, srlno, tenant_id);

-- seasonsmaster  old_pk=(seasonsname)
ALTER TABLE s9.seasonsmaster DROP CONSTRAINT seasonsmaster_pkey;
ALTER TABLE s9.seasonsmaster ADD CONSTRAINT seasonsmaster_pkey PRIMARY KEY (seasonsname, tenant_id);

-- seasonsmasterlog  old_pk=(smriti_id)
ALTER TABLE s9.seasonsmasterlog DROP CONSTRAINT seasonsmasterlog_pkey;
ALTER TABLE s9.seasonsmasterlog ADD CONSTRAINT seasonsmasterlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- shoperscriptupdateinfo  old_pk=(scriptid, runsrl)
ALTER TABLE s9.shoperscriptupdateinfo DROP CONSTRAINT shoperscriptupdateinfo_pkey;
ALTER TABLE s9.shoperscriptupdateinfo ADD CONSTRAINT shoperscriptupdateinfo_pkey PRIMARY KEY (scriptid, runsrl, tenant_id);

-- shrmscript  old_pk=(scriptblockid, srlno)
ALTER TABLE s9.shrmscript DROP CONSTRAINT shrmscript_pkey;
ALTER TABLE s9.shrmscript ADD CONSTRAINT shrmscript_pkey PRIMARY KEY (scriptblockid, srlno, tenant_id);

-- shrmscriptextd  old_pk=(smriti_id)
ALTER TABLE s9.shrmscriptextd DROP CONSTRAINT shrmscriptextd_pkey;
ALTER TABLE s9.shrmscriptextd ADD CONSTRAINT shrmscriptextd_pkey PRIMARY KEY (smriti_id, tenant_id);

-- sisstatus  old_pk=(runno)
ALTER TABLE s9.sisstatus DROP CONSTRAINT sisstatus_pkey;
ALTER TABLE s9.sisstatus ADD CONSTRAINT sisstatus_pkey PRIMARY KEY (runno, tenant_id);

-- sizecat  old_pk=(class1cd, class2cd, sizecd)
ALTER TABLE s9.sizecat DROP CONSTRAINT sizecat_pkey;
ALTER TABLE s9.sizecat ADD CONSTRAINT sizecat_pkey PRIMARY KEY (class1cd, class2cd, sizecd, tenant_id);

-- sizeentryfieldsconfig  old_pk=(entrytype, trntype, fieldsrlno)
ALTER TABLE s9.sizeentryfieldsconfig DROP CONSTRAINT sizeentryfieldsconfig_pkey;
ALTER TABLE s9.sizeentryfieldsconfig ADD CONSTRAINT sizeentryfieldsconfig_pkey PRIMARY KEY (entrytype, trntype, fieldsrlno, tenant_id);

-- smriti_barcode_templates  old_pk=(id)
ALTER TABLE s9.smriti_barcode_templates DROP CONSTRAINT smriti_barcode_templates_pkey;
ALTER TABLE s9.smriti_barcode_templates ADD CONSTRAINT smriti_barcode_templates_pkey PRIMARY KEY (id, tenant_id);

-- spdefsettings  old_pk=(smriti_id)
ALTER TABLE s9.spdefsettings DROP CONSTRAINT spdefsettings_pkey;
ALTER TABLE s9.spdefsettings ADD CONSTRAINT spdefsettings_pkey PRIMARY KEY (smriti_id, tenant_id);

-- stktrnaddldtls  old_pk=(trntype, trndocnoprefix, trndocno, entsrlno)
ALTER TABLE s9.stktrnaddldtls DROP CONSTRAINT stktrnaddldtls_pkey;
ALTER TABLE s9.stktrnaddldtls ADD CONSTRAINT stktrnaddldtls_pkey PRIMARY KEY (trntype, trndocnoprefix, trndocno, entsrlno, tenant_id);

-- stktrnaddlhdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.stktrnaddlhdr DROP CONSTRAINT stktrnaddlhdr_pkey;
ALTER TABLE s9.stktrnaddlhdr ADD CONSTRAINT stktrnaddlhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- stktrndtls  old_pk=(trntype, trnctrlno, docnoprefix, docno, entsrlno)
ALTER TABLE s9.stktrndtls DROP CONSTRAINT stktrndtls_pkey;
ALTER TABLE s9.stktrndtls ADD CONSTRAINT stktrndtls_pkey PRIMARY KEY (trntype, trnctrlno, docnoprefix, docno, entsrlno, tenant_id);

-- stktrndtlsextd01  old_pk=(trntype, trnctrlno, entsrlno, itemtagsrlno)
ALTER TABLE s9.stktrndtlsextd01 DROP CONSTRAINT stktrndtlsextd01_pkey;
ALTER TABLE s9.stktrndtlsextd01 ADD CONSTRAINT stktrndtlsextd01_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- stktrneddtls  old_pk=(trntype, trnctrlno, entsrlno)
ALTER TABLE s9.stktrneddtls DROP CONSTRAINT stktrneddtls_pkey;
ALTER TABLE s9.stktrneddtls ADD CONSTRAINT stktrneddtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- stktrnedhdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.stktrnedhdr DROP CONSTRAINT stktrnedhdr_pkey;
ALTER TABLE s9.stktrnedhdr ADD CONSTRAINT stktrnedhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- stktrnhdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.stktrnhdr DROP CONSTRAINT stktrnhdr_pkey;
ALTER TABLE s9.stktrnhdr ADD CONSTRAINT stktrnhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- stockcreditnote  old_pk=(docnoprefix, docno, docentsrlno)
ALTER TABLE s9.stockcreditnote DROP CONSTRAINT stockcreditnote_pkey;
ALTER TABLE s9.stockcreditnote ADD CONSTRAINT stockcreditnote_pkey PRIMARY KEY (docnoprefix, docno, docentsrlno, tenant_id);

-- stockmaster  old_pk=(stockno, batchsrlno, locnid)
ALTER TABLE s9.stockmaster DROP CONSTRAINT stockmaster_pkey;
ALTER TABLE s9.stockmaster ADD CONSTRAINT stockmaster_pkey PRIMARY KEY (stockno, batchsrlno, locnid, tenant_id);

-- stockmasterextd  old_pk=(stockno, batchsrlno)
ALTER TABLE s9.stockmasterextd DROP CONSTRAINT stockmasterextd_pkey;
ALTER TABLE s9.stockmasterextd ADD CONSTRAINT stockmasterextd_pkey PRIMARY KEY (stockno, batchsrlno, tenant_id);

-- stockmasterextd01  old_pk=(stockno, batchno, gradecd, locationcd)
ALTER TABLE s9.stockmasterextd01 DROP CONSTRAINT stockmasterextd01_pkey;
ALTER TABLE s9.stockmasterextd01 ADD CONSTRAINT stockmasterextd01_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, tenant_id);

-- stockmasterextd02  old_pk=(stockno, itemtag1, batchno, gradecd, locationcd)
ALTER TABLE s9.stockmasterextd02 DROP CONSTRAINT stockmasterextd02_pkey;
ALTER TABLE s9.stockmasterextd02 ADD CONSTRAINT stockmasterextd02_pkey PRIMARY KEY (stockno, itemtag1, batchno, gradecd, locationcd, tenant_id);

-- stockmasterextdopbal  old_pk=(stockno, batchno, gradecd, locationcd)
ALTER TABLE s9.stockmasterextdopbal DROP CONSTRAINT stockmasterextdopbal_pkey;
ALTER TABLE s9.stockmasterextdopbal ADD CONSTRAINT stockmasterextdopbal_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, tenant_id);

-- stocktrnsummary  old_pk=(stockno, batchsrlno, locnid, yr, monthno)
ALTER TABLE s9.stocktrnsummary DROP CONSTRAINT stocktrnsummary_pkey;
ALTER TABLE s9.stocktrnsummary ADD CONSTRAINT stocktrnsummary_pkey PRIMARY KEY (stockno, batchsrlno, locnid, yr, monthno, tenant_id);

-- subclass1cat  old_pk=(class1cd, class2cd, subclass1cd)
ALTER TABLE s9.subclass1cat DROP CONSTRAINT subclass1cat_pkey;
ALTER TABLE s9.subclass1cat ADD CONSTRAINT subclass1cat_pkey PRIMARY KEY (class1cd, class2cd, subclass1cd, tenant_id);

-- subclass2cat  old_pk=(class1cd, class2cd, subclass2cd)
ALTER TABLE s9.subclass2cat DROP CONSTRAINT subclass2cat_pkey;
ALTER TABLE s9.subclass2cat ADD CONSTRAINT subclass2cat_pkey PRIMARY KEY (class1cd, class2cd, subclass2cd, tenant_id);

-- sysparam  old_pk=(id)
ALTER TABLE s9.sysparam DROP CONSTRAINT sysparam_pkey;
ALTER TABLE s9.sysparam ADD CONSTRAINT sysparam_pkey PRIMARY KEY (id, tenant_id);

-- sysparamextd  old_pk=(id)
ALTER TABLE s9.sysparamextd DROP CONSTRAINT sysparamextd_pkey;
ALTER TABLE s9.sysparamextd ADD CONSTRAINT sysparamextd_pkey PRIMARY KEY (id, tenant_id);

-- sysparamlookup  old_pk=(smriti_id)
ALTER TABLE s9.sysparamlookup DROP CONSTRAINT sysparamlookup_pkey;
ALTER TABLE s9.sysparamlookup ADD CONSTRAINT sysparamlookup_pkey PRIMARY KEY (smriti_id, tenant_id);

-- szcatdtls  old_pk=(szgrpcd, szcd)
ALTER TABLE s9.szcatdtls DROP CONSTRAINT szcatdtls_pkey;
ALTER TABLE s9.szcatdtls ADD CONSTRAINT szcatdtls_pkey PRIMARY KEY (szgrpcd, szcd, tenant_id);

-- szhdrs  old_pk=(szgrpcd)
ALTER TABLE s9.szhdrs DROP CONSTRAINT szhdrs_pkey;
ALTER TABLE s9.szhdrs ADD CONSTRAINT szhdrs_pkey PRIMARY KEY (szgrpcd, tenant_id);

-- tallyexportedtrans  old_pk=(trntype, voucherno)
ALTER TABLE s9.tallyexportedtrans DROP CONSTRAINT tallyexportedtrans_pkey;
ALTER TABLE s9.tallyexportedtrans ADD CONSTRAINT tallyexportedtrans_pkey PRIMARY KEY (trntype, voucherno, tenant_id);

-- tallyhsnrules  old_pk=(mapid)
ALTER TABLE s9.tallyhsnrules DROP CONSTRAINT tallyhsnrules_pkey;
ALTER TABLE s9.tallyhsnrules ADD CONSTRAINT tallyhsnrules_pkey PRIMARY KEY (mapid, tenant_id);

-- tallymappurchtaxcat  old_pk=(taxcomponent, mapname)
ALTER TABLE s9.tallymappurchtaxcat DROP CONSTRAINT tallymappurchtaxcat_pkey;
ALTER TABLE s9.tallymappurchtaxcat ADD CONSTRAINT tallymappurchtaxcat_pkey PRIMARY KEY (taxcomponent, mapname, tenant_id);

-- tallymapsettinginfo  old_pk=(mapname, poststartdate)
ALTER TABLE s9.tallymapsettinginfo DROP CONSTRAINT tallymapsettinginfo_pkey;
ALTER TABLE s9.tallymapsettinginfo ADD CONSTRAINT tallymapsettinginfo_pkey PRIMARY KEY (mapname, poststartdate, tenant_id);

-- tallymasterinfo  old_pk=(alias)
ALTER TABLE s9.tallymasterinfo DROP CONSTRAINT tallymasterinfo_pkey;
ALTER TABLE s9.tallymasterinfo ADD CONSTRAINT tallymasterinfo_pkey PRIMARY KEY (alias, tenant_id);

-- tallypostingsettings  old_pk=(trantype, slno)
ALTER TABLE s9.tallypostingsettings DROP CONSTRAINT tallypostingsettings_pkey;
ALTER TABLE s9.tallypostingsettings ADD CONSTRAINT tallypostingsettings_pkey PRIMARY KEY (trantype, slno, tenant_id);

-- tallyprintconfigdetails  old_pk=(configname, paramname)
ALTER TABLE s9.tallyprintconfigdetails DROP CONSTRAINT tallyprintconfigdetails_pkey;
ALTER TABLE s9.tallyprintconfigdetails ADD CONSTRAINT tallyprintconfigdetails_pkey PRIMARY KEY (configname, paramname, tenant_id);

-- tallyprintconfigheader  old_pk=(terminal, trntype, configname)
ALTER TABLE s9.tallyprintconfigheader DROP CONSTRAINT tallyprintconfigheader_pkey;
ALTER TABLE s9.tallyprintconfigheader ADD CONSTRAINT tallyprintconfigheader_pkey PRIMARY KEY (terminal, trntype, configname, tenant_id);

-- tallyvchinfo  old_pk=(vchid, vchguid, trntype, mapname)
ALTER TABLE s9.tallyvchinfo DROP CONSTRAINT tallyvchinfo_pkey;
ALTER TABLE s9.tallyvchinfo ADD CONSTRAINT tallyvchinfo_pkey PRIMARY KEY (vchid, vchguid, trntype, mapname, tenant_id);

-- terminalmaster  old_pk=(terminalid)
ALTER TABLE s9.terminalmaster DROP CONSTRAINT terminalmaster_pkey;
ALTER TABLE s9.terminalmaster ADD CONSTRAINT terminalmaster_pkey PRIMARY KEY (terminalid, tenant_id);

-- tillacceptdisplaydtls  old_pk=(tilltrntype, tillindex)
ALTER TABLE s9.tillacceptdisplaydtls DROP CONSTRAINT tillacceptdisplaydtls_pkey;
ALTER TABLE s9.tillacceptdisplaydtls ADD CONSTRAINT tillacceptdisplaydtls_pkey PRIMARY KEY (tilltrntype, tillindex, tenant_id);

-- tilloperationjournaldtls  old_pk=(tilltrntype, tilltrnctrlno, tilltrndt, srlno)
ALTER TABLE s9.tilloperationjournaldtls DROP CONSTRAINT tilloperationjournaldtls_pkey;
ALTER TABLE s9.tilloperationjournaldtls ADD CONSTRAINT tilloperationjournaldtls_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, tilltrndt, srlno, tenant_id);

-- tilloperationjournalhdr  old_pk=(tilltrntype, tilltrnctrlno, tilltrndt)
ALTER TABLE s9.tilloperationjournalhdr DROP CONSTRAINT tilloperationjournalhdr_pkey;
ALTER TABLE s9.tilloperationjournalhdr ADD CONSTRAINT tilloperationjournalhdr_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, tilltrndt, tenant_id);

-- tillshiftdtls  old_pk=(tilltrndt, nodeid, shiftno)
ALTER TABLE s9.tillshiftdtls DROP CONSTRAINT tillshiftdtls_pkey;
ALTER TABLE s9.tillshiftdtls ADD CONSTRAINT tillshiftdtls_pkey PRIMARY KEY (tilltrndt, nodeid, shiftno, tenant_id);

-- tilltrnswisedenomination  old_pk=(tilltrntype, tilltrnctrlno, srlno, subsrlno, tilltrndt)
ALTER TABLE s9.tilltrnswisedenomination DROP CONSTRAINT tilltrnswisedenomination_pkey;
ALTER TABLE s9.tilltrnswisedenomination ADD CONSTRAINT tilltrnswisedenomination_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, srlno, subsrlno, tilltrndt, tenant_id);

-- transactioncomponentsdtls  old_pk=(trntype, fieldcode, srlno, eventid)
ALTER TABLE s9.transactioncomponentsdtls DROP CONSTRAINT transactioncomponentsdtls_pkey;
ALTER TABLE s9.transactioncomponentsdtls ADD CONSTRAINT transactioncomponentsdtls_pkey PRIMARY KEY (trntype, fieldcode, srlno, eventid, tenant_id);

-- tripsheetdtls  old_pk=(trntype, trnctrlno, entsrlno)
ALTER TABLE s9.tripsheetdtls DROP CONSTRAINT tripsheetdtls_pkey;
ALTER TABLE s9.tripsheetdtls ADD CONSTRAINT tripsheetdtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- tripsheethdr  old_pk=(trntype, trnctrlno)
ALTER TABLE s9.tripsheethdr DROP CONSTRAINT tripsheethdr_pkey;
ALTER TABLE s9.tripsheethdr ADD CONSTRAINT tripsheethdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- tripsheetstatusdtls  old_pk=(statusctrlno, statusentsrlno)
ALTER TABLE s9.tripsheetstatusdtls DROP CONSTRAINT tripsheetstatusdtls_pkey;
ALTER TABLE s9.tripsheetstatusdtls ADD CONSTRAINT tripsheetstatusdtls_pkey PRIMARY KEY (statusctrlno, statusentsrlno, tenant_id);

-- trnstockaudit  old_pk=(smriti_id)
ALTER TABLE s9.trnstockaudit DROP CONSTRAINT trnstockaudit_pkey;
ALTER TABLE s9.trnstockaudit ADD CONSTRAINT trnstockaudit_pkey PRIMARY KEY (smriti_id, tenant_id);

-- userwiseitemconfig  old_pk=(userid)
ALTER TABLE s9.userwiseitemconfig DROP CONSTRAINT userwiseitemconfig_pkey;
ALTER TABLE s9.userwiseitemconfig ADD CONSTRAINT userwiseitemconfig_pkey PRIMARY KEY (userid, tenant_id);

-- vamenu  old_pk=(smriti_id)
ALTER TABLE s9.vamenu DROP CONSTRAINT vamenu_pkey;
ALTER TABLE s9.vamenu ADD CONSTRAINT vamenu_pkey PRIMARY KEY (smriti_id, tenant_id);

-- vamenushortcut  old_pk=(smriti_id)
ALTER TABLE s9.vamenushortcut DROP CONSTRAINT vamenushortcut_pkey;
ALTER TABLE s9.vamenushortcut ADD CONSTRAINT vamenushortcut_pkey PRIMARY KEY (smriti_id, tenant_id);

-- vendoritems  old_pk=(vendcd, recno)
ALTER TABLE s9.vendoritems DROP CONSTRAINT vendoritems_pkey;
ALTER TABLE s9.vendoritems ADD CONSTRAINT vendoritems_pkey PRIMARY KEY (vendcd, recno, tenant_id);

-- vendors  old_pk=(code)
ALTER TABLE s9.vendors DROP CONSTRAINT vendors_pkey;
ALTER TABLE s9.vendors ADD CONSTRAINT vendors_pkey PRIMARY KEY (code, tenant_id);

-- versiondtls  old_pk=(verid)
ALTER TABLE s9.versiondtls DROP CONSTRAINT versiondtls_pkey;
ALTER TABLE s9.versiondtls ADD CONSTRAINT versiondtls_pkey PRIMARY KEY (verid, tenant_id);

-- versionwisetblsscript  old_pk=(verid, srlno)
ALTER TABLE s9.versionwisetblsscript DROP CONSTRAINT versionwisetblsscript_pkey;
ALTER TABLE s9.versionwisetblsscript ADD CONSTRAINT versionwisetblsscript_pkey PRIMARY KEY (verid, srlno, tenant_id);

-- walkin  old_pk=(walkinsysdate, walkinintervalctr)
ALTER TABLE s9.walkin DROP CONSTRAINT walkin_pkey;
ALTER TABLE s9.walkin ADD CONSTRAINT walkin_pkey PRIMARY KEY (walkinsysdate, walkinintervalctr, tenant_id);

COMMIT;
-- Migration complete