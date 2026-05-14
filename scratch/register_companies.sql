-- ============================================================
-- PrimeSetu - Shoper9-Based Retail OS
-- Zero Cloud . Sovereign . AI-Governed
-- ============================================================
-- System Architect   :  Jawahar R. M.
-- Organisation       :  AITDL Network
-- Project            :  PrimeSetu
-- (c) 2026 - All Rights Reserved
-- "Memory, Not Code."
-- ============================================================

USE [tspsysdb9]
GO

-- Cleanup existing entries if they were partially added
DELETE FROM vaCompany WHERE CompCode IN ('X01', 'WH1');
GO

-- Insert X01 (Nexus Mall Seawood Store)
INSERT INTO [vaCompany] (
    [CompCode], [Nm], [Address], [CompWght], [DbName], [DbPassWd], [DbPath], [DbProvider], [DbType], [DbServer], [DbUserName], 
    [DbShareDir], [DbInDir], [DbOutDir], [NdCreateAllowed], [NdWiseNumbPresent], [MaintNdWiseDevice], [EnvironmentType], [Databaseversion], [CompanyActive], [checkupdate],
    [DbPath1], [DbName1], [DbPasswd1], [DbProvider1], [DbType1], [DbServer1], [DbUserName1]
)
SELECT 
    'X01', 'Nexus Mall Seawood Store', Address, CompWght, 'SHOPER9X01', DbPassWd, DbPath, DbProvider, DbType, DbServer, DbUserName, 
    DbShareDir, DbInDir, DbOutDir, NdCreateAllowed, NdWiseNumbPresent, MaintNdWiseDevice, EnvironmentType, Databaseversion, CompanyActive, checkupdate,
    DbPath1, DbName1, DbPasswd1, DbProvider1, DbType1, DbServer1, DbUserName1
FROM vaCompany WHERE CompCode = 'CSW';
GO

-- Insert WH1 (Nexus Mall Seawood Warehouse)
INSERT INTO [vaCompany] (
    [CompCode], [Nm], [Address], [CompWght], [DbName], [DbPassWd], [DbPath], [DbProvider], [DbType], [DbServer], [DbUserName], 
    [DbShareDir], [DbInDir], [DbOutDir], [NdCreateAllowed], [NdWiseNumbPresent], [MaintNdWiseDevice], [EnvironmentType], [Databaseversion], [CompanyActive], [checkupdate],
    [DbPath1], [DbName1], [DbPasswd1], [DbProvider1], [DbType1], [DbServer1], [DbUserName1]
)
SELECT 
    'WH1', 'Nexus Mall Seawood Warehouse', Address, CompWght, 'SHOPER9WH1', DbPassWd, DbPath, DbProvider, DbType, DbServer, DbUserName, 
    DbShareDir, DbInDir, DbOutDir, NdCreateAllowed, NdWiseNumbPresent, MaintNdWiseDevice, EnvironmentType, Databaseversion, CompanyActive, checkupdate,
    DbPath1, DbName1, DbPasswd1, DbProvider1, DbType1, DbServer1, DbUserName1
FROM vaCompany WHERE CompCode = 'CSW';
GO

-- Final verification
SELECT CompCode, Nm, DbName, DbServer FROM vaCompany;
GO
