/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: add-api-endpoint
 * ============================================================ */

# SKILL: Add a FastAPI Endpoint (Phase 2)

Read this file completely before writing any code.

---

## When to use this skill

Any time a new API route is needed in `backend/`. This skill covers the full
chain: Pydantic schema → SQLAlchemy model → router → error handling → test cases.

---

## Step 1 — Define the Pydantic schema first

File: `backend/app/schemas/<domain>.py`

```python
# backend/app/schemas/billing.py

from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal
from datetime import datetime

class SaleLineItem(BaseModel):
    product_id: UUID
    qty: int = Field(gt=0)
    unit_price_paise: int = Field(gt=0, description="Price in paise. Never float.")
    gst_rate: int = Field(ge=0, description="GST % as integer: 0,5,12,18,28 only")
    hsn_code: str

class CreateSaleRequest(BaseModel):
    store_id: UUID          # derived from auth — NEVER accept from client body
    cashier_id: UUID
    items: list[SaleLineItem]
    payment_mode: str       # "cash" | "upi" | "card"

class SaleResponse(BaseModel):
    sale_id: UUID
    invoice_no: str
    total_paise: int
    gst_paise: int
    created_at: datetime

    model_config = {"from_attributes": True}
```

**Rules:**
- Money is always `int` (paise). Never `float` or `Decimal` in schemas.
- `store_id` must come from the JWT auth context — never from the request body.
- GST rates are integers: 0, 5, 12, 18, 28. Reject anything else.

---

## Step 2 — Check/create the SQLAlchemy model

File: `backend/app/models/<domain>.py`

```python
# backend/app/models/billing.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
import uuid
from backend.app.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    cashier_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    invoice_no = Column(String, nullable=False, unique=True)
    total_paise = Column(Integer, nullable=False)
    gst_paise = Column(Integer, nullable=False)
    payment_mode = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default="now()")
```

---

## Step 3 — Write the router

File: `backend/app/routers/<domain>.py`

```python
# backend/app/routers/billing.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.auth import get_current_store_context
from backend.app.schemas.billing import CreateSaleRequest, SaleResponse
from backend.app.models.billing import Sale

router = APIRouter(prefix="/billing", tags=["billing"])

@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def create_sale(
    payload: CreateSaleRequest,
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new sale. store_id is ALWAYS derived from JWT — never trusted from body.
    """
    # Override any client-supplied store_id with the one from JWT
    safe_store_id = store_ctx["store_id"]

    # Validate GST rates
    valid_gst_rates = {0, 5, 12, 18, 28}
    for item in payload.items:
        if item.gst_rate not in valid_gst_rates:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid GST rate: {item.gst_rate}. Must be one of {valid_gst_rates}"
            )

    # Compute totals in paise (integer math only)
    subtotal_paise = sum(i.unit_price_paise * i.qty for i in payload.items)
    gst_paise = sum(
        (i.unit_price_paise * i.qty * i.gst_rate) // 100
        for i in payload.items
    )
    total_paise = subtotal_paise + gst_paise

    sale = Sale(
        store_id=safe_store_id,
        cashier_id=payload.cashier_id,
        total_paise=total_paise,
        gst_paise=gst_paise,
        payment_mode=payload.payment_mode,
        invoice_no=await generate_invoice_no(db, safe_store_id),
    )

    db.add(sale)
    try:
        await db.commit()
        await db.refresh(sale)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"[PrimeSetu] Mutation failed: {str(e)}"
        )

    return sale
```

---

## Step 4 — Register the router in main.py

```python
# backend/app/main.py
from backend.app.routers import billing

app.include_router(billing.router, prefix="/api/v1")
```

---

## Step 5 — Write the React Query hook (frontend)

File: `frontend/src/hooks/use<Domain>.ts`

```typescript
// frontend/src/hooks/useBilling.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

interface CreateSalePayload {
  items: SaleLineItem[]
  paymentMode: 'cash' | 'upi' | 'card'
  // store_id is added server-side from JWT — do NOT include here
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSalePayload) =>
      apiClient.post('/billing/sales', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (error) => {
      console.error('[PrimeSetu] Sale creation failed:', error)
    },
  })
}
```

**Rules:**
- All API calls go through hooks — never `fetch()` directly in a component
- `store_id` is NEVER sent from the frontend
- Always handle `onError`

---

## Checklist before committing

- [ ] Pydantic schema defined with `store_id` derived from JWT
- [ ] Money values are `int` (paise), never float
- [ ] GST rate validated against `{0, 5, 12, 18, 28}`
- [ ] Router error handling uses `HTTPException` with descriptive messages
- [ ] Router registered in `main.py`
- [ ] React Query hook written for frontend consumption
- [ ] RLS policy confirmed active on any table touched
- [ ] Test cases written (happy path + invalid GST rate + auth failure)
- [ ] File signature present
- [ ] `npm run build` passes (if frontend files changed)
