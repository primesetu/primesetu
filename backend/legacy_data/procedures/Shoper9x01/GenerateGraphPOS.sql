CREATE PROCEDURE GenerateGraphPOS
@ChartType VARCHAR (32), @OptQtyVal INT, @TmpTable VARCHAR (64), @StrUserId VARCHAR (16), @UserWt INT, @OthParam VARCHAR (32)=''
AS
DECLARE @StrSql AS VARCHAR (5000);
DECLARE @StrSqlExec AS NVARCHAR (4000);
DECLARE @ShoperDate AS DATETIME;
DECLARE @ShoperActDate AS DATETIME;
DECLARE @FinYearDate AS DATETIME;
DECLARE @QtyValCap AS VARCHAR (16);
DECLARE @StrOptQtyVal AS VARCHAR (32);
DECLARE @YearEndMonth AS INT;
DECLARE @YearEndMonthChk AS INT;
DECLARE @ColCaption AS VARCHAR (32);
DECLARE @IntClass12FltrCnt AS INT;
DECLARE @IntShowTillDays AS INT;
DECLARE @intFlag AS INT;
SET NOCOUNT ON;
SELECT @ShoperDate = DT FROM SYSPARAM WHERE PARAMCODE LIKE 'SHOPERSysDt';
SELECT @YearEndMonth = CONVERT (INT, Txt) FROM SYSPARAM WHERE  PARAMCODE LIKE 'YearEndMonthNo';
SELECT @IntShowTillDays = Isnull(intg, 0) FROM SYSPARAM WHERE  PARAMCODE LIKE 'ShowLastFinYrDashboard';
SET @ShoperActDate = @ShoperDate;
SET @YearEndMonthChk = @YearEndMonth;
IF @YearEndMonthChk = 12
BEGIN
SET @YearEndMonthChk = 0;
END
IF @YearEndMonthChk + 1 = Month(@ShoperDate) AND DAY(@ShoperDate) <= @IntShowTillDays
BEGIN
SET @ShoperDate = DATEADD(DAY, -DAY(@ShoperDate), @ShoperDate);
END
IF @YearEndMonth = 12
BEGIN
SET @StrSql = CONVERT (VARCHAR, Year(@ShoperDate)) + '-01-01';
END
IF @YearEndMonth <> 12
BEGIN
SET @StrSql = CONVERT (VARCHAR, Year(@ShoperDate)) + '-' + CONVERT (VARCHAR, @YearEndMonth + 1) + '-01';
END
SET @FinYearDate = CONVERT (VARCHAR (10), @StrSQl, 127);
IF @FinYearDate > @ShoperDate
BEGIN
SET @StrSql = CONVERT (VARCHAR, Year(@ShoperDate) - 1) + '-' + CONVERT (VARCHAR, @YearEndMonth + 1) + '-01';
SET @FinYearDate = CONVERT (VARCHAR (10), @StrSQl, 127);
END
IF @OptQtyVal = 1
BEGIN
SET @StrOptQtyVal = ' Sum(DocQty) QtyVal';
SET @QtyValCap = 'Qty';
END
IF @OptQtyVal = 2
BEGIN
SET @StrOptQtyVal = ' Sum(DocEntNetValue) QtyVal';
SET @QtyValCap = 'Value';
END
SET @StrSql = 'if object_ID(' + CHAR(39) + 'TempDb..[##TmpGraphClass12' + @StrUserId + ']' + CHAR(39) + ',' + CHAR(39) + 'U' + CHAR(39) + ' ) IS NULL ';
SET @StrSql = @StrSql + ' SELECT Class1cd,Class2Cd Into [##TmpGraphClass12' + @StrUserId + ']';
SET @StrSql = @StrSql + ' From Class12combo Where (Class1cd In (Select Value From ItemClassRestrict Where IsAllowed = 1 And UserId = ';
SET @StrSql = @StrSql + CHAR(39) + @StrUserId + CHAR(39) + ' And ColumnName = ' + Char(39) + 'Class1cd' + Char(39) + ')) Or ';
SET @StrSql = @StrSql + ' (Class2cd In (Select Value From ItemClassRestrict Where IsAllowed = 1 And UserId = ';
SET @StrSql = @StrSql + CHAR(39) + @StrUserId + CHAR(39) + ' And ColumnName = ' + Char(39) + 'Class2cd' + Char(39) + '))';
EXECUTE (@StrSql);
SET @StrSqlExec = 'Select @IntClass12FltrCnt = Count(*) From [##TmpGraphClass12' + @StrUserId + ']';
EXECUTE Sp_executesql 
@Query = @StrSqlExec, 
@Params = N'@IntClass12FltrCnt INT OUTPUT', 
@IntClass12FltrCnt = @IntClass12FltrCnt OUTPUT;
IF @UserWt = 9999
SET @IntClass12FltrCnt = 0;
SET @StrSql = 'IF  EXISTS (SELECT * FROM sysobjects WHERE Id = OBJECT_ID(N' + char(39) + '[dbo].[' + @TmpTable + ']' + char(39) + ') AND type in (N' + char(39) + 'U' + char(39) + '))';
SET @StrSql = @StrSql + ' DROP TABLE [dbo].[' + @TmpTable + ']';
EXECUTE (@StrSql);
IF @ChartType = 'CHART1' ---Last 7 Days         
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,DocDt,03) As Date,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperActDate - 6, 127) + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperActDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY DOCDT,Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'Select Date,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + '] Group By Date Order By Date';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART2' ---Last 15 Days         
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,DocDt,03) As Date,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperActDate - 14, 127) + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperActDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY DOCDT,Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'Select Date,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + '] Group By Date Order By Date';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART3' ---Last Month        
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,DocDt,03) As Date,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.StockNo = B.StockNo And DocDt Between ';
IF MONTH(DATEADD(MONTH, -1, @ShoperDate)) = 12
BEGIN
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate) - 1) + '-' + CONVERT (VARCHAR, MONTH(DATEADD(MONTH, -1, @ShoperDate))) + '-01' + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate) - 1) + '-' + CONVERT (VARCHAR, MONTH(DATEADD(MONTH, -1, @ShoperDate))) + '-' + CONVERT (VARCHAR, DAY(DATEADD(DAY, -DATEPART(DAY, @ShoperDate), @ShoperDate))) + CHAR(39);
END
IF MONTH(DATEADD(MONTH, -1, @ShoperDate)) <> 12
BEGIN
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate)) + '-' + CONVERT (VARCHAR, MONTH(DATEADD(MONTH, -1, @ShoperDate))) + '-01' + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate)) + '-' + CONVERT (VARCHAR, MONTH(DATEADD(MONTH, -1, @ShoperDate))) + '-' + CONVERT (VARCHAR, DAY(DATEADD(DAY, -DATEPART(DAY, @ShoperDate), @ShoperDate))) + CHAR(39);
END
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY DOCDT,Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'Select Date,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + '] Group By Date Order By Date';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART4' ---This Month        
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,DocDt,03) As Date,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate)) + '-' + CONVERT (VARCHAR, MONTH(@ShoperDate)) + '-01' + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY DOCDT,Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'Select Date,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + '] Group By Date Order By Date';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART5' ---Current Financial Year      
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) As Month,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + '+ MonNo + ' + Char(39) + '-01' + Char(39) + ') Order By Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + Char(39) + ')';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART6' ---Last Financial Year      
BEGIN
SET @StrSql = CONVERT (VARCHAR, Year(@FinYearDate) - 1) + '-' + CONVERT (VARCHAR, Month(@FinYearDate)) + '-01';
SET @FinYearDate = CONVERT (VARCHAR (10), @StrSQl, 127);
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), DateAdd(Year, 1, @FinYearDate) - 1, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) As Month ,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + '+ MonNo + ' + Char(39) + '-01' + Char(39) + ') Order By Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + Char(39) + ')';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART7' ---'Current Quarter   
BEGIN
IF @ShoperDate > dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = dateadd(Month, 3, @FinYearDate);
IF @ShoperDate > dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = dateadd(Month, 3, @FinYearDate);
IF @ShoperDate > dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = dateadd(Month, 3, @FinYearDate);
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) As Month,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + '+ MonNo + ' + Char(39) + '-01' + Char(39) + ') Order By Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + Char(39) + ')';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART8' ---'Last Quarter   
BEGIN
IF @ShoperDate > Dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = Dateadd(Month, 3, @FinYearDate);
IF @ShoperDate > Dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = Dateadd(Month, 3, @FinYearDate);
IF @ShoperDate > Dateadd(Month, 3, @FinYearDate)
SET @FinYearDate = Dateadd(Month, 3, @FinYearDate);
SET @FinYearDate = Dateadd(Month, -3, @FinYearDate);
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), DateAdd(Day, -1, Dateadd(Month, 3, @FinYearDate)), 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) As Month,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + '+ MonNo + ' + Char(39) + '-01' + Char(39) + ') Order By Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + Char(39) + ')';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART9' ---Quarter Wise Comparision  
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,Convert(Varchar(16),' + Char(39) + Char(39) + ') As ' + Char(39) + 'QtrName' + Char(39) + ',TrnType,';
SET @StrSql = @StrSql + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
IF @YearEndMonth = 3
BEGIN
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '1st Quarter' + Char(39) + ' Where MonNo in (4,5,6)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '2nd Quarter' + Char(39) + ' Where MonNo in (7,8,9)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '3rd Quarter' + Char(39) + ' Where MonNo in (10,11,12)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '4th Quarter' + Char(39) + ' Where MonNo in (1,2,3)';
EXECUTE (@StrSql);
END
IF @YearEndMonth = 12
BEGIN
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '1st Quarter' + Char(39) + ' Where MonNo in (1,2,3)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '2nd Quarter' + Char(39) + ' Where MonNo in (4,5,6)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '3rd Quarter' + Char(39) + ' Where MonNo in (7,8,9)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtrName = ' + Char(39) + '4th Quarter' + Char(39) + ' Where MonNo in (10,11,12)';
EXECUTE (@StrSql);
END
SET @StrSql = ' Select QtrName As ' + Char(39) + 'Quarter' + Char(39) + ',Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by QtrName ';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART10' ---Hourly Sales for Today & Yesterday      
BEGIN
SET @STRSQL = 'CREATE TABLE [##TmpGraph' + @StrUserId + '] (TransDate DateTime,TimeStart Varchar(16),TimeEnd Varchar(16),Val2100 Money, Val1300 Money)';
EXECUTE (@StrSql);
---For Today      
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '09:00 AM' + Char(39) + ',' + Char(39) + '10:00 AM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '10:01 AM' + Char(39) + ',' + Char(39) + '11:00 AM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '11:01 AM' + Char(39) + ',' + Char(39) + '12:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '12:01 PM' + Char(39) + ',' + Char(39) + '13:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '13:01 PM' + Char(39) + ',' + Char(39) + '14:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '14:01 PM' + Char(39) + ',' + Char(39) + '15:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '15:01 PM' + Char(39) + ',' + Char(39) + '16:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '16:01 PM' + Char(39) + ',' + Char(39) + '17:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '17:01 PM' + Char(39) + ',' + Char(39) + '18:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '18:01 PM' + Char(39) + ',' + Char(39) + '19:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '19:01 PM' + Char(39) + ',' + Char(39) + '20:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '20:01 PM' + Char(39) + ',' + Char(39) + '21:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39) + ',' + Char(39) + '21:01 PM' + Char(39) + ',' + Char(39) + '22:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
--For Yesterday      
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '09:00 AM' + Char(39) + ',' + Char(39) + '10:00 AM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '10:01 AM' + Char(39) + ',' + Char(39) + '11:00 AM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '11:01 AM' + Char(39) + ',' + Char(39) + '12:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '12:01 PM' + Char(39) + ',' + Char(39) + '13:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '13:01 PM' + Char(39) + ',' + Char(39) + '14:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '14:01 PM' + Char(39) + ',' + Char(39) + '15:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '15:01 PM' + Char(39) + ',' + Char(39) + '16:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '16:01 PM' + Char(39) + ',' + Char(39) + '17:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '17:01 PM' + Char(39) + ',' + Char(39) + '18:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '18:01 PM' + Char(39) + ',' + Char(39) + '19:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '19:01 PM' + Char(39) + ',' + Char(39) + '20:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '20:01 PM' + Char(39) + ',' + Char(39) + '21:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] Values (' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ',' + Char(39) + '21:01 PM' + Char(39) + ',' + Char(39) + '22:00 PM' + Char(39) + ',0,0)';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Val2100=X.QtyVal From (Select a.TransDate,a.TimeStart,TimeEnd,' + @StrOptQtyVal;
SET @StrSql = @StrSql + ' FROM [##TmpGraph' + @StrUserId + '] A INNER JOIN StkTrnHdr B ON A.TransDate = B.DocDt INNER JOIN STKTRNDTLS C';
SET @StrSql = @StrSql + ' ON B.TRNTYPE = C.TRNTYPE AND B.TRNCTRLNO = C.TRNCTRLNO Inner Join ItemMaster D On C.StockNo = D.StockNo Where Convert(VarChar,B.DocTime,108) Between';
SET @StrSql = @StrSql + ' CONVERT(VARCHAR,Cast(A.TimeStart as datetime) ,108) and CONVERT(VARCHAR,cast(A.TimeEnd as datetime)' + '+' + Char(39) + '00:00:59' + Char(39) + ',108)';
SET @StrSql = @StrSql + ' and B.TrnType in (2100) And B.DocVoidInd <> 1 And B.DocDt Between ' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ' and ' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And D.Class1Cd +' + Char(39) + ':' + Char(39) + '+ D.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' Group By A.TransDate,A.TimeStart,A.TimeEnd) As X, [##TmpGraph' + @StrUserId + '] As Y';
SET @StrSql = @StrSql + ' Where X.TransDate = Y.TransDate And X.TimeStart = Y.TimeStart And X.TimeEnd = Y.TimeEnd';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Val1300=X.QtyVal From (Select a.TransDate,a.TimeStart,TimeEnd,' + @StrOptQtyVal;
SET @StrSql = @StrSql + ' FROM [##TmpGraph' + @StrUserId + '] A INNER JOIN StkTrnHdr B ON A.TransDate = B.DocDt INNER JOIN STKTRNDTLS C';
SET @StrSql = @StrSql + ' ON B.TRNTYPE = C.TRNTYPE AND B.TRNCTRLNO = C.TRNCTRLNO Inner Join ItemMaster D On C.StockNo = D.StockNo Where Convert(VarChar,B.DocTime,108) Between';
SET @StrSql = @StrSql + ' CONVERT(VARCHAR,Cast(A.TimeStart as datetime) ,108) and CONVERT(VARCHAR,cast(A.TimeEnd as datetime)' + '+' + Char(39) + '00:00:59' + Char(39) + ',108)';
SET @StrSql = @StrSql + ' and B.TrnType in (1300) And B.DocVoidInd <> 1 And B.DocDt Between ' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + Char(39) + ' and ' + Char(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + Char(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And D.Class1Cd +' + Char(39) + ':' + Char(39) + '+ D.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' Group By A.TransDate,A.TimeStart,A.TimeEnd) As X, [##TmpGraph' + @StrUserId + ']  As Y';
SET @StrSql = @StrSql + ' Where X.TransDate = Y.TransDate And X.TimeStart = Y.TimeStart And X.TimeEnd = Y.TimeEnd';
EXECUTE (@StrSql);
SET @StrSql = 'SELECT A.TM As Time,SUM(A.TODAY) AS Today,SUM(A.YESTERDAY) AS Yesterday Into ' + @TmpTable + ' FROM';
SET @StrSql = @StrSql + ' (SELECT SUBSTRING(TimeStart,1,2)+' + CHAR(39) + '-' + CHAR(39) + '+SUBSTRING(TimeEnd,1,2) Tm,(SELECT Case TransDate WHEN ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39) + ' Then SUM(Val2100-Val1300) ELSE 0 END)';
SET @StrSql = @StrSql + ' AS TODAY,(SELECT Case TransDate WHEN ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + CHAR(39) + ' Then SUM(Val2100-Val1300) ELSE 0 END) AS YESTERDAY';
SET @StrSql = @StrSql + ' FROM [##TmpGraph' + @StrUserId + '] GROUP BY TransDate,SUBSTRING(TimeStart,1,2)+' + CHAR(39) + '-' + CHAR(39) + '+SUBSTRING(TimeEnd,1,2)) AS A GROUP BY A.TM';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART11' OR @ChartType = 'CHART14' ---Top 10 Class1Cd For the Financial Year      
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,B.Class1cd,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype,B.Class1cd ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SELECT @ColCaption = Txt
FROM   SYSPARAM
WHERE  PARAMCODE LIKE 'ItemClass1Cap';
IF @ChartType = 'CHART11'
BEGIN
SET @StrSql = ' Select Top 10 Class1cd AS [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Class1Cd Order By Sum(QtyVal) Desc ';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART14'
BEGIN
SET @StrSql = ' Select Top 10 Class1cd AS [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Class1Cd Having Sum(QtyVal) > 0 Order By Sum(QtyVal) Asc ';
EXECUTE (@StrSql);
END
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART12' OR @ChartType = 'CHART15' ---Top 10 Class2Cd For the Financial Year      
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,B.Class2cd,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype,B.Class2cd ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SELECT @ColCaption = Txt FROM SYSPARAM WHERE PARAMCODE LIKE 'ItemClass2Cap';
IF @ChartType = 'CHART12'
BEGIN
SET @StrSql = ' Select Top 10 Class2cd AS [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Class2Cd Order By Sum(QtyVal) Desc ';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART15'
BEGIN
SET @StrSql = ' Select Top 10 Class2cd AS [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Class2Cd Having Sum(QtyVal) > 0 Order By Sum(QtyVal) Asc ';
EXECUTE (@StrSql);
END
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART13' OR @ChartType = 'CHART16' ---Top/Least 10 SubClass1Cd For the Financial Year      
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,B.SubClass1cd,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype,B.SubClass1cd ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SELECT @ColCaption = Txt FROM SYSPARAM WHERE  PARAMCODE LIKE 'ItemSubClass1Cap';
IF @ChartType = 'CHART13'
BEGIN
SET @StrSql = ' Select Top 10 SubClass1cd As [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by SubClass1Cd Order By Sum(QtyVal) Desc ';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART16'
BEGIN
SET @StrSql = ' Select Top 10 SubClass1cd As [' + @ColCaption + '],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by SubClass1Cd Having Sum(QtyVal) > 0 Order By Sum(QtyVal) Asc ';
EXECUTE (@StrSql);
END
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART17' ---'Sales Person wise Sales    
BEGIN
SET @StrSql = 'SELECT B.SalesPersonCd,A.TrnType,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A INNER JOIN SALETRNHDR AS B ON A.TRNTYPE = B.SALETRNTYPE AND A.TRNCTRLNO = B.SALETRNCTRLNO ';
SET @StrSql = @StrSql + ' Inner Join ItemMaster C On A.StockNo = C.Stockno WHERE A.TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.DocDt Between ' + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39);
SET @StrSql = @StrSql + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And C.Class1Cd +' + Char(39) + ':' + Char(39) + '+ C.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP By B.SalesPersonCd,A.Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Top 10 SalesPersonCd As [Sales Person],Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group By SalesPersonCd Order By Sum(QtyVal) Desc ';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART18' ---'Payment Mode wise Details    
BEGIN
--SET @StrSql = 'SELECT (Select Case PayModeType When 1 Then ' + Char(39) + 'Cash' + Char(39) + ' When 2 Then ' + Char(39) + 'Credit Card' + Char(39) + ' When 4 Then ' + Char(39) + 'Discount Card' + Char(39) + ' When 5 Then ' + Char(39) + 'Gift Coupon' + Char(39) + '';
--SET @StrSql = @StrSql + ' When 6 Then ' + Char(39) + 'Cheque' + Char(39) + ' When 7 Then ' + Char(39) + 'Advance Receipt' + Char(39) + ' When 8 Then ' + Char(39) + 'Credit Note' + Char(39) + ' End) As [Payment Mode],Sum(LocCurrNetAmt) Amount Into ' + @TmpTable;
--SET @StrSql = @StrSql + ' FROM POSCASHTRN WHERE DOCDT Between ' + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39);
--SET @StrSql = @StrSql + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
--SET @StrSql = @StrSql + ' Group By PAYMODETYPE ORDER BY PAYMODETYPE ';
SET @StrSql = 'SELECT Convert(Varchar(32),PayModeType) As [Payment Mode],Sum(LocCurrNetAmt) Amount Into ' + @TmpTable;
SET @StrSql = @StrSql + ' FROM POSCASHTRN WHERE DOCDT Between ' + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39);
SET @StrSql = @StrSql + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
SET @StrSql = @StrSql + ' Group By PAYMODETYPE ORDER BY PAYMODETYPE ';
EXECUTE (@StrSql);
SET @StrSql = 'Update ' + @TmpTable + ' Set [Payment Mode] = PayModeTypeDesc From PayModeConfig Where PayModeType =[Payment Mode]';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART19' ---'Transaction Wise Details    
BEGIN
SET @StrSql = 'SELECT Descr,' + @StrOptQtyVal + ' Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,Genlookup B,ItemMaster C WHERE A.DocEntVoidInd <> 1 And DOCDT Between ' + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39);
SET @StrSql = @StrSql + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And C.Class1Cd +' + Char(39) + ':' + Char(39) + '+ C.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' And A.StockNo = C.Stockno And CODE = CONVERT(VARCHAR,TRNTYPE) And Recid = 101 and DocEntVoidind <> 1 GROUP BY Descr ';
EXECUTE (@StrSql);
SET @StrSql = ' Select Descr As [Transaction Name],QtyVal As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART20'
OR @ChartType = 'CHART21' ---Gross Margin Monthly /Yearly     
BEGIN
SET @StrSql = 'SELECT Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,TrnType,Sum(DocEntNetValue)-(Sum(DocEntTax)+Sum(stkupdtValueOut)) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Month(DOCDT),YEAR(DocDt),Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
IF @ChartType = 'CHART20'
BEGIN
SET @StrSql = ' Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) As Month,Sum(Value) As Value Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + '+ MonNo + ' + Char(39) + '-01' + Char(39) + ') Order By Convert(datetime,Yr +' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + Char(39) + ')';
END
IF @ChartType = 'CHART21'
BEGIN
SET @StrSql = 'Select ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39) + ' As Year,Sum(Value) As Value Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
END
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART22' --- Top 20 Discount Details     
BEGIN
SET @StrSql = 'SELECT TrnType,Convert(Varchar(32),PromoCode) As PromoCode ,SUM(DocEntDisc) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) AND DocEntDisc > 0 And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype,PromoCode ';
EXECUTE (@StrSql);
SET @StrSql = 'Insert Into [##TmpGraph' + @StrUserId + '] SELECT A.TrnType,C.PromoCode,SUM(DocEntTotDisc-DocEntDisc) As Value ';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B,StkTrnHdr C WHERE A.TRNTYPE In(2100,1300) AND C.PROMOCODE > ' + CHAR(39) + CHAR(39) + ' And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo ';
SET @StrSql = @StrSql + ' AND A.TRNTYPE = C.TRNTYPE AND A.TRNCTRLNO = C.TRNCTRLNO And A.DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY A.Trntype,C.PromoCode ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set PromoCode = SubString(SalesPromoDesc,1,32) From PromoMnHeader Where PromoCode =SalesPromoCode';
EXECUTE (@StrSql);
SET @StrSql = ' Select Top 20 PromoCode as [Discount Name],Sum(Value) As Value Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group by PromoCode Order By Value Desc';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART23' ---Year wise Sales  
BEGIN
SET @ShoperDate = DateAdd(Year, 1, @FinYearDate);
SET @ShoperDate = DateAdd(Day, -1, @ShoperDate);
SET @StrSql = 'Create Table [##TmpGraph' + @StrUserId + '] (Yr Varchar(16),TrnType Int,QtyVal Money)';
EXECUTE (@StrSql);
SET NOCOUNT OFF;
SET @intFlag = 1;
WHILE (@intFlag >= 0)
BEGIN
SET @StrSql = ' Insert Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' SELECT ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39) + ' As Yr,TrnType,' + @StrOptQtyVal;
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
IF @@RowCount = 0
BEGIN
SET @intFlag = 0;
END
IF @intFlag = 0
BREAK;
SET @ShoperDate = DATEADD(Year, -1, @ShoperDate);
SET @FinYearDate = DATEADD(Year, -1, @FinYearDate);
END
SET NOCOUNT ON;
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Select Yr As Year,Sum(QtyVal) As ' + @QtyValCap + ' Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' Group By Yr Order By Yr';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END
IF @ChartType = 'CHART24' ---Monthly Comparision (Between Financial Year)        
BEGIN  
SET @StrSql = CONVERT (VARCHAR, Year(@FinYearDate) - 1) + '-' + CONVERT (VARCHAR, @YearEndMonth) + '-01';  
SET @FinYearDate = CONVERT (VARCHAR (10), @StrSQl, 127);  
SET @StrSql = 'SELECT TrnType,Convert(Varchar,Month(DocDt)) As MonNo,Convert(Varchar,Year(DocDt)) As Yr,' + @StrOptQtyVal + ',' + 'Convert(Varchar(16),Null) As FYear Into [##TmpGraph' + @StrUserId + ']';  
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';  
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);  
IF @IntClass12FltrCnt > 0  
BEGIN  
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';  
END  
SET @StrSql = @StrSql + ' GROUP BY Trntype,Month(DocDt),Year(DocDt) ';  
EXECUTE (@StrSql);  
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set QtyVal = -QtyVal Where Trntype = 1300';  
EXECUTE (@StrSql);  
IF @YearEndMonth > 1  
BEGIN  
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Fyear = ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate)) + '-';  
SET @StrSql = @StrSql + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39) + ' Where yr = ' + CONVERT (VARCHAR, Year(@FinYearDate)) + ' Or (Yr = ' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + ' And Monno < 4) ';  
EXECUTE (@StrSql);  
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Fyear = ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 2) + Char(39) + ' Where Fyear is null ';  
EXECUTE (@StrSql);  
END  
SET @StrSql = 'SELECT Mname As Month,SUM([' + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + ']) AS ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39);  
SET @StrSql = @StrSql + ' ,SUM([' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 2) + ']) AS  ' + Char(39);  
SET @StrSql = @StrSql + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 2) + Char(39) + ' Into ' + @TmpTable + ' FROM ';  
SET @StrSql = @StrSql + ' (Select Substring(DateName(Month,Convert(Datetime,Yr + ' + Char(39) + '-' + Char(39) + ' + MonNo + ' + Char(39) + '-01' + CHAR(39) + ')),1,3) + ' + Char(39) + ' ' + Char(39) + ' As Mname,MonNo,';  
SET @StrSql = @StrSql + ' (SELECT CASE FYEAR WHEN ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39) + ' THEN QTYVAL ELSE 0 END) AS ' + Char(39);  
SET @StrSql = @StrSql + CONVERT (VARCHAR, Year(@FinYearDate)) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + Char(39) + ',';  
SET @StrSql = @StrSql + ' (SELECT CASE FYEAR WHEN ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 2) + Char(39);  
SET @StrSql = @StrSql + ' THEN QTYVAL ELSE 0 END) AS ' + Char(39) + CONVERT (VARCHAR, Year(@FinYearDate) + 1) + '-' + CONVERT (VARCHAR, Year(@FinYearDate) + 2) + Char(39);  
SET @StrSql = @StrSql + ' From [##TmpGraph' + @StrUserId + ']) AS X GROUP BY Mname,MonNo ORDER BY Convert(Int,X.MonNo)';  
EXECUTE (@StrSql);  
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';  
EXECUTE (@StrSql);  
END  
IF @ChartType = 'CHART99' ---Company Summary Info - Current Financial Year  
BEGIN
SET @StrSql = 'SELECT TrnType,Sum(DocQty) AS Qty,Sum(DocEntNetValue) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Qty = -Qty,Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = 'SELECT Identity(Int,1,1) As Slno,Convert(Varchar(50),' + Char(39) + 'Current Year Sales' + Char(39) + ')  As Descr,Sum(Qty) As Qty,';
SET @StrSql = @StrSql + 'Sum(Value) As Value Into ' + @TmpTable + ' From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = CONVERT (VARCHAR, Year(@FinYearDate) - 1) + '-' + CONVERT (VARCHAR, Month(@FinYearDate)) + '-01';
SET @FinYearDate = CONVERT (VARCHAR (10), @StrSQl, 127);
SET @StrSql = 'SELECT TrnType,Sum(DocQty) AS Qty,Sum(DocEntNetValue) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @FinYearDate, 127) + CHAR(39) + ' And ' + CHAR(39) + CONVERT (VARCHAR (10), DateAdd(Year, 1, @FinYearDate) - 1, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Qty = -Qty,Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Last Year Sales' + Char(39) + ' As Descr,Sum(Qty) As Qty,Sum(Value) As Value From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'SELECT TrnType,Sum(DocQty) AS Qty,Sum(DocEntNetValue) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt Between ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR, YEAR(@ShoperDate)) + '-' + CONVERT (VARCHAR, MONTH(@ShoperDate)) + '-01' + CHAR(39) + ' And ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Qty = -Qty,Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Current Month Sales' + Char(39) + ' As Descr,Sum(Qty) As Qty,Sum(Value) As Value From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
----Today Sales 
SET @StrSql = 'SELECT TrnType,Sum(DocQty) AS Qty,Sum(DocEntNetValue) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt = ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Qty = -Qty,Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Current Day Sales' + Char(39) + ' As Descr,Sum(Qty) As Qty,Sum(Value) As Value From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
-----Yesterday Sales
SET @StrSql = 'SELECT TrnType,Sum(DocQty) AS Qty,Sum(DocEntNetValue) As Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNDTLS A,ItemMaster B WHERE TRNTYPE In(2100,1300) And A.DocEntVoidInd <> 1 And A.StockNo = B.StockNo And DocDt = ';
SET @StrSql = @StrSql + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate - 1, 127) + CHAR(39);
IF @IntClass12FltrCnt > 0
BEGIN
SET @StrSql = @StrSql + ' And B.Class1Cd +' + Char(39) + ':' + Char(39) + '+ B.Class2cd In (Select Class1cd + ' + Char(39) + ':' + Char(39) + ' +Class2cd From [##TmpGraphClass12' + @StrUserId + '])';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Qty = -Qty,Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Yesterday Sales' + Char(39) + ' As Descr,Sum(Qty) As Qty,Sum(Value) As Value From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
----Current Stock 
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Current Stock' + Char(39) + ' As Descr,Sum(CurBalQty) As Qty,Sum(CurBalVal) As Value ';
SET @StrSql = @StrSql + ' From StockMaster';
EXECUTE (@StrSql);
----Payment Details 
--SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) ';
--SET @StrSql = @StrSql + ' SELECT (Select Case PayModeType When 1 Then ' + Char(39) + 'Cash (Today)' + Char(39) + ' When 2 Then ' + Char(39) + 'Credit Card (Today)' + Char(39) + ' When 4 Then ';
--SET @StrSql = @StrSql + Char(39) + 'Discount Card (Today)' + Char(39) + ' When 5 Then ' + Char(39) + 'Gift Coupon (Today)' + Char(39) + '';
--SET @StrSql = @StrSql + ' When 6 Then ' + Char(39) + 'Cheque (Today)' + Char(39) + ' When 7 Then ' + Char(39) + 'Advance Receipt (Today)';
--SET @StrSql = @StrSql + Char(39) + ' When 8 Then ' + Char(39) + 'Credit Note (Today)' + Char(39) + ' End) As [Payment Mode],Null,Sum(LocCurrNetAmt-Isnull(TotValUsed,0)) As Amount ';
--SET @StrSql = @StrSql + ' FROM POSCASHTRN WHERE DOCDT = ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39) + '';
SET @StrSql = ' SELECT Convert(Varchar(50),PayModeType) As [Payment Mode],Null As Qty,Sum(LocCurrNetAmt-Isnull(TotValUsed,0)) As Amount ';
SET @StrSql = @StrSql + ' Into [##TmpGraph' + @StrUserId + '] FROM POSCASHTRN WHERE DOCDT = ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39) + '';
IF @UserWt <> 9999
BEGIN
SET @StrSql = @StrSql + ' And CashierID = ' + Char(39) + @StrUserId + Char(39) + '';
END
SET @StrSql = @StrSql + ' Group By PAYMODETYPE ORDER BY PAYMODETYPE ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set [Payment Mode] = PayModeTypeDesc + ''(Today)'' From PayModeConfig Where PayModeType =[Payment Mode]';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT [Payment Mode],Qty,Amount From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
----Discount For the Day 
SET @StrSql = 'SELECT TrnType,Sum(TotDocDisc) AS Value Into [##TmpGraph' + @StrUserId + ']';
SET @StrSql = @StrSql + ' FROM STKTRNHDR WHERE TRNTYPE In(2100,1300) And DocVoidInd <> 1 And ';
SET @StrSql = @StrSql + ' DocDt = ' + CHAR(39) + CONVERT (VARCHAR (10), @ShoperDate, 127) + CHAR(39);
IF @UserWt <> 9999
BEGIN
SET @StrSql = @StrSql + ' And VaUid = ' + Char(39) + @StrUserId + Char(39) + '';
END
SET @StrSql = @StrSql + ' GROUP BY Trntype ';
EXECUTE (@StrSql);
SET @StrSql = 'Update [##TmpGraph' + @StrUserId + '] Set Value = -Value Where Trntype = 1300';
EXECUTE (@StrSql);
SET @StrSql = ' Insert Into ' + @TmpTable + '(Descr,Qty,Value) SELECT ' + Char(39) + 'Total Discount (Today)' + Char(39) + ' As Descr,Null As Qty,Sum(Value) As Value From [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
SET @StrSql = 'Drop Table [##TmpGraph' + @StrUserId + ']';
EXECUTE (@StrSql);
END