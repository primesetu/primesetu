/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9-module-index
 * ============================================================ */

# SKILL: Shoper9 Module Index — Load This First

This is the entry point for all Shoper9-parity work.
Read this file, then load the specific skill file for your task.

---

## Which skill to load

| Task involves... | Load this skill file |
|-----------------|---------------------|
| Items, SKUs, stock matrix, size groups, HSN codes | `skills/shoper9-item-master.md` |
| Catalog, departments, universal search, GeneralLookup, Partner model | `skills/shoper9-catalog.md` |
| Customers, loyalty points, credit, account ledger, GSTIN | `skills/shoper9-customer.md` |
| Price groups, wholesale pricing, staff pricing, discount % | `skills/shoper9-customer-price-group.md` |
| Barcodes, EAN-13, GTIN, scanner, label printing, PDT import, Auto-Print Bridge | `skills/shoper9-barcode.md` |
| Billing terminal, cart, F2/F5/F8/F10 hotkeys, payment | `skills/ux-billing-terminal.md` + `skills/tally-voucher.md` |
| Predictive stockout, DoC, HQ Sync Pulse, Cashier metrics | `skills/ux-operational-intelligence.md` |
| New FastAPI endpoint | `skills/add-api-endpoint.md` |
| New DB table / migration | `skills/add-db-migration.md` |
| New React page | `skills/add-react-page.md` |

---

## Shoper9 parity status — master tracker

| Module | DB Schema | Backend API | Frontend | Phase |
|--------|-----------|------------|----------|-------|
| Billing Terminal | ✅ | ✅ | ✅ | 2 ✅ DONE |
| Item Master | ✅ | ✅ | ✅ | 3 ✅ DONE |
| GRN / Stock Inward | ✅ | ✅ | ✅ | 3 ✅ DONE |
| Physical Stock Audit | ✅ | ✅ | ✅ | 3 ✅ DONE |
| Barcode / GTIN Studio + Auto-Print | ✅ | ✅ | ✅ | 3 ✅ DONE |
| Catalog / Master Registry | ✅ | ✅ | ✅ | 4 ✅ DONE |
| Customer Master | ✅ | ✅ | ✅ | 4 ✅ DONE |
| Customer Price Groups | ✅ | ✅ | ✅ | 4 ✅ DONE |
| Tally Bridge | ✅ | ✅ | ⏳ print | 3 ✅ DONE |
| Predictive Stockout (DoC) | ✅ | ✅ | ✅ | 5 ✅ DONE |
| HQ Heartbeat (Sync Pulse) | N/A | ✅ /health | ✅ Sidebar | 5 ✅ DONE |
| Multi-lingual (EN/HI) | N/A | N/A | ✅ useLanguage | 5 ✅ DONE |
| Cashier Performance Dashboard | ⏳ | ⏳ | ⏳ | 6 ⏳ PENDING |
| Till Management | ⏳ | ⏳ | ⏳ | 6 ⏳ PENDING |
| MIS Reports (drill-down) | ⏳ | ⏳ | ⏳ | 6 ⏳ PENDING |
| PDT Integration | ⏳ | ⏳ | ⏳ | 7 ⏳ PENDING |
| Multi-store HO Sync | ⏳ | ⏳ | ⏳ | 7 ⏳ PENDING |

---

## Cross-module data flows

Understanding how the modules connect prevents broken integrations.

```
GeneralLookup (shoper9-catalog)
    ↓ provides: payment modes, colours, seasons
    ↓ consumed by: Billing, Item Master, Customer forms

SizeGroups (shoper9-item-master)
    ↓ defines valid sizes for items
    ↓ consumed by: StockMatrix, Barcodes (size-specific), Billing cart

Items (shoper9-item-master)
    ↓ item_id is FK in:
        → item_stock (qty per size/colour)
        → item_price_levels (price per level)
        → item_barcodes (one-to-many)
        → sale_line_items (billing)

Partners (shoper9-catalog)
    ↓ partner_id is FK in:
        → items.supplier_id (vendor)
        → sales.partner_id (customer)
        → customer_ledger
        → loyalty_ledger

CustomerPriceGroups (shoper9-customer-price-group)
    ↓ price_group_id is FK in:
        → partners.price_group_id (customer assignment)
    ↓ consumed by: Billing (resolve_item_price)
    ↓ depends on: item_price_levels in item-master

ItemBarcodes (shoper9-barcode)
    ↓ barcode scan → resolves item_id + size + colour
    ↓ consumed by: Billing terminal (hot path: < 50ms)
    ↓ depends on: items (FK), item_stock (stock lookup after scan)
```

---

## Non-negotiable rules across ALL Shoper9 modules

These apply to every module without exception.
Do not re-read these in every skill file — they are inherited from this index.

**Money:**
- All monetary values stored as `INTEGER` (paise). Never float, Decimal, or Numeric.
- Display only: divide by 100 to show rupees. `₹{paise // 100:,}`
- GST rates: `{0, 5, 12, 18, 28}` only. Validate server-side on every write.

**IDs:**
- All PKs: `UUID DEFAULT gen_random_uuid()`
- `store_id` always derived from JWT auth context. Never from request body.
- Never hardcode a store_id.

**Soft deletes:**
- Items, Customers, Price Groups: use `is_active = false`. Never `DELETE`.
- Preserves sales history integrity.
- Audit tables (ledgers): append-only. No UPDATE. No DELETE.

**RLS:**
- Every new table: `ENABLE ROW LEVEL SECURITY` + store isolation policy.
- Test policy before merging (see `skills/add-db-migration.md`).

**Performance targets:**
- Barcode scan lookup: < 50ms
- Customer phone lookup at POS: < 100ms
- Item search (50k items): < 200ms
- Price resolution (batch 50 items): < 50ms
- All targets achievable via proper indexing — see individual skill files.

**Shoper9 UI parity:**
- Validate all UI changes against `primesetu-shoper9-ui.html`
- Item name max 40 chars (thermal printer constraint — hard limit)
- Item code max 20 chars
- Hotkeys must work when input fields are focused (`enableOnFormTags: true`)

---

## Recommended implementation order

Follow this order to avoid FK dependency failures:

```
1. GeneralLookup seed data         (shoper9-catalog)
2. SizeGroups table                (shoper9-item-master)
3. Departments table               (shoper9-item-master)
4. CustomerPriceGroups table       (shoper9-customer-price-group)
5. Partners table                  (shoper9-catalog / shoper9-customer)
6. Items table                     (shoper9-item-master)
7. ItemPriceLevels table           (shoper9-item-master)
8. ItemStock table                 (shoper9-item-master)
9. ItemBarcodes table              (shoper9-barcode)
10. CustomerLedger table           (shoper9-customer)
11. LoyaltyLedger table            (shoper9-customer)
```

Each step depends on the previous. AGENT-DB must apply migrations in this order.

---

## Commit message convention for Shoper9 work

```
feat(item-master): add size group and stock matrix tables + RLS
feat(catalog): implement universal search with trigram indexes
feat(customer): add loyalty ledger and earn/redeem endpoints
feat(price-group): add batch price resolution endpoint
feat(barcode): implement EAN-13 generator + POS scan hot path
feat(gtin-studio): add GTINStudio page with F3/F4/F6 hotkeys
```

Format: `feat(<module>): <what was done>`
Module names: `item-master`, `catalog`, `customer`, `price-group`, `barcode`, `gtin-studio`, `billing`, `tally`, `reports`
