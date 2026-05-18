
[SCAN] Tables with tenant_id column: 271

=================================================================
  SUMMARY
=================================================================
  Tables with tenant_id:           271
  Already have tenant_id in PK:    0
  [NEEDS FIX] tenant_id NOT in PK: 271
  No PK at all:                    0

[NEEDS FIX] Tables where tenant_id must be added to PK:
  Table                                         Current PK
  --------------------------------------------- ------------------------------
  acceptdisplaydtls                             ['trntype', 'index']
  accountsmaster                                ['type', 'code']
  accountsummary                                ['type', 'code', 'yr', 'monthno']
  actualscheduletask                            ['task_id', 'task_subno', 'task_location', 'showroomcode']
  additionalchargedtls                          ['paymodecode', 'schemecode', 'addnlchrgcd']
  agencycatdtl                                  ['agencycode', 'paymodetype', 'paymodecode']
  agencycathdr                                  ['agencyid']
  agentactivity                                 ['actvindex', 'task_id', 'hocompcd']
  baledtl                                       ['suppcd', 'dcno', 'dcdate', 'baleno']
  basecomptemplate                              ['tmplidno']
  billduestatusdtls                             ['sourcecompcode', 'destcompcode', 'recvtrntype', 'recvtrnctrlno', 'recvtrnsrlno']
  billduestatushdr                              ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno']
  billpassdtls                                  ['trntype', 'trnctrlno', 'srlno']
  billpasshdr                                   ['trntype', 'trnctrlno']
  browsesettings                                ['smriti_id']
  catalogsettings                               ['appname', 'formname', 'fldname', 'shoperenvtype', 'pgmoption', 'userid']
  chainstores                                   ['code']
  class12combo                                  ['class1cd', 'class2cd']
  class12locwise                                ['class1cd', 'class2cd']
  commconfig                                    ['synctype', 'mode']
  compareqty                                    ['smriti_id']
  confinschemedtls                              ['paymodetype', 'paymodecode', 'schemecode']
  crdtinvrcvdtls                                ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt']
  crdtinvrcvhdr                                 ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt']
  crdtsalecustopbal                             ['trntype', 'trnctrlno', 'trndt', 'srlno']
  crmfinalcustomer                              ['queryid', 'qrysrlno']
  crmqryinfo                                    ['queryid']
  crmqrystruc                                   ['queryid', 'qrysrlno']
  currencycat                                   ['code']
  currencydenomination                          ['code', 'srlno']
  customerimport                                ['smriti_id']
  customers                                     ['code']
  custpricegroups                               ['pricegrpcd']
  dashboardconfig                               ['userid', 'chartareacd', 'paramcd']
  datasyncconfig                                ['hocompcd']
  daybeginpgms                                  ['pgmindex']
  dayendpgms                                    ['pgmindex']
  dbtuningconfig                                ['srlno', 'type']
  dcrefnodtls                                   ['suppcd', 'dcno', 'dcdate']
  deliveryadvicedtls                            ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
  deliveryadvicehdr                             ['sourcecompcode', 'trntype', 'trnctrlno', 'docnoprefix', 'docno']
  deliverynotedtls                              ['trntype', 'trnctrlno', 'entsrlno']
  deliverynotedtlsextd01                        ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
  deliverynotehdr                               ['trntype', 'trnctrlno']
  discountdtls72                                ['recno']
  downloadparams                                ['dayenddate', 'controlno']
  errole                                        ['smriti_id']
  eventextnfieldconfig                          ['programid', 'eventid', 'fieldsrlno', 'fieldname']
  eventextnkeyvalueconfig                       ['programid', 'eventid', 'srlno', 'eventkeyvalue']
  exchangeolditems                              ['trntype', 'trnctrlno', 'srlno']
  excisedutycomponents                          ['edcode']
  excisedutydtls                                ['docno', 'srlno']
  expectedtrnaddonded                           ['trntype', 'trnctrlno', 'srlno']
  expectedtrndtls                               ['trntype', 'trnctrlno', 'docsubsrlno']
  expectedtrnhdr                                ['trntype', 'trnctrlno']
  expectedtrnrcpts                              ['trntype', 'trnctrlno', 'docsrlno']
  exportgenlookup                               ['recid', 'code', 'hocompcode', 'filenumber']
  exportsysparam                                ['id', 'hocompcode', 'filenumber']
  expttrndtlsextd01                             ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
  extditemmaster                                ['stockno']
  extdmailinglist                               ['recno', 'addresstype']
  extensionconfigexternal                       ['recid', 'programid', 'eventid', 'srlno']
  extensionconfiginfo                           ['trntype', 'extnlevel', 'structtype', 'fieldsrlno']
  extensionconfiginternal                       ['recid', 'programid', 'eventid', 'srlno']
  extensionconfigtable                          ['trntype', 'extlevel', 'structtype']
  extnpartnerinfo                               ['partnerid']
  factorheader                                  ['trntype', 'name']
  featureintrodtls                              ['featureid']
  fileloadingstatus                             ['smriti_id']
  filesfromho                                   ['infofile', 'slno']
  franchiseelog                                 ['idtype', 'shoperdt', 'srlno', 'trnstype', 'paymode']
  franchiseetrans                               ['trnacctype', 'trntype', 'trnctrlno']
  franchiselstloadeddtls                        ['smriti_id']
  franmismatchlog                               ['shoperdt', 'paymode']
  genlookup                                     ['recid', 'code']
  genlookupextd                                 ['recid', 'code']
  gs1dtls                                       ['slno', 'gs1companyprefix', 'startingno', 'endingno', 'class1cd', 'class2cd']
  hotkeys                                       ['formid', 'funcid']
  incdeftable                                   ['incname', 'personnelcd', 'ptypedesc']
  incentivegrpitemdtls                          ['incname', 'srlno']
  incshrmperioddtls                             ['incname', 'shrmprofcd', 'pcode', 'srlno']
  infotable                                     ['smriti_id']
  iniloadingerrorlog                            ['smriti_id']
  inpacksliphdr                                 ['trntype', 'trnctrlno']
  inpacksliptrn                                 ['trntype', 'trnctrlno', 'slipcrtnno', 'slipentsrlno']
  itemclassrestrict                             ['userid', 'columnname', 'value']
  itemmapping                                   ['maptype', 'hocode', 'posattrib1', 'posattrib2', 'hoattrib1', 'hoattrib2', 'hoattrib']
  itemmappingrules                              ['hocode', 'hoattrib', 'posattrib', 'condition', 'receivedcode', 'newcode']
  itemmaster                                    ['stockno', 'batchsrlno']
  itemmasterconfig                              ['fid']
  itemmasterextd01                              ['stockno', 'batchno', 'gradecd']
  itemmasterlog                                 ['smriti_id']
  itemreclassconfig                             ['fldid']
  itemreclassdtls                               ['ircid', 'srlno', 'frindicator', 'frindsrlno']
  itemreclassheader                             ['ircid']
  itemsfromho                                   ['stockno']
  itemtagconfig                                 ['trntype', 'class1cd', 'class2cd', 'fieldsrlno']
  itemtagconfigfromho                           ['trntype', 'class1cd', 'class2cd', 'fieldsrlno']
  itemtagdtls                                   ['class1cd', 'class2cd', 'itemtag1']
  kpidtls                                       ['showroomcode', 'docdt']
  logagentactivity                              ['logsrlno']
  logdataextractdetail                          ['logsrlno']
  logdataextractsummary                         ['runnumber']
  logdatasync                                   ['logsrlno']
  logdbtuningconfig                             ['srlno']
  logtilldtls                                   ['tilltrndt', 'nodeid']
  logtrnsctrlno                                 ['smriti_id']
  logwgsync                                     ['syncfilename', 'shoperdt', 'syncdt']
  lstloadeddtls                                 ['smriti_id']
  mailinglist                                   ['recno']
  messagecentre                                 ['msgid', 'msgsource']
  messagecentrelog                              ['msgid', 'msgsource', 'srlno']
  mismatchvalue                                 ['smriti_id']
  missingdocno                                  ['trntype', 'docnoprefix', 'docno', 'docdt', 'tabletype']
  monthsummary                                  ['stockno', 'batchno', 'gradecd', 'locationcd', 'yr', 'monthno']
  multipleprices                                ['sourcecompcode', 'docno', 'destcompcode', 'stockno', 'slabno']
  onacccrdtntlinktbldtls                        ['trntype', 'trnctrlno', 'srlno', 'subsrlno']
  onacccrdtntlinktblhdr                         ['trntype', 'trnctrlno', 'srlno']
  paymodeacceptconfig                           ['trntype', 'acptpaymode']
  paymodeacceptdisplaydtls                      ['paymode', 'index', 'paycode']
  paymodeacceptdisplaydtlsextd                  ['paymode', 'index', 'paycode']
  paymodeconfig                                 ['paymodetype']
  paytermscat                                   ['recno']
  pcbilldtls                                    ['posentrytype', 'posctrlno', 'posdocnoprefix', 'posdocno', 'srlno']
  pdtfieldconfig                                ['trntype', 'fieldid', 'fieldcaption']
  personnel                                     ['code']
  personnelshrmwise                             ['smcode', 'shrmcode', 'srlno']
  pgmwisefeaturedtls                            ['featureid', 'programid', 'srlno']
  phystkdl                                      ['stockno']
  phystkdtls                                    ['smriti_id']
  phystkdtlsextd01                              ['smriti_id']
  phystkhdr                                     ['smriti_id']
  phystocktakingitembkup                        ['scopeid', 'stockno', 'batchsrlno']
  phystocktakingitembkup01                      ['scopeid', 'entsrlno']
  phystocktakingitembkup02                      ['smriti_id']
  posactivitylogdtls                            ['ctrlnumber', 'srlno']
  posactivityloghdr                             ['ctrlnumber']
  poscashtrn                                    ['entrytype', 'ctrlno', 'entsrlno']
  poscashtrnextd01                              ['entrytype', 'ctrlno', 'entsrlno', 'entsubsrlno']
  poslstloadeddtls                              ['smriti_id']
  posmodebalances                               ['smriti_id']
  posmodedatadtls                               ['fld1', 'fld6']
  pospaymodes                                   ['paymodetype', 'paymodecode']
  prefixconfig                                  ['slno']
  prefixdoclog                                  ['smriti_id']
  prefixmaster                                  ['trntype', 'opid', 'terminalgroupid', 'srlno']
  prefixterminalgroups                          ['terminalgroupid', 'srlno']
  prefixtrnlog                                  ['fld1', 'fld2', 'fld4']
  prefixtrnno                                   ['trntype', 'actualprefix']
  priceloadinglog                               ['smriti_id']
  pricerange                                    ['pricetype', 'docnoprefix', 'docno', 'srlno']
  pricerangecatdtls                             ['prcatid', 'srlno']
  pricerangesettings                            ['fldtype', 'fldid']
  pricerevision                                 ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber']
  pricerevisionhistory                          ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber']
  printbusinesshandlermaster                    ['bushandlerid']
  printconfigsetting                            ['configsettingid', 'configparamid']
  printconfigsettingmaster                      ['configsettingid']
  printlinkedrefinterface                       ['linkedrefid', 'bushandlerid', 'renhandlerid', 'configsettingid']
  printlinkedreflookup                          ['smriti_id']
  printnodetrnconfigmaster                      ['nodeid', 'trntypeidentifier', 'linkedrefid']
  printrenderermaster                           ['renhandlerid']
  printtemplateconfigdtls                       ['linkrefid', 'terminalid', 'trntype', 'templatename']
  promoarapplcustdtls                           ['salespromocode', 'srlno', 'salespromosrlno']
  promoarbilllvldiscdtls                        ['salespromocode', 'salespromosrlno', 'srlno']
  promoarbuyitemgrpdtls                         ['salespromocode', 'srlno', 'salespromosrlno']
  promoargetitemgrpdtls                         ['salespromocode', 'srlno', 'salespromosrlno']
  promoarheader                                 ['salespromocode', 'salespromosrlno']
  promoaritemlvldiscdtls                        ['salespromocode', 'srlno', 'salespromosrlno']
  promoarshowroomdtls                           ['salespromocode', 'srlno', 'salespromosrlno']
  promologapplcustdtls                          ['salespromocode', 'srlno', 'salespromosrlno']
  promologbilllvldiscdtls                       ['salespromocode', 'srlno', 'salespromosrlno']
  promologbuyitemgrpdtls                        ['salespromocode', 'srlno', 'salespromosrlno']
  promologgetitemgrpdtls                        ['salespromocode', 'srlno', 'salespromosrlno']
  promologheader                                ['salespromocode', 'salespromosrlno']
  promologitemlvldiscdtls                       ['salespromocode', 'srlno', 'salespromosrlno']
  promologshowroomdtls                          ['salespromocode', 'srlno', 'salespromosrlno']
  promomnapplcustdtls                           ['salespromocode', 'srlno']
  promomnbilllvldiscdtls                        ['salespromocode', 'srlno']
  promomnbuyitemgrpdtls                         ['salespromocode', 'srlno']
  promomngetitemgrpdtls                         ['salespromocode', 'srlno']
  promomnheader                                 ['salespromocode']
  promomnintermediate                           ['smriti_id']
  promomnitemlvldiscdtls                        ['salespromocode', 'srlno']
  promomnshowroomdtls                           ['salespromocode', 'srlno']
  ptbrowsesuper                                 ['smriti_id']
  ptdtlsuper                                    ['smriti_id']
  pthdrsuper                                    ['smriti_id']
  ptinvoicedtl                                  ['suppcode', 'billdate', 'billno', 'srlno', 'trntype']
  ptinvoiceextd01                               ['trntype', 'suppcode', 'showroomcode', 'billdate', 'billno', 'srlno', 'subsrlno']
  ptinvoicehdr                                  ['suppcode', 'billno', 'billdate', 'trntype']
  purchasetaxcat                                ['desttaxtype', 'prodtaxtype', 'srctaxtype']
  purchordconfig                                ['smriti_id']
  purchorddtl                                   ['potype', 'ponoprefix', 'poctrlno', 'deliverylocation', 'entrysrlno', 'entrysubsrlno']
  purchordhdr                                   ['potype', 'ponoprefix', 'poctrlno']
  purchordtrl                                   ['ponoprefix', 'poctrlno', 'entrysrlno']
  purchplan                                     ['smriti_id']
  purgelogdtls                                  ['ctrlnumber', 'srlno']
  purgeloghdr                                   ['ctrlnumber']
  reportconfigpreferences                       ['userid', 'taskid']
  reportconfigsettings                          ['configid', 'taskid']
  reportdates                                   ['sno']
  repsizecat                                    ['smriti_id']
  rptselfilename                                ['exename', 'filename']
  salesfactors                                  ['recno']
  salestaxcat                                   ['desttaxtype', 'prodtaxtype', 'srctaxtype']
  salestaxrevision                              ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype']
  salestaxrevisionhistory                       ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype']
  saletrnhdr                                    ['saletrntype', 'saletrnctrlno']
  schemesdefinitiondtls                         ['schemecode', 'srlno']
  schemesdefinitionhdr                          ['schemecode']
  schemespointsslabs                            ['schemecode', 'slabtype', 'srlno']
  seasonsmaster                                 ['seasonsname']
  seasonsmasterlog                              ['smriti_id']
  shoperscriptupdateinfo                        ['scriptid', 'runsrl']
  shrmscript                                    ['scriptblockid', 'srlno']
  shrmscriptextd                                ['smriti_id']
  sisstatus                                     ['runno']
  sizecat                                       ['class1cd', 'class2cd', 'sizecd']
  sizeentryfieldsconfig                         ['entrytype', 'trntype', 'fieldsrlno']
  smriti_barcode_templates                      ['id']
  spdefsettings                                 ['smriti_id']
  stktrnaddldtls                                ['trntype', 'trndocnoprefix', 'trndocno', 'entsrlno']
  stktrnaddlhdr                                 ['trntype', 'trnctrlno']
  stktrndtls                                    ['trntype', 'trnctrlno', 'docnoprefix', 'docno', 'entsrlno']
  stktrndtlsextd01                              ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
  stktrneddtls                                  ['trntype', 'trnctrlno', 'entsrlno']
  stktrnedhdr                                   ['trntype', 'trnctrlno']
  stktrnhdr                                     ['trntype', 'trnctrlno']
  stockcreditnote                               ['docnoprefix', 'docno', 'docentsrlno']
  stockmaster                                   ['stockno', 'batchsrlno', 'locnid']
  stockmasterextd                               ['stockno', 'batchsrlno']
  stockmasterextd01                             ['stockno', 'batchno', 'gradecd', 'locationcd']
  stockmasterextd02                             ['stockno', 'itemtag1', 'batchno', 'gradecd', 'locationcd']
  stockmasterextdopbal                          ['stockno', 'batchno', 'gradecd', 'locationcd']
  stocktrnsummary                               ['stockno', 'batchsrlno', 'locnid', 'yr', 'monthno']
  subclass1cat                                  ['class1cd', 'class2cd', 'subclass1cd']
  subclass2cat                                  ['class1cd', 'class2cd', 'subclass2cd']
  sysparam                                      ['id']
  sysparamextd                                  ['id']
  sysparamlookup                                ['smriti_id']
  szcatdtls                                     ['szgrpcd', 'szcd']
  szhdrs                                        ['szgrpcd']
  tallyexportedtrans                            ['trntype', 'voucherno']
  tallyhsnrules                                 ['mapid']
  tallymappurchtaxcat                           ['taxcomponent', 'mapname']
  tallymapsettinginfo                           ['mapname', 'poststartdate']
  tallymasterinfo                               ['alias']
  tallypostingsettings                          ['trantype', 'slno']
  tallyprintconfigdetails                       ['configname', 'paramname']
  tallyprintconfigheader                        ['terminal', 'trntype', 'configname']
  tallyvchinfo                                  ['vchid', 'vchguid', 'trntype', 'mapname']
  terminalmaster                                ['terminalid']
  tillacceptdisplaydtls                         ['tilltrntype', 'tillindex']
  tilloperationjournaldtls                      ['tilltrntype', 'tilltrnctrlno', 'tilltrndt', 'srlno']
  tilloperationjournalhdr                       ['tilltrntype', 'tilltrnctrlno', 'tilltrndt']
  tillshiftdtls                                 ['tilltrndt', 'nodeid', 'shiftno']
  tilltrnswisedenomination                      ['tilltrntype', 'tilltrnctrlno', 'srlno', 'subsrlno', 'tilltrndt']
  transactioncomponentsdtls                     ['trntype', 'fieldcode', 'srlno', 'eventid']
  tripsheetdtls                                 ['trntype', 'trnctrlno', 'entsrlno']
  tripsheethdr                                  ['trntype', 'trnctrlno']
  tripsheetstatusdtls                           ['statusctrlno', 'statusentsrlno']
  trnstockaudit                                 ['smriti_id']
  userwiseitemconfig                            ['userid']
  vamenu                                        ['smriti_id']
  vamenushortcut                                ['smriti_id']
  vendoritems                                   ['vendcd', 'recno']
  vendors                                       ['code']
  versiondtls                                   ['verid']
  versionwisetblsscript                         ['verid', 'srlno']
  walkin                                        ['walkinsysdate', 'walkinintervalctr']


