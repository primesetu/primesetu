# 🗂️ Suggested Modifications: Product Creation Parity with Shoper 9 SQL

> Source: `Start to Product Creations.sql` — 4864 lines, SQL Profiler trace from live Shoper 9 session

---

## 🔍 What the SQL Trace Reveals — The S9 Product Creation Pipeline

Shoper 9 creates a product in a **cascaded, staged pipeline** across 7 tables.
Current SMRITI-OS **handles ItemMaster in isolation only.** Exact S9 order:

```
GenLookup  (Class1 → RecId=1, Class2 → RecId=2, AnalCodes → RecId=65–7026)
    ↓
CLASS12COMBO  (Product × Brand matrix, with SizeGroup + ProdTaxType)
    ↓
SUBCLASS1CAT  (Style/SubClass1 under Class1+Class2, with all 32 AnalCodes)
    ↓
SUBCLASS2CAT  (Shade/SubClass2 under Class1+Class2)
    ↓
SIZECAT       (Size under Class1+Class2 with SizeGroupSrlNo + PivotalSize)
    ↓
ItemMaster    (116 fields incl. 32 AnalCodes, flags, pricing, stock params)
    ↓
StockMaster   (Initial stock row: StockNo, LocnId=0, BatchSrlNo, CurBalQty)
```

---

## 📋 GAP ANALYSIS: Current SMRITI-OS vs. Shoper 9 Reality

### GAP 1 — Frontend Schema: Missing Critical Fields (`ItemMasterWorkbench.tsx`)

**Current `ALL_FIELDS` / `SCHEMAS.ITEM_MASTER`** — only 16 fields.  
**Shoper 9 `INSERT INTO ItemMaster`** — **116 columns**. Key missing ones:

| Missing Field | S9 Column | Impact |
|---|---|---|
| Style | `SubClass1Cd` | Required for SUBCLASS1CAT cascade |
| Shade | `SubClass2Cd` | Required for SUBCLASS2CAT cascade |
| Size | `SizeCd` | Required for SIZECAT cascade |
| GST Slab | `ProdTaxType` | FK → GenLookup RecId=54 |
| Source Tax | `SrcTaxType` | Source tax type code |
| Batch Sr No | `BatchSrlNo` | Existence sentinel (0=new, 99=exists) |
| Inventory? | `IsInventoryItem` | Inventory tracking flag |
| Tax Inclusive? | `IsRPTaxInclusive` | RP tax inclusive flag |
| Service/Billable | `IsService`, `IsBillable` | Service item flags |
| Consignment | `IsConsignmentItem` | Consignment flag |
| Regular Item | `RegularInd` | Regular item indicator |
| Min Sale Qty | `LeastSalableQty` | Min saleable qty |
| Reorder | `ReordLvl`, `EOQ`, `MinOrdQty` | Reorder params |
| Cost Price | `CurrentCost` | (currently `cost_price` — wrong name) |
| Last Purch Price | `LastPurchPrice` | Auto-set = CurrentCost if NULL |
| Final MRP | `FinalMRP` | MRP incl. tax |
| Attributes (x32) | `AnalCode1`–`AnalCode32` | Fibre, Finish, ColourBase, Styling, Usage, HSN… |
| Markup | `RtlMarkUp`, `DlrMarkUp` | (currently `markup_percent` — wrong name) |
| Super Classes | `SuperClass1`, `SuperClass2` | Dept + Buyer (RecId=51, 52) |
| Grade | `GradeCd` | From SysParam `DefaultValueForGradeCd` |
| Image | `ImagePresent`, `ImageID` | Product image |
| Batch Dates | `MfgDate`, `ExpDate`, `ShelfLife` | Batch date fields |
| Flags | `FlgStockTake`, `FlgRateAlterable`, `FlgStockChkAppl`, `StockTolerance` | Stock take flags |
| Custom Fields | `SField1–5`, `NField1–5`, `DField1–3`, `BField1–2` | User-defined fields |

