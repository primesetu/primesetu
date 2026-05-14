/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-item-master
 * ============================================================ */

# SKILL: Shoper9 Item Master (ItemMaster) — Full Parity

Read this file completely before writing any Item Master code.

---

## What Shoper9 Item Master does (parity target)

Shoper9's Item Master is the central product registry. Every SKU in the store
lives here. Key capabilities to match:

| Shoper9 Feature | PrimeSetu Status | Notes |
|----------------|-----------------|-------|
| Item Code (unique per store) | ✅ Required | Alphanumeric, max 20 chars |
| Item Name | ✅ Required | Max 40 chars (thermal printer constraint) |
| Department / Category / Sub-category | ✅ Required | 3-level hierarchy |
| Size group + size matrix | ✅ Required | E.g. "S/M/L/XL" or "28/30/32/34" |
| Colour attribute | ✅ Required | Free text + optional colour code |
| MRP (Maximum Retail Price) | ✅ Required | Stored as paise integer |
| Multiple price levels | ✅ Required | MRP, Wholesale, Staff, Custom |
| GST rate + HSN code | ✅ Required | GST: 0/5/12/18/28 only |
| Barcode (EAN-13 / internal) | ✅ Required | One item can have multiple barcodes |
| Supplier / Brand | ✅ Required | FK to Partner table |
| Stock opening balance | ✅ Required | Per size per colour per store |
| Item image | ⏳ Phase 5 | Cloudflare Images |
| Alternate units (pcs/set/dozen) | ⏳ Phase 5 | |

---

## DB Schema

Migration file: `supabase/migrations/<timestamp>_add_item_master.sql`

```sql
/* ============================================================
 * PrimeSetu — Item Master Schema
 * ============================================================ */

-- Department hierarchy
CREATE TABLE IF NOT EXISTS public.departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT NOT NULL,
    parent_id   UUID REFERENCES public.departments(id),  -- NULL = top level
    level       SMALLINT NOT NULL CHECK (level IN (1,2,3)),  -- 1=dept, 2=cat, 3=subcat
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- Size groups (e.g. "Apparel S/M/L", "Footwear 6-11")
CREATE TABLE IF NOT EXISTS public.size_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,                          -- "UK Footwear"
    sizes       TEXT[] NOT NULL,                        -- ["6","7","8","9","10","11"]
    UNIQUE (store_id, name)
);

-- Core item / product master
CREATE TABLE IF NOT EXISTS public.items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    item_code       TEXT NOT NULL,                      -- user-defined, unique per store
    item_name       TEXT NOT NULL CHECK (char_length(item_name) <= 40),
    department_id   UUID NOT NULL REFERENCES public.departments(id),
    brand           TEXT,
    supplier_id     UUID REFERENCES public.partners(id),
    size_group_id   UUID REFERENCES public.size_groups(id),
    colour          TEXT,                               -- e.g. "Navy Blue"
    colour_code     TEXT,                               -- e.g. "NVY"
    mrp_paise       INTEGER NOT NULL CHECK (mrp_paise > 0),
    cost_paise      INTEGER CHECK (cost_paise > 0),
    gst_rate        SMALLINT NOT NULL CHECK (gst_rate IN (0,5,12,18,28)),
    hsn_code        TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, item_code)
);

-- Price levels per item (MRP, Wholesale, Staff, etc.)
CREATE TABLE IF NOT EXISTS public.item_price_levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    price_level     TEXT NOT NULL CHECK (price_level IN ('mrp','wholesale','staff','custom_1','custom_2')),
    price_paise     INTEGER NOT NULL CHECK (price_paise > 0),
    valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to        DATE,
    UNIQUE (item_id, price_level, valid_from)
);

-- Stock matrix: quantity per size per colour per location
CREATE TABLE IF NOT EXISTS public.item_stock (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    size            TEXT NOT NULL,                      -- must be in size_group.sizes array
    colour          TEXT NOT NULL,
    qty_on_hand     INTEGER NOT NULL DEFAULT 0,
    qty_reserved    INTEGER NOT NULL DEFAULT 0,         -- in open orders
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, store_id, size, colour)
);

-- RLS
ALTER TABLE public.departments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.size_groups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_price_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_stock        ENABLE ROW LEVEL SECURITY;

-- Store isolation policy (apply to all 5 tables)
CREATE POLICY "store_isolation" ON public.departments
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.size_groups
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.items
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.item_price_levels
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation" ON public.item_stock
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));

-- Indexes
CREATE INDEX idx_items_store_code     ON public.items(store_id, item_code);
CREATE INDEX idx_items_department     ON public.items(department_id);
CREATE INDEX idx_item_stock_item      ON public.item_stock(item_id, store_id);
CREATE INDEX idx_item_price_item      ON public.item_price_levels(item_id, price_level);
```

---

## Pydantic schemas

