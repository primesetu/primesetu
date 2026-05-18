# 🧬 Sovereign ERP - Class12Combo (Item Grouping) Field Guide

This document provides an exhaustive operational breakdown of the `s9.class12combo` database table inside Smriti Retail OS. It details how each of the legacy Shoper9 fields functions, how they govern core retail automation processes (pricing, logistics, tax compliance, batch control, and reporting), and how they are utilized in the modern, reactive TanStack Table workspace.

---

## 📌 Executive Summary
In high-performance retail enterprise structures, managing tens of thousands of individual SKUs (Stock Keeping Units) individually is operationally impossible. 

`Class12Combo` is the **Universal Rules Engine** of the inventory catalogue. By defining a combination rule between a **Product Group (Class 1)** and a **Brand/Supplier Category (Class 2)**, all items under that pairing instantly inherit these rules. This eliminates manual configuration for new inventory and maintains total data integrity across the supply chain.

---

## 🔍 Detailed Field Breakdown & Operational Utility

### 1. Unique Identifiers & Routing Core

| Database Field | Frontend Term | Type | Parity / Operational Utility |
| :--- | :--- | :--- | :--- |
| **`tenant_id`** | Company/Tenant ID | `VARCHAR` | **Dynamic Tenant Isolation:** Secures and partitions data in multi-company environments. The backend automatically switches database routing pools dynamically based on the active selection. |
| **`class1cd`** | Product Category | `VARCHAR` | **Primary Key 1:** The code representing the physical product group (e.g., `APPAREL`, `FOOTWEAR`, `ACCESSORIES`). |
| **`class2cd`** | Brand / Subclass | `VARCHAR` | **Primary Key 2:** The code representing the brand name or subclassification (e.g., `NIKE`, `ADIDAS`, `LEVIS`). |

> [!NOTE]
> The composite key `(tenant_id, class1cd, class2cd)` forms the unique DNA signature of a combination. Any SKU carrying both matching classifications immediately inherits the underlying attributes.

---

### 2. Pricing & Financial Inheritance Controls

These fields automate pricing strategies and gross margin rules instantly during bulk purchase invoicing.

```
       [ Purchase Inward Invoicing ]
                     │
         Checks SKU Class1 & Class2
                     │
      ┌──────────────┴──────────────┐
      ▼                             ▼
[ Retail Markup % ]           [ Dealer Markup % ]
  ↳ Auto-calculates MRP         ↳ Auto-calculates Franchise
    Formula: Cost + Markup%       Billing Rate for Outward Dispatch
```

#### 🏷️ `retailmarkup` (Retail Markup %)
* **Utility:** Automatically calculates the Maximum Retail Price (MRP) during Purchase Inward entries.
* **Real-World Case:** If a pair of shoes from `Footwear / Adidas` has a unit landing cost of `$1,000` and the combination's `retailmarkup` is set to `50.00%`, the POS and Inventory modules automatically pre-fill the MRP as `$1,500`.

#### 🏢 `dealermarkup` (Dealer Markup %)
* **Utility:** Governs franchise or wholesale pricing models.
* **Real-World Case:** Used in secondary distribution setups. When billing inventory outwards from central warehouses to franchise outlets, this markup automatically adds the pre-defined distributor commission margin to the wholesale transfer value.

#### 🧾 `prodtaxtype` (Product Tax Type / HSN Class)
* **Utility:** Maps the matching combination to an enterprise-grade tax matrix (GST, VAT, Sales Tax) or HSN code rules.
* **Real-World Case:** Setting `prodtaxtype` to `18%GST` ensures that any incoming items under that specific Product/Brand pairing inherit the exact multi-tier tax brackets without manual cashier setup, eliminating tax calculation compliance penalties at point-of-sale.

---

### 3. Logistics, Supply Chain & Inventory Classifications

These parameters control cash-flow pipelines, physical stock handling, and automated replenishment.

> [!IMPORTANT]
> Correctly configuring these fields dictates whether physical inventory lockups occur or whether services map cleanly to accounts ledger codes.

* **`billable` (Is Combination Billable)**
  * *Utility:* Toggle switch determining if cashiers can scan and sell items under this pairing.
  * *Operational Impact:* Setting this to `False` is used for **Promotional Display Items, Marketing Collateral, or Raw Packaging Materials**. The stock is tracked in warehouses, but blocked from transaction billing.