=================================================================
  GENERATED MIGRATION SQL
=================================================================
-- Auto-generated by audit_tenant_pk.py
-- Adds tenant_id to Primary Key for 271 tables
-- Run inside a transaction!

BEGIN;

-- Table: acceptdisplaydtls
-- Old PK: ['trntype', 'index']
-- New PK: ['trntype', 'index', 'tenant_id']
ALTER TABLE s9.acceptdisplaydtls DROP CONSTRAINT acceptdisplaydtls_pkey;
ALTER TABLE s9.acceptdisplaydtls ADD CONSTRAINT acceptdisplaydtls_pkey PRIMARY KEY (trntype, index, tenant_id);

-- Table: accountsmaster
-- Old PK: ['type', 'code']
-- New PK: ['type', 'code', 'tenant_id']
ALTER TABLE s9.accountsmaster DROP CONSTRAINT accountsmaster_pkey;
ALTER TABLE s9.accountsmaster ADD CONSTRAINT accountsmaster_pkey PRIMARY KEY (type, code, tenant_id);

-- Table: accountsummary
-- Old PK: ['type', 'code', 'yr', 'monthno']
-- New PK: ['type', 'code', 'yr', 'monthno', 'tenant_id']
ALTER TABLE s9.accountsummary DROP CONSTRAINT accountsummary_pkey;
ALTER TABLE s9.accountsummary ADD CONSTRAINT accountsummary_pkey PRIMARY KEY (type, code, yr, monthno, tenant_id);

-- Table: actualscheduletask
-- Old PK: ['task_id', 'task_subno', 'task_location', 'showroomcode']
-- New PK: ['task_id', 'task_subno', 'task_location', 'showroomcode', 'tenant_id']
ALTER TABLE s9.actualscheduletask DROP CONSTRAINT actualscheduletask_pkey;
ALTER TABLE s9.actualscheduletask ADD CONSTRAINT actualscheduletask_pkey PRIMARY KEY (task_id, task_subno, task_location, showroomcode, tenant_id);

-- Table: additionalchargedtls
-- Old PK: ['paymodecode', 'schemecode', 'addnlchrgcd']
-- New PK: ['paymodecode', 'schemecode', 'addnlchrgcd', 'tenant_id']
ALTER TABLE s9.additionalchargedtls DROP CONSTRAINT additionalchargedtls_pkey;
ALTER TABLE s9.additionalchargedtls ADD CONSTRAINT additionalchargedtls_pkey PRIMARY KEY (paymodecode, schemecode, addnlchrgcd, tenant_id);

-- Table: agencycatdtl
-- Old PK: ['agencycode', 'paymodetype', 'paymodecode']
-- New PK: ['agencycode', 'paymodetype', 'paymodecode', 'tenant_id']
ALTER TABLE s9.agencycatdtl DROP CONSTRAINT agencycatdtl_pkey;
ALTER TABLE s9.agencycatdtl ADD CONSTRAINT agencycatdtl_pkey PRIMARY KEY (agencycode, paymodetype, paymodecode, tenant_id);

-- Table: agencycathdr
-- Old PK: ['agencyid']
-- New PK: ['agencyid', 'tenant_id']
ALTER TABLE s9.agencycathdr DROP CONSTRAINT agencycathdr_pkey;
ALTER TABLE s9.agencycathdr ADD CONSTRAINT agencycathdr_pkey PRIMARY KEY (agencyid, tenant_id);

-- Table: agentactivity
-- Old PK: ['actvindex', 'task_id', 'hocompcd']
-- New PK: ['actvindex', 'task_id', 'hocompcd', 'tenant_id']
ALTER TABLE s9.agentactivity DROP CONSTRAINT agentactivity_pkey;
ALTER TABLE s9.agentactivity ADD CONSTRAINT agentactivity_pkey PRIMARY KEY (actvindex, task_id, hocompcd, tenant_id);

-- Table: baledtl
-- Old PK: ['suppcd', 'dcno', 'dcdate', 'baleno']
-- New PK: ['suppcd', 'dcno', 'dcdate', 'baleno', 'tenant_id']
ALTER TABLE s9.baledtl DROP CONSTRAINT baledtl_pkey;
ALTER TABLE s9.baledtl ADD CONSTRAINT baledtl_pkey PRIMARY KEY (suppcd, dcno, dcdate, baleno, tenant_id);

-- Table: basecomptemplate
-- Old PK: ['tmplidno']
-- New PK: ['tmplidno', 'tenant_id']
ALTER TABLE s9.basecomptemplate DROP CONSTRAINT basecomptemplate_pkey;
ALTER TABLE s9.basecomptemplate ADD CONSTRAINT basecomptemplate_pkey PRIMARY KEY (tmplidno, tenant_id);

-- Table: billduestatusdtls
-- Old PK: ['sourcecompcode', 'destcompcode', 'recvtrntype', 'recvtrnctrlno', 'recvtrnsrlno']
-- New PK: ['sourcecompcode', 'destcompcode', 'recvtrntype', 'recvtrnctrlno', 'recvtrnsrlno', 'tenant_id']
ALTER TABLE s9.billduestatusdtls DROP CONSTRAINT billduestatusdtls_pkey;
ALTER TABLE s9.billduestatusdtls ADD CONSTRAINT billduestatusdtls_pkey PRIMARY KEY (sourcecompcode, destcompcode, recvtrntype, recvtrnctrlno, recvtrnsrlno, tenant_id);

-- Table: billduestatushdr
-- Old PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno']
-- New PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.billduestatushdr DROP CONSTRAINT billduestatushdr_pkey;
ALTER TABLE s9.billduestatushdr ADD CONSTRAINT billduestatushdr_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, tenant_id);

-- Table: billpassdtls
-- Old PK: ['trntype', 'trnctrlno', 'srlno']
-- New PK: ['trntype', 'trnctrlno', 'srlno', 'tenant_id']
ALTER TABLE s9.billpassdtls DROP CONSTRAINT billpassdtls_pkey;
ALTER TABLE s9.billpassdtls ADD CONSTRAINT billpassdtls_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- Table: billpasshdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.billpasshdr DROP CONSTRAINT billpasshdr_pkey;
ALTER TABLE s9.billpasshdr ADD CONSTRAINT billpasshdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: browsesettings
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.browsesettings DROP CONSTRAINT browsesettings_pkey;
ALTER TABLE s9.browsesettings ADD CONSTRAINT browsesettings_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: catalogsettings
-- Old PK: ['appname', 'formname', 'fldname', 'shoperenvtype', 'pgmoption', 'userid']
-- New PK: ['appname', 'formname', 'fldname', 'shoperenvtype', 'pgmoption', 'userid', 'tenant_id']
ALTER TABLE s9.catalogsettings DROP CONSTRAINT catalogsettings_pkey;
ALTER TABLE s9.catalogsettings ADD CONSTRAINT catalogsettings_pkey PRIMARY KEY (appname, formname, fldname, shoperenvtype, pgmoption, userid, tenant_id);

-- Table: chainstores
-- Old PK: ['code']
-- New PK: ['code', 'tenant_id']
ALTER TABLE s9.chainstores DROP CONSTRAINT chainstores_pkey;
ALTER TABLE s9.chainstores ADD CONSTRAINT chainstores_pkey PRIMARY KEY (code, tenant_id);

-- Table: class12combo
-- Old PK: ['class1cd', 'class2cd']
-- New PK: ['class1cd', 'class2cd', 'tenant_id']
ALTER TABLE s9.class12combo DROP CONSTRAINT class12combo_pkey;
ALTER TABLE s9.class12combo ADD CONSTRAINT class12combo_pkey PRIMARY KEY (class1cd, class2cd, tenant_id);

-- Table: class12locwise
-- Old PK: ['class1cd', 'class2cd']
-- New PK: ['class1cd', 'class2cd', 'tenant_id']
ALTER TABLE s9.class12locwise DROP CONSTRAINT class12locwise_pkey;
ALTER TABLE s9.class12locwise ADD CONSTRAINT class12locwise_pkey PRIMARY KEY (class1cd, class2cd, tenant_id);

-- Table: commconfig
-- Old PK: ['synctype', 'mode']
-- New PK: ['synctype', 'mode', 'tenant_id']
ALTER TABLE s9.commconfig DROP CONSTRAINT commconfig_pkey;
ALTER TABLE s9.commconfig ADD CONSTRAINT commconfig_pkey PRIMARY KEY (synctype, mode, tenant_id);

-- Table: compareqty
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.compareqty DROP CONSTRAINT compareqty_pkey;
ALTER TABLE s9.compareqty ADD CONSTRAINT compareqty_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: confinschemedtls
-- Old PK: ['paymodetype', 'paymodecode', 'schemecode']
-- New PK: ['paymodetype', 'paymodecode', 'schemecode', 'tenant_id']
ALTER TABLE s9.confinschemedtls DROP CONSTRAINT confinschemedtls_pkey;
ALTER TABLE s9.confinschemedtls ADD CONSTRAINT confinschemedtls_pkey PRIMARY KEY (paymodetype, paymodecode, schemecode, tenant_id);

-- Table: crdtinvrcvdtls
-- Old PK: ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt']
-- New PK: ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt', 'tenant_id']
ALTER TABLE s9.crdtinvrcvdtls DROP CONSTRAINT crdtinvrcvdtls_pkey;
ALTER TABLE s9.crdtinvrcvdtls ADD CONSTRAINT crdtinvrcvdtls_pkey PRIMARY KEY (recvtrntype, recvctrlno, recvsrlno, recvdocdt, tenant_id);

-- Table: crdtinvrcvhdr
-- Old PK: ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt']
-- New PK: ['recvtrntype', 'recvctrlno', 'recvsrlno', 'recvdocdt', 'tenant_id']
ALTER TABLE s9.crdtinvrcvhdr DROP CONSTRAINT crdtinvrcvhdr_pkey;
ALTER TABLE s9.crdtinvrcvhdr ADD CONSTRAINT crdtinvrcvhdr_pkey PRIMARY KEY (recvtrntype, recvctrlno, recvsrlno, recvdocdt, tenant_id);

-- Table: crdtsalecustopbal
-- Old PK: ['trntype', 'trnctrlno', 'trndt', 'srlno']
-- New PK: ['trntype', 'trnctrlno', 'trndt', 'srlno', 'tenant_id']
ALTER TABLE s9.crdtsalecustopbal DROP CONSTRAINT crdtsalecustopbal_pkey;
ALTER TABLE s9.crdtsalecustopbal ADD CONSTRAINT crdtsalecustopbal_pkey PRIMARY KEY (trntype, trnctrlno, trndt, srlno, tenant_id);

-- Table: crmfinalcustomer
-- Old PK: ['queryid', 'qrysrlno']
-- New PK: ['queryid', 'qrysrlno', 'tenant_id']
ALTER TABLE s9.crmfinalcustomer DROP CONSTRAINT crmfinalcustomer_pkey;
ALTER TABLE s9.crmfinalcustomer ADD CONSTRAINT crmfinalcustomer_pkey PRIMARY KEY (queryid, qrysrlno, tenant_id);

-- Table: crmqryinfo
-- Old PK: ['queryid']
-- New PK: ['queryid', 'tenant_id']
ALTER TABLE s9.crmqryinfo DROP CONSTRAINT crmqryinfo_pkey;
ALTER TABLE s9.crmqryinfo ADD CONSTRAINT crmqryinfo_pkey PRIMARY KEY (queryid, tenant_id);

-- Table: crmqrystruc
-- Old PK: ['queryid', 'qrysrlno']
-- New PK: ['queryid', 'qrysrlno', 'tenant_id']
ALTER TABLE s9.crmqrystruc DROP CONSTRAINT crmqrystruc_pkey;
ALTER TABLE s9.crmqrystruc ADD CONSTRAINT crmqrystruc_pkey PRIMARY KEY (queryid, qrysrlno, tenant_id);

-- Table: currencycat
-- Old PK: ['code']
-- New PK: ['code', 'tenant_id']
ALTER TABLE s9.currencycat DROP CONSTRAINT currencycat_pkey;
ALTER TABLE s9.currencycat ADD CONSTRAINT currencycat_pkey PRIMARY KEY (code, tenant_id);

-- Table: currencydenomination
-- Old PK: ['code', 'srlno']
-- New PK: ['code', 'srlno', 'tenant_id']
ALTER TABLE s9.currencydenomination DROP CONSTRAINT currencydenomination_pkey;
ALTER TABLE s9.currencydenomination ADD CONSTRAINT currencydenomination_pkey PRIMARY KEY (code, srlno, tenant_id);

