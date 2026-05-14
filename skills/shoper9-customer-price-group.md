/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-customer-price-group
 * ============================================================ */

# SKILL: Shoper9 Customer Price Groups — Full Parity

Read this file completely before writing any price group code.

---

## What Shoper9 Customer Price Groups does (parity target)

Price groups allow different customers to see different prices for the same item.
This is one of Shoper9's most-used features in apparel retail (trade, wholesale, staff discounts).

| Shoper9 Feature | PrimeSetu | Notes |
|----------------|-----------|-------|
| Named price groups | ✅ Required | "Retail", "Wholesale", "Staff", "VIP" etc. |
| Price group → price level mapping | ✅ Required | Each group uses one of the item_price_levels |
| Customer assigned to price group | ✅ Required | FK on partners table |
| Billing auto-resolves price from group | ✅ Required | Critical path in billing terminal |
| Fallback to MRP if no group | ✅ Required | Default behaviour |
| Discount % override per group | ✅ Required | Alternatively: fixed % off MRP |
| Time-bound price groups | ⏳ Phase 5 | Seasonal promotions |

---

## DB Schema

```sql
/* ============================================================
 * PrimeSetu — Customer Price Groups Schema
 * ============================================================ */

CREATE TABLE IF NOT EXISTS public.customer_price_groups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,              -- "Wholesale", "Staff", "VIP"
    code                TEXT NOT NULL,              -- short code, e.g. "WHL", "STF", "VIP"
    price_level         TEXT CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    discount_pct        NUMERIC(5,2) DEFAULT 0,     -- flat % off MRP, e.g. 10.00 = 10% off
    -- priority: if price_level is set, use that. if discount_pct > 0, apply % off MRP.
    -- price_level takes precedence over discount_pct.
    is_taxable          BOOLEAN NOT NULL DEFAULT true,  -- some groups may be tax-exempt
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

ALTER TABLE public.customer_price_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.customer_price_groups
    FOR ALL USING (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

CREATE INDEX idx_price_groups_store ON public.customer_price_groups(store_id);
```

---

## Price resolution logic — the billing critical path

This function is called every time a line item is added to the billing cart.
It must be fast (in-memory once data is loaded) and deterministic.

```python
# backend/app/services/pricing.py

from uuid import UUID

async def resolve_item_price(
    item_id: UUID,
    price_group_id: UUID | None,
    db: AsyncSession,
    store_id: UUID,
) -> int:
    """
    Resolve the correct price for an item given a customer's price group.
    Returns price in PAISE (integer). Never float.

    Resolution order:
    1. If price_group has a price_level → look up item_price_levels for that level
    2. If price_group has discount_pct → apply % off MRP
    3. If no price_group or fallback → return MRP

    Always returns MRP if no specific price is found (never returns 0).
    """

    if price_group_id is None:
        # Walk-in customer or no group → MRP
        item = await get_item_mrp(db, item_id, store_id)
        return item.mrp_paise

    pg = await get_price_group(db, price_group_id, store_id)
    item = await get_item_with_prices(db, item_id, store_id)

    # Strategy 1: named price level
    if pg.price_level:
        level_price = next(
            (p.price_paise for p in item.price_levels if p.price_level == pg.price_level),
            None
        )
        if level_price:
            return level_price

    # Strategy 2: discount % off MRP
    if pg.discount_pct and pg.discount_pct > 0:
        discount_paise = int(item.mrp_paise * pg.discount_pct / 100)
        return item.mrp_paise - discount_paise

    # Fallback: MRP
    return item.mrp_paise
```

---

## Frontend — billing cart integration

The price group is loaded when a customer is selected at POS.
The cart must re-price all existing line items when the customer changes.

```typescript
// frontend/src/pages/Billing/hooks/useBillingCart.ts

function applyPriceGroup(
  cartItems: CartItem[],
  priceGroupId: string | null,
  itemPrices: Record<string, ItemPriceData>
): CartItem[] {
  return cartItems.map(item => ({
    ...item,
    unit_price_paise: resolvePrice(item.item_id, priceGroupId, itemPrices),
  }))
}

// When customer is selected:
// 1. Fetch customer price group from lookup result
// 2. Re-resolve price for all items already in cart
// 3. Show price change notification if any item price changed
```

