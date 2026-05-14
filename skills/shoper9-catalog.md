/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-catalog
 * ============================================================ */

# SKILL: Shoper9 Catalog (Master Registry) — Full Parity

Read this file completely before writing any Catalog/Registry code.

---

## What Shoper9 Catalog does (parity target)

The Catalog (called "Master Registry" in Phase 4 plan) is the unified command
centre for all master data. In Shoper9, this covers:

| Shoper9 Module | PrimeSetu Entity | Phase |
|---------------|-----------------|-------|
| Item Catalogue | `items` table | Phase 4 ✅ |
| Customer Master | `partners` (type=customer) | Phase 4 ✅ |
| Vendor / Supplier | `partners` (type=vendor) | Phase 4 ✅ |
| Salesperson | `partners` (type=salesperson) | Phase 4 ✅ |
| Department / Category | `departments` table | Phase 4 ✅ |
| Size Groups | `size_groups` table | Phase 4 ✅ |
| Payment Modes | `general_lookup` | Phase 4 ✅ |
| Tax Categories | `general_lookup` | Phase 4 ✅ |
| Colour Master | `general_lookup` | Phase 4 ✅ |
| Season / Collection | `general_lookup` | Phase 4 ✅ |

---

## DB Schema — Partner (unified entity)

```sql
/* ============================================================
 * PrimeSetu — Partner / Catalog Schema
 * ============================================================ */

-- Single table for Customers, Vendors, Salespersons (Shoper9 "Partner" model)
CREATE TABLE IF NOT EXISTS public.partners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    partner_type    TEXT NOT NULL CHECK (partner_type IN ('customer','vendor','salesperson','both')),
    code            TEXT NOT NULL,                  -- Shoper9-style short code, e.g. "C0001"
    name            TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    gstin           TEXT,                           -- 15-char GSTIN for B2B customers
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    state_code      TEXT,                           -- 2-char state code for GST (e.g. "27" = Maharashtra)
    pincode         TEXT,
    credit_limit_paise INTEGER DEFAULT 0,
    credit_days     SMALLINT DEFAULT 0,
    price_group_id  UUID REFERENCES public.customer_price_groups(id),
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (store_id, code)
);

-- GeneralLookup: dynamic system constants (replaces hardcoded enums)
CREATE TABLE IF NOT EXISTS public.general_lookup (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID REFERENCES public.stores(id) ON DELETE CASCADE,  -- NULL = system-wide
    category    TEXT NOT NULL,      -- 'payment_mode' | 'colour' | 'season' | 'size_group' | 'tax_category'
    code        TEXT NOT NULL,      -- short key, e.g. "UPI", "NVY", "SS26"
    label       TEXT NOT NULL,      -- display name, e.g. "UPI Payment", "Navy Blue"
    sort_order  SMALLINT DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    meta        JSONB,              -- extra props (e.g. colour_hex for colour entries)
    UNIQUE (store_id, category, code)
);

-- RLS
ALTER TABLE public.partners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_lookup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_isolation" ON public.partners
    FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY "store_isolation_or_system" ON public.general_lookup
    FOR SELECT USING (
        store_id IS NULL OR
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );
CREATE POLICY "store_isolation_write" ON public.general_lookup
    FOR INSERT WITH CHECK (
        store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid() LIMIT 1)
    );

-- Indexes
CREATE INDEX idx_partners_store_type   ON public.partners(store_id, partner_type);
CREATE INDEX idx_partners_store_code   ON public.partners(store_id, code);
CREATE INDEX idx_partners_phone        ON public.partners(store_id, phone);
CREATE INDEX idx_general_lookup_cat    ON public.general_lookup(store_id, category);
```

---

## Universal Search — the Catalog's killer feature

Phase 4 plan specifies: "Universal Search that spans all master data types."
This is the `Ctrl+K` Omnisearch + the catalogue search bar.

```python
# backend/app/routers/catalogue.py

@router.get("/catalogue/search")
async def universal_search(
    q: str = Query(min_length=2, max_length=50),
    types: list[str] = Query(default=["item", "customer", "vendor"]),
    limit: int = Query(default=10, le=50),
    store_ctx: dict = Depends(get_current_store_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Searches across items (code + name), partners (name + phone + code).
    Returns mixed results grouped by type.
    Used by: Billing terminal item lookup, Ctrl+K command bar, Catalogue page.

    Performance target: < 150ms for stores with 50,000 items + 10,000 customers.
    Achieved via: PostgreSQL trigram indexes (pg_trgm extension).
    """
    store_id = store_ctx["store_id"]
    results = {"items": [], "customers": [], "vendors": []}

    if "item" in types:
        items = await db.execute(
            text("""
                SELECT id, item_code, item_name, mrp_paise, gst_rate
                FROM public.items
                WHERE store_id = :store_id
                  AND is_active = true
                  AND (item_code ILIKE :q OR item_name ILIKE :q)
                ORDER BY similarity(item_name, :raw_q) DESC
                LIMIT :limit
            """),
            {"store_id": store_id, "q": f"%{q}%", "raw_q": q, "limit": limit}
        )
        results["items"] = items.mappings().all()

    if "customer" in types:
        customers = await db.execute(
            text("""
                SELECT id, code, name, phone, loyalty_points
                FROM public.partners
                WHERE store_id = :store_id
                  AND partner_type IN ('customer', 'both')
                  AND is_active = true
                  AND (name ILIKE :q OR phone ILIKE :q OR code ILIKE :q)
                LIMIT :limit
            """),
            {"store_id": store_id, "q": f"%{q}%", "limit": limit}
        )
        results["customers"] = customers.mappings().all()

    return results
```