```python
# backend/app/schemas/item_master.py

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class SizeGroupCreate(BaseModel):
    name: str
    sizes: list[str] = Field(min_length=1)

class ItemCreate(BaseModel):
    item_code: str = Field(max_length=20)
    item_name: str = Field(max_length=40)
    department_id: UUID
    brand: Optional[str] = None
    supplier_id: Optional[UUID] = None
    size_group_id: Optional[UUID] = None
    colour: Optional[str] = None
    colour_code: Optional[str] = None
    mrp_paise: int = Field(gt=0)
    cost_paise: Optional[int] = Field(default=None, gt=0)
    gst_rate: int = Field(..., description="Must be 0, 5, 12, 18, or 28")
    hsn_code: str

class StockMatrixEntry(BaseModel):
    size: str
    colour: str
    qty_on_hand: int = Field(ge=0)

class ItemWithStock(ItemCreate):
    stock_matrix: list[StockMatrixEntry] = []

class ItemResponse(BaseModel):
    id: UUID
    item_code: str
    item_name: str
    mrp_paise: int
    gst_rate: int
    hsn_code: str
    total_stock: int           # sum across all sizes/colours
    model_config = {"from_attributes": True}
```

---

## FastAPI router — key endpoints

```python
# backend/app/routers/item_master.py

@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(payload: ItemWithStock, ...):
    """
    Create item + optional opening stock matrix in one atomic transaction.
    Validates: GST rate, HSN format, item_code uniqueness per store.
    """

@router.get("/items", response_model=list[ItemResponse])
async def list_items(
    department_id: UUID | None = None,
    search: str | None = None,      # searches item_code AND item_name
    is_active: bool = True,
    limit: int = 50,
    offset: int = 0,
    ...
):
    """
    Paginated item list. Powers the billing item search and catalogue grid.
    MUST return results in < 200ms for up to 50,000 items.
    """

@router.get("/items/{item_id}/stock-matrix")
async def get_stock_matrix(item_id: UUID, ...):
    """
    Returns size × colour grid with qty_on_hand and qty_reserved.
    This is the Shoper9 'Size-wise Stock' view.
    """

@router.patch("/items/{item_id}/price")
async def update_price_level(item_id: UUID, price_level: str, price_paise: int, ...):
    """
    Update a specific price level. Creates a new row with valid_from = today.
    Previous price row gets valid_to = yesterday (price history preserved).
    """

@router.post("/items/bulk-import")
async def bulk_import_from_pdt(file: UploadFile, ...):
    """
    PDT CSV import. Expected columns: item_code, item_name, mrp, gst_rate, hsn_code.
    See skills/shoper9-barcode.md for barcode column handling.
    """
```

---

## Frontend — ItemMaster page structure

```
frontend/src/pages/ItemMaster/
├── index.tsx              ← master list with universal search
├── ItemForm.tsx           ← create/edit form
├── StockMatrix.tsx        ← size × colour grid component
├── PriceLevels.tsx        ← price level manager
└── hooks/
    ├── useItems.ts        ← React Query: list + search
    ├── useItemMutations.ts← create / update / deactivate
    └── useStockMatrix.ts  ← size/colour grid data
```

**Hotkeys on ItemMaster page:**

| Key | Action |
|-----|--------|
| F3 | Open item search / new item |
| F4 | Edit selected item |
| Ctrl+K | Omnisearch (global command bar) |
| Esc | Cancel / close form |

**Item search in billing terminal:**
- Cashier types partial item code or name → debounced 300ms → hits `GET /items?search=`
- Must support barcode scan: scanner fires Enter after barcode → resolved via `GET /items?barcode=`
- Result populated into billing cart immediately

---

## Size × colour matrix UI

The stock matrix is a 2D grid: rows = sizes (from size_group), columns = colours.
Each cell shows `qty_on_hand`. Cells with 0 stock are greyed. Cells with < 3 are amber.

```typescript
// StockMatrix.tsx
interface MatrixCell {
  size: string
  colour: string
  qty_on_hand: number
  qty_reserved: number
}

// Render as HTML table — NOT a virtualised grid (max ~100 cells per item)
// Tailwind classes:
// qty === 0  → 'bg-gray-100 text-gray-400'
// qty <= 3   → 'bg-amber-50 text-amber-700'
// qty > 3    → 'bg-green-50 text-green-800'
```

---

## Shoper9 parity checklist

- [ ] Item code max 20 chars, unique per store
- [ ] Item name max 40 chars (fits 80mm thermal receipt)
- [ ] 3-level department hierarchy (dept → category → sub-category)
- [ ] Size group defines valid sizes; stock matrix validates against it
- [ ] MRP stored as paise integer
- [ ] Multiple price levels with date-range validity
- [ ] GST rate in `{0,5,12,18,28}` with HSN code
- [ ] Size × colour stock matrix with qty_on_hand + qty_reserved
- [ ] Billing terminal item search < 200ms
- [ ] PDT CSV import for bulk item creation
- [ ] Item deactivation (never delete — preserve sales history)
- [ ] RLS active on all 5 tables
- [ ] `npm run build` passes