**Price display in billing terminal:**
- Show the resolved price prominently
- Show "MRP: ₹XXX" in smaller text if a discount is applied
- If price group = "Staff", show "STAFF PRICE" badge in amber

---

## Pydantic schemas

```python
# backend/app/schemas/price_group.py

from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal
from typing import Optional, Literal

class PriceGroupCreate(BaseModel):
    name: str = Field(max_length=50)
    code: str = Field(max_length=10, pattern=r'^[A-Z0-9_]+$')
    price_level: Optional[Literal['mrp','wholesale','staff','custom_1','custom_2']] = None
    discount_pct: Decimal = Field(default=Decimal('0'), ge=0, le=100)
    is_taxable: bool = True

class PriceGroupResponse(BaseModel):
    id: UUID
    name: str
    code: str
    price_level: Optional[str]
    discount_pct: Decimal
    is_taxable: bool
    model_config = {"from_attributes": True}

class ItemPriceResolutionRequest(BaseModel):
    item_ids: list[UUID]            # batch resolve for efficiency
    price_group_id: Optional[UUID] = None

class ItemPriceResolutionResponse(BaseModel):
    item_id: UUID
    resolved_price_paise: int
    price_source: str               # "price_level:wholesale" | "discount_pct:10%" | "mrp"
```

---

## FastAPI endpoints

```python
# backend/app/routers/price_groups.py

@router.get("/price-groups", response_model=list[PriceGroupResponse])
async def list_price_groups(...):
    """List all active price groups for the store. Used in customer form + billing setup."""

@router.post("/price-groups", response_model=PriceGroupResponse, status_code=201)
async def create_price_group(payload: PriceGroupCreate, ...):
    """
    Create a new price group.
    Validate: cannot have BOTH price_level AND discount_pct > 0 simultaneously.
    """

@router.post("/price-groups/resolve-prices", response_model=list[ItemPriceResolutionResponse])
async def resolve_prices_batch(payload: ItemPriceResolutionRequest, ...):
    """
    Batch price resolution for billing cart.
    Takes a list of item_ids + price_group_id → returns resolved price per item.
    Called when: customer is selected, items are added to cart.
    Performance target: < 50ms for up to 50 items.
    """
```

---

## Seed data for new stores

Every store should start with these default price groups:

```sql
INSERT INTO public.customer_price_groups (store_id, name, code, price_level, discount_pct)
VALUES
  (:store_id, 'Retail MRP',  'MRP',  'mrp',       0),
  (:store_id, 'Wholesale',   'WHL',  'wholesale',  0),
  (:store_id, 'Staff',       'STF',  'staff',      0),
  (:store_id, 'VIP 10% Off', 'VIP',  NULL,        10.00);
```

---

## Frontend — PriceGroups management page

```
frontend/src/pages/PriceGroups/
├── index.tsx          ← list all groups with customer count per group
├── PriceGroupForm.tsx ← create/edit: name, code, strategy selector
└── hooks/
    └── usePriceGroups.ts
```

**Hotkeys:**

| Key | Action |
|-----|--------|
| F4 | New price group |
| F3 | Search price groups |

---

## Shoper9 parity checklist

- [ ] Named price groups with code (MRP, WHL, STF, VIP etc.)
- [ ] Two pricing strategies: named price level OR discount % off MRP
- [ ] Cannot have both strategies active simultaneously (validated server-side)
- [ ] Customer assigned price group (FK on partners)
- [ ] Billing terminal resolves price in < 50ms (batch endpoint)
- [ ] Cart re-prices all items when customer / price group changes
- [ ] Price source shown in billing ("Staff Price", "10% Off MRP")
- [ ] Fallback to MRP when no price group or no matching level
- [ ] Default price groups seeded on store onboarding
- [ ] `is_taxable` flag for tax-exempt groups (e.g. export sales)
- [ ] RLS active on customer_price_groups