> [!IMPORTANT]
> The SQL trace shows all these fields are explicitly SET to 0/NULL via UPDATE statements **before** the INSERT. SMRITI-OS must apply the same defaults.

---

### GAP 2 — Missing Cascade Sheets in `ItemMasterWorkbench.tsx`

**Current sheets:** Common Fields | Item Master | Item Classification | Master Attributes

**S9 pipeline requires these additional sheets:**

| Suggested Sheet | S9 Table | Key Fields |
|---|---|---|
| `CLASS12COMBO` | CLASS12COMBO | Class1Cd, Class2Cd, SizeGroup, ProdTaxType, Billable, RetailMarkUp, DealerMarkUp, PrefVendorId, SuperClass1, SuperClass2 |
| `SUBCLASS1CAT` | SUBCLASS1CAT | Class1Cd, Class2Cd, SubClass1Cd, SubClass1Desc, AnalCode1–32 |
| `SUBCLASS2CAT` | SUBCLASS2CAT | Class1Cd, Class2Cd, SubClass2Cd, SubClass2Desc |
| `SIZECAT` | SIZECAT | Class1Cd, Class2Cd, SizeCd, SizeGroupId, IsPivotalSize, SizeGroupSrlNo, IdealStockRatioQty |
| `StockMaster Init` | StockMaster | StockNo, LocnId=0, BatchSrlNo, CurBalQty=0, CurBalVal=0 |

> [!NOTE]
> S9 uses `BATCHSRLNO = 0 / 99` as a **"does this row already exist?"** sentinel before every INSERT. SMRITI-OS must replicate this upsert logic on batch save.

---

### GAP 3 — `GenLookup` Sync Not Implemented

The SQL trace shows every new `Class1Cd`, `Class2Cd`, and `AnalCode` value is **auto-inserted into `GenLookup`** before the ItemMaster INSERT. SMRITI-OS has no equivalent.

**RecId mapping extracted from SQL trace:**

```
RecId=1    → Class1Cd     (label: "Product"     from ItemMasterConfig)
RecId=2    → Class2Cd     (label: "Brand")
RecId=51   → SuperClass1  (label: "Department")
RecId=52   → SuperClass2  (label: "Buyer")
RecId=53   → SizeGroup    (used in CLASS12COMBO)
RecId=54   → ProdTaxType  (used in CLASS12COMBO)
RecId=65   → AnalCode1    (label: "Fibre")
RecId=66   → AnalCode2    (label: "Finish")
RecId=67   → AnalCode3    (label: "Colour Base")
RecId=68   → AnalCode4    (label: "Styling")
RecId=69   → AnalCode5    (label: "Usage")
RecId=7000+→ AnalCode6–31
RecId=7026 → AnalCode32   (label: "HSN Code")
RecId=7030 → GradeCd
RecId=7031 → LocationCd
```

**Suggested:** Add `/api/lookup/sync` backend endpoint — upserts to `GenLookup` before item save.

---

### GAP 4 — Backend Schema (`item_master.py`) — Wrong Column Names

Pydantic model uses **non-S9 field names**:

| Current SMRITI-OS Field | Actual S9 Column | Fix Required |
|---|---|---|
| `department_id` (UUID) | `Class1Cd` (VARCHAR 16) | Rename + change type |
| `supplier_id` (UUID) | `PrefVendorId` (VARCHAR 16) | Rename + change type |
| `size_group_id` (UUID) | SizeGroup in `CLASS12COMBO` | Move to CLASS12COMBO sheet |
| `colour` | `SubClass2Cd` | Rename |
| `colour_code` | *(not in S9)* | Remove |
| `mrp_paise` (int) | `Retail_Price` (MONEY/decimal) | Rename + change to decimal |
| `cost_paise` (int) | `CurrentCost` (MONEY/decimal) | Rename + change to decimal |
| `gst_rate` (int) | `ProdTaxType` (VARCHAR 16) | Rename + change to string FK |