-- Table: customerimport
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.customerimport DROP CONSTRAINT customerimport_pkey;
ALTER TABLE s9.customerimport ADD CONSTRAINT customerimport_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: customers
-- Old PK: ['code']
-- New PK: ['code', 'tenant_id']
ALTER TABLE s9.customers DROP CONSTRAINT customers_pkey;
ALTER TABLE s9.customers ADD CONSTRAINT customers_pkey PRIMARY KEY (code, tenant_id);

-- Table: custpricegroups
-- Old PK: ['pricegrpcd']
-- New PK: ['pricegrpcd', 'tenant_id']
ALTER TABLE s9.custpricegroups DROP CONSTRAINT custpricegroups_pkey;
ALTER TABLE s9.custpricegroups ADD CONSTRAINT custpricegroups_pkey PRIMARY KEY (pricegrpcd, tenant_id);

-- Table: dashboardconfig
-- Old PK: ['userid', 'chartareacd', 'paramcd']
-- New PK: ['userid', 'chartareacd', 'paramcd', 'tenant_id']
ALTER TABLE s9.dashboardconfig DROP CONSTRAINT dashboardconfig_pkey;
ALTER TABLE s9.dashboardconfig ADD CONSTRAINT dashboardconfig_pkey PRIMARY KEY (userid, chartareacd, paramcd, tenant_id);

-- Table: datasyncconfig
-- Old PK: ['hocompcd']
-- New PK: ['hocompcd', 'tenant_id']
ALTER TABLE s9.datasyncconfig DROP CONSTRAINT datasyncconfig_pkey;
ALTER TABLE s9.datasyncconfig ADD CONSTRAINT datasyncconfig_pkey PRIMARY KEY (hocompcd, tenant_id);

-- Table: daybeginpgms
-- Old PK: ['pgmindex']
-- New PK: ['pgmindex', 'tenant_id']
ALTER TABLE s9.daybeginpgms DROP CONSTRAINT daybeginpgms_pkey;
ALTER TABLE s9.daybeginpgms ADD CONSTRAINT daybeginpgms_pkey PRIMARY KEY (pgmindex, tenant_id);

-- Table: dayendpgms
-- Old PK: ['pgmindex']
-- New PK: ['pgmindex', 'tenant_id']
ALTER TABLE s9.dayendpgms DROP CONSTRAINT dayendpgms_pkey;
ALTER TABLE s9.dayendpgms ADD CONSTRAINT dayendpgms_pkey PRIMARY KEY (pgmindex, tenant_id);

-- Table: dbtuningconfig
-- Old PK: ['srlno', 'type']
-- New PK: ['srlno', 'type', 'tenant_id']
ALTER TABLE s9.dbtuningconfig DROP CONSTRAINT dbtuningconfig_pkey;
ALTER TABLE s9.dbtuningconfig ADD CONSTRAINT dbtuningconfig_pkey PRIMARY KEY (srlno, type, tenant_id);

-- Table: dcrefnodtls
-- Old PK: ['suppcd', 'dcno', 'dcdate']
-- New PK: ['suppcd', 'dcno', 'dcdate', 'tenant_id']
ALTER TABLE s9.dcrefnodtls DROP CONSTRAINT dcrefnodtls_pkey;
ALTER TABLE s9.dcrefnodtls ADD CONSTRAINT dcrefnodtls_pkey PRIMARY KEY (suppcd, dcno, dcdate, tenant_id);

-- Table: deliveryadvicedtls
-- Old PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
-- New PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno', 'tenant_id']
ALTER TABLE s9.deliveryadvicedtls DROP CONSTRAINT deliveryadvicedtls_pkey;
ALTER TABLE s9.deliveryadvicedtls ADD CONSTRAINT deliveryadvicedtls_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- Table: deliveryadvicehdr
-- Old PK: ['sourcecompcode', 'trntype', 'trnctrlno', 'docnoprefix', 'docno']
-- New PK: ['sourcecompcode', 'trntype', 'trnctrlno', 'docnoprefix', 'docno', 'tenant_id']
ALTER TABLE s9.deliveryadvicehdr DROP CONSTRAINT deliveryadvicehdr_pkey;
ALTER TABLE s9.deliveryadvicehdr ADD CONSTRAINT deliveryadvicehdr_pkey PRIMARY KEY (sourcecompcode, trntype, trnctrlno, docnoprefix, docno, tenant_id);