**Trigram index for performance (add to migration):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_items_name_trgm   ON public.items   USING GIN (item_name gin_trgm_ops);
CREATE INDEX idx_partners_name_trgm ON public.partners USING GIN (name gin_trgm_ops);
```

---

## Frontend — MasterRegistry page structure

```
frontend/src/pages/MasterRegistry/
├── index.tsx                  ← unified registry with tab/entity switcher
├── tabs/
│   ├── ItemsTab.tsx           ← links to ItemMaster page
│   ├── CustomersTab.tsx       ← links to Customer page
│   ├── VendorsTab.tsx
│   └── LookupTab.tsx          ← GeneralLookup editor (colours, seasons, payment modes)
├── components/
│   ├── UniversalSearchBar.tsx ← real-time search across all entity types
│   ├── RelationshipMatrix.tsx ← customer behaviour insights panel
│   └── InlineBulkEdit.tsx     ← spreadsheet-style price/tax revisions
└── hooks/
    └── useCatalogueSearch.ts  ← debounced universal search hook
```

**Hotkeys on MasterRegistry page:**

| Key | Action |
|-----|--------|
| Ctrl+K | Open Omnisearch (global command bar) |
| F3 | Focus universal search bar |
| F4 | New entity (context-aware: new item / new customer) |
| Tab | Switch between entity tabs |

---

## Relationship Matrix (Phase 4 intelligence layer)

Per the implementation plan: "Show stock velocity in Item Catalogue and loyalty insights in Customer Catalogue."

```python
@router.get("/catalogue/partners/{partner_id}/matrix")
async def get_partner_matrix(partner_id: UUID, ...):
    """
    Returns behavioural insights for a customer:
    - total_spend_paise (last 90 days)
    - visit_count (last 90 days)
    - favourite_category
    - loyalty_points
    - last_visit_date
    - average_basket_paise
    """

@router.get("/catalogue/items/{item_id}/velocity")
async def get_item_velocity(item_id: UUID, ...):
    """
    Returns stock velocity metrics:
    - avg_daily_sales (last 30 days)
    - days_of_cover = qty_on_hand / avg_daily_sales
    - last_sold_date
    - reorder_suggested: bool
    """
```

---

## GeneralLookup — seed data for new stores

When a new store is onboarded, seed these system-wide lookup values:

```sql
-- Payment modes
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'payment_mode', 'CASH', 'Cash',        1),
  (NULL, 'payment_mode', 'UPI',  'UPI',          2),
  (NULL, 'payment_mode', 'CARD', 'Card',         3),
  (NULL, 'payment_mode', 'CRED', 'Store Credit', 4);

-- GST tax categories
INSERT INTO public.general_lookup (store_id, category, code, label, sort_order)
VALUES
  (NULL, 'tax_category', 'GST0',  'GST Exempt (0%)',   1),
  (NULL, 'tax_category', 'GST5',  'GST 5%',            2),
  (NULL, 'tax_category', 'GST12', 'GST 12%',           3),
  (NULL, 'tax_category', 'GST18', 'GST 18%',           4),
  (NULL, 'tax_category', 'GST28', 'GST 28%',           5);
```

---

## Inline bulk edit (spreadsheet mode)

The implementation plan specifies "spreadsheet-like updates for price revisions."
Use `@tanstack/react-table` with editable cells:

```typescript
// InlineBulkEdit.tsx
// - Renders items as editable table rows
// - Changed cells highlight in amber
// - "Save All" button fires PATCH /items/bulk-price-update
// - Optimistic UI update via React Query mutation
// - Escape key discards unsaved changes
```

---

## Shoper9 parity checklist

- [ ] Partner model covers customer + vendor + salesperson in one table
- [ ] GeneralLookup provides all dynamic system constants (no hardcoded enums in code)
- [ ] Universal search spans items + customers + vendors
- [ ] Trigram indexes added for search performance (pg_trgm)
- [ ] Relationship matrix API returns customer behavioural insights
- [ ] Item velocity API returns days-of-cover prediction
- [ ] Inline bulk edit for price revisions
- [ ] Ctrl+K Omnisearch wired to universal search endpoint
- [ ] New store onboarding seeds GeneralLookup with default payment modes + GST categories
- [ ] RLS active on all catalog tables
