CREATE PROCEDURE [dbo].[PrnTaxSummary]
-- Add the parameters for the stored procedure here
--<@Param1, sysname, @p1> <Datatype_For_Param1, , int> = <Default_Value_For_Param1, , 0>, 
--<@Param2, sysname, @p2> <Datatype_For_Param2, , int> = <Default_Value_For_Param2, , 0>
@DBname Varchar(20),
@TrnType int,
@CtrlNo int,
@UserName Varchar(20),
@RetTableName Varchar(20) Out
AS
BEGIN
Declare @StrSQL as nvarchar(4000)	
Declare @TempTabName Varchar(20)
Declare @ShowComponentWise bit
Declare @ShowExclusiveSeperatey bit
Declare @ShowTaxCaptions bit
Declare @SelectFields Varchar(2000)
Declare @GroupFields Varchar(2000)
Declare @InsertFields Varchar(2000)
Declare @intLp int
--Added by Vijay on 6th June 2013 for Rel 2.2 to group vat summary based on Tax% only
Declare @GroupByTaxPerOnly bit
--till here
Set @ShowExclusiveSeperatey=0
Set @ShowComponentWise=0
Set @ShowTaxCaptions=0
--Added by Vijay on 6th June 2013 for Rel 2.2 to group vat summary based on Tax% only
Set @GroupByTaxPerOnly=0
--till here
Set @SelectFields=''
Set @GroupFields=''
Set @InsertFields=''
Begin try
Select @ShowExclusiveSeperatey =[Boolean]  from sysparam Where paramcode='PrintInclExclVatSummarySeparately'
Select @ShowComponentWise =[Boolean]  from sysparam Where paramcode='PrintTaxBreakUpOnBill'
Select @ShowTaxCaptions =[Boolean]  from sysparam Where paramcode='PrintTaxBreakupWithTaxCompDtls'
--Added by Vijay on 6th June 2013 for Rel 2.2 to group vat summary based on Tax% only
Select @GroupByTaxPerOnly =[Boolean]  from sysparam Where paramcode='GroupTaxSummaryBasedOnTaxPercentageOnly'
--till here
Set @TempTabName='##xtmpTaxSmry' + @UserName
Set @StrSQL = N'if object_ID(''tempdb..' + @TempTabName+''') is Not NULL Drop Table ' + @TempTabName 
Print (@StrSQL)
Execute sp_ExecuteSQl @StrSQL
Set @StrSQL = 'CREATE TABLE [dbo].['+@TempTabName+']('+
'[SeqNum] [int] NULL,'+
'[ProdTaxType] [varchar](16) NOT NULL,'+
'[DestTaxType] [varchar](16) NOT NULL,'+
'[SrcTaxType] [varchar](16) NOT NULL,'+
'[ItemTaxFlag] [int] NULL,'+
'[TaxDesc] [varchar](50) NULL,'+
'[TaxName] [varchar](25) NULL,'+
'[TaxDescr] [varchar](50) NULL,'+
'[TaxPercOfSTD] [money] NULL,'+
'[TaxPercOfSalesTaxCat] [money] NULL,'+
'[TaxableValue] [money] NULL,'+
'[TaxAmount] [money] NULL,'+
'[ExclIndicator] Varchar(10) NULL' +
')'
Exec (@StrSQL)
If @ShowComponentWise=0
Begin
If @GroupByTaxPerOnly=1
BEGIN
Set @SelectFields='Convert(int,0) As SeqNum,'''','''','''',TAXPercOfSTD,TaxPercOfSalesTaxCat,SUM(TaxableValue),SUM(TaxAmount)'
Set @GroupFields='TAXPercOfSTD,TaxPercOfSalesTaxCat'
Set @InsertFields='SeqNum,ProdTaxType,DestTaxType,SrcTaxType,TaxPercOfSTD,TaxPercOfSalesTaxCat,TaxableValue,TaxAmount'	--In this, TaxPercOfSalesTaxCat is actually not required but it is used because in print engine, render, this column used to extract taxper value.
if @ShowExclusiveSeperatey=1
Begin
Set @SelectFields=@SelectFields + ',STD.ItemTaxFlag'
Set @GroupFields=@GroupFields + ',STD.ItemTaxFlag'
Set @InsertFields= @InsertFields+',ItemTaxFlag'
End
if @ShowTaxCaptions=1
Begin
Set @SelectFields=@SelectFields + ',STC.TaxDesc'
Set @GroupFields=@GroupFields + ',STC.TaxDesc'
Set @InsertFields= @InsertFields+',TaxDesc'
End
Set @StrSQL=N'Insert Into '+ @TempTabName +'('+@InsertFields+') Select ' + @SelectFields + ' From '+
'('+
'Select Convert(int,0) As SeqNum, STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType,'+
'(Sum(STD.stdTaxComp1Per+STD.stdTaxComp2Per+STD.stdTaxComp3Per+STD.stdTaxComp4Per+STD.stdTaxComp5Per)/COUNT(*)) as TaxPercOfSTD,'+
'(Sum(STD.stdTaxComp1Per+STD.stdTaxComp2Per+STD.stdTaxComp3Per+STD.stdTaxComp4Per+STD.stdTaxComp5Per)/COUNT(*)) as TaxPercOfSalesTaxCat,'+
'Sum(STD.TaxAV1) As TaxableValue,Sum(STD.TaxComp1+STD.TaxComp2+STD.TaxComp3+STD.TaxComp4+STD.TaxComp5) As TaxAmount '+
' from '+ @DBname +'..StktrnDtls STD Inner Join '+ @DBname +'..SalesTaxCat STC ON ' +
' STC.ProdTaxType=STD.ItemTaxType and STC.DestTaxType=STD.CustTaxType and STC.SrcTaxType=STD.SrcTaxType'+
' Where STD.TrnType='+Convert(Varchar(20),@TrnType) +' And TrnCtrlNo='+ Convert(Varchar(20),@CtrlNo) +
' Group by STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType ' +
') AS TTAX '
Set @StrSQL=@StrSQL+ ' Group by '+ @GroupFields
Execute Sp_ExecuteSQL @StrSQL
END
Else
BEGIN
Set @SelectFields='Convert(int,0) As SeqNum,STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType,(Sum(STD.stdTaxComp1Per+STD.stdTaxComp2Per+STD.stdTaxComp3Per+STD.stdTaxComp4Per+STD.stdTaxComp5Per)/count(*)) as TaxPercOfSTD'+
',(Sum(STD.stdTaxComp1Per+STD.stdTaxComp2Per+STD.stdTaxComp3Per+STD.stdTaxComp4Per+STD.stdTaxComp5Per)/count(*)) as TaxPercOfSalesTaxCat'+	--In this, TaxPercOfSalesTaxCat is actually not required but it is used because in print engine, render, this column used to extract taxper value.
---',Sum(STD.TaxAV1+STD.TaxAV2+STD.TaxAV3+STD.TaxAV4+STD.TaxAV5) As TaxableValue,Sum(STD.TaxComp1+STD.TaxComp2+STD.TaxComp3+STD.TaxComp4+STD.TaxComp5) As TaxAmount'
',Sum(STD.TaxAV1) As TaxableValue,Sum(STD.TaxComp1+STD.TaxComp2+STD.TaxComp3+STD.TaxComp4+STD.TaxComp5) As TaxAmount'
Set @GroupFields='STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType'	
Set @InsertFields='SeqNum,ProdTaxType,DestTaxType,SrcTaxType,TaxPercOfSTD,TaxPercOfSalesTaxCat,TaxableValue,TaxAmount'	--In this, TaxPercOfSalesTaxCat is actually not required but it is used because in print engine, render, this column used to extract taxper value.
if @ShowExclusiveSeperatey=1
Begin
Set @SelectFields=@SelectFields + ',STD.ItemTaxFlag'
Set @GroupFields=@GroupFields + ',STD.ItemTaxFlag'
Set @InsertFields= @InsertFields+',ItemTaxFlag'
End
if @ShowTaxCaptions=1
Begin
Set @SelectFields=@SelectFields + ',STC.TaxDesc'
Set @GroupFields=@GroupFields + ',STC.TaxDesc'
Set @InsertFields= @InsertFields+',TaxDesc'
End
Set @StrSQL=N'Insert Into '+ @TempTabName +'('+@InsertFields+') Select ' + @SelectFields +
' from '+ @DBname +'..StktrnDtls STD Inner Join '+ @DBname +'..SalesTaxCat STC ON' +
' STC.ProdTaxType=STD.ItemTaxType and STC.DestTaxType=STD.CustTaxType and STC.SrcTaxType=STD.SrcTaxType'+
' Where STD.TrnType='+Convert(Varchar(20),@TrnType) +' And TrnCtrlNo='+ Convert(Varchar(20),@CtrlNo) 
Set @StrSQL=@StrSQL+ ' Group by '+ @GroupFields
Execute Sp_ExecuteSQL @StrSQL
END
End
Else
Begin
set @intLp = 1
WHILE (@intLp <=5)
BEGIN
Set @SelectFields='Convert(int,'+Char(39)+Convert(Varchar(1),@intLp) +Char(39)+') As SeqNum,STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType,STD.stdTaxComp'+Convert(Varchar(1),@intLp)+'Per as TaxPercOfSTD'+
',STC.T'+Convert(Varchar(1),@intLp)+'Rate as TaxPercOfSalesTaxCat,Sum(STD.TaxAV'+Convert(Varchar(1),@intLp)+') As TaxableValue,Sum(STD.TaxComp'+Convert(Varchar(1),@intLp)+') As TaxAmount'
Set @GroupFields='STC.ProdTaxType,STC.DestTaxType,STC.SrcTaxType,STD.stdTaxComp'+Convert(Varchar(1),@intLp)+'Per,STC.T'+Convert(Varchar(1),@intLp)+'Rate'
Set @InsertFields='SeqNum,ProdTaxType,DestTaxType,SrcTaxType,TaxPercOfSTD,TaxPercOfSalesTaxCat,TaxableValue,TaxAmount'
if @ShowExclusiveSeperatey=1 
Begin
Set @SelectFields=@SelectFields + ',STD.ItemTaxFlag'
Set @GroupFields=@GroupFields + ',STD.ItemTaxFlag'
Set @InsertFields= @InsertFields+',ItemTaxFlag'
End
if @ShowTaxCaptions=1
Begin
Set @SelectFields=@SelectFields + ',STC.TaxDesc,STC.T'++Convert(Varchar(1),@intLp)+'Name As TaxName,STC.T'+Convert(Varchar(1),@intLp)+'Descr As TaxDescr'
Set @GroupFields=@GroupFields + ',STC.TaxDesc,STC.T'+Convert(Varchar(1),@intLp)+'Name,STC.T'+Convert(Varchar(1),@intLp)+'Descr'
Set @InsertFields= @InsertFields+',TaxDesc,TaxName,TaxDescr'
End
Set @StrSQL='Insert Into '+ @TempTabName +'('+@InsertFields+') Select ' + @SelectFields +
' from '+ @DBname +'..StktrnDtls STD Inner Join '+ @DBname +'..SalesTaxCat STC ON' +
' STC.ProdTaxType=STD.ItemTaxType and STC.DestTaxType=STD.CustTaxType and STC.SrcTaxType=STD.SrcTaxType'+
' Where STD.TrnType='+Convert(Varchar(20),@TrnType) +' And TrnCtrlNo='+ Convert(Varchar(20),@CtrlNo) 
If @intLp>1 
Begin
Set @StrSQL=@StrSQL+ ' AND TaxComp'+Convert(Varchar(1),@intLp)+'>0'
End
Set @StrSQL=@StrSQL+ ' Group by '+ @GroupFields
Execute Sp_ExecuteSQL @StrSQL
SET @intLp = @intLp + 1
END
End
Set @StrSQL ='Update '+@TempTabName + ' Set ExclIndicator=''**'' Where ItemTaxFlag=2'
Execute Sp_ExecuteSQL @StrSQL
Set @StrSQL ='Update '+@TempTabName + ' Set ExclIndicator='''' Where ExclIndicator IS NULL'
Execute Sp_ExecuteSQL @StrSQL
Set @RetTableName= @TempTabName
End try
Begin catch
Set @RetTableName= 'Error'
End catch
END