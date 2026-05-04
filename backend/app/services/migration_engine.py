# ============================================================
# SMRITI-OS - SOVEREIGN MIGRATION ENGINE
# Transfers data from Legacy MSSQL to Sovereign PostgreSQL
# ============================================================

import pyodbc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import engine
from app.models.sovereign import (
    SmritiAD, SmritiParam, SmritiLookup, SmritiLookupMap,
    SmritiStaff, SmritiPayMode
)
import asyncio
from datetime import datetime

class MigrationEngine:
    def __init__(self, mssql_db: str = "Shoper9X01"):
        self.mssql_conn_str = f'DRIVER={{SQL Server}};SERVER=AITDL;DATABASE={mssql_db};UID=sa;PWD=netmanthan@123'

    def fetch_from_mssql(self, query: str):
        conn = pyodbc.connect(self.mssql_conn_str)
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results

    async def migrate_params(self):
        print("Migrating SysParam -> SMRITI_PARAM...")
        data = self.fetch_from_mssql("SELECT ParamCode, Descr, Txt, Boolean, Intg FROM SysParam")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    param = SmritiParam(
                        param_code=row['ParamCode'],
                        descr=row['Descr'],
                        value_txt=row['Txt'],
                        value_bool=bool(row['Boolean']),
                        value_int=row['Intg'] or 0
                    )
                    await session.merge(param)
            await session.commit()
        print(f"Synced {len(data)} parameters.")

    async def migrate_ad(self):
        print("Migrating AcceptDisplayDtls -> SMRITI_AD...")
        data = self.fetch_from_mssql("SELECT TrnType, [Index], AcptCap, DispCap, AcptVisible, AcptPos, ColumnName, AcptDataType, AcptWidth FROM AcceptDisplayDtls")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    ad = SmritiAD(
                        trntype=row['TrnType'],
                        index=row['Index'],
                        acptcap=row['AcptCap'],
                        dispcap=row['DispCap'],
                        visible=bool(row['AcptVisible']),
                        position=row['AcptPos'],
                        column_name=row['ColumnName'],
                        data_type=row['AcptDataType'],
                        width=row['AcptWidth']
                    )
                    await session.merge(ad)
            await session.commit()
        print(f"Synced {len(data)} layout definitions.")

    async def migrate_lookup_map(self):
        print("Migrating GenlookupExtd -> SMRITI_LOOKUP_MAP...")
        data = self.fetch_from_mssql("SELECT Recid, Category, RecType FROM GenlookupExtd")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    lmap = SmritiLookupMap(
                        rec_id=row['Recid'],
                        category=row['Category'],
                        rec_type=row['RecType']
                    )
                    await session.merge(lmap)
            await session.commit()
        print(f"Synced {len(data)} lookup categories.")

    async def migrate_lookups(self):
        print("Migrating GenLookUp -> SMRITI_LOOKUP...")
        # Note: Genlookup is large, we'll sync the core codes
        data = self.fetch_from_mssql("SELECT RecID, Code, Descr FROM GenLookUp")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    lookup = SmritiLookup(
                        rec_id=row['RecID'],
                        code=row['Code'],
                        descr=row['Descr']
                    )
                    await session.merge(lookup)
            await session.commit()
        print(f"Synced {len(data)} lookup master codes.")

    async def migrate_test_items(self, limit: int = 10, min_qty: float = 50.0, max_qty: float = 100.0):
        print(f"Migrating {limit} Test Items (Stock: {min_qty}-{max_qty})...")
        query = f"""
            SELECT TOP {limit} 
                i.StockNo, i.ItemDesc, i.Class1Cd, i.Class2Cd, 
                i.SubClass1Cd, i.SubClass2Cd, i.Retail_Price,
                i.AnalCode32, s.CurBalQty
            FROM ItemMaster i
            JOIN StockMaster s ON i.StockNo = s.StockNo
            WHERE s.CurBalQty BETWEEN {min_qty} AND {max_qty}
            AND i.IsBillable = 1
        """
        data = self.fetch_from_mssql(query)
        
        from app.models.sovereign import SmritiItem, SmritiStock
        from decimal import Decimal

        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    # Sync Item
                    item = SmritiItem(
                        sku=row['StockNo'],
                        name=row['ItemDesc'],
                        class1=row['Class1Cd'],
                        class2=row['Class2Cd'],
                        subclass1=row['SubClass1Cd'],
                        subclass2=row['SubClass2Cd'],
                        mrp=Decimal(str(row['Retail_Price'])),
                        cost_price=Decimal(str(row['Retail_Price'])),
                        hsn_code=row['AnalCode32']
                    )
                    await session.merge(item)

                    # Sync Stock
                    stock = SmritiStock(
                        sku=row['StockNo'],
                        store_id="GKP", # Defaulting to GKP context
                        on_hand=Decimal(str(row['CurBalQty']))
                    )
                    await session.merge(stock)
            await session.commit()
        print(f"Synced {len(data)} test items and their stock balances.")

    async def migrate_staff(self):
        print("Migrating Personnel -> SMRITI_STAFF...")
        data = self.fetch_from_mssql("SELECT Code, Nm FROM Personnel WHERE ActiveFlag = 1")
        
        async with AsyncSession(engine) as session:
            async with session.begin():
                for row in data:
                    staff = SmritiStaff(
                        code=row['Code'],
                        name=row['Nm'],
                        role='SALESMAN'
                    )
                    await session.merge(staff)
            await session.commit()
        print(f"Synced {len(data)} sales personnel.")

# To be executed via a standalone script for now
