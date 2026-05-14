/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: shoper9skill
 * Source: Extension_Framework_in_Shoper_9.chm
 * ============================================================ */

# SKILL: Shoper9 Technical & Extension Knowledge

This file contains distilled knowledge about Shoper 9's internal architecture, extension framework, and database patterns to ensure PrimeSetu maintains high fidelity with the original system.

---

## 1. Extension Framework Architecture

The Shoper 9 Extension Framework allows for customized add-ons (DLLs) to extend standard functionality without modifying the base product.

### Core Workflow:
1. **Trigger**: Shoper 9 reaches a transaction point supporting extensions.
2. **Temp Table**: The framework creates an intermediate temp table populated with standard transaction data.
3. **Invocation**: The framework calls the custom DLL function `ShowDllForm1`.
4. **Validation/Update**: The DLL validates standard fields and updates custom fields in the temp table.
5. **Finalize**: Shoper 9 reads the temp table and persists data to the standard tables.

### DLL Function Signature:
```vb
Public Function ShowDllForm1(StrTableName As String, StrSqlConnstr As String) As Integer
```
- **StrTableName**: Name of the temp table containing transaction data.
- **StrSqlConnstr**: SQL Connection string for the local Shoper 9 MSSQL database.

### Return Codes:
| Code | Action |
|------|--------|
| **10** | **Continue**: Save the transaction and proceed. |
| **20** | **Recall**: Return to framework, call custom DLL again. |
| **30** | **Stop**: Abort the transaction process. |

---

## 2. Transaction Extension Levels

Extensions can be plugged into different stages of a transaction:

| Level | Name | Description |
|-------|------|-------------|
| **1** | Header | Customer info, Bill Date, Store ID. |
| **2** | Detail | Item code, Qty, Rate, Size, Colour. |
| **3** | Footer | Bill-wise taxes, total discount, net payable. |
| **4** | Footer Detail | Payment modes (Cash, Card, Credit). |

---

## 3. Configuration Registry (GenLookUp)

Shoper 9 uses the `GenLookUp` table as a central registry for all extensions and system settings.

### Key Rec IDs:
- **14500**: Holds metadata about the Extension Project, Class Name, and the physical location of the DLL.
- **14600**: Configures the invocation of the DLL. 
  - Determines if the extension is **Mandatory** or **Optional**.
  - Maps the DLL to specific Transaction Levels (Header/Detail/etc.).

---

## 4. Post-Update Extensions

Unlike Pre-update (which can stop a save), Post-update extensions execute *after* the data is committed. They are used for:
- External integrations (Accounting sync, SMS alerts).
- Updating external dashboards.
- Printing custom labels.

### Common Module/Operation Codes:
| Module | Op Code 01 | Op Code 02 | Op Code 03 | Op Code 04 |
|--------|------------|------------|------------|------------|
| Inwards| Add | Edit | Delete | Reprint |
| Outwards| Add | Edit | Delete | Reprint |
| Billing| Sales Bill | Void | - | Reprint |

---

## 5. Database Patterns (MSSQL)

To extract "Memory" from a local Shoper 9 MSSQL instance:
- **Tables**: Look for `Stock`, `SaleHeader`, `SaleDetail`, `ItemMaster`, `Partners`.
- **Custom Fields**: Usually named `UserField1`, `UserField2`, etc., in standard tables.
- **Connection**: Uses standard ADO/ODBC connection strings.

---

## 6. Implementation Notes for PrimeSetu

1. **Phase 2 Parity**: When building FastAPI endpoints, emulate the "Pre-update" logic by using Pydantic schemas as the "Temp Table" for validation before persisting to Supabase.
2. **GenLookUp Emulation**: Our `menu` and `config` tables in Supabase should reflect the `GenLookUp` logic for dynamic feature toggling.
3. **Paise over Float**: Maintain Shoper 9's legacy of using integers for all currency to avoid rounding errors in GST.

## 7. Shoper 9 DNA Mapping (Live Data)
Based on live MSSQL analysis of `SHOPER9X01`, we use the following mapping:

| Entity | Shoper 9 (MSSQL) | PrimeSetu (PostgreSQL) | Logic |
| :--- | :--- | :--- | :--- |
| **Item** | `StockNo` | `external_id` | Unique SKU identifier. |
| **Item** | `ItemDesc` | `item_name` | Product Name (Limit 40 chars). |
| **Item** | `Retail_Price` | `mrp_paise` | Money -> Integer (Paise). |
| **Item** | `AnalCode1-32` | `anal_codes` (JSONB) | All analytic attributes. |
| **Item** | `SField/NField` | `user_fields` (JSONB) | Custom user-defined fields. |
| **Sale** | `DocNo` | `external_id` | Original bill reference. |
| **Partner**| `PartyId` | `external_id` | Shoper 9 Customer/Supplier ID. |