-- Table: deliverynotedtls
-- Old PK: ['trntype', 'trnctrlno', 'entsrlno']
-- New PK: ['trntype', 'trnctrlno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.deliverynotedtls DROP CONSTRAINT deliverynotedtls_pkey;
ALTER TABLE s9.deliverynotedtls ADD CONSTRAINT deliverynotedtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- Table: deliverynotedtlsextd01
-- Old PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
-- New PK: ['sourcecompcode', 'destcompcode', 'trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno', 'tenant_id']
ALTER TABLE s9.deliverynotedtlsextd01 DROP CONSTRAINT deliverynotedtlsextd01_pkey;
ALTER TABLE s9.deliverynotedtlsextd01 ADD CONSTRAINT deliverynotedtlsextd01_pkey PRIMARY KEY (sourcecompcode, destcompcode, trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- Table: deliverynotehdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.deliverynotehdr DROP CONSTRAINT deliverynotehdr_pkey;
ALTER TABLE s9.deliverynotehdr ADD CONSTRAINT deliverynotehdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: discountdtls72
-- Old PK: ['recno']
-- New PK: ['recno', 'tenant_id']
ALTER TABLE s9.discountdtls72 DROP CONSTRAINT discountdtls72_pkey;
ALTER TABLE s9.discountdtls72 ADD CONSTRAINT discountdtls72_pkey PRIMARY KEY (recno, tenant_id);

-- Table: downloadparams
-- Old PK: ['dayenddate', 'controlno']
-- New PK: ['dayenddate', 'controlno', 'tenant_id']
ALTER TABLE s9.downloadparams DROP CONSTRAINT downloadparams_pkey;
ALTER TABLE s9.downloadparams ADD CONSTRAINT downloadparams_pkey PRIMARY KEY (dayenddate, controlno, tenant_id);

-- Table: errole
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.errole DROP CONSTRAINT errole_pkey;
ALTER TABLE s9.errole ADD CONSTRAINT errole_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: eventextnfieldconfig
-- Old PK: ['programid', 'eventid', 'fieldsrlno', 'fieldname']
-- New PK: ['programid', 'eventid', 'fieldsrlno', 'fieldname', 'tenant_id']
ALTER TABLE s9.eventextnfieldconfig DROP CONSTRAINT eventextnfieldconfig_pkey;
ALTER TABLE s9.eventextnfieldconfig ADD CONSTRAINT eventextnfieldconfig_pkey PRIMARY KEY (programid, eventid, fieldsrlno, fieldname, tenant_id);

-- Table: eventextnkeyvalueconfig
-- Old PK: ['programid', 'eventid', 'srlno', 'eventkeyvalue']
-- New PK: ['programid', 'eventid', 'srlno', 'eventkeyvalue', 'tenant_id']
ALTER TABLE s9.eventextnkeyvalueconfig DROP CONSTRAINT eventextnkeyvalueconfig_pkey;
ALTER TABLE s9.eventextnkeyvalueconfig ADD CONSTRAINT eventextnkeyvalueconfig_pkey PRIMARY KEY (programid, eventid, srlno, eventkeyvalue, tenant_id);

-- Table: exchangeolditems
-- Old PK: ['trntype', 'trnctrlno', 'srlno']
-- New PK: ['trntype', 'trnctrlno', 'srlno', 'tenant_id']
ALTER TABLE s9.exchangeolditems DROP CONSTRAINT exchangeolditems_pkey;
ALTER TABLE s9.exchangeolditems ADD CONSTRAINT exchangeolditems_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- Table: excisedutycomponents
-- Old PK: ['edcode']
-- New PK: ['edcode', 'tenant_id']
ALTER TABLE s9.excisedutycomponents DROP CONSTRAINT excisedutycomponents_pkey;
ALTER TABLE s9.excisedutycomponents ADD CONSTRAINT excisedutycomponents_pkey PRIMARY KEY (edcode, tenant_id);

-- Table: excisedutydtls
-- Old PK: ['docno', 'srlno']
-- New PK: ['docno', 'srlno', 'tenant_id']
ALTER TABLE s9.excisedutydtls DROP CONSTRAINT excisedutydtls_pkey;
ALTER TABLE s9.excisedutydtls ADD CONSTRAINT excisedutydtls_pkey PRIMARY KEY (docno, srlno, tenant_id);

-- Table: expectedtrnaddonded
-- Old PK: ['trntype', 'trnctrlno', 'srlno']
-- New PK: ['trntype', 'trnctrlno', 'srlno', 'tenant_id']
ALTER TABLE s9.expectedtrnaddonded DROP CONSTRAINT expectedtrnaddonded_pkey;
ALTER TABLE s9.expectedtrnaddonded ADD CONSTRAINT expectedtrnaddonded_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- Table: expectedtrndtls
-- Old PK: ['trntype', 'trnctrlno', 'docsubsrlno']
-- New PK: ['trntype', 'trnctrlno', 'docsubsrlno', 'tenant_id']
ALTER TABLE s9.expectedtrndtls DROP CONSTRAINT expectedtrndtls_pkey;
ALTER TABLE s9.expectedtrndtls ADD CONSTRAINT expectedtrndtls_pkey PRIMARY KEY (trntype, trnctrlno, docsubsrlno, tenant_id);

-- Table: expectedtrnhdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.expectedtrnhdr DROP CONSTRAINT expectedtrnhdr_pkey;
ALTER TABLE s9.expectedtrnhdr ADD CONSTRAINT expectedtrnhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: expectedtrnrcpts
-- Old PK: ['trntype', 'trnctrlno', 'docsrlno']
-- New PK: ['trntype', 'trnctrlno', 'docsrlno', 'tenant_id']
ALTER TABLE s9.expectedtrnrcpts DROP CONSTRAINT expectedtrnrcpts_pkey;
ALTER TABLE s9.expectedtrnrcpts ADD CONSTRAINT expectedtrnrcpts_pkey PRIMARY KEY (trntype, trnctrlno, docsrlno, tenant_id);

-- Table: exportgenlookup
-- Old PK: ['recid', 'code', 'hocompcode', 'filenumber']
-- New PK: ['recid', 'code', 'hocompcode', 'filenumber', 'tenant_id']
ALTER TABLE s9.exportgenlookup DROP CONSTRAINT exportgenlookup_pkey;
ALTER TABLE s9.exportgenlookup ADD CONSTRAINT exportgenlookup_pkey PRIMARY KEY (recid, code, hocompcode, filenumber, tenant_id);

-- Table: exportsysparam
-- Old PK: ['id', 'hocompcode', 'filenumber']
-- New PK: ['id', 'hocompcode', 'filenumber', 'tenant_id']
ALTER TABLE s9.exportsysparam DROP CONSTRAINT exportsysparam_pkey;
ALTER TABLE s9.exportsysparam ADD CONSTRAINT exportsysparam_pkey PRIMARY KEY (id, hocompcode, filenumber, tenant_id);

-- Table: expttrndtlsextd01
-- Old PK: ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
-- New PK: ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno', 'tenant_id']
ALTER TABLE s9.expttrndtlsextd01 DROP CONSTRAINT expttrndtlsextd01_pkey;
ALTER TABLE s9.expttrndtlsextd01 ADD CONSTRAINT expttrndtlsextd01_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- Table: extditemmaster
-- Old PK: ['stockno']
-- New PK: ['stockno', 'tenant_id']
ALTER TABLE s9.extditemmaster DROP CONSTRAINT extditemmaster_pkey;
ALTER TABLE s9.extditemmaster ADD CONSTRAINT extditemmaster_pkey PRIMARY KEY (stockno, tenant_id);

-- Table: extdmailinglist
-- Old PK: ['recno', 'addresstype']
-- New PK: ['recno', 'addresstype', 'tenant_id']
ALTER TABLE s9.extdmailinglist DROP CONSTRAINT extdmailinglist_pkey;
ALTER TABLE s9.extdmailinglist ADD CONSTRAINT extdmailinglist_pkey PRIMARY KEY (recno, addresstype, tenant_id);

-- Table: extensionconfigexternal
-- Old PK: ['recid', 'programid', 'eventid', 'srlno']
-- New PK: ['recid', 'programid', 'eventid', 'srlno', 'tenant_id']
ALTER TABLE s9.extensionconfigexternal DROP CONSTRAINT extensionconfigexternal_pkey;
ALTER TABLE s9.extensionconfigexternal ADD CONSTRAINT extensionconfigexternal_pkey PRIMARY KEY (recid, programid, eventid, srlno, tenant_id);

-- Table: extensionconfiginfo
-- Old PK: ['trntype', 'extnlevel', 'structtype', 'fieldsrlno']
-- New PK: ['trntype', 'extnlevel', 'structtype', 'fieldsrlno', 'tenant_id']
ALTER TABLE s9.extensionconfiginfo DROP CONSTRAINT extensionconfiginfo_pkey;
ALTER TABLE s9.extensionconfiginfo ADD CONSTRAINT extensionconfiginfo_pkey PRIMARY KEY (trntype, extnlevel, structtype, fieldsrlno, tenant_id);

-- Table: extensionconfiginternal
-- Old PK: ['recid', 'programid', 'eventid', 'srlno']
-- New PK: ['recid', 'programid', 'eventid', 'srlno', 'tenant_id']
ALTER TABLE s9.extensionconfiginternal DROP CONSTRAINT extensionconfiginternal_pkey;
ALTER TABLE s9.extensionconfiginternal ADD CONSTRAINT extensionconfiginternal_pkey PRIMARY KEY (recid, programid, eventid, srlno, tenant_id);

-- Table: extensionconfigtable
-- Old PK: ['trntype', 'extlevel', 'structtype']
-- New PK: ['trntype', 'extlevel', 'structtype', 'tenant_id']
ALTER TABLE s9.extensionconfigtable DROP CONSTRAINT extensionconfigtable_pkey;
ALTER TABLE s9.extensionconfigtable ADD CONSTRAINT extensionconfigtable_pkey PRIMARY KEY (trntype, extlevel, structtype, tenant_id);

-- Table: extnpartnerinfo
-- Old PK: ['partnerid']
-- New PK: ['partnerid', 'tenant_id']
ALTER TABLE s9.extnpartnerinfo DROP CONSTRAINT extnpartnerinfo_pkey;
ALTER TABLE s9.extnpartnerinfo ADD CONSTRAINT extnpartnerinfo_pkey PRIMARY KEY (partnerid, tenant_id);

-- Table: factorheader
-- Old PK: ['trntype', 'name']
-- New PK: ['trntype', 'name', 'tenant_id']
ALTER TABLE s9.factorheader DROP CONSTRAINT factorheader_pkey;
ALTER TABLE s9.factorheader ADD CONSTRAINT factorheader_pkey PRIMARY KEY (trntype, name, tenant_id);

-- Table: featureintrodtls
-- Old PK: ['featureid']
-- New PK: ['featureid', 'tenant_id']
ALTER TABLE s9.featureintrodtls DROP CONSTRAINT featureintrodtls_pkey;
ALTER TABLE s9.featureintrodtls ADD CONSTRAINT featureintrodtls_pkey PRIMARY KEY (featureid, tenant_id);

-- Table: fileloadingstatus
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.fileloadingstatus DROP CONSTRAINT fileloadingstatus_pkey;
ALTER TABLE s9.fileloadingstatus ADD CONSTRAINT fileloadingstatus_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: filesfromho
-- Old PK: ['infofile', 'slno']
-- New PK: ['infofile', 'slno', 'tenant_id']
ALTER TABLE s9.filesfromho DROP CONSTRAINT filesfromho_pkey;
ALTER TABLE s9.filesfromho ADD CONSTRAINT filesfromho_pkey PRIMARY KEY (infofile, slno, tenant_id);

-- Table: franchiseelog
-- Old PK: ['idtype', 'shoperdt', 'srlno', 'trnstype', 'paymode']
-- New PK: ['idtype', 'shoperdt', 'srlno', 'trnstype', 'paymode', 'tenant_id']
ALTER TABLE s9.franchiseelog DROP CONSTRAINT franchiseelog_pkey;
ALTER TABLE s9.franchiseelog ADD CONSTRAINT franchiseelog_pkey PRIMARY KEY (idtype, shoperdt, srlno, trnstype, paymode, tenant_id);

-- Table: franchiseetrans
-- Old PK: ['trnacctype', 'trntype', 'trnctrlno']
-- New PK: ['trnacctype', 'trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.franchiseetrans DROP CONSTRAINT franchiseetrans_pkey;
ALTER TABLE s9.franchiseetrans ADD CONSTRAINT franchiseetrans_pkey PRIMARY KEY (trnacctype, trntype, trnctrlno, tenant_id);

-- Table: franchiselstloadeddtls
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.franchiselstloadeddtls DROP CONSTRAINT franchiselstloadeddtls_pkey;
ALTER TABLE s9.franchiselstloadeddtls ADD CONSTRAINT franchiselstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: franmismatchlog
-- Old PK: ['shoperdt', 'paymode']
-- New PK: ['shoperdt', 'paymode', 'tenant_id']
ALTER TABLE s9.franmismatchlog DROP CONSTRAINT franmismatchlog_pkey;
ALTER TABLE s9.franmismatchlog ADD CONSTRAINT franmismatchlog_pkey PRIMARY KEY (shoperdt, paymode, tenant_id);

-- Table: genlookup
-- Old PK: ['recid', 'code']
-- New PK: ['recid', 'code', 'tenant_id']
ALTER TABLE s9.genlookup DROP CONSTRAINT genlookup_pkey;
ALTER TABLE s9.genlookup ADD CONSTRAINT genlookup_pkey PRIMARY KEY (recid, code, tenant_id);

-- Table: genlookupextd
-- Old PK: ['recid', 'code']
-- New PK: ['recid', 'code', 'tenant_id']
ALTER TABLE s9.genlookupextd DROP CONSTRAINT genlookupextd_pkey;
ALTER TABLE s9.genlookupextd ADD CONSTRAINT genlookupextd_pkey PRIMARY KEY (recid, code, tenant_id);

-- Table: gs1dtls
-- Old PK: ['slno', 'gs1companyprefix', 'startingno', 'endingno', 'class1cd', 'class2cd']
-- New PK: ['slno', 'gs1companyprefix', 'startingno', 'endingno', 'class1cd', 'class2cd', 'tenant_id']
ALTER TABLE s9.gs1dtls DROP CONSTRAINT gs1dtls_pkey;
ALTER TABLE s9.gs1dtls ADD CONSTRAINT gs1dtls_pkey PRIMARY KEY (slno, gs1companyprefix, startingno, endingno, class1cd, class2cd, tenant_id);

-- Table: hotkeys
-- Old PK: ['formid', 'funcid']
-- New PK: ['formid', 'funcid', 'tenant_id']
ALTER TABLE s9.hotkeys DROP CONSTRAINT hotkeys_pkey;
ALTER TABLE s9.hotkeys ADD CONSTRAINT hotkeys_pkey PRIMARY KEY (formid, funcid, tenant_id);

-- Table: incdeftable
-- Old PK: ['incname', 'personnelcd', 'ptypedesc']
-- New PK: ['incname', 'personnelcd', 'ptypedesc', 'tenant_id']
ALTER TABLE s9.incdeftable DROP CONSTRAINT incdeftable_pkey;
ALTER TABLE s9.incdeftable ADD CONSTRAINT incdeftable_pkey PRIMARY KEY (incname, personnelcd, ptypedesc, tenant_id);

-- Table: incentivegrpitemdtls
-- Old PK: ['incname', 'srlno']
-- New PK: ['incname', 'srlno', 'tenant_id']
ALTER TABLE s9.incentivegrpitemdtls DROP CONSTRAINT incentivegrpitemdtls_pkey;
ALTER TABLE s9.incentivegrpitemdtls ADD CONSTRAINT incentivegrpitemdtls_pkey PRIMARY KEY (incname, srlno, tenant_id);

-- Table: incshrmperioddtls
-- Old PK: ['incname', 'shrmprofcd', 'pcode', 'srlno']
-- New PK: ['incname', 'shrmprofcd', 'pcode', 'srlno', 'tenant_id']
ALTER TABLE s9.incshrmperioddtls DROP CONSTRAINT incshrmperioddtls_pkey;
ALTER TABLE s9.incshrmperioddtls ADD CONSTRAINT incshrmperioddtls_pkey PRIMARY KEY (incname, shrmprofcd, pcode, srlno, tenant_id);

-- Table: infotable
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.infotable DROP CONSTRAINT infotable_pkey;
ALTER TABLE s9.infotable ADD CONSTRAINT infotable_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: iniloadingerrorlog
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.iniloadingerrorlog DROP CONSTRAINT iniloadingerrorlog_pkey;
ALTER TABLE s9.iniloadingerrorlog ADD CONSTRAINT iniloadingerrorlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: inpacksliphdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.inpacksliphdr DROP CONSTRAINT inpacksliphdr_pkey;
ALTER TABLE s9.inpacksliphdr ADD CONSTRAINT inpacksliphdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: inpacksliptrn
-- Old PK: ['trntype', 'trnctrlno', 'slipcrtnno', 'slipentsrlno']
-- New PK: ['trntype', 'trnctrlno', 'slipcrtnno', 'slipentsrlno', 'tenant_id']
ALTER TABLE s9.inpacksliptrn DROP CONSTRAINT inpacksliptrn_pkey;
ALTER TABLE s9.inpacksliptrn ADD CONSTRAINT inpacksliptrn_pkey PRIMARY KEY (trntype, trnctrlno, slipcrtnno, slipentsrlno, tenant_id);

-- Table: itemclassrestrict
-- Old PK: ['userid', 'columnname', 'value']
-- New PK: ['userid', 'columnname', 'value', 'tenant_id']
ALTER TABLE s9.itemclassrestrict DROP CONSTRAINT itemclassrestrict_pkey;
ALTER TABLE s9.itemclassrestrict ADD CONSTRAINT itemclassrestrict_pkey PRIMARY KEY (userid, columnname, value, tenant_id);

-- Table: itemmapping
-- Old PK: ['maptype', 'hocode', 'posattrib1', 'posattrib2', 'hoattrib1', 'hoattrib2', 'hoattrib']
-- New PK: ['maptype', 'hocode', 'posattrib1', 'posattrib2', 'hoattrib1', 'hoattrib2', 'hoattrib', 'tenant_id']
ALTER TABLE s9.itemmapping DROP CONSTRAINT itemmapping_pkey;
ALTER TABLE s9.itemmapping ADD CONSTRAINT itemmapping_pkey PRIMARY KEY (maptype, hocode, posattrib1, posattrib2, hoattrib1, hoattrib2, hoattrib, tenant_id);

-- Table: itemmappingrules
-- Old PK: ['hocode', 'hoattrib', 'posattrib', 'condition', 'receivedcode', 'newcode']
-- New PK: ['hocode', 'hoattrib', 'posattrib', 'condition', 'receivedcode', 'newcode', 'tenant_id']
ALTER TABLE s9.itemmappingrules DROP CONSTRAINT itemmappingrules_pkey;
ALTER TABLE s9.itemmappingrules ADD CONSTRAINT itemmappingrules_pkey PRIMARY KEY (hocode, hoattrib, posattrib, condition, receivedcode, newcode, tenant_id);

-- Table: itemmaster
-- Old PK: ['stockno', 'batchsrlno']
-- New PK: ['stockno', 'batchsrlno', 'tenant_id']
ALTER TABLE s9.itemmaster DROP CONSTRAINT itemmaster_pkey;
ALTER TABLE s9.itemmaster ADD CONSTRAINT itemmaster_pkey PRIMARY KEY (stockno, batchsrlno, tenant_id);

-- Table: itemmasterconfig
-- Old PK: ['fid']
-- New PK: ['fid', 'tenant_id']
ALTER TABLE s9.itemmasterconfig DROP CONSTRAINT itemmasterconfig_pkey;
ALTER TABLE s9.itemmasterconfig ADD CONSTRAINT itemmasterconfig_pkey PRIMARY KEY (fid, tenant_id);

-- Table: itemmasterextd01
-- Old PK: ['stockno', 'batchno', 'gradecd']
-- New PK: ['stockno', 'batchno', 'gradecd', 'tenant_id']
ALTER TABLE s9.itemmasterextd01 DROP CONSTRAINT itemmasterextd01_pkey;
ALTER TABLE s9.itemmasterextd01 ADD CONSTRAINT itemmasterextd01_pkey PRIMARY KEY (stockno, batchno, gradecd, tenant_id);

-- Table: itemmasterlog
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.itemmasterlog DROP CONSTRAINT itemmasterlog_pkey;
ALTER TABLE s9.itemmasterlog ADD CONSTRAINT itemmasterlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: itemreclassconfig
-- Old PK: ['fldid']
-- New PK: ['fldid', 'tenant_id']
ALTER TABLE s9.itemreclassconfig DROP CONSTRAINT itemreclassconfig_pkey;
ALTER TABLE s9.itemreclassconfig ADD CONSTRAINT itemreclassconfig_pkey PRIMARY KEY (fldid, tenant_id);

-- Table: itemreclassdtls
-- Old PK: ['ircid', 'srlno', 'frindicator', 'frindsrlno']
-- New PK: ['ircid', 'srlno', 'frindicator', 'frindsrlno', 'tenant_id']
ALTER TABLE s9.itemreclassdtls DROP CONSTRAINT itemreclassdtls_pkey;
ALTER TABLE s9.itemreclassdtls ADD CONSTRAINT itemreclassdtls_pkey PRIMARY KEY (ircid, srlno, frindicator, frindsrlno, tenant_id);

-- Table: itemreclassheader
-- Old PK: ['ircid']
-- New PK: ['ircid', 'tenant_id']
ALTER TABLE s9.itemreclassheader DROP CONSTRAINT itemreclassheader_pkey;
ALTER TABLE s9.itemreclassheader ADD CONSTRAINT itemreclassheader_pkey PRIMARY KEY (ircid, tenant_id);

-- Table: itemsfromho
-- Old PK: ['stockno']
-- New PK: ['stockno', 'tenant_id']
ALTER TABLE s9.itemsfromho DROP CONSTRAINT itemsfromho_pkey;
ALTER TABLE s9.itemsfromho ADD CONSTRAINT itemsfromho_pkey PRIMARY KEY (stockno, tenant_id);

-- Table: itemtagconfig
-- Old PK: ['trntype', 'class1cd', 'class2cd', 'fieldsrlno']
-- New PK: ['trntype', 'class1cd', 'class2cd', 'fieldsrlno', 'tenant_id']
ALTER TABLE s9.itemtagconfig DROP CONSTRAINT itemtagconfig_pkey;
ALTER TABLE s9.itemtagconfig ADD CONSTRAINT itemtagconfig_pkey PRIMARY KEY (trntype, class1cd, class2cd, fieldsrlno, tenant_id);

-- Table: itemtagconfigfromho
-- Old PK: ['trntype', 'class1cd', 'class2cd', 'fieldsrlno']
-- New PK: ['trntype', 'class1cd', 'class2cd', 'fieldsrlno', 'tenant_id']
ALTER TABLE s9.itemtagconfigfromho DROP CONSTRAINT itemtagconfigfromho_pkey;
ALTER TABLE s9.itemtagconfigfromho ADD CONSTRAINT itemtagconfigfromho_pkey PRIMARY KEY (trntype, class1cd, class2cd, fieldsrlno, tenant_id);

-- Table: itemtagdtls
-- Old PK: ['class1cd', 'class2cd', 'itemtag1']
-- New PK: ['class1cd', 'class2cd', 'itemtag1', 'tenant_id']
ALTER TABLE s9.itemtagdtls DROP CONSTRAINT itemtagdtls_pkey;
ALTER TABLE s9.itemtagdtls ADD CONSTRAINT itemtagdtls_pkey PRIMARY KEY (class1cd, class2cd, itemtag1, tenant_id);

-- Table: kpidtls
-- Old PK: ['showroomcode', 'docdt']
-- New PK: ['showroomcode', 'docdt', 'tenant_id']
ALTER TABLE s9.kpidtls DROP CONSTRAINT kpidtls_pkey;
ALTER TABLE s9.kpidtls ADD CONSTRAINT kpidtls_pkey PRIMARY KEY (showroomcode, docdt, tenant_id);

-- Table: logagentactivity
-- Old PK: ['logsrlno']
-- New PK: ['logsrlno', 'tenant_id']
ALTER TABLE s9.logagentactivity DROP CONSTRAINT logagentactivity_pkey;
ALTER TABLE s9.logagentactivity ADD CONSTRAINT logagentactivity_pkey PRIMARY KEY (logsrlno, tenant_id);

-- Table: logdataextractdetail
-- Old PK: ['logsrlno']
-- New PK: ['logsrlno', 'tenant_id']
ALTER TABLE s9.logdataextractdetail DROP CONSTRAINT logdataextractdetail_pkey;
ALTER TABLE s9.logdataextractdetail ADD CONSTRAINT logdataextractdetail_pkey PRIMARY KEY (logsrlno, tenant_id);

-- Table: logdataextractsummary
-- Old PK: ['runnumber']
-- New PK: ['runnumber', 'tenant_id']
ALTER TABLE s9.logdataextractsummary DROP CONSTRAINT logdataextractsummary_pkey;
ALTER TABLE s9.logdataextractsummary ADD CONSTRAINT logdataextractsummary_pkey PRIMARY KEY (runnumber, tenant_id);

-- Table: logdatasync
-- Old PK: ['logsrlno']
-- New PK: ['logsrlno', 'tenant_id']
ALTER TABLE s9.logdatasync DROP CONSTRAINT logdatasync_pkey;
ALTER TABLE s9.logdatasync ADD CONSTRAINT logdatasync_pkey PRIMARY KEY (logsrlno, tenant_id);

-- Table: logdbtuningconfig
-- Old PK: ['srlno']
-- New PK: ['srlno', 'tenant_id']
ALTER TABLE s9.logdbtuningconfig DROP CONSTRAINT logdbtuningconfig_pkey;
ALTER TABLE s9.logdbtuningconfig ADD CONSTRAINT logdbtuningconfig_pkey PRIMARY KEY (srlno, tenant_id);

-- Table: logtilldtls
-- Old PK: ['tilltrndt', 'nodeid']
-- New PK: ['tilltrndt', 'nodeid', 'tenant_id']
ALTER TABLE s9.logtilldtls DROP CONSTRAINT logtilldtls_pkey;
ALTER TABLE s9.logtilldtls ADD CONSTRAINT logtilldtls_pkey PRIMARY KEY (tilltrndt, nodeid, tenant_id);

-- Table: logtrnsctrlno
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.logtrnsctrlno DROP CONSTRAINT logtrnsctrlno_pkey;
ALTER TABLE s9.logtrnsctrlno ADD CONSTRAINT logtrnsctrlno_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: logwgsync
-- Old PK: ['syncfilename', 'shoperdt', 'syncdt']
-- New PK: ['syncfilename', 'shoperdt', 'syncdt', 'tenant_id']
ALTER TABLE s9.logwgsync DROP CONSTRAINT logwgsync_pkey;
ALTER TABLE s9.logwgsync ADD CONSTRAINT logwgsync_pkey PRIMARY KEY (syncfilename, shoperdt, syncdt, tenant_id);

-- Table: lstloadeddtls
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.lstloadeddtls DROP CONSTRAINT lstloadeddtls_pkey;
ALTER TABLE s9.lstloadeddtls ADD CONSTRAINT lstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: mailinglist
-- Old PK: ['recno']
-- New PK: ['recno', 'tenant_id']
ALTER TABLE s9.mailinglist DROP CONSTRAINT mailinglist_pkey;
ALTER TABLE s9.mailinglist ADD CONSTRAINT mailinglist_pkey PRIMARY KEY (recno, tenant_id);

-- Table: messagecentre
-- Old PK: ['msgid', 'msgsource']
-- New PK: ['msgid', 'msgsource', 'tenant_id']
ALTER TABLE s9.messagecentre DROP CONSTRAINT messagecentre_pkey;
ALTER TABLE s9.messagecentre ADD CONSTRAINT messagecentre_pkey PRIMARY KEY (msgid, msgsource, tenant_id);

-- Table: messagecentrelog
-- Old PK: ['msgid', 'msgsource', 'srlno']
-- New PK: ['msgid', 'msgsource', 'srlno', 'tenant_id']
ALTER TABLE s9.messagecentrelog DROP CONSTRAINT messagecentrelog_pkey;
ALTER TABLE s9.messagecentrelog ADD CONSTRAINT messagecentrelog_pkey PRIMARY KEY (msgid, msgsource, srlno, tenant_id);

-- Table: mismatchvalue
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.mismatchvalue DROP CONSTRAINT mismatchvalue_pkey;
ALTER TABLE s9.mismatchvalue ADD CONSTRAINT mismatchvalue_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: missingdocno
-- Old PK: ['trntype', 'docnoprefix', 'docno', 'docdt', 'tabletype']
-- New PK: ['trntype', 'docnoprefix', 'docno', 'docdt', 'tabletype', 'tenant_id']
ALTER TABLE s9.missingdocno DROP CONSTRAINT missingdocno_pkey;
ALTER TABLE s9.missingdocno ADD CONSTRAINT missingdocno_pkey PRIMARY KEY (trntype, docnoprefix, docno, docdt, tabletype, tenant_id);

-- Table: monthsummary
-- Old PK: ['stockno', 'batchno', 'gradecd', 'locationcd', 'yr', 'monthno']
-- New PK: ['stockno', 'batchno', 'gradecd', 'locationcd', 'yr', 'monthno', 'tenant_id']
ALTER TABLE s9.monthsummary DROP CONSTRAINT monthsummary_pkey;
ALTER TABLE s9.monthsummary ADD CONSTRAINT monthsummary_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, yr, monthno, tenant_id);

-- Table: multipleprices
-- Old PK: ['sourcecompcode', 'docno', 'destcompcode', 'stockno', 'slabno']
-- New PK: ['sourcecompcode', 'docno', 'destcompcode', 'stockno', 'slabno', 'tenant_id']
ALTER TABLE s9.multipleprices DROP CONSTRAINT multipleprices_pkey;
ALTER TABLE s9.multipleprices ADD CONSTRAINT multipleprices_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, stockno, slabno, tenant_id);

-- Table: onacccrdtntlinktbldtls
-- Old PK: ['trntype', 'trnctrlno', 'srlno', 'subsrlno']
-- New PK: ['trntype', 'trnctrlno', 'srlno', 'subsrlno', 'tenant_id']
ALTER TABLE s9.onacccrdtntlinktbldtls DROP CONSTRAINT onacccrdtntlinktbldtls_pkey;
ALTER TABLE s9.onacccrdtntlinktbldtls ADD CONSTRAINT onacccrdtntlinktbldtls_pkey PRIMARY KEY (trntype, trnctrlno, srlno, subsrlno, tenant_id);

-- Table: onacccrdtntlinktblhdr
-- Old PK: ['trntype', 'trnctrlno', 'srlno']
-- New PK: ['trntype', 'trnctrlno', 'srlno', 'tenant_id']
ALTER TABLE s9.onacccrdtntlinktblhdr DROP CONSTRAINT onacccrdtntlinktblhdr_pkey;
ALTER TABLE s9.onacccrdtntlinktblhdr ADD CONSTRAINT onacccrdtntlinktblhdr_pkey PRIMARY KEY (trntype, trnctrlno, srlno, tenant_id);

-- Table: paymodeacceptconfig
-- Old PK: ['trntype', 'acptpaymode']
-- New PK: ['trntype', 'acptpaymode', 'tenant_id']
ALTER TABLE s9.paymodeacceptconfig DROP CONSTRAINT paymodeacceptconfig_pkey;
ALTER TABLE s9.paymodeacceptconfig ADD CONSTRAINT paymodeacceptconfig_pkey PRIMARY KEY (trntype, acptpaymode, tenant_id);

-- Table: paymodeacceptdisplaydtls
-- Old PK: ['paymode', 'index', 'paycode']
-- New PK: ['paymode', 'index', 'paycode', 'tenant_id']
ALTER TABLE s9.paymodeacceptdisplaydtls DROP CONSTRAINT paymodeacceptdisplaydtls_pkey;
ALTER TABLE s9.paymodeacceptdisplaydtls ADD CONSTRAINT paymodeacceptdisplaydtls_pkey PRIMARY KEY (paymode, index, paycode, tenant_id);

-- Table: paymodeacceptdisplaydtlsextd
-- Old PK: ['paymode', 'index', 'paycode']
-- New PK: ['paymode', 'index', 'paycode', 'tenant_id']
ALTER TABLE s9.paymodeacceptdisplaydtlsextd DROP CONSTRAINT paymodeacceptdisplaydtlsextd_pkey;
ALTER TABLE s9.paymodeacceptdisplaydtlsextd ADD CONSTRAINT paymodeacceptdisplaydtlsextd_pkey PRIMARY KEY (paymode, index, paycode, tenant_id);

-- Table: paymodeconfig
-- Old PK: ['paymodetype']
-- New PK: ['paymodetype', 'tenant_id']
ALTER TABLE s9.paymodeconfig DROP CONSTRAINT paymodeconfig_pkey;
ALTER TABLE s9.paymodeconfig ADD CONSTRAINT paymodeconfig_pkey PRIMARY KEY (paymodetype, tenant_id);

-- Table: paytermscat
-- Old PK: ['recno']
-- New PK: ['recno', 'tenant_id']
ALTER TABLE s9.paytermscat DROP CONSTRAINT paytermscat_pkey;
ALTER TABLE s9.paytermscat ADD CONSTRAINT paytermscat_pkey PRIMARY KEY (recno, tenant_id);

-- Table: pcbilldtls
-- Old PK: ['posentrytype', 'posctrlno', 'posdocnoprefix', 'posdocno', 'srlno']
-- New PK: ['posentrytype', 'posctrlno', 'posdocnoprefix', 'posdocno', 'srlno', 'tenant_id']
ALTER TABLE s9.pcbilldtls DROP CONSTRAINT pcbilldtls_pkey;
ALTER TABLE s9.pcbilldtls ADD CONSTRAINT pcbilldtls_pkey PRIMARY KEY (posentrytype, posctrlno, posdocnoprefix, posdocno, srlno, tenant_id);

-- Table: pdtfieldconfig
-- Old PK: ['trntype', 'fieldid', 'fieldcaption']
-- New PK: ['trntype', 'fieldid', 'fieldcaption', 'tenant_id']
ALTER TABLE s9.pdtfieldconfig DROP CONSTRAINT pdtfieldconfig_pkey;
ALTER TABLE s9.pdtfieldconfig ADD CONSTRAINT pdtfieldconfig_pkey PRIMARY KEY (trntype, fieldid, fieldcaption, tenant_id);

-- Table: personnel
-- Old PK: ['code']
-- New PK: ['code', 'tenant_id']
ALTER TABLE s9.personnel DROP CONSTRAINT personnel_pkey;
ALTER TABLE s9.personnel ADD CONSTRAINT personnel_pkey PRIMARY KEY (code, tenant_id);

-- Table: personnelshrmwise
-- Old PK: ['smcode', 'shrmcode', 'srlno']
-- New PK: ['smcode', 'shrmcode', 'srlno', 'tenant_id']
ALTER TABLE s9.personnelshrmwise DROP CONSTRAINT personnelshrmwise_pkey;
ALTER TABLE s9.personnelshrmwise ADD CONSTRAINT personnelshrmwise_pkey PRIMARY KEY (smcode, shrmcode, srlno, tenant_id);

-- Table: pgmwisefeaturedtls
-- Old PK: ['featureid', 'programid', 'srlno']
-- New PK: ['featureid', 'programid', 'srlno', 'tenant_id']
ALTER TABLE s9.pgmwisefeaturedtls DROP CONSTRAINT pgmwisefeaturedtls_pkey;
ALTER TABLE s9.pgmwisefeaturedtls ADD CONSTRAINT pgmwisefeaturedtls_pkey PRIMARY KEY (featureid, programid, srlno, tenant_id);

-- Table: phystkdl
-- Old PK: ['stockno']
-- New PK: ['stockno', 'tenant_id']
ALTER TABLE s9.phystkdl DROP CONSTRAINT phystkdl_pkey;
ALTER TABLE s9.phystkdl ADD CONSTRAINT phystkdl_pkey PRIMARY KEY (stockno, tenant_id);

-- Table: phystkdtls
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.phystkdtls DROP CONSTRAINT phystkdtls_pkey;
ALTER TABLE s9.phystkdtls ADD CONSTRAINT phystkdtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: phystkdtlsextd01
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.phystkdtlsextd01 DROP CONSTRAINT phystkdtlsextd01_pkey;
ALTER TABLE s9.phystkdtlsextd01 ADD CONSTRAINT phystkdtlsextd01_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: phystkhdr
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.phystkhdr DROP CONSTRAINT phystkhdr_pkey;
ALTER TABLE s9.phystkhdr ADD CONSTRAINT phystkhdr_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: phystocktakingitembkup
-- Old PK: ['scopeid', 'stockno', 'batchsrlno']
-- New PK: ['scopeid', 'stockno', 'batchsrlno', 'tenant_id']
ALTER TABLE s9.phystocktakingitembkup DROP CONSTRAINT phystocktakingitembkup_pkey;
ALTER TABLE s9.phystocktakingitembkup ADD CONSTRAINT phystocktakingitembkup_pkey PRIMARY KEY (scopeid, stockno, batchsrlno, tenant_id);

-- Table: phystocktakingitembkup01
-- Old PK: ['scopeid', 'entsrlno']
-- New PK: ['scopeid', 'entsrlno', 'tenant_id']
ALTER TABLE s9.phystocktakingitembkup01 DROP CONSTRAINT phystocktakingitembkup01_pkey;
ALTER TABLE s9.phystocktakingitembkup01 ADD CONSTRAINT phystocktakingitembkup01_pkey PRIMARY KEY (scopeid, entsrlno, tenant_id);

-- Table: phystocktakingitembkup02
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.phystocktakingitembkup02 DROP CONSTRAINT phystocktakingitembkup02_pkey;
ALTER TABLE s9.phystocktakingitembkup02 ADD CONSTRAINT phystocktakingitembkup02_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: posactivitylogdtls
-- Old PK: ['ctrlnumber', 'srlno']
-- New PK: ['ctrlnumber', 'srlno', 'tenant_id']
ALTER TABLE s9.posactivitylogdtls DROP CONSTRAINT posactivitylogdtls_pkey;
ALTER TABLE s9.posactivitylogdtls ADD CONSTRAINT posactivitylogdtls_pkey PRIMARY KEY (ctrlnumber, srlno, tenant_id);

-- Table: posactivityloghdr
-- Old PK: ['ctrlnumber']
-- New PK: ['ctrlnumber', 'tenant_id']
ALTER TABLE s9.posactivityloghdr DROP CONSTRAINT posactivityloghdr_pkey;
ALTER TABLE s9.posactivityloghdr ADD CONSTRAINT posactivityloghdr_pkey PRIMARY KEY (ctrlnumber, tenant_id);

-- Table: poscashtrn
-- Old PK: ['entrytype', 'ctrlno', 'entsrlno']
-- New PK: ['entrytype', 'ctrlno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.poscashtrn DROP CONSTRAINT poscashtrn_pkey;
ALTER TABLE s9.poscashtrn ADD CONSTRAINT poscashtrn_pkey PRIMARY KEY (entrytype, ctrlno, entsrlno, tenant_id);

-- Table: poscashtrnextd01
-- Old PK: ['entrytype', 'ctrlno', 'entsrlno', 'entsubsrlno']
-- New PK: ['entrytype', 'ctrlno', 'entsrlno', 'entsubsrlno', 'tenant_id']
ALTER TABLE s9.poscashtrnextd01 DROP CONSTRAINT poscashtrnextd01_pkey;
ALTER TABLE s9.poscashtrnextd01 ADD CONSTRAINT poscashtrnextd01_pkey PRIMARY KEY (entrytype, ctrlno, entsrlno, entsubsrlno, tenant_id);

-- Table: poslstloadeddtls
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.poslstloadeddtls DROP CONSTRAINT poslstloadeddtls_pkey;
ALTER TABLE s9.poslstloadeddtls ADD CONSTRAINT poslstloadeddtls_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: posmodebalances
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.posmodebalances DROP CONSTRAINT posmodebalances_pkey;
ALTER TABLE s9.posmodebalances ADD CONSTRAINT posmodebalances_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: posmodedatadtls
-- Old PK: ['fld1', 'fld6']
-- New PK: ['fld1', 'fld6', 'tenant_id']
ALTER TABLE s9.posmodedatadtls DROP CONSTRAINT posmodedatadtls_pkey;
ALTER TABLE s9.posmodedatadtls ADD CONSTRAINT posmodedatadtls_pkey PRIMARY KEY (fld1, fld6, tenant_id);

-- Table: pospaymodes
-- Old PK: ['paymodetype', 'paymodecode']
-- New PK: ['paymodetype', 'paymodecode', 'tenant_id']
ALTER TABLE s9.pospaymodes DROP CONSTRAINT pospaymodes_pkey;
ALTER TABLE s9.pospaymodes ADD CONSTRAINT pospaymodes_pkey PRIMARY KEY (paymodetype, paymodecode, tenant_id);

-- Table: prefixconfig
-- Old PK: ['slno']
-- New PK: ['slno', 'tenant_id']
ALTER TABLE s9.prefixconfig DROP CONSTRAINT prefixconfig_pkey;
ALTER TABLE s9.prefixconfig ADD CONSTRAINT prefixconfig_pkey PRIMARY KEY (slno, tenant_id);

-- Table: prefixdoclog
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.prefixdoclog DROP CONSTRAINT prefixdoclog_pkey;
ALTER TABLE s9.prefixdoclog ADD CONSTRAINT prefixdoclog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: prefixmaster
-- Old PK: ['trntype', 'opid', 'terminalgroupid', 'srlno']
-- New PK: ['trntype', 'opid', 'terminalgroupid', 'srlno', 'tenant_id']
ALTER TABLE s9.prefixmaster DROP CONSTRAINT prefixmaster_pkey;
ALTER TABLE s9.prefixmaster ADD CONSTRAINT prefixmaster_pkey PRIMARY KEY (trntype, opid, terminalgroupid, srlno, tenant_id);

-- Table: prefixterminalgroups
-- Old PK: ['terminalgroupid', 'srlno']
-- New PK: ['terminalgroupid', 'srlno', 'tenant_id']
ALTER TABLE s9.prefixterminalgroups DROP CONSTRAINT prefixterminalgroups_pkey;
ALTER TABLE s9.prefixterminalgroups ADD CONSTRAINT prefixterminalgroups_pkey PRIMARY KEY (terminalgroupid, srlno, tenant_id);

-- Table: prefixtrnlog
-- Old PK: ['fld1', 'fld2', 'fld4']
-- New PK: ['fld1', 'fld2', 'fld4', 'tenant_id']
ALTER TABLE s9.prefixtrnlog DROP CONSTRAINT prefixtrnlog_pkey;
ALTER TABLE s9.prefixtrnlog ADD CONSTRAINT prefixtrnlog_pkey PRIMARY KEY (fld1, fld2, fld4, tenant_id);

-- Table: prefixtrnno
-- Old PK: ['trntype', 'actualprefix']
-- New PK: ['trntype', 'actualprefix', 'tenant_id']
ALTER TABLE s9.prefixtrnno DROP CONSTRAINT prefixtrnno_pkey;
ALTER TABLE s9.prefixtrnno ADD CONSTRAINT prefixtrnno_pkey PRIMARY KEY (trntype, actualprefix, tenant_id);

-- Table: priceloadinglog
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.priceloadinglog DROP CONSTRAINT priceloadinglog_pkey;
ALTER TABLE s9.priceloadinglog ADD CONSTRAINT priceloadinglog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: pricerange
-- Old PK: ['pricetype', 'docnoprefix', 'docno', 'srlno']
-- New PK: ['pricetype', 'docnoprefix', 'docno', 'srlno', 'tenant_id']
ALTER TABLE s9.pricerange DROP CONSTRAINT pricerange_pkey;
ALTER TABLE s9.pricerange ADD CONSTRAINT pricerange_pkey PRIMARY KEY (pricetype, docnoprefix, docno, srlno, tenant_id);

-- Table: pricerangecatdtls
-- Old PK: ['prcatid', 'srlno']
-- New PK: ['prcatid', 'srlno', 'tenant_id']
ALTER TABLE s9.pricerangecatdtls DROP CONSTRAINT pricerangecatdtls_pkey;
ALTER TABLE s9.pricerangecatdtls ADD CONSTRAINT pricerangecatdtls_pkey PRIMARY KEY (prcatid, srlno, tenant_id);

-- Table: pricerangesettings
-- Old PK: ['fldtype', 'fldid']
-- New PK: ['fldtype', 'fldid', 'tenant_id']
ALTER TABLE s9.pricerangesettings DROP CONSTRAINT pricerangesettings_pkey;
ALTER TABLE s9.pricerangesettings ADD CONSTRAINT pricerangesettings_pkey PRIMARY KEY (fldtype, fldid, tenant_id);

-- Table: pricerevision
-- Old PK: ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber']
-- New PK: ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber', 'tenant_id']
ALTER TABLE s9.pricerevision DROP CONSTRAINT pricerevision_pkey;
ALTER TABLE s9.pricerevision ADD CONSTRAINT pricerevision_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, filenumber, serialnumber, tenant_id);

-- Table: pricerevisionhistory
-- Old PK: ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber']
-- New PK: ['sourcecompcode', 'docno', 'destcompcode', 'filenumber', 'serialnumber', 'tenant_id']
ALTER TABLE s9.pricerevisionhistory DROP CONSTRAINT pricerevisionhistory_pkey;
ALTER TABLE s9.pricerevisionhistory ADD CONSTRAINT pricerevisionhistory_pkey PRIMARY KEY (sourcecompcode, docno, destcompcode, filenumber, serialnumber, tenant_id);

-- Table: printbusinesshandlermaster
-- Old PK: ['bushandlerid']
-- New PK: ['bushandlerid', 'tenant_id']
ALTER TABLE s9.printbusinesshandlermaster DROP CONSTRAINT printbusinesshandlermaster_pkey;
ALTER TABLE s9.printbusinesshandlermaster ADD CONSTRAINT printbusinesshandlermaster_pkey PRIMARY KEY (bushandlerid, tenant_id);

-- Table: printconfigsetting
-- Old PK: ['configsettingid', 'configparamid']
-- New PK: ['configsettingid', 'configparamid', 'tenant_id']
ALTER TABLE s9.printconfigsetting DROP CONSTRAINT printconfigsetting_pkey;
ALTER TABLE s9.printconfigsetting ADD CONSTRAINT printconfigsetting_pkey PRIMARY KEY (configsettingid, configparamid, tenant_id);

-- Table: printconfigsettingmaster
-- Old PK: ['configsettingid']
-- New PK: ['configsettingid', 'tenant_id']
ALTER TABLE s9.printconfigsettingmaster DROP CONSTRAINT printconfigsettingmaster_pkey;
ALTER TABLE s9.printconfigsettingmaster ADD CONSTRAINT printconfigsettingmaster_pkey PRIMARY KEY (configsettingid, tenant_id);

-- Table: printlinkedrefinterface
-- Old PK: ['linkedrefid', 'bushandlerid', 'renhandlerid', 'configsettingid']
-- New PK: ['linkedrefid', 'bushandlerid', 'renhandlerid', 'configsettingid', 'tenant_id']
ALTER TABLE s9.printlinkedrefinterface DROP CONSTRAINT printlinkedrefinterface_pkey;
ALTER TABLE s9.printlinkedrefinterface ADD CONSTRAINT printlinkedrefinterface_pkey PRIMARY KEY (linkedrefid, bushandlerid, renhandlerid, configsettingid, tenant_id);

-- Table: printlinkedreflookup
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.printlinkedreflookup DROP CONSTRAINT printlinkedreflookup_pkey;
ALTER TABLE s9.printlinkedreflookup ADD CONSTRAINT printlinkedreflookup_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: printnodetrnconfigmaster
-- Old PK: ['nodeid', 'trntypeidentifier', 'linkedrefid']
-- New PK: ['nodeid', 'trntypeidentifier', 'linkedrefid', 'tenant_id']
ALTER TABLE s9.printnodetrnconfigmaster DROP CONSTRAINT printnodetrnconfigmaster_pkey;
ALTER TABLE s9.printnodetrnconfigmaster ADD CONSTRAINT printnodetrnconfigmaster_pkey PRIMARY KEY (nodeid, trntypeidentifier, linkedrefid, tenant_id);

-- Table: printrenderermaster
-- Old PK: ['renhandlerid']
-- New PK: ['renhandlerid', 'tenant_id']
ALTER TABLE s9.printrenderermaster DROP CONSTRAINT printrenderermaster_pkey;
ALTER TABLE s9.printrenderermaster ADD CONSTRAINT printrenderermaster_pkey PRIMARY KEY (renhandlerid, tenant_id);

-- Table: printtemplateconfigdtls
-- Old PK: ['linkrefid', 'terminalid', 'trntype', 'templatename']
-- New PK: ['linkrefid', 'terminalid', 'trntype', 'templatename', 'tenant_id']
ALTER TABLE s9.printtemplateconfigdtls DROP CONSTRAINT printtemplateconfigdtls_pkey;
ALTER TABLE s9.printtemplateconfigdtls ADD CONSTRAINT printtemplateconfigdtls_pkey PRIMARY KEY (linkrefid, terminalid, trntype, templatename, tenant_id);

-- Table: promoarapplcustdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoarapplcustdtls DROP CONSTRAINT promoarapplcustdtls_pkey;
ALTER TABLE s9.promoarapplcustdtls ADD CONSTRAINT promoarapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promoarbilllvldiscdtls
-- Old PK: ['salespromocode', 'salespromosrlno', 'srlno']
-- New PK: ['salespromocode', 'salespromosrlno', 'srlno', 'tenant_id']
ALTER TABLE s9.promoarbilllvldiscdtls DROP CONSTRAINT promoarbilllvldiscdtls_pkey;
ALTER TABLE s9.promoarbilllvldiscdtls ADD CONSTRAINT promoarbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, salespromosrlno, srlno, tenant_id);