> [!WARNING]
> The `POST /items/` router references `Item` model which is **undefined** — should be `Itemmaster`. This is a pre-existing crash bug on any create attempt.

---

### GAP 5 — StockMaster Initial Row Not Created

S9 trace, line 4373:
```sql
Insert into stockmaster (stockno, LocnId, BatchSrlno, curbalqty, curbalval,
  VActr, YrOpBalQty, YrOpBalVal, VAUid, VATermId, VACompCode)
Select StockNo, 0, BatchSrlNo, JwlMakeCharge, JwlMakeCharge * CurrentCost,
  1, 0, 0, 'super', '.', 'GKP'
From TempItemMastersuper Where BField1 = 0
```

SMRITI-OS backend creates **no `Stockmaster` row** after item creation. Without this, all stock queries return NULL/zero incorrectly.

---

### GAP 6 — ItemMasterConfig Column Labels Not Used in UI

S9 reads `ItemMasterConfig.FC` (Field Caption) to **dynamically label grid columns**. The SQL trace confirms:

```
Class1Cd    → "Product"
Class2Cd    → "Brand"
SubClass1Cd → "Style"
SubClass2Cd → "Shade"
SizeCd      → "Size"
Analcode1   → "Fibre"
Analcode2   → "Finish"
Analcode32  → "HSN Code"
```

Currently the frontend uses **hardcoded labels** like "Class1/Dept", "Colour". Should be fetched from `ItemMasterConfig` via `/api/config/item-captions`.

---

## ✅ Recommended Modifications — Prioritized

### 🔴 Priority 1 — Critical (Product Creation is Broken)

1. **Fix `item_master.py` router** — `Item` → `Itemmaster`; rename all fields to S9 column names
2. **Add StockMaster INSERT** in `create_item` after every ItemMaster insert (`LocnId=0, BatchSrlNo=0, curbalqty=0`)
3. **Add `BatchSrlNo`** to `ItemCreate` schema (default=0)

### 🟠 Priority 2 — High (Data Integrity / Cascade)

4. **Add CLASS12COMBO sheet** to `ItemMasterWorkbench.tsx`
5. **Add SUBCLASS1CAT sheet** with all 32 AnalCode columns
6. **Add SUBCLASS2CAT sheet**
7. **Add SIZECAT sheet** with PivotalSize + SizeGroupSrlNo

### 🟡 Priority 3 — Medium (Schema Completeness)

8. **Expand `ALL_FIELDS`** in `ItemMasterWorkbench.tsx` — add SubClass1Cd, SubClass2Cd, SizeCd, ProdTaxType, SrcTaxType, IsInventoryItem, IsRPTaxInclusive, IsService, IsBillable, RegularInd, LeastSalableQty, ReordLvl, FinalMRP, AnalCode1–32
9. **Add `/api/lookup/sync` endpoint** for GenLookup auto-upsert on new Class1/Class2/AnalCode values

### 🟢 Priority 4 — Low (Polish)

10. **Dynamic column labels** — fetch `ItemMasterConfig.FC` from backend, replace hardcoded field labels
11. **BATCHSRLNO sentinel logic** in batch-save — check existing before INSERT (0=new, 99=exists)

---

## 📁 Files Affected

| File | Change Summary |
|---|---|
| `frontend/src/modules/inventory/ItemMasterWorkbench.tsx` | Expand `ALL_FIELDS`, add CLASS12COMBO / SUBCLASS1CAT / SUBCLASS2CAT / SIZECAT sheets |
| `backend/app/schemas/item_master.py` | Rename fields to exact S9 column names, add missing 116-column fields |
| `backend/app/routers/item_master.py` | Fix `Item` → `Itemmaster`, add StockMaster row after create |
| `backend/app/routers/catalogue.py` | Add GenLookup sync endpoint |

---

> **Ready to proceed?** Shall I start with **Priority 1+2 (critical fixes + cascade sheets)**, or do all 4 priorities together?
