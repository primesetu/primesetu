from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.legacy_s9 import Class12combo

router = APIRouter()

@router.get("/")
async def get_classifications(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(100, le=1000),
    offset: int = 0
):
    try:
        stmt = select(Class12combo).limit(limit).offset(offset)
        result = await db.execute(stmt)
        records = result.scalars().all()
        return {"data": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_classification(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    try:
        class1cd = payload.get("class1cd")
        class2cd = payload.get("class2cd")
        
        if not class1cd or not class2cd:
            raise HTTPException(status_code=400, detail="class1cd and class2cd are required")
            
        new_record = Class12combo(
            class1cd=class1cd,
            class2cd=class2cd,
            billable=payload.get("billable", True),
            sizegroup=payload.get("sizegroup"),
            retailmarkup=payload.get("retailmarkup", 0.0),
            dealermarkup=payload.get("dealermarkup", 0.0),
            prefvendorid=payload.get("prefvendorid"),
            prodtaxtype=payload.get("prodtaxtype"),
            superclass1=payload.get("superclass1"),
            superclass2=payload.get("superclass2"),
            isservicecombo=payload.get("isservicecombo", False),
            isconsignmentitem=payload.get("isconsignmentitem", False),
            dateinsert=datetime.now(),
            lastupdateddate=datetime.now(),
            batchapplicable=payload.get("batchapplicable", 0),
            batchmfgformat=payload.get("batchmfgformat", 0),
            batchexpformat=payload.get("batchexpformat", 0),
            batchshelfapp=payload.get("batchshelfapp", 0),
            batchpriceapp=payload.get("batchpriceapp", 0),
            stopsalesbefexpdays=payload.get("stopsalesbefexpdays", 0)
        )
        db.add(new_record)
        await db.commit()
        await db.refresh(new_record)
        return {"status": "success", "data": new_record}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{class1cd}/{class2cd}")
async def update_classification(
    class1cd: str,
    class2cd: str,
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    try:
        stmt = select(Class12combo).where(
            Class12combo.class1cd == class1cd,
            Class12combo.class2cd == class2cd
        )
        result = await db.execute(stmt)
        record = result.scalars().first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Classification not found")
            
        # Update allowed fields
        updateable_fields = [
            "billable", "sizegroup", "retailmarkup", "dealermarkup",
            "prefvendorid", "prodtaxtype", "superclass1", "superclass2",
            "isservicecombo", "isconsignmentitem", "batchapplicable",
            "batchmfgformat", "batchexpformat", "batchshelfapp",
            "batchpriceapp", "stopsalesbefexpdays"
        ]
        
        for field in updateable_fields:
            if field in payload:
                setattr(record, field, payload[field])
                
        record.lastupdateddate = datetime.now()
        
        await db.commit()
        await db.refresh(record)
        return {"status": "success", "data": record}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
