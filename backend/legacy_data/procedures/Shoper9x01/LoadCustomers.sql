Create procedure LoadCustomers  @returnValue INT OUTPUT,@LogRunNumber int = 0 as
Declare @strSql  varchar(3000)                  
Declare @lngMailLstNo as integer
Declare @RunNumber as int  
Declare @AddType as varchar(16)
Declare @Vactr as int
set @AddType = '1'    
select top 1 @AddType =  Code from GenLookUp where recid=15500 order by Code
select top 1 @Vactr=Intg from sysparam where paramcode='VasysCounter'
IF (@@ERROR <> 0)                                       
BEGIN        
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Retrieving AddressType from Genlookup Recid 15500 failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END
set @RunNumber = @LogRunNumber    
if @LogRunNumber = 0     
begin                    
select @RunNumber = isnull(Max(RunNumber),0)+ 1  From IniLoadingErrorLog    
end 
if exists (Select * from dbo.sysobjects where id = object_id(N'[tmpCustImport]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table [tmpCustImport]
if exists (Select * from dbo.sysobjects where id = object_id(N'[tmpMailImport]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table [tmpMailImport]
if exists (Select * from dbo.sysobjects where id = object_id(N'[tmpExtdMailImport]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table [tmpExtdMailImport]
if exists (Select * from dbo.sysobjects where id = object_id(N'[tmpMailListSrlNo]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) drop table [tmpMailListSrlNo]
Select *,' ' as UpdFlag into tmpCustImport from Customers where 1=2
Select *,' ' as UpdFlag into tmpMailImport from MailingList  where 1=2
Select *,' ' as UpdFlag into tmpExtdMailImport from ExtdMailingList  where 1=2
Update CustomerImport set IsASubOrdinate = 0 where IsASubOrdinate in('N','F')
Update CustomerImport set IsASubOrdinate = 1 where IsASubOrdinate in('Y','T')
Update CustomerImport set IsASubOrdinate = 0 where IsASubOrdinate not in (0,1)
Update CustomerImport set HasSubOrdinates = 0 where HasSubOrdinates in('N','F')
Update CustomerImport set HasSubOrdinates = 1 where HasSubOrdinates in('Y','T')
Update CustomerImport set ApplySuperAddress = 0 where ApplySuperAddress in('N','F')
Update CustomerImport set ApplySuperAddress = 1 where ApplySuperAddress in('Y','T')
Update CustomerImport set IsMale = 0 where IsMale in('N','F')
Update CustomerImport set IsMale = 1 where IsMale in('Y','T')
Update CustomerImport set IsMaried = 0 where IsMaried in('N','F')
Update CustomerImport set IsMaried = 1 where IsMaried in('Y','T')
Update CustomerImport set IsSHOPERTaxInc = 0 where IsSHOPERTaxInc in('N','F')
Update CustomerImport set IsSHOPERTaxInc = 1 where IsSHOPERTaxInc in('Y','T')
Update CustomerImport set IsSHOPERTaxInc = 0 where IsSHOPERTaxInc not in(0,1)
Update CustomerImport set AllowCreditInvoice = 0 where AllowCreditInvoice in('N','F')
Update CustomerImport set AllowCreditInvoice = 1 where AllowCreditInvoice in('Y','T')
Update CustomerImport set AllowCashBill = 0 where AllowCashBill in('N','F')
Update CustomerImport set AllowCashBill = 1 where AllowCashBill in('Y','T')
Update CustomerImport set AllowMiscIssue = 0 where AllowMiscIssue in('N','F')
Update CustomerImport set AllowMiscIssue = 1 where AllowMiscIssue in('Y','T')
Update CustomerImport set AllowMiscIssue = 0 where AllowMiscIssue not in(0,1)
Update CustomerImport set AllowDCGen = 0 where AllowDCGen in('N','F')
Update CustomerImport set AllowDCGen = 1 where AllowDCGen in('Y','T')
Update CustomerImport set AllowMiscRcpt = 0 where AllowMiscRcpt in('N','F')
Update CustomerImport set AllowMiscRcpt = 1 where AllowMiscRcpt in('Y','T')
Update CustomerImport set PresaleTaxFormYes = 0 where PresaleTaxFormYes in('N','F')
Update CustomerImport set PresaleTaxFormYes = 1 where PresaleTaxFormYes in('Y','T')
Update CustomerImport set PostSaleTaxFormYes = 0 where PostSaleTaxFormYes in('N','F')
Update CustomerImport set PostSaleTaxFormYes = 1 where PostSaleTaxFormYes in('Y','T')
Update CustomerImport set CustProf1='NA' where CustProf1 is null
Update CustomerImport set CustProf2='NA' where CustProf2 is null
Update CustomerImport set CustProf3='NA' where CustProf3 is null
Update CustomerImport set CustProf4='NA' where CustProf4 is null
Update CustomerImport set CustProf5='NA' where CustProf5 is null
Update CustomerImport set HasSubordinates=0 where HasSubordinates is null
Update CustomerImport set LoyaltyPgmId='NA' where LoyaltyPgmId is null
Update CustomerImport set LoyaltyPgmCd='NA' where LoyaltyPgmCd is null
Update CustomerImport set LSTNo='NA' where LSTNo is null
Update CustomerImport set CSTNo='NA' where CSTNo is null
Update CustomerImport set DestTaxType=0 where DestTaxType is null
Update CustomerImport set ModeOfTrans='NA' where ModeOfTrans is null
Update CustomerImport set TransCode='NA' where TransCode is null
Update CustomerImport set BankCd='NA' where BankCd is null
Update CustomerImport set BankLoc='NA' where BankLoc is null
Update CustomerImport set PaymtCat='NA' where PaymtCat is null
Update CustomerImport set PaymtTerms='NA' where PaymtTerms is null
--Update CustomerImport set ShoperComp=ShoperCompCode from ShowroomMaster where DistributionCenter ='99'
Update CustomerImport set ShoperComp='HO' where ShoperComp is null
Update CustomerImport set ShoperVer='NA' where ShoperVer is null
Update CustomerImport set PreSaleTaxFormNm='NA' where PreSaleTaxFormNM is null
Update CustomerImport set PostSaleTaxFormNm='NA' where PostSaleTaxFormNm is null
Update CustomerImport set CreditUsed=0 where CreditUsed is null
Update CustomerImport set Vactr=@Vactr
Insert into tmpCustImport(Code,Nm,MailListSrlNo,PriceGrp,CustClass1,CustClass2,CustClass3,CustClass4,CustClass5,
CustProf1,CustProf2,CustProf3,CustProf4,CustProf5,IsASubOrdinate,HasSubOrdinates,AttachedToCd,ApplySuperAddress,
IsMale,BirthDate,IsMaried,WedAnniv,LoyaltyPgmId,LoyaltyPgmCd,LSTNo,CSTNo,DestTaxType,ModeOfTrans,TransCode,
BankCd,BankLoc,PaymtCat,PaymtTerms,CreditDays,CreditLimit,TransitDays,SHOPERComp,SHOPERVer,IsSHOPERTaxInc,
Retail_Factor,Retail_RoundOff,Dealer_Factor,Dealer_RoundOff,AllowCreditInvoice,AllowCashBill,AllowMiscIssue,
AllowDCGen,AllowMiscRcpt,PresaleTaxFormYes,PreSaleTaxFormNm,PostSaleTaxFormYes,PostSaleTaxFormNm,DtOfCreation,
Vactr,CreditUsed,SHOPERDelimiter,SHOPEREnv,SrcTaxType,LSTDate,CSTDate,TransAllowed,
IsConsignmentItem,POApplicable,Lastupdateddate,UpdFlag)
SELECT Code,Nm,SrlNo,PriceGp,CustClass1,CustClass2,CustClass3,CustClass4,CustClass5,
CustProf1,CustProf2,CustProf3,CustProf4,CustProf5,IsASubOrdinate,HasSubOrdinates,
AttachedToCd,ApplySuperAddress,IsMale,BirthDate,IsMaried,WedAnniv,LoyaltyPgmId,
LoyaltyPgmCd,LSTNo,CSTNo,DestTaxType,ModeOfTrans,TransCode,BankCd,BankLoc,PaymtCat,
PaymtTerms,CreditDays,CreditLimit,TransitDays,SHOPERComp,SHOPERVer,IsSHOPERTaxInc,
ISNULL(CONVERT(MONEY,Retail_Factor),0),ISNULL(CONVERT(MONEY,Retail_RoundOff),0),
ISNULL(CONVERT(MONEY,Dealer_Factor),0),ISNULL(CONVERT(MONEY,Dealer_RoundOff),0),AllowCreditInvoice,AllowCashBill,AllowMiscIssue,AllowDCGen,AllowMiscRcpt,
PresaleTaxFormYes,PreSaleTaxFormNm,PostSaleTaxFormYes,PostSaleTaxFormNm,
GETDATE(),Vactr,CreditUsed,SHOPERDelimiter,SHOPEREnv,SrcTaxType,LSTDate,CSTDate,TransAllowed,IsConsignmentItem,POApplicable,GETDATE(),''
FROM CustomerImport where code is not null
IF (@@ERROR <> 0)                                       
BEGIN        
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Inserting to Temp Customer table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END                
Update tmpCustImport set AttachedToCd=(CASE WHEN CHARINDEX('.',AttachedToCd)>0 THEN 'NA' ELSE AttachedToCd END)
update tmpCustImport set updflag='U' from tmpCustImport as a,customers as b where a.code=b.code
select @lngMailLstNo = number from genlookup where code = 'MailNO'
IF (@@ERROR <> 0)                                       
BEGIN           
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','MailingListSrlNo in Genlookup table not found' ,'CustomerImport'
GOTO ErrorHandle                                       
END  
set @lngMailLstNo = @lngMailLstNo + 1
SET @strSql = 'Create table tmpMailListSrlNo(Code Varchar(32),MailnglstSrlno int identity(' + convert(varchar,@lngMailLstNo) + ',1))'
EXEC (@strSql) 
IF (@@ERROR <> 0)                                       
BEGIN           
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Temp MailingListSrlNo table creation failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Insert into tmpMailListSrlNo(Code) Select Code from tmpCustImport where UpdFlag<>'U' and Code <>''
Insert into tmpMailImport(RecNo,Nm,StreetAddr,Town,PostalCd,State,Country,Locality,
OffPhone,HomePhone,MobilePhone,FaxNo,Email,Email2,Email3,Contact,CatType,CatCd,UpdFlag)
SELECT 0,Nm,StreetAddr,Town,PostalCd,State,Country,Locality,OffPhone,Homephone,
MobilePhone,FaxNo,Email,Email2,'','','C',Code,'' FROM CustomerImport
IF (@@ERROR <> 0)                                       
BEGIN           
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Insert into temp MailingList table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
UPDATE tmpMailImport SET EMAIL2='' WHERE EMAIL2 IS NULL
update tmpMailImport set updflag='U' from tmpMailImport as a, mailinglist as c where a.catcd=c.catcd
Update tmpMailImport set RecNo=MailnglstSrlno from tmpMailListSrlNo as t,tmpMailImport as m where t.Code=m.CatCd and m.UpdFlag<>'U'
INSERT INTO tmpExtdMailImport(RecNo,AddressType,Nm,Addr1,Addr2,Addr3,Addr4,Addr5,Locality,PostalCd,
Country,Zone,State,City,OffPhone,HomePhone,MobilePhone,FaxNo,Email,Email2,Email3,Contact,
CatType,CatCd,DateInsert,LastUpdatedDate,DefaultAddress,UpdFlag) 
SELECT 0,@AddType,Nm,streetaddr,'','','','',Locality,PostalCd,Country,'',State,Town,OffPhone,HomePhone,
MobilePhone,FaxNo,Email,Email2,'NA',Nm,'C',Code,getdate(),getdate(),1,'' FROM CustomerImport
IF (@@ERROR <> 0)                                       
BEGIN           
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Insert into temp ExtdMailingList table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
update tmpExtdMailImport set updflag='U' from tmpExtdMailImport as a, ExtdMailinglist as c where a.catcd = c.catcd 
Update tmpExtdMailImport set RecNo=MailnglstSrlno from tmpMailListSrlNo as t,tmpExtdMailImport as m where t.Code=m.CatCd and m.UpdFlag<>'U'
Begin transaction
Update Customers Set Nm=c.Nm,PriceGrp=c.PriceGrp,
CustClass1=c.CustClass1,CustClass2=c.CustClass2,CustClass3=c.CustClass3,CustClass4=c.CustClass4,
CustClass5=c.CustClass5,CustProf1=c.CustProf1,CustProf2=c.CustProf2,CustProf3=c.CustProf3,
CustProf4=c.CustProf4,CustProf5=c.CustProf5,IsASubOrdinate=c.IsASubOrdinate,
HasSubOrdinates=c.HasSubOrdinates,AttachedToCd=c.AttachedToCd,
ApplySuperAddress=c.ApplySuperAddress,IsMale=c.IsMale,BirthDate=c.BirthDate,IsMaried=c.IsMaried,
WedAnniv=c.WedAnniv,LoyaltyPgmId=c.LoyaltyPgmId,LoyaltyPgmCd=c.LoyaltyPgmCd,LSTNo=c.LSTNo,
CSTNo=c.CSTNo,DestTaxType=c.DestTaxType,ModeOfTrans=c.ModeOfTrans,TransCode=c.TransCode,BankCd=c.BankCd,BankLoc=c.BankLoc,PaymtCat=c.PaymtCat,PaymtTerms=c.PaymtTerms,CreditDays=c.CreditDays,CreditLimit=c.CreditLimit,TransitDays=c.TransitDays,SHOPERComp=c.SHOPERComp,SHOPERVer=c.SHOPERVer,IsSHOPERTaxInc=c.IsSHOPERTaxInc,Retail_Factor=c.Retail_Factor,Retail_RoundOff=c.Retail_RoundOff,Dealer_Factor=c.Dealer_Factor,Dealer_RoundOff=c.Dealer_RoundOff,
AllowCreditInvoice=c.AllowCreditInvoice,AllowCashBill=c.AllowCashBill,
AllowMiscIssue=c.AllowMiscIssue,AllowDCGen=c.AllowDCGen,AllowMiscRcpt=c.AllowMiscRcpt,PresaleTaxFormYes=c.PresaleTaxFormYes,PreSaleTaxFormNm=c.PreSaleTaxFormNm,
PostSaleTaxFormYes=c.PostSaleTaxFormYes,PostSaleTaxFormNm=c.PostSaleTaxFormNm,
CreditUsed=c.CreditUsed, SHOPERDelimiter=c.SHOPERDelimiter, SHOPEREnv=c.SHOPEREnv, SrcTaxType=c.SrcTaxType, LSTDate=c.LSTDate, CSTDate=c.CSTDate, TransAllowed=c.TransAllowed,
IsConsignmentItem=c.IsConsignmentItem, POApplicable=c.POApplicable,
DtOfCreation=c.DtOfCreation,Vactr=@vactr,LastUpdatedDate=getdate()
from tmpCustImport c,Customers c1 where c.Code=c1.Code and c.updflag='U'
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Updating Customer table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Update tmpCustImport set MailListSrlNo=t.MailnglstSrlno from tmpMailListSrlNo as t,tmpCustImport as m where t.Code=m.Code and m.UpdFlag<>'U'
Insert into Customers(Code,Nm,MailListSrlNo,PriceGrp,CustClass1,CustClass2,CustClass3,CustClass4,CustClass5,
CustProf1,CustProf2,CustProf3,CustProf4,CustProf5,IsASubOrdinate,HasSubOrdinates,AttachedToCd,
ApplySuperAddress,IsMale,BirthDate,IsMaried,WedAnniv,LoyaltyPgmId,LoyaltyPgmCd,LSTNo,CSTNo,DestTaxType,
ModeOfTrans,TransCode,BankCd,BankLoc,PaymtCat,PaymtTerms,CreditDays,CreditLimit,TransitDays,SHOPERComp,
SHOPERVer,IsSHOPERTaxInc,Retail_Factor,Retail_RoundOff,Dealer_Factor,Dealer_RoundOff,AllowCreditInvoice,
AllowCashBill,AllowMiscIssue,AllowDCGen,AllowMiscRcpt,PresaleTaxFormYes,PreSaleTaxFormNm,PostSaleTaxFormYes,
PostSaleTaxFormNm,DtOfCreation,CreditUsed,SHOPERDelimiter,SHOPEREnv,SrcTaxType,LSTDate,CSTDate,TransAllowed,
IsConsignmentItem,POApplicable,Vactr,Lastupdateddate) 
Select Code,Nm,MailListSrlNo,PriceGrp,CustClass1,CustClass2,CustClass3,CustClass4,CustClass5,
CustProf1,CustProf2,CustProf3,CustProf4,CustProf5,IsASubOrdinate,HasSubOrdinates,AttachedToCd,
ApplySuperAddress,IsMale,BirthDate,IsMaried,WedAnniv,LoyaltyPgmId,LoyaltyPgmCd,LSTNo,CSTNo,DestTaxType,
ModeOfTrans,TransCode,BankCd,BankLoc,PaymtCat,PaymtTerms,CreditDays,CreditLimit,TransitDays,SHOPERComp,
SHOPERVer,IsSHOPERTaxInc,Retail_Factor,Retail_RoundOff,Dealer_Factor,Dealer_RoundOff,AllowCreditInvoice,
AllowCashBill,AllowMiscIssue,AllowDCGen,AllowMiscRcpt,PresaleTaxFormYes,PreSaleTaxFormNm,PostSaleTaxFormYes,
PostSaleTaxFormNm,DtOfCreation,CreditUsed,SHOPERDelimiter,SHOPEREnv,SrcTaxType,LSTDate,CSTDate,TransAllowed,
IsConsignmentItem,POApplicable,@Vactr,Lastupdateddate
from tmpCustImport where UpdFlag<>'U' and Code<>''
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Inserting to Customer table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Update MailingList Set Nm= ml.Nm,StreetAddr= ml.StreetAddr,Town= ml.Town,
PostalCd= ml.PostalCd,State= ml.State,Country= ml.Country,Locality= ml.Locality,
OffPhone= ml.OffPhone,HomePhone=ml.HomePhone,MobilePhone=ml.MobilePhone,FaxNo=ml.FaxNo,
Email= ml.Email,Email2=ml.Email2
from tmpMailImport ml,MailingList m where ml.CatCd= m.CatCd and ml.UpdFlag='U'
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Updating Customer Mailing List table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Insert Into MailingList(RecNo,Nm,StreetAddr,Town,PostalCd,State,Country,
Locality,OffPhone,HomePhone,MobilePhone,FaxNo,Email,Email2,Email3,Contact,CatType,CatCd)
Select RecNo,Nm,StreetAddr,Town,PostalCd,
State,Country,Locality,OffPhone,HomePhone,MobilePhone,FaxNo,Email,
Email2,Email3,Contact,CatType,CatCd 
from tmpMailImport where UpdFlag<>'U' and CatCd <>''
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Inserting to Customer Mailing List table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Update ExtdMailingList Set Nm=t.Nm,Addr1=t.Addr1,Locality=t.Locality,PostalCd=t.PostalCd,
Country=t.Country,State=t.State,City=t.City,OffPhone=t.OffPhone,HomePhone=t.HomePhone,MobilePhone=t.MobilePhone, 
FaxNo=t.FaxNo,Email=t.Email,Email2=t.Email2,LastUpdatedDate=t.LastUpdatedDate 
From ExtdMailingList,tmpExtdMailImport t Where ExtdMailingList.CatCd = t.CatCd
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Updating Customer ExtdMailing List table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
Insert Into ExtdMailingList(RecNo,AddressType,Nm,Addr1,Addr2,Addr3,Addr4,Addr5,Locality,PostalCd,Country,Zone,
State,City,OffPhone,HomePhone,MobilePhone,FaxNo,Email,Email2,Email3,Contact,
CatType,CatCd,DateInsert,LastUpdatedDate,DefaultAddress)
Select RecNo,AddressType,Nm,Addr1,Addr2,Addr3,Addr4,Addr5,Locality,PostalCd,Country,Zone,
State,City,OffPhone,HomePhone,MobilePhone,FaxNo,Email,Email2,Email3,Contact,
CatType,CatCd,getdate(),getdate(),DefaultAddress From tmpExtdMailImport where UpdFlag<>'U' and CatCd <>''
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Inserting to Customer ExtdMailing List table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
select @lngMailLstNo = isnull(max(MailnglstSrlno),0) from tmpMailListSrlNo  
if @lngMailLstNo > 0 
begin
SET @strSql = 'UPDATE GENLOOKUP SET NUMBER =' + convert(varchar,@lngMailLstNo) + ' WHERE CODE  =''MailNO'''
EXEC (@strSql) 
end
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Updating the last loaded MailingListSrlNo to Genlookup table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END 
set @strSql= 'insert into CustPriceGroups(PriceGrpCd,PriceGrpDesc,IsFactorByClass,AllowCreditInvoice,AllowCashBill,AllowMiscIssue,PaymtTerms,CreditDays,CreditLimit,DestTaxType) '
set @strSql= @strSql + ' select distinct PriceGrp,PriceGrp,1,1,1,1,1,30,999999999,0 '
set @strSql= @strSql + ' from tmpCustImport where Code<>'''' and isnull(PriceGrp,'''')<>'''' '
set @strSql= @strSql + ' and PriceGrp not in(select PriceGrpCd from CustPriceGroups) '	
EXEC (@strSql)
IF (@@ERROR <> 0)                                       
BEGIN           
Rollback Transaction
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Inserting to CustPriceGroups table failed' ,'CustomerImport'
GOTO ErrorHandle                                       
END
COMMIT TRANSACTION                                       
set @returnValue=0                             
return (0)                                       
ErrorHandle:                                       
begin                                       
RAISERROR('Error Occured in the Procedure',16,1) with nowait                                       
INSERT INTO IniLoadingErrorLog(RunNumber,RunDate,ErrorItem,ErrorDesc,UploadSource)                       
SELECT @RunNumber,GETDATE(),'','Importing of Customers failed' ,'CustomerImport'
set @returnValue = -1                                   
return (-1)                                            
end