* **`isconsignmentitem` (Consignment Supply Agreement)**
  * *Utility:* Activates the **Pay-When-Sold** wholesale model.
  * *Operational Impact:* When checked, incoming stock doesn't trigger accounts payable immediately. The system tracks this inventory separately and generates vendor invoices only *after* a customer purchase occurs at a retail store, dramatically improving cash-flow management.
* **`isservicecombo` (Non-Inventory Services)**
  * *Utility:* Differentiates between physical physical products and intangible store services.
  * *Operational Impact:* Used for items such as **Alteration Charges, Home Delivery Fees, or Premium Gift Wrapping**. These do not track stock levels (no physical stock reduction on sell) but route revenues directly to service ledger accounts.
* **`sizegroup` (Size Configuration Grid)**
  * *Utility:* Determines the dimensional matrices (sizes, colors, fits) allocated to the item during catalog creation.
  * *Operational Impact:* Maps shoes to footwear grids (`6, 7, 8, 9, 10`) and t-shirts to apparel grids (`S, M, L, XL, XXL`), avoiding manual sizing configuration errors when bootstrapping new products.
* **`prefvendorid` (Preferred Vendor ID)**
  * *Utility:* Automates purchase ordering and inventory replenishment.
  * *Operational Impact:* When inventory levels drop below safety stocks, the replenishment engine checks the `prefvendorid` for the classification pair to automatically generate Draft Purchase Orders addressed to that specific vendor.

---

### 4. Advanced Batch, Serial & Expiry Safeguards

Retailers dealing with perishable items (cosmetics, packaged goods, high-performance sports foods) rely on these gates to avoid compliance violations and customer dissatisfaction.

```
                  [ SKU Near Expiry Date ]
                             │
            Days remaining <= stopsalesbefexpdays
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             [ POS Terminal ]    [ Alerts Engine ]
              ↳ LOCKS SALE         ↳ Triggers markdown/
                at Checkout          returns sequence
```

* **`batchapplicable` (Enforce Serialized Batch Control)**
  * *Utility:* Activates serialization tracking. Cashiers must select/enter specific batch codes or batch timestamps during purchase inward and retail billing.
* **`stopsalesbefexpdays` (Expiry Safety Buffer)**
  * *Utility:* Automatically blocks POS cashier checkouts *X* days before the product's actual expiry.
  * *Real-World Case:* For a gourmet chocolate category, setting this value to `15` ensures that if a batch expires on May 30th, cashiers will be barred from selling it starting May 15th. The inventory is automatically sequestered for write-off or vendor return, protecting store reputation.
* **`batchshelfapp` & `batchpriceapp` (Shelf Placement & Batch Dynamics)**
  * *Utility:* Connects batch tracking directly to custom pricing scales (e.g. older batches discounted to move stock, newer batches billed at current higher MRPs).

---

### 5. Multi-Dimensional Reporting (Superclasses)

ERP analytical intelligence requires high-level aggregation vectors to identify category-specific trends.

* **`superclass1` (Department/Vertical Code)**
  * *Utility:* Groups combinations into massive macroeconomic divisions.
  * *Real-World Case:* Both `Footwear / Nike` and `Apparel / Nike` can carry different sub-rules, but they inherit `superclass1 = SPORTSWEAR`, allowing regional executives to run global performance reports for the entire Sportswear division.
* **`superclass2` (Seasonality / Theme)**
  * *Utility:* Groups classifications chronologically to analyze inventory performance across fashion cycles.
  * *Real-World Case:* Tagging combinations with `superclass2 = SS26` (Spring Summer 2026) enables quick markdown calculation reports on obsolete stock when moving into winter campaigns.

---

## 💡 Summary Grid: The Modern TanStack Table Edge

By refactoring this interface in [ItemGrouping.tsx](file:///d:/IMP/GitHub/primesetu/frontend/src/modules/catalogue/ItemGrouping.tsx) using **TanStack Table v8**, operators experience:
1. **Instant Searchability:** Query across thousands of Product-Brand rules in milliseconds to edit parameters.
2. **Context-Rich Details Sidebar:** Clicking any combination opens a sliding editor where all these operational fields are accessible and synced live back to the database.
3. **Modified Status Indicators:** Modified rules glow amber, allowing operators to audit changes before sending bulk upserts to the PostgreSQL backend database engine.