-- Table: promoarbuyitemgrpdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoarbuyitemgrpdtls DROP CONSTRAINT promoarbuyitemgrpdtls_pkey;
ALTER TABLE s9.promoarbuyitemgrpdtls ADD CONSTRAINT promoarbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promoargetitemgrpdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoargetitemgrpdtls DROP CONSTRAINT promoargetitemgrpdtls_pkey;
ALTER TABLE s9.promoargetitemgrpdtls ADD CONSTRAINT promoargetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promoarheader
-- Old PK: ['salespromocode', 'salespromosrlno']
-- New PK: ['salespromocode', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoarheader DROP CONSTRAINT promoarheader_pkey;
ALTER TABLE s9.promoarheader ADD CONSTRAINT promoarheader_pkey PRIMARY KEY (salespromocode, salespromosrlno, tenant_id);

-- Table: promoaritemlvldiscdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoaritemlvldiscdtls DROP CONSTRAINT promoaritemlvldiscdtls_pkey;
ALTER TABLE s9.promoaritemlvldiscdtls ADD CONSTRAINT promoaritemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promoarshowroomdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promoarshowroomdtls DROP CONSTRAINT promoarshowroomdtls_pkey;
ALTER TABLE s9.promoarshowroomdtls ADD CONSTRAINT promoarshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologapplcustdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologapplcustdtls DROP CONSTRAINT promologapplcustdtls_pkey;
ALTER TABLE s9.promologapplcustdtls ADD CONSTRAINT promologapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologbilllvldiscdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologbilllvldiscdtls DROP CONSTRAINT promologbilllvldiscdtls_pkey;
ALTER TABLE s9.promologbilllvldiscdtls ADD CONSTRAINT promologbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologbuyitemgrpdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologbuyitemgrpdtls DROP CONSTRAINT promologbuyitemgrpdtls_pkey;
ALTER TABLE s9.promologbuyitemgrpdtls ADD CONSTRAINT promologbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologgetitemgrpdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologgetitemgrpdtls DROP CONSTRAINT promologgetitemgrpdtls_pkey;
ALTER TABLE s9.promologgetitemgrpdtls ADD CONSTRAINT promologgetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologheader
-- Old PK: ['salespromocode', 'salespromosrlno']
-- New PK: ['salespromocode', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologheader DROP CONSTRAINT promologheader_pkey;
ALTER TABLE s9.promologheader ADD CONSTRAINT promologheader_pkey PRIMARY KEY (salespromocode, salespromosrlno, tenant_id);

-- Table: promologitemlvldiscdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologitemlvldiscdtls DROP CONSTRAINT promologitemlvldiscdtls_pkey;
ALTER TABLE s9.promologitemlvldiscdtls ADD CONSTRAINT promologitemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promologshowroomdtls
-- Old PK: ['salespromocode', 'srlno', 'salespromosrlno']
-- New PK: ['salespromocode', 'srlno', 'salespromosrlno', 'tenant_id']
ALTER TABLE s9.promologshowroomdtls DROP CONSTRAINT promologshowroomdtls_pkey;
ALTER TABLE s9.promologshowroomdtls ADD CONSTRAINT promologshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, salespromosrlno, tenant_id);

-- Table: promomnapplcustdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomnapplcustdtls DROP CONSTRAINT promomnapplcustdtls_pkey;
ALTER TABLE s9.promomnapplcustdtls ADD CONSTRAINT promomnapplcustdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: promomnbilllvldiscdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomnbilllvldiscdtls DROP CONSTRAINT promomnbilllvldiscdtls_pkey;
ALTER TABLE s9.promomnbilllvldiscdtls ADD CONSTRAINT promomnbilllvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: promomnbuyitemgrpdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomnbuyitemgrpdtls DROP CONSTRAINT promomnbuyitemgrpdtls_pkey;
ALTER TABLE s9.promomnbuyitemgrpdtls ADD CONSTRAINT promomnbuyitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: promomngetitemgrpdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomngetitemgrpdtls DROP CONSTRAINT promomngetitemgrpdtls_pkey;
ALTER TABLE s9.promomngetitemgrpdtls ADD CONSTRAINT promomngetitemgrpdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: promomnheader
-- Old PK: ['salespromocode']
-- New PK: ['salespromocode', 'tenant_id']
ALTER TABLE s9.promomnheader DROP CONSTRAINT promomnheader_pkey;
ALTER TABLE s9.promomnheader ADD CONSTRAINT promomnheader_pkey PRIMARY KEY (salespromocode, tenant_id);

-- Table: promomnintermediate
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.promomnintermediate DROP CONSTRAINT promomnintermediate_pkey;
ALTER TABLE s9.promomnintermediate ADD CONSTRAINT promomnintermediate_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: promomnitemlvldiscdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomnitemlvldiscdtls DROP CONSTRAINT promomnitemlvldiscdtls_pkey;
ALTER TABLE s9.promomnitemlvldiscdtls ADD CONSTRAINT promomnitemlvldiscdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: promomnshowroomdtls
-- Old PK: ['salespromocode', 'srlno']
-- New PK: ['salespromocode', 'srlno', 'tenant_id']
ALTER TABLE s9.promomnshowroomdtls DROP CONSTRAINT promomnshowroomdtls_pkey;
ALTER TABLE s9.promomnshowroomdtls ADD CONSTRAINT promomnshowroomdtls_pkey PRIMARY KEY (salespromocode, srlno, tenant_id);

-- Table: ptbrowsesuper
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.ptbrowsesuper DROP CONSTRAINT ptbrowsesuper_pkey;
ALTER TABLE s9.ptbrowsesuper ADD CONSTRAINT ptbrowsesuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: ptdtlsuper
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.ptdtlsuper DROP CONSTRAINT ptdtlsuper_pkey;
ALTER TABLE s9.ptdtlsuper ADD CONSTRAINT ptdtlsuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: pthdrsuper
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.pthdrsuper DROP CONSTRAINT pthdrsuper_pkey;
ALTER TABLE s9.pthdrsuper ADD CONSTRAINT pthdrsuper_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: ptinvoicedtl
-- Old PK: ['suppcode', 'billdate', 'billno', 'srlno', 'trntype']
-- New PK: ['suppcode', 'billdate', 'billno', 'srlno', 'trntype', 'tenant_id']
ALTER TABLE s9.ptinvoicedtl DROP CONSTRAINT ptinvoicedtl_pkey;
ALTER TABLE s9.ptinvoicedtl ADD CONSTRAINT ptinvoicedtl_pkey PRIMARY KEY (suppcode, billdate, billno, srlno, trntype, tenant_id);

-- Table: ptinvoiceextd01
-- Old PK: ['trntype', 'suppcode', 'showroomcode', 'billdate', 'billno', 'srlno', 'subsrlno']
-- New PK: ['trntype', 'suppcode', 'showroomcode', 'billdate', 'billno', 'srlno', 'subsrlno', 'tenant_id']
ALTER TABLE s9.ptinvoiceextd01 DROP CONSTRAINT ptinvoiceextd01_pkey;
ALTER TABLE s9.ptinvoiceextd01 ADD CONSTRAINT ptinvoiceextd01_pkey PRIMARY KEY (trntype, suppcode, showroomcode, billdate, billno, srlno, subsrlno, tenant_id);

-- Table: ptinvoicehdr
-- Old PK: ['suppcode', 'billno', 'billdate', 'trntype']
-- New PK: ['suppcode', 'billno', 'billdate', 'trntype', 'tenant_id']
ALTER TABLE s9.ptinvoicehdr DROP CONSTRAINT ptinvoicehdr_pkey;
ALTER TABLE s9.ptinvoicehdr ADD CONSTRAINT ptinvoicehdr_pkey PRIMARY KEY (suppcode, billno, billdate, trntype, tenant_id);

-- Table: purchasetaxcat
-- Old PK: ['desttaxtype', 'prodtaxtype', 'srctaxtype']
-- New PK: ['desttaxtype', 'prodtaxtype', 'srctaxtype', 'tenant_id']
ALTER TABLE s9.purchasetaxcat DROP CONSTRAINT purchasetaxcat_pkey;
ALTER TABLE s9.purchasetaxcat ADD CONSTRAINT purchasetaxcat_pkey PRIMARY KEY (desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- Table: purchordconfig
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.purchordconfig DROP CONSTRAINT purchordconfig_pkey;
ALTER TABLE s9.purchordconfig ADD CONSTRAINT purchordconfig_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: purchorddtl
-- Old PK: ['potype', 'ponoprefix', 'poctrlno', 'deliverylocation', 'entrysrlno', 'entrysubsrlno']
-- New PK: ['potype', 'ponoprefix', 'poctrlno', 'deliverylocation', 'entrysrlno', 'entrysubsrlno', 'tenant_id']
ALTER TABLE s9.purchorddtl DROP CONSTRAINT purchorddtl_pkey;
ALTER TABLE s9.purchorddtl ADD CONSTRAINT purchorddtl_pkey PRIMARY KEY (potype, ponoprefix, poctrlno, deliverylocation, entrysrlno, entrysubsrlno, tenant_id);

-- Table: purchordhdr
-- Old PK: ['potype', 'ponoprefix', 'poctrlno']
-- New PK: ['potype', 'ponoprefix', 'poctrlno', 'tenant_id']
ALTER TABLE s9.purchordhdr DROP CONSTRAINT purchordhdr_pkey;
ALTER TABLE s9.purchordhdr ADD CONSTRAINT purchordhdr_pkey PRIMARY KEY (potype, ponoprefix, poctrlno, tenant_id);

-- Table: purchordtrl
-- Old PK: ['ponoprefix', 'poctrlno', 'entrysrlno']
-- New PK: ['ponoprefix', 'poctrlno', 'entrysrlno', 'tenant_id']
ALTER TABLE s9.purchordtrl DROP CONSTRAINT purchordtrl_pkey;
ALTER TABLE s9.purchordtrl ADD CONSTRAINT purchordtrl_pkey PRIMARY KEY (ponoprefix, poctrlno, entrysrlno, tenant_id);

-- Table: purchplan
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.purchplan DROP CONSTRAINT purchplan_pkey;
ALTER TABLE s9.purchplan ADD CONSTRAINT purchplan_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: purgelogdtls
-- Old PK: ['ctrlnumber', 'srlno']
-- New PK: ['ctrlnumber', 'srlno', 'tenant_id']
ALTER TABLE s9.purgelogdtls DROP CONSTRAINT purgelogdtls_pkey;
ALTER TABLE s9.purgelogdtls ADD CONSTRAINT purgelogdtls_pkey PRIMARY KEY (ctrlnumber, srlno, tenant_id);

-- Table: purgeloghdr
-- Old PK: ['ctrlnumber']
-- New PK: ['ctrlnumber', 'tenant_id']
ALTER TABLE s9.purgeloghdr DROP CONSTRAINT purgeloghdr_pkey;
ALTER TABLE s9.purgeloghdr ADD CONSTRAINT purgeloghdr_pkey PRIMARY KEY (ctrlnumber, tenant_id);

-- Table: reportconfigpreferences
-- Old PK: ['userid', 'taskid']
-- New PK: ['userid', 'taskid', 'tenant_id']
ALTER TABLE s9.reportconfigpreferences DROP CONSTRAINT reportconfigpreferences_pkey;
ALTER TABLE s9.reportconfigpreferences ADD CONSTRAINT reportconfigpreferences_pkey PRIMARY KEY (userid, taskid, tenant_id);

-- Table: reportconfigsettings
-- Old PK: ['configid', 'taskid']
-- New PK: ['configid', 'taskid', 'tenant_id']
ALTER TABLE s9.reportconfigsettings DROP CONSTRAINT reportconfigsettings_pkey;
ALTER TABLE s9.reportconfigsettings ADD CONSTRAINT reportconfigsettings_pkey PRIMARY KEY (configid, taskid, tenant_id);

-- Table: reportdates
-- Old PK: ['sno']
-- New PK: ['sno', 'tenant_id']
ALTER TABLE s9.reportdates DROP CONSTRAINT reportdates_pkey;
ALTER TABLE s9.reportdates ADD CONSTRAINT reportdates_pkey PRIMARY KEY (sno, tenant_id);

-- Table: repsizecat
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.repsizecat DROP CONSTRAINT repsizecat_pkey;
ALTER TABLE s9.repsizecat ADD CONSTRAINT repsizecat_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: rptselfilename
-- Old PK: ['exename', 'filename']
-- New PK: ['exename', 'filename', 'tenant_id']
ALTER TABLE s9.rptselfilename DROP CONSTRAINT rptselfilename_pkey;
ALTER TABLE s9.rptselfilename ADD CONSTRAINT rptselfilename_pkey PRIMARY KEY (exename, filename, tenant_id);

-- Table: salesfactors
-- Old PK: ['recno']
-- New PK: ['recno', 'tenant_id']
ALTER TABLE s9.salesfactors DROP CONSTRAINT salesfactors_pkey;
ALTER TABLE s9.salesfactors ADD CONSTRAINT salesfactors_pkey PRIMARY KEY (recno, tenant_id);

-- Table: salestaxcat
-- Old PK: ['desttaxtype', 'prodtaxtype', 'srctaxtype']
-- New PK: ['desttaxtype', 'prodtaxtype', 'srctaxtype', 'tenant_id']
ALTER TABLE s9.salestaxcat DROP CONSTRAINT salestaxcat_pkey;
ALTER TABLE s9.salestaxcat ADD CONSTRAINT salestaxcat_pkey PRIMARY KEY (desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- Table: salestaxrevision
-- Old PK: ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype']
-- New PK: ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype', 'tenant_id']
ALTER TABLE s9.salestaxrevision DROP CONSTRAINT salestaxrevision_pkey;
ALTER TABLE s9.salestaxrevision ADD CONSTRAINT salestaxrevision_pkey PRIMARY KEY (taxrevisionid, desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- Table: salestaxrevisionhistory
-- Old PK: ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype']
-- New PK: ['taxrevisionid', 'desttaxtype', 'prodtaxtype', 'srctaxtype', 'tenant_id']
ALTER TABLE s9.salestaxrevisionhistory DROP CONSTRAINT salestaxrevisionhistory_pkey;
ALTER TABLE s9.salestaxrevisionhistory ADD CONSTRAINT salestaxrevisionhistory_pkey PRIMARY KEY (taxrevisionid, desttaxtype, prodtaxtype, srctaxtype, tenant_id);

-- Table: saletrnhdr
-- Old PK: ['saletrntype', 'saletrnctrlno']
-- New PK: ['saletrntype', 'saletrnctrlno', 'tenant_id']
ALTER TABLE s9.saletrnhdr DROP CONSTRAINT saletrnhdr_pkey;
ALTER TABLE s9.saletrnhdr ADD CONSTRAINT saletrnhdr_pkey PRIMARY KEY (saletrntype, saletrnctrlno, tenant_id);

-- Table: schemesdefinitiondtls
-- Old PK: ['schemecode', 'srlno']
-- New PK: ['schemecode', 'srlno', 'tenant_id']
ALTER TABLE s9.schemesdefinitiondtls DROP CONSTRAINT schemesdefinitiondtls_pkey;
ALTER TABLE s9.schemesdefinitiondtls ADD CONSTRAINT schemesdefinitiondtls_pkey PRIMARY KEY (schemecode, srlno, tenant_id);

-- Table: schemesdefinitionhdr
-- Old PK: ['schemecode']
-- New PK: ['schemecode', 'tenant_id']
ALTER TABLE s9.schemesdefinitionhdr DROP CONSTRAINT schemesdefinitionhdr_pkey;
ALTER TABLE s9.schemesdefinitionhdr ADD CONSTRAINT schemesdefinitionhdr_pkey PRIMARY KEY (schemecode, tenant_id);

-- Table: schemespointsslabs
-- Old PK: ['schemecode', 'slabtype', 'srlno']
-- New PK: ['schemecode', 'slabtype', 'srlno', 'tenant_id']
ALTER TABLE s9.schemespointsslabs DROP CONSTRAINT schemespointsslabs_pkey;
ALTER TABLE s9.schemespointsslabs ADD CONSTRAINT schemespointsslabs_pkey PRIMARY KEY (schemecode, slabtype, srlno, tenant_id);

-- Table: seasonsmaster
-- Old PK: ['seasonsname']
-- New PK: ['seasonsname', 'tenant_id']
ALTER TABLE s9.seasonsmaster DROP CONSTRAINT seasonsmaster_pkey;
ALTER TABLE s9.seasonsmaster ADD CONSTRAINT seasonsmaster_pkey PRIMARY KEY (seasonsname, tenant_id);

-- Table: seasonsmasterlog
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.seasonsmasterlog DROP CONSTRAINT seasonsmasterlog_pkey;
ALTER TABLE s9.seasonsmasterlog ADD CONSTRAINT seasonsmasterlog_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: shoperscriptupdateinfo
-- Old PK: ['scriptid', 'runsrl']
-- New PK: ['scriptid', 'runsrl', 'tenant_id']
ALTER TABLE s9.shoperscriptupdateinfo DROP CONSTRAINT shoperscriptupdateinfo_pkey;
ALTER TABLE s9.shoperscriptupdateinfo ADD CONSTRAINT shoperscriptupdateinfo_pkey PRIMARY KEY (scriptid, runsrl, tenant_id);

-- Table: shrmscript
-- Old PK: ['scriptblockid', 'srlno']
-- New PK: ['scriptblockid', 'srlno', 'tenant_id']
ALTER TABLE s9.shrmscript DROP CONSTRAINT shrmscript_pkey;
ALTER TABLE s9.shrmscript ADD CONSTRAINT shrmscript_pkey PRIMARY KEY (scriptblockid, srlno, tenant_id);

-- Table: shrmscriptextd
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.shrmscriptextd DROP CONSTRAINT shrmscriptextd_pkey;
ALTER TABLE s9.shrmscriptextd ADD CONSTRAINT shrmscriptextd_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: sisstatus
-- Old PK: ['runno']
-- New PK: ['runno', 'tenant_id']
ALTER TABLE s9.sisstatus DROP CONSTRAINT sisstatus_pkey;
ALTER TABLE s9.sisstatus ADD CONSTRAINT sisstatus_pkey PRIMARY KEY (runno, tenant_id);

-- Table: sizecat
-- Old PK: ['class1cd', 'class2cd', 'sizecd']
-- New PK: ['class1cd', 'class2cd', 'sizecd', 'tenant_id']
ALTER TABLE s9.sizecat DROP CONSTRAINT sizecat_pkey;
ALTER TABLE s9.sizecat ADD CONSTRAINT sizecat_pkey PRIMARY KEY (class1cd, class2cd, sizecd, tenant_id);

-- Table: sizeentryfieldsconfig
-- Old PK: ['entrytype', 'trntype', 'fieldsrlno']
-- New PK: ['entrytype', 'trntype', 'fieldsrlno', 'tenant_id']
ALTER TABLE s9.sizeentryfieldsconfig DROP CONSTRAINT sizeentryfieldsconfig_pkey;
ALTER TABLE s9.sizeentryfieldsconfig ADD CONSTRAINT sizeentryfieldsconfig_pkey PRIMARY KEY (entrytype, trntype, fieldsrlno, tenant_id);

-- Table: smriti_barcode_templates
-- Old PK: ['id']
-- New PK: ['id', 'tenant_id']
ALTER TABLE s9.smriti_barcode_templates DROP CONSTRAINT smriti_barcode_templates_pkey;
ALTER TABLE s9.smriti_barcode_templates ADD CONSTRAINT smriti_barcode_templates_pkey PRIMARY KEY (id, tenant_id);

-- Table: spdefsettings
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.spdefsettings DROP CONSTRAINT spdefsettings_pkey;
ALTER TABLE s9.spdefsettings ADD CONSTRAINT spdefsettings_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: stktrnaddldtls
-- Old PK: ['trntype', 'trndocnoprefix', 'trndocno', 'entsrlno']
-- New PK: ['trntype', 'trndocnoprefix', 'trndocno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.stktrnaddldtls DROP CONSTRAINT stktrnaddldtls_pkey;
ALTER TABLE s9.stktrnaddldtls ADD CONSTRAINT stktrnaddldtls_pkey PRIMARY KEY (trntype, trndocnoprefix, trndocno, entsrlno, tenant_id);

-- Table: stktrnaddlhdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.stktrnaddlhdr DROP CONSTRAINT stktrnaddlhdr_pkey;
ALTER TABLE s9.stktrnaddlhdr ADD CONSTRAINT stktrnaddlhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: stktrndtls
-- Old PK: ['trntype', 'trnctrlno', 'docnoprefix', 'docno', 'entsrlno']
-- New PK: ['trntype', 'trnctrlno', 'docnoprefix', 'docno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.stktrndtls DROP CONSTRAINT stktrndtls_pkey;
ALTER TABLE s9.stktrndtls ADD CONSTRAINT stktrndtls_pkey PRIMARY KEY (trntype, trnctrlno, docnoprefix, docno, entsrlno, tenant_id);

-- Table: stktrndtlsextd01
-- Old PK: ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno']
-- New PK: ['trntype', 'trnctrlno', 'entsrlno', 'itemtagsrlno', 'tenant_id']
ALTER TABLE s9.stktrndtlsextd01 DROP CONSTRAINT stktrndtlsextd01_pkey;
ALTER TABLE s9.stktrndtlsextd01 ADD CONSTRAINT stktrndtlsextd01_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, itemtagsrlno, tenant_id);

-- Table: stktrneddtls
-- Old PK: ['trntype', 'trnctrlno', 'entsrlno']
-- New PK: ['trntype', 'trnctrlno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.stktrneddtls DROP CONSTRAINT stktrneddtls_pkey;
ALTER TABLE s9.stktrneddtls ADD CONSTRAINT stktrneddtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- Table: stktrnedhdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.stktrnedhdr DROP CONSTRAINT stktrnedhdr_pkey;
ALTER TABLE s9.stktrnedhdr ADD CONSTRAINT stktrnedhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: stktrnhdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.stktrnhdr DROP CONSTRAINT stktrnhdr_pkey;
ALTER TABLE s9.stktrnhdr ADD CONSTRAINT stktrnhdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: stockcreditnote
-- Old PK: ['docnoprefix', 'docno', 'docentsrlno']
-- New PK: ['docnoprefix', 'docno', 'docentsrlno', 'tenant_id']
ALTER TABLE s9.stockcreditnote DROP CONSTRAINT stockcreditnote_pkey;
ALTER TABLE s9.stockcreditnote ADD CONSTRAINT stockcreditnote_pkey PRIMARY KEY (docnoprefix, docno, docentsrlno, tenant_id);

-- Table: stockmaster
-- Old PK: ['stockno', 'batchsrlno', 'locnid']
-- New PK: ['stockno', 'batchsrlno', 'locnid', 'tenant_id']
ALTER TABLE s9.stockmaster DROP CONSTRAINT stockmaster_pkey;
ALTER TABLE s9.stockmaster ADD CONSTRAINT stockmaster_pkey PRIMARY KEY (stockno, batchsrlno, locnid, tenant_id);

-- Table: stockmasterextd
-- Old PK: ['stockno', 'batchsrlno']
-- New PK: ['stockno', 'batchsrlno', 'tenant_id']
ALTER TABLE s9.stockmasterextd DROP CONSTRAINT stockmasterextd_pkey;
ALTER TABLE s9.stockmasterextd ADD CONSTRAINT stockmasterextd_pkey PRIMARY KEY (stockno, batchsrlno, tenant_id);

-- Table: stockmasterextd01
-- Old PK: ['stockno', 'batchno', 'gradecd', 'locationcd']
-- New PK: ['stockno', 'batchno', 'gradecd', 'locationcd', 'tenant_id']
ALTER TABLE s9.stockmasterextd01 DROP CONSTRAINT stockmasterextd01_pkey;
ALTER TABLE s9.stockmasterextd01 ADD CONSTRAINT stockmasterextd01_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, tenant_id);

-- Table: stockmasterextd02
-- Old PK: ['stockno', 'itemtag1', 'batchno', 'gradecd', 'locationcd']
-- New PK: ['stockno', 'itemtag1', 'batchno', 'gradecd', 'locationcd', 'tenant_id']
ALTER TABLE s9.stockmasterextd02 DROP CONSTRAINT stockmasterextd02_pkey;
ALTER TABLE s9.stockmasterextd02 ADD CONSTRAINT stockmasterextd02_pkey PRIMARY KEY (stockno, itemtag1, batchno, gradecd, locationcd, tenant_id);

-- Table: stockmasterextdopbal
-- Old PK: ['stockno', 'batchno', 'gradecd', 'locationcd']
-- New PK: ['stockno', 'batchno', 'gradecd', 'locationcd', 'tenant_id']
ALTER TABLE s9.stockmasterextdopbal DROP CONSTRAINT stockmasterextdopbal_pkey;
ALTER TABLE s9.stockmasterextdopbal ADD CONSTRAINT stockmasterextdopbal_pkey PRIMARY KEY (stockno, batchno, gradecd, locationcd, tenant_id);

-- Table: stocktrnsummary
-- Old PK: ['stockno', 'batchsrlno', 'locnid', 'yr', 'monthno']
-- New PK: ['stockno', 'batchsrlno', 'locnid', 'yr', 'monthno', 'tenant_id']
ALTER TABLE s9.stocktrnsummary DROP CONSTRAINT stocktrnsummary_pkey;
ALTER TABLE s9.stocktrnsummary ADD CONSTRAINT stocktrnsummary_pkey PRIMARY KEY (stockno, batchsrlno, locnid, yr, monthno, tenant_id);

-- Table: subclass1cat
-- Old PK: ['class1cd', 'class2cd', 'subclass1cd']
-- New PK: ['class1cd', 'class2cd', 'subclass1cd', 'tenant_id']
ALTER TABLE s9.subclass1cat DROP CONSTRAINT subclass1cat_pkey;
ALTER TABLE s9.subclass1cat ADD CONSTRAINT subclass1cat_pkey PRIMARY KEY (class1cd, class2cd, subclass1cd, tenant_id);

-- Table: subclass2cat
-- Old PK: ['class1cd', 'class2cd', 'subclass2cd']
-- New PK: ['class1cd', 'class2cd', 'subclass2cd', 'tenant_id']
ALTER TABLE s9.subclass2cat DROP CONSTRAINT subclass2cat_pkey;
ALTER TABLE s9.subclass2cat ADD CONSTRAINT subclass2cat_pkey PRIMARY KEY (class1cd, class2cd, subclass2cd, tenant_id);

-- Table: sysparam
-- Old PK: ['id']
-- New PK: ['id', 'tenant_id']
ALTER TABLE s9.sysparam DROP CONSTRAINT sysparam_pkey;
ALTER TABLE s9.sysparam ADD CONSTRAINT sysparam_pkey PRIMARY KEY (id, tenant_id);

-- Table: sysparamextd
-- Old PK: ['id']
-- New PK: ['id', 'tenant_id']
ALTER TABLE s9.sysparamextd DROP CONSTRAINT sysparamextd_pkey;
ALTER TABLE s9.sysparamextd ADD CONSTRAINT sysparamextd_pkey PRIMARY KEY (id, tenant_id);

-- Table: sysparamlookup
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.sysparamlookup DROP CONSTRAINT sysparamlookup_pkey;
ALTER TABLE s9.sysparamlookup ADD CONSTRAINT sysparamlookup_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: szcatdtls
-- Old PK: ['szgrpcd', 'szcd']
-- New PK: ['szgrpcd', 'szcd', 'tenant_id']
ALTER TABLE s9.szcatdtls DROP CONSTRAINT szcatdtls_pkey;
ALTER TABLE s9.szcatdtls ADD CONSTRAINT szcatdtls_pkey PRIMARY KEY (szgrpcd, szcd, tenant_id);

-- Table: szhdrs
-- Old PK: ['szgrpcd']
-- New PK: ['szgrpcd', 'tenant_id']
ALTER TABLE s9.szhdrs DROP CONSTRAINT szhdrs_pkey;
ALTER TABLE s9.szhdrs ADD CONSTRAINT szhdrs_pkey PRIMARY KEY (szgrpcd, tenant_id);

-- Table: tallyexportedtrans
-- Old PK: ['trntype', 'voucherno']
-- New PK: ['trntype', 'voucherno', 'tenant_id']
ALTER TABLE s9.tallyexportedtrans DROP CONSTRAINT tallyexportedtrans_pkey;
ALTER TABLE s9.tallyexportedtrans ADD CONSTRAINT tallyexportedtrans_pkey PRIMARY KEY (trntype, voucherno, tenant_id);

-- Table: tallyhsnrules
-- Old PK: ['mapid']
-- New PK: ['mapid', 'tenant_id']
ALTER TABLE s9.tallyhsnrules DROP CONSTRAINT tallyhsnrules_pkey;
ALTER TABLE s9.tallyhsnrules ADD CONSTRAINT tallyhsnrules_pkey PRIMARY KEY (mapid, tenant_id);

-- Table: tallymappurchtaxcat
-- Old PK: ['taxcomponent', 'mapname']
-- New PK: ['taxcomponent', 'mapname', 'tenant_id']
ALTER TABLE s9.tallymappurchtaxcat DROP CONSTRAINT tallymappurchtaxcat_pkey;
ALTER TABLE s9.tallymappurchtaxcat ADD CONSTRAINT tallymappurchtaxcat_pkey PRIMARY KEY (taxcomponent, mapname, tenant_id);

-- Table: tallymapsettinginfo
-- Old PK: ['mapname', 'poststartdate']
-- New PK: ['mapname', 'poststartdate', 'tenant_id']
ALTER TABLE s9.tallymapsettinginfo DROP CONSTRAINT tallymapsettinginfo_pkey;
ALTER TABLE s9.tallymapsettinginfo ADD CONSTRAINT tallymapsettinginfo_pkey PRIMARY KEY (mapname, poststartdate, tenant_id);

-- Table: tallymasterinfo
-- Old PK: ['alias']
-- New PK: ['alias', 'tenant_id']
ALTER TABLE s9.tallymasterinfo DROP CONSTRAINT tallymasterinfo_pkey;
ALTER TABLE s9.tallymasterinfo ADD CONSTRAINT tallymasterinfo_pkey PRIMARY KEY (alias, tenant_id);

-- Table: tallypostingsettings
-- Old PK: ['trantype', 'slno']
-- New PK: ['trantype', 'slno', 'tenant_id']
ALTER TABLE s9.tallypostingsettings DROP CONSTRAINT tallypostingsettings_pkey;
ALTER TABLE s9.tallypostingsettings ADD CONSTRAINT tallypostingsettings_pkey PRIMARY KEY (trantype, slno, tenant_id);

-- Table: tallyprintconfigdetails
-- Old PK: ['configname', 'paramname']
-- New PK: ['configname', 'paramname', 'tenant_id']
ALTER TABLE s9.tallyprintconfigdetails DROP CONSTRAINT tallyprintconfigdetails_pkey;
ALTER TABLE s9.tallyprintconfigdetails ADD CONSTRAINT tallyprintconfigdetails_pkey PRIMARY KEY (configname, paramname, tenant_id);

-- Table: tallyprintconfigheader
-- Old PK: ['terminal', 'trntype', 'configname']
-- New PK: ['terminal', 'trntype', 'configname', 'tenant_id']
ALTER TABLE s9.tallyprintconfigheader DROP CONSTRAINT tallyprintconfigheader_pkey;
ALTER TABLE s9.tallyprintconfigheader ADD CONSTRAINT tallyprintconfigheader_pkey PRIMARY KEY (terminal, trntype, configname, tenant_id);

-- Table: tallyvchinfo
-- Old PK: ['vchid', 'vchguid', 'trntype', 'mapname']
-- New PK: ['vchid', 'vchguid', 'trntype', 'mapname', 'tenant_id']
ALTER TABLE s9.tallyvchinfo DROP CONSTRAINT tallyvchinfo_pkey;
ALTER TABLE s9.tallyvchinfo ADD CONSTRAINT tallyvchinfo_pkey PRIMARY KEY (vchid, vchguid, trntype, mapname, tenant_id);

-- Table: terminalmaster
-- Old PK: ['terminalid']
-- New PK: ['terminalid', 'tenant_id']
ALTER TABLE s9.terminalmaster DROP CONSTRAINT terminalmaster_pkey;
ALTER TABLE s9.terminalmaster ADD CONSTRAINT terminalmaster_pkey PRIMARY KEY (terminalid, tenant_id);

-- Table: tillacceptdisplaydtls
-- Old PK: ['tilltrntype', 'tillindex']
-- New PK: ['tilltrntype', 'tillindex', 'tenant_id']
ALTER TABLE s9.tillacceptdisplaydtls DROP CONSTRAINT tillacceptdisplaydtls_pkey;
ALTER TABLE s9.tillacceptdisplaydtls ADD CONSTRAINT tillacceptdisplaydtls_pkey PRIMARY KEY (tilltrntype, tillindex, tenant_id);

-- Table: tilloperationjournaldtls
-- Old PK: ['tilltrntype', 'tilltrnctrlno', 'tilltrndt', 'srlno']
-- New PK: ['tilltrntype', 'tilltrnctrlno', 'tilltrndt', 'srlno', 'tenant_id']
ALTER TABLE s9.tilloperationjournaldtls DROP CONSTRAINT tilloperationjournaldtls_pkey;
ALTER TABLE s9.tilloperationjournaldtls ADD CONSTRAINT tilloperationjournaldtls_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, tilltrndt, srlno, tenant_id);

-- Table: tilloperationjournalhdr
-- Old PK: ['tilltrntype', 'tilltrnctrlno', 'tilltrndt']
-- New PK: ['tilltrntype', 'tilltrnctrlno', 'tilltrndt', 'tenant_id']
ALTER TABLE s9.tilloperationjournalhdr DROP CONSTRAINT tilloperationjournalhdr_pkey;
ALTER TABLE s9.tilloperationjournalhdr ADD CONSTRAINT tilloperationjournalhdr_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, tilltrndt, tenant_id);

-- Table: tillshiftdtls
-- Old PK: ['tilltrndt', 'nodeid', 'shiftno']
-- New PK: ['tilltrndt', 'nodeid', 'shiftno', 'tenant_id']
ALTER TABLE s9.tillshiftdtls DROP CONSTRAINT tillshiftdtls_pkey;
ALTER TABLE s9.tillshiftdtls ADD CONSTRAINT tillshiftdtls_pkey PRIMARY KEY (tilltrndt, nodeid, shiftno, tenant_id);

-- Table: tilltrnswisedenomination
-- Old PK: ['tilltrntype', 'tilltrnctrlno', 'srlno', 'subsrlno', 'tilltrndt']
-- New PK: ['tilltrntype', 'tilltrnctrlno', 'srlno', 'subsrlno', 'tilltrndt', 'tenant_id']
ALTER TABLE s9.tilltrnswisedenomination DROP CONSTRAINT tilltrnswisedenomination_pkey;
ALTER TABLE s9.tilltrnswisedenomination ADD CONSTRAINT tilltrnswisedenomination_pkey PRIMARY KEY (tilltrntype, tilltrnctrlno, srlno, subsrlno, tilltrndt, tenant_id);

-- Table: transactioncomponentsdtls
-- Old PK: ['trntype', 'fieldcode', 'srlno', 'eventid']
-- New PK: ['trntype', 'fieldcode', 'srlno', 'eventid', 'tenant_id']
ALTER TABLE s9.transactioncomponentsdtls DROP CONSTRAINT transactioncomponentsdtls_pkey;
ALTER TABLE s9.transactioncomponentsdtls ADD CONSTRAINT transactioncomponentsdtls_pkey PRIMARY KEY (trntype, fieldcode, srlno, eventid, tenant_id);

-- Table: tripsheetdtls
-- Old PK: ['trntype', 'trnctrlno', 'entsrlno']
-- New PK: ['trntype', 'trnctrlno', 'entsrlno', 'tenant_id']
ALTER TABLE s9.tripsheetdtls DROP CONSTRAINT tripsheetdtls_pkey;
ALTER TABLE s9.tripsheetdtls ADD CONSTRAINT tripsheetdtls_pkey PRIMARY KEY (trntype, trnctrlno, entsrlno, tenant_id);

-- Table: tripsheethdr
-- Old PK: ['trntype', 'trnctrlno']
-- New PK: ['trntype', 'trnctrlno', 'tenant_id']
ALTER TABLE s9.tripsheethdr DROP CONSTRAINT tripsheethdr_pkey;
ALTER TABLE s9.tripsheethdr ADD CONSTRAINT tripsheethdr_pkey PRIMARY KEY (trntype, trnctrlno, tenant_id);

-- Table: tripsheetstatusdtls
-- Old PK: ['statusctrlno', 'statusentsrlno']
-- New PK: ['statusctrlno', 'statusentsrlno', 'tenant_id']
ALTER TABLE s9.tripsheetstatusdtls DROP CONSTRAINT tripsheetstatusdtls_pkey;
ALTER TABLE s9.tripsheetstatusdtls ADD CONSTRAINT tripsheetstatusdtls_pkey PRIMARY KEY (statusctrlno, statusentsrlno, tenant_id);

-- Table: trnstockaudit
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.trnstockaudit DROP CONSTRAINT trnstockaudit_pkey;
ALTER TABLE s9.trnstockaudit ADD CONSTRAINT trnstockaudit_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: userwiseitemconfig
-- Old PK: ['userid']
-- New PK: ['userid', 'tenant_id']
ALTER TABLE s9.userwiseitemconfig DROP CONSTRAINT userwiseitemconfig_pkey;
ALTER TABLE s9.userwiseitemconfig ADD CONSTRAINT userwiseitemconfig_pkey PRIMARY KEY (userid, tenant_id);

-- Table: vamenu
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.vamenu DROP CONSTRAINT vamenu_pkey;
ALTER TABLE s9.vamenu ADD CONSTRAINT vamenu_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: vamenushortcut
-- Old PK: ['smriti_id']
-- New PK: ['smriti_id', 'tenant_id']
ALTER TABLE s9.vamenushortcut DROP CONSTRAINT vamenushortcut_pkey;
ALTER TABLE s9.vamenushortcut ADD CONSTRAINT vamenushortcut_pkey PRIMARY KEY (smriti_id, tenant_id);

-- Table: vendoritems
-- Old PK: ['vendcd', 'recno']
-- New PK: ['vendcd', 'recno', 'tenant_id']
ALTER TABLE s9.vendoritems DROP CONSTRAINT vendoritems_pkey;
ALTER TABLE s9.vendoritems ADD CONSTRAINT vendoritems_pkey PRIMARY KEY (vendcd, recno, tenant_id);

-- Table: vendors
-- Old PK: ['code']
-- New PK: ['code', 'tenant_id']
ALTER TABLE s9.vendors DROP CONSTRAINT vendors_pkey;
ALTER TABLE s9.vendors ADD CONSTRAINT vendors_pkey PRIMARY KEY (code, tenant_id);

-- Table: versiondtls
-- Old PK: ['verid']
-- New PK: ['verid', 'tenant_id']
ALTER TABLE s9.versiondtls DROP CONSTRAINT versiondtls_pkey;
ALTER TABLE s9.versiondtls ADD CONSTRAINT versiondtls_pkey PRIMARY KEY (verid, tenant_id);

-- Table: versionwisetblsscript
-- Old PK: ['verid', 'srlno']
-- New PK: ['verid', 'srlno', 'tenant_id']
ALTER TABLE s9.versionwisetblsscript DROP CONSTRAINT versionwisetblsscript_pkey;
ALTER TABLE s9.versionwisetblsscript ADD CONSTRAINT versionwisetblsscript_pkey PRIMARY KEY (verid, srlno, tenant_id);

-- Table: walkin
-- Old PK: ['walkinsysdate', 'walkinintervalctr']
-- New PK: ['walkinsysdate', 'walkinintervalctr', 'tenant_id']
ALTER TABLE s9.walkin DROP CONSTRAINT walkin_pkey;
ALTER TABLE s9.walkin ADD CONSTRAINT walkin_pkey PRIMARY KEY (walkinsysdate, walkinintervalctr, tenant_id);

COMMIT;

-- End of migration